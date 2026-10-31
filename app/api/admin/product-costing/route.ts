import {NextRequest,NextResponse} from "next/server";
import {verifyAdminSessionToken} from "@/lib/admin-auth";
import {requestCostingBackend} from "@/lib/costing-backend";
import {calculateProductCost} from "@/lib/product-costing";
function authorized(r:NextRequest){const secret=process.env.ADMIN_SESSION_SECRET,token=r.cookies.get("vartana_admin_session")?.value;return !!(secret&&token&&verifyAdminSessionToken(token,secret));}
export async function GET(r:NextRequest){
  if(!authorized(r))return NextResponse.json({message:"Sesi admin tidak valid."},{status:401});
  try {const d=await requestCostingBackend("getProductCosting");if(!Array.isArray(d.costs))throw new Error("Perbarui Apps Script ke versi HPP terlebih dahulu.");return NextResponse.json(d);}catch(e){return NextResponse.json({message:e instanceof Error?e.message:"HPP belum dapat dimuat."},{status:502});}
}
export async function POST(r:NextRequest){
  if(!authorized(r))return NextResponse.json({message:"Sesi admin tidak valid."},{status:401});
  try {const d=await r.json();if(typeof d.sku!=="string"||!d.sku.trim()||d.sku.length>100)throw new Error("Pilih SKU produk.");const result=calculateProductCost(d.recipe);const saved=await requestCostingBackend("saveProductCosting",{sku:d.sku,recipe:d.recipe});if(saved.success!==true||saved.hpp!==result.hpp)throw new Error("HPP belum terkonfirmasi tersimpan. Perbarui Apps Script lalu coba lagi.");return NextResponse.json(saved);}catch(e){return NextResponse.json({message:e instanceof Error?e.message:"HPP belum tersimpan."},{status:400});}
}
