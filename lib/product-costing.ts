export type CostComponent = {materialId?:string;name:string; category:"Bahan baku"|"Kemasan"|"Perlengkapan"|"Produksi"; unit:string; purchaseCost:number; purchaseQty:number; usageQty:number};
export type CostRecipe = {mode:"manual"|"recipe"; batchYield:number; manualCost:number; components:CostComponent[]};
export function calculateProductCost(recipe:CostRecipe) {
  const valid=(v:number)=>typeof v==="number" && Number.isFinite(v) && v>=0 && v<=1e12;
  if(!recipe || !["manual","recipe"].includes(recipe.mode))throw new Error("Pilih cara mengisi HPP.");
  if(recipe.mode==="manual") {if(!valid(recipe.manualCost)||recipe.manualCost<=0)throw new Error("HPP satuan harus lebih dari nol.");return {hpp:Math.ceil(recipe.manualCost),batchTotal:recipe.manualCost,lines:[]};}
  if(!Number.isSafeInteger(recipe.batchYield)||recipe.batchYield<1||recipe.batchYield>1000000)throw new Error("Hasil produksi harus berupa jumlah kemasan utuh, minimal 1.");
  if(!Array.isArray(recipe.components)||!recipe.components.length||recipe.components.length>100)throw new Error("Isi minimal satu komponen biaya (maksimal 100).");
  const lines=recipe.components.map(c=>{
    if(!c || typeof c.name!=="string" || !c.name.trim() || c.name.length>100 || !["Bahan baku","Kemasan","Perlengkapan","Produksi"].includes(c.category) || !["gram","ml","pcs","roll","meter","batch"].includes(c.unit) || !valid(c.purchaseCost)||c.purchaseCost<=0||!valid(c.purchaseQty)||c.purchaseQty<=0||!valid(c.usageQty)||c.usageQty<=0)throw new Error("Lengkapi nama, harga beli, jumlah beli, dan pemakaian setiap komponen.");
    return c.purchaseCost/c.purchaseQty*c.usageQty;
  });
  const batchTotal=lines.reduce((a,b)=>a+b,0);if(!valid(batchTotal)||batchTotal<=0)throw new Error("Total biaya harus lebih dari nol dan dalam batas yang valid.");
  return {hpp:Math.ceil(batchTotal/recipe.batchYield),batchTotal,lines};
}
