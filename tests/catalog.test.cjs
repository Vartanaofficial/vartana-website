const fs = require("node:fs");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { test } = require("node:test");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true } }).outputText, filename);
};
const { buildStoreCatalog, catalogImage } = require("../lib/store-catalog.ts");
const row = (overrides = {}) => ({ sku: "TEST-01", productName: "Test Tea", active: true, sellingPrice: 97000, discountType: "percent", discountValue: 22, ...overrides });

test("only active, priced products appear; empty master stays empty", () => {
  assert.deepEqual(buildStoreCatalog([]), []);
  const result = buildStoreCatalog([row(), row({ sku: "OFF", active: false }), row({ sku: "ZERO", sellingPrice: 0 }), row({ sku: "BAD", sellingPrice: -1 })]);
  assert.equal(result.length, 1);
  assert.equal(result[0].variants[0].sku, "TEST-01");
});

test("admin discounts determine catalog price with Rp100 rounding", () => {
  assert.equal(buildStoreCatalog([row()])[0].priceValue, 75700);
  assert.equal(buildStoreCatalog([row({ discountType: "nominal", discountValue: 24200 })])[0].priceValue, 72800);
  assert.equal(buildStoreCatalog([row({ sellingPrice: 97050, discountValue: 0 })])[0].priceValue, 97050);
  assert.equal(buildStoreCatalog([row({ discountType: "", discountValue: 22 })])[0].priceValue, 97000);
});

test("variants retain distinct SKU, image, weight and ingredients", () => {
  const result = buildStoreCatalog([
    row({ productNumber: "TEA", variantName: "Box", ingredients: ["Jahe"], weightGram: 50 }),
    row({ sku: "TEST-02", productNumber: "TEA", variantName: "Jar", ingredients: "Kunyit, Serai", imageUrl: "/jar.png", weightGram: 100 }),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].variants.length, 2);
  assert.equal(result[0].variants[1].sku, "TEST-02");
  assert.equal(result[0].variants[1].image, "/jar.png");
  assert.equal(result[0].variants[1].weightGram, 100);
  assert.equal(result[0].variants[1].ingredients[0].id, "Kunyit");
});

test("public catalog omits internal cost data and handles image sources", () => {
  const result = buildStoreCatalog([row({ hpp: 12345 })]);
  assert.equal(JSON.stringify(result).includes("hpp"), false);
  assert.equal(catalogImage("javascript:alert(1)"), "");
  assert.equal(catalogImage("//unknown.test/p.png"), "");
  assert.equal(catalogImage("/tea.png"), "/tea.png");
  assert.equal(catalogImage("https://drive.google.com/file/d/example123/view"), "/api/product-image/example123");
});

test("Drive share, open, thumbnail and uc links share the same image endpoint", () => {
  for (const url of [
    "https://drive.google.com/file/d/example123/view?usp=sharing",
    "https://drive.google.com/open?id=example123",
    "https://drive.google.com/thumbnail?id=example123&sz=w1200",
    "https://drive.google.com/uc?export=view&id=example123",
    "https://lh3.googleusercontent.com/d/example123=w1600",
  ]) assert.equal(catalogImage(url), "/api/product-image/example123");
  assert.equal(catalogImage("https://drive.google.com/file/d/example123/view?resourcekey=key_123"), "/api/product-image/example123?resourceKey=key_123");
  assert.equal(catalogImage("https://drive.google.com/drive/folders/example123"), "");
  assert.equal(catalogImage("https://evil.test/drive.google.com/file/d/example123/view"), "https://evil.test/drive.google.com/file/d/example123/view");
});
