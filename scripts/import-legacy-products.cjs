// One-time migration. Defaults to preview; --apply writes missing catalog data.
// Existing prices, discounts and active flags are preserved.
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
require("@next/env").loadEnvConfig(process.cwd());

const source = fs.readFileSync("lib/products.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const legacyModule = new Module("legacy-catalog");
legacyModule._compile(compiled, "legacy-catalog.cjs");
const { products } = legacyModule.exports;
const apply = process.argv.includes("--apply");

async function request(action, payload) {
  const url = new URL(process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL);
  if (!payload) url.searchParams.set("action", action);
  const response = await fetch(url, {
    method: payload ? "POST" : "GET", signal: AbortSignal.timeout(30000),
    ...(payload ? { headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...payload, action }) } : {}),
  });
  if (!response.ok) throw new Error(`Apps Script HTTP ${response.status}`);
  const data = await response.json();
  if (data.success === false || data.status === "error") throw new Error(data.message || "Apps Script rejected request");
  return data;
}

async function main() {
  const { products: existing } = await request("getProducts");
  if (!Array.isArray(existing)) throw new Error("Invalid products response");
  let changed = 0;
  for (const product of products) {
    for (const [index, variant] of product.variants.entries()) {
      const sku = product.number === "VRT-01" ? (index === 0 ? "VRT-01-10S" : "VRT-01-05P") : `${product.number}-${String(index + 1).padStart(2, "0")}`;
      const previous = existing.find(p => p.sku === sku) || existing.find(p => p.productName === product.name && p.variantName === variant.size);
      const blend = products.find(p => p.id === variant.blendProductId) || product;
      const regular = Number(variant.regularPrice.replace(/\D/g, "")) || variant.priceValue;
      const count = variant.bagCount || Number(variant.size.match(/(\d+) Tea Bags/)?.[1]) || 10;
      const seed = {
        sku, productNumber: product.number, productName: product.name, variantName: variant.size.replace(/\u00e2\u20ac\u201d/g, "—"),
        category: "BOTANICAL WELLNESS", packageType: product.number === "VRT-06" ? "Jar" : product.number === "VRT-07" || variant.size.includes("Personal") ? "Pouch" : "Box",
        subtitle: product.subtitle, description: product.description.id,
        ingredients: blend.ingredients.map(i => i.id), benefits: blend.benefit.id,
        imageUrl: variant.image || product.image || "", teaBagCount: count, teaBagWeightGram: 5, weightGram: count * 5,
        sellingPrice: regular, discountType: "nominal", discountValue: Math.max(0, regular - variant.priceValue),
        promoPrice: variant.priceValue, active: product.status === "READY STOCK", status: "Active",
      };
      const payload = previous ? { ...seed, ...previous } : seed;
      if (previous) {
        if (previous.variantName === variant.size) payload.variantName = seed.variantName;
        // Fill missing editorial/package fields only, never overwrite configured pricing or visibility.
        for (const key of ["productNumber", "variantName", "subtitle", "description", "ingredients", "benefits", "imageUrl", "teaBagCount", "teaBagWeightGram", "weightGram"]) {
          if (!previous[key] || (Array.isArray(previous[key]) && !previous[key].length)) payload[key] = seed[key];
        }
      }
      const needsWrite = !previous || Object.keys(payload).some(key => JSON.stringify(payload[key]) !== JSON.stringify(previous[key]));
      if (!needsWrite) { console.log(`Unchanged ${payload.sku}`); continue; }
      console.log(`${apply ? "Saving" : "Would save"} ${payload.sku} (${product.name} / ${variant.size})`);
      if (apply) {
        const result = await request(previous ? "updateProduct" : "createProduct", payload);
        if (result.success !== true) throw new Error(result.message || "Product not saved");
      }
      changed++;
    }
  }
  console.log(`${apply ? "Saved" : "Planned"}: ${changed} variants. Existing prices and active flags preserved.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
