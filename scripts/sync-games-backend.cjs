const fs=require('fs'),ts=require('typescript');
let code=fs.readFileSync('apps-script/Code.gs','utf8');
const compiled=ts.transpileModule(fs.readFileSync('lib/crossword.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.CommonJS}}).outputText.replace(/^"use strict";\r?\n/,'').replace(/^Object.defineProperty\(exports[^\n]*\n/gm,'').replace(/^exports\.[^\n]*\n/gm,'').replace(/exports\.crosswordBanks/g,'crosswordBanks').replace(/exports\.crosswordThemes/g,'crosswordThemes');
// Exported constants are emitted as assignments by TypeScript.
const banks=require('../tests/load-ts.cjs')('lib/crossword.ts').crosswordBanks;
const functions=compiled.slice(compiled.indexOf('function buildCrossword('));
const crossword='// CROSSWORD ENGINE (generated from lib/crossword.ts)\nvar crosswordBanks='+JSON.stringify(banks)+';\n'+functions;
fs.writeFileSync('apps-script/crossword-functions.txt',crossword);
const marker=code.indexOf('// GAMES V3:');if(marker<0)throw Error('Games marker missing');
const orderMarker=code.indexOf('// ORDER CUSTOMER EMAILS V1:');
code=code.slice(0,orderMarker>=0?orderMarker:marker)+fs.readFileSync('apps-script/order-notifications-functions.txt','utf8')+'\n'+fs.readFileSync('apps-script/games-functions.txt','utf8')+'\n'+fs.readFileSync('apps-script/game-rewards-functions.txt','utf8')+'\n'+fs.readFileSync('apps-script/game-email-functions.txt','utf8')+'\n'+crossword;
fs.writeFileSync('apps-script/Code.gs',code);fs.writeFileSync('deliverables/VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt',code);
// Keep the optional promotion fragment aligned with the canonical backend too.
const canonical=ts.createSourceFile('Code.js',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),functionsByName=new Map(canonical.statements.filter(ts.isFunctionDeclaration).map(node=>[node.name?.text,code.slice(node.getStart(canonical),node.end)]));
const promoPath='apps-script/promotion-functions.txt',promo=fs.readFileSync(promoPath,'utf8'),parsed=ts.createSourceFile('promo.js',promo,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
let aligned=promo;
for(const node of [...parsed.statements].reverse().filter(ts.isFunctionDeclaration)){const replacement=functionsByName.get(node.name?.text);if(replacement)aligned=aligned.slice(0,node.getStart(parsed))+replacement+aligned.slice(node.end);}
fs.writeFileSync(promoPath,aligned);
