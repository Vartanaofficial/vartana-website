import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 30000;

type AnyRecord = Record<string, unknown>;

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("vartana_admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;

  return Boolean(token && secret && secret.length >= 32 && verifyAdminSessionToken(token, secret));
}

function getScriptUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!raw) return null;

  try {
    const url = new URL(raw);

    if (url.protocol !== "https:" || url.hostname !== "script.google.com") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

async function scriptRequest(url: URL, init?: RequestInit): Promise<AnyRecord> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Apps Script HTTP ${response.status}`);
    }

    let data: AnyRecord;

    try {
      data = JSON.parse(text) as AnyRecord;
    } catch {
      throw new Error("Apps Script memberikan respons bukan JSON.");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function packageCode(packageType: string) {
  switch (packageType.toLowerCase()) {
    case "jar":
      return "JAR";
    case "box":
      return "BOX";
    case "sachet":
      return "SAC";
    case "pcs":
      return "PCS";
    default:
      return "PRD";
  }
}

function generateSku(products: AnyRecord[], packageType: string) {
  const prefix = `VRT-${packageCode(packageType)}-`;

  const used = new Set(
    products.map((p) =>
      String(p.sku ?? "")
        .trim()
        .toUpperCase(),
    ),
  );

  let next = 1;

  for (const sku of used) {
    if (sku.startsWith(prefix)) {
      const n = Number(sku.slice(prefix.length));

      if (Number.isInteger(n) && n >= next) {
        next = n + 1;
      }
    }
  }

  let candidate = `${prefix}${String(next).padStart(4, "0")}`;

  while (used.has(candidate)) {
    next += 1;
    candidate = `${prefix}${String(next).padStart(4, "0")}`;
  }

  return candidate;
}

// GET: Mengambil master produk
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi admin tidak valid.",
      },
      { status: 401 },
    );
  }

  const url = getScriptUrl();

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        message: "Konfigurasi Apps Script tidak tersedia.",
      },
      { status: 500 },
    );
  }

  url.searchParams.set("action", "getProducts");

  try {
    const data = await scriptRequest(url);

    return NextResponse.json({
      success: true,
      products: Array.isArray(data.products) ? data.products : [],
    });
  } catch (error) {
    console.error("Admin products GET failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil master produk.",
      },
      { status: 502 },
    );
  }
}

// POST: Membuat atau memperbarui produk
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi admin tidak valid.",
      },
      { status: 401 },
    );
  }

  const url = getScriptUrl();

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        message: "Konfigurasi Apps Script tidak tersedia.",
      },
      { status: 500 },
    );
  }

  let body: AnyRecord;

  try {
    body = (await request.json()) as AnyRecord;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Format data tidak valid.",
      },
      { status: 400 },
    );
  }

  const productName = String(body.productName ?? "").trim();

  if (!productName || productName.length > 200) {
    return NextResponse.json(
      {
        success: false,
        message: "Nama produk wajib diisi (maksimal 200 karakter).",
      },
      { status: 400 },
    );
  }

  const category = String(body.category ?? "").trim();

  if (!category) {
    return NextResponse.json(
      {
        success: false,
        message: "Kategori produk wajib dipilih.",
      },
      { status: 400 },
    );
  }

  const packageType = String(body.packageType ?? "Jar").trim();

  if (!["Jar", "Box", "Sachet", "Pcs"].includes(packageType)) {
    return NextResponse.json(
      {
        success: false,
        message: "Jenis kemasan tidak valid.",
      },
      { status: 400 },
    );
  }

  const textFields = ["productNumber", "variantName", "category", "packageType", "subtitle", "description", "ingredients", "benefits", "journalReferences", "brewingInstructions", "imageUrl", "discountType"] as const;

  const product: AnyRecord = {
    productName,
    active: body.active !== false,
    category,
    packageType,
    status: body.active === false ? "Inactive" : "Active",
  };

  for (const field of textFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: `Field ${field} harus berupa teks.`,
          },
          { status: 400 },
        );
      }

      product[field] = (body[field] as string).trim();
    }
  }

  if (product.imageUrl && !/^https:\/\//i.test(String(product.imageUrl))) {
    return NextResponse.json(
      {
        success: false,
        message: "URL gambar harus menggunakan HTTPS.",
      },
      { status: 400 },
    );
  }

  if (product.discountType !== "" && product.discountType !== "percent" && product.discountType !== "nominal") {
    return NextResponse.json(
      {
        success: false,
        message: "Jenis diskon tidak valid.",
      },
      { status: 400 },
    );
  }

  const numericFields = ["teaBagWeightGram", "teaBagCount", "weightGram", "sellingPrice", "discountValue", "promoPrice"] as const;

  for (const field of numericFields) {
    const value = Number(body[field] ?? 0);

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        {
          success: false,
          message: `${field} harus berupa angka nol atau lebih.`,
        },
        { status: 400 },
      );
    }

    product[field] = value;
  }

  if (product.discountType === "percent" && Number(product.discountValue) > 100) {
    return NextResponse.json(
      {
        success: false,
        message: "Diskon persentase maksimal 100%.",
      },
      { status: 400 },
    );
  }

  const price = Number(product.sellingPrice);
  const discountValue = Number(product.discountValue);

  const discount = product.discountType === "percent" ? (price * Math.min(discountValue, 100)) / 100 : product.discountType === "nominal" ? Math.min(discountValue, price) : 0;

  product.promoPrice = Math.max(0, Math.ceil((price - discount) / 100) * 100);

  product.weightGram = Number(product.teaBagWeightGram) * Number(product.teaBagCount);

  try {
    const readUrl = new URL(url);
    readUrl.searchParams.set("action", "getProducts");

    const existingData = await scriptRequest(readUrl);

    const existingProducts = Array.isArray(existingData.products) ? (existingData.products as AnyRecord[]) : [];

    const requestedSku = String(body.sku ?? "").trim();

    const sku = requestedSku || generateSku(existingProducts, packageType);

    if (!/^[A-Za-z0-9._-]{2,80}$/.test(sku)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format SKU tidak valid.",
        },
        { status: 400 },
      );
    }

    product.sku = sku;

    const exists = existingProducts.some(
      (item) =>
        String(item.sku ?? "")
          .trim()
          .toUpperCase() === sku.toUpperCase(),
    );

    const saveUrl = new URL(url);

    const payload = {
      action: exists ? "updateProduct" : "createProduct",
      ...product,
    };

    const result = await scriptRequest(saveUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (result.success !== true) {
      return NextResponse.json(
        {
          success: false,
          message: String(result.message ?? "Apps Script menolak penyimpanan."),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      action: exists ? "updated" : "created",
      sku,
      message: exists ? "Master produk berhasil diperbarui." : `Master produk berhasil dibuat dengan kode ${sku}.`,
    });
  } catch (error) {
    console.error("Admin products POST failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan master produk. Periksa koneksi Apps Script.",
      },
      { status: 502 },
    );
  }
}

// DELETE: Menghapus produk berdasarkan SKU
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi admin tidak valid.",
      },
      { status: 401 },
    );
  }

  const url = getScriptUrl();

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        message: "Konfigurasi Apps Script tidak tersedia.",
      },
      { status: 500 },
    );
  }

  let body: AnyRecord;

  try {
    body = (await request.json()) as AnyRecord;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Format permintaan hapus tidak valid.",
      },
      { status: 400 },
    );
  }

  const sku = String(body.sku ?? "").trim();

  if (!sku || !/^[A-Za-z0-9._-]{2,80}$/.test(sku)) {
    return NextResponse.json(
      {
        success: false,
        message: "SKU produk tidak valid.",
      },
      { status: 400 },
    );
  }

  try {
    // Pastikan SKU memang terdaftar sebelum meneruskan penghapusan.
    const readUrl = new URL(url);
    readUrl.searchParams.set("action", "getProducts");

    const existingData = await scriptRequest(readUrl);

    const existingProducts = Array.isArray(existingData.products) ? (existingData.products as AnyRecord[]) : [];

    const productExists = existingProducts.some(
      (item) =>
        String(item.sku ?? "")
          .trim()
          .toUpperCase() === sku.toUpperCase(),
    );

    if (!productExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Produk dengan SKU ${sku} tidak ditemukan.`,
        },
        { status: 404 },
      );
    }

    const deleteUrl = new URL(url);

    const result = await scriptRequest(deleteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "deleteProduct",
        sku,
      }),
    });

    if (result.success !== true) {
      return NextResponse.json(
        {
          success: false,
          message: String(result.message ?? "Apps Script menolak penghapusan produk."),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      action: "deleted",
      sku,
      message: `Produk ${sku} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Admin products DELETE failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus produk. Periksa koneksi Apps Script.",
      },
      { status: 502 },
    );
  }
}
