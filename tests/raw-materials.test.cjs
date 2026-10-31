const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {supplierPrices,validateMaterial,bomForPackage,bomExamples}=require('../lib/raw-materials.ts');
const {calculateProductCost}=require('../lib/product-costing.ts');
test('supplier per-kilogram prices convert to gram costs without substituting materials',()=>{
 assert.equal(new Map(supplierPrices).get('Cengkeh')/1000,155);assert.equal(new Map(supplierPrices).get('Jahe emprit')/1000,85);assert.equal(new Set(supplierPrices.map(([n])=>n.toLowerCase())).size,supplierPrices.length);
 assert.equal(new Map(supplierPrices).has('Pala'),false);assert.equal(new Map(supplierPrices).get('Kulit pala'),17000);
});
test('each example scales exact composition to the SKU tea bag count and weight, requiring actual price choices',()=>{
 for(const name of Object.keys(bomExamples)){
  const components=bomForPackage(name,10,9);assert.ok(Math.abs(components.reduce((a,c)=>a+c.usageQty,0)-90)<1e-8);
  assert.ok(components.every(c=>c.purchaseCost===0&&!c.materialId));
  assert.throws(()=>calculateProductCost({mode:'recipe',batchYield:1,manualCost:0,components:components.map((c,i)=>i?c:{...c,purchaseCost:65000})}));
 }
 assert.throws(()=>bomForPackage('Signature Blend',0,9));
});
class Sheet{constructor(rows=[]){this.rows=rows;}getLastRow(){return this.rows.length;}getDataRange(){return {getValues:()=>this.rows.map(r=>[...r])};}getRange(r,c){return {setValues:v=>v.forEach((row,y)=>{this.rows[r+y-1]||=[];row.forEach((val,x)=>this.rows[r+y-1][c+x-1]=val);})};}appendRow(row){this.rows.push([...row]);}setFrozenRows(){}}
test('material import preserves edited supplier prices on repeat and keeps recipe costs as snapshots',()=>{
 const sheets={},c=vm.createContext({SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:n=>sheets[n],insertSheet:n=>(sheets[n]=new Sheet())})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},responseJSON:x=>x});vm.runInContext(fs.readFileSync('apps-script/raw-material-functions.txt','utf8'),c);
 const m={id:'MAT-TEST',name:'Jahe merah',category:'Bahan baku',unit:'gram',purchaseCost:65000,purchaseQty:1000,supplier:'Supplier',source:'Sep-26',confirmed:true};validateMaterial(m);
 assert.equal(c.saveRawMaterials_({materials:[m],skipExisting:true}).saved,1);
 assert.equal(c.saveRawMaterials_({materials:[{...m,purchaseCost:70000}]}).saved,1);
 assert.equal(c.saveRawMaterials_({materials:[m],skipExisting:true}).saved,0);
 assert.equal(c.getRawMaterials_().materials[0].purchaseCost,70000);assert.equal(sheets.RawMaterials.rows.length,2);assert.equal(sheets.RawMaterials.rows[1][10],70);
 const before=JSON.stringify(sheets.RawMaterials.rows);assert.equal(c.saveRawMaterials_({materials:[{...m,purchaseQty:0}]}).success,false);assert.equal(JSON.stringify(sheets.RawMaterials.rows),before);
});
