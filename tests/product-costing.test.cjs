const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {calculateProductCost}=require('../lib/product-costing.ts');
const recipe={mode:'recipe',batchYield:10,manualCost:0,components:[{name:'Jahe',category:'Bahan baku',unit:'gram',purchaseCost:50000,purchaseQty:1000,usageQty:200},{name:'Pouch',category:'Kemasan',unit:'pcs',purchaseCost:25000,purchaseQty:100,usageQty:10},{name:'Tenaga kerja',category:'Produksi',unit:'batch',purchaseCost:20000,purchaseQty:1,usageQty:1}]};
test('HPP allocates ingredient, packaging and production costs across actual batch yield',()=>{const c=calculateProductCost(recipe);assert.equal(c.batchTotal,32500);assert.equal(c.hpp,3250);assert.deepEqual(c.lines,[10000,2500,20000]);assert.equal(calculateProductCost({...recipe,batchYield:3}).hpp,10834);});
test('invalid or incomplete costs cannot create a zero or infinite HPP',()=>{for(const r of [{...recipe,batchYield:0},{...recipe,batchYield:1.5},{...recipe,components:[]},{...recipe,components:[{...recipe.components[0],purchaseQty:0}]},{mode:'manual',manualCost:-1},{mode:'manual',manualCost:Infinity}])assert.throws(()=>calculateProductCost(r));assert.equal(calculateProductCost({mode:'manual',manualCost:26400}).hpp,26400);});
class Sheet{constructor(rows){this.rows=rows;}getLastRow(){return this.rows.length;}getDataRange(){return {getValues:()=>this.rows.map(r=>[...r])};}getRange(r,c,h=1,w=1){return {setValues:v=>{v.forEach((row,y)=>row.forEach((val,x)=>{this.rows[r+y-1]||=[];this.rows[r+y-1][c+x-1]=val;}));},setValue:v=>{this.rows[r-1][c-1]=v;}};}appendRow(r){this.rows.push([...r]);}setFrozenRows(){}}
test('editing product details preserves HPP when that form does not submit costs',()=>{
 const old=Array(26).fill('');old[0]='TEST';old[2]='Name';old[8]=3250;const sheet=new Sheet([Array(26).fill(''),old]);
 const c=vm.createContext({SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet})}});vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8'),c);c.ensureHeaders=()=>{};c.responseJSON=x=>x;
 assert.equal(c.saveProduct({sku:'TEST',productName:'Updated name'}).success,true);assert.equal(sheet.rows[1][8],3250);assert.equal(sheet.rows[1][2],'Updated name');
});
test('Apps Script stores the recipe and updates only the selected SKU HPP, keeping other product data',()=>{
 const products=new Sheet([['SKU','Product Name','HPP','Updated At','Other'],['TEST','Keep name',0,'old','Keep field'],['OTHER','Other',900,'old','Keep other']]),sheets={Products:products};
 const c=vm.createContext({SHEET_PRODUCTS:'Products',SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:n=>sheets[n],insertSheet:n=>(sheets[n]=new Sheet([]))})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},responseJSON:x=>x});vm.runInContext(fs.readFileSync('apps-script/product-costing-functions.txt','utf8'),c);
 assert.equal(c.saveProductCosting_({sku:'TEST',recipe}).hpp,3250);assert.equal(products.rows[1][1],'Keep name');assert.equal(products.rows[1][4],'Keep field');assert.equal(products.rows[2][2],900);
 assert.equal(c.getProductCosting_().costs[0].recipe.batchYield,10);
 c.saveProductCosting_({sku:'TEST',recipe:{mode:'manual',manualCost:4000}});assert.equal(sheets.ProductCosting.rows.length,2);assert.equal(products.rows[1][2],4000);
 const before=JSON.stringify(products.rows);assert.equal(c.saveProductCosting_({sku:'MISSING',recipe}).success,false);assert.equal(JSON.stringify(products.rows),before);
});
