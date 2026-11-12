const fs=require('fs'),ts=require('typescript');
let code=fs.readFileSync('apps-script/Code.gs','utf8');
const compiled=ts.transpileModule(fs.readFileSync('lib/crossword.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.CommonJS}}).outputText.replace(/^"use strict";\r?\n/,'').replace(/^Object.defineProperty\(exports[^\n]*\n/gm,'').replace(/^exports\.[^\n]*\n/gm,'').replace(/exports\.crosswordBanks/g,'crosswordBanks').replace(/exports\.crosswordThemes/g,'crosswordThemes');
// Exported constants are emitted as assignments by TypeScript.
const banks=require('../tests/load-ts.cjs')('lib/crossword.ts').crosswordBanks;
const functions=compiled.slice(compiled.indexOf('function buildCrossword('));
const crossword='// CROSSWORD ENGINE (generated from lib/crossword.ts)\nvar crosswordBanks='+JSON.stringify(banks)+';\n'+functions;
fs.writeFileSync('apps-script/crossword-functions.txt',crossword);
const marker=code.indexOf('// GAMES V3:');if(marker<0)throw Error('Games marker missing');
code=code.slice(0,marker)+fs.readFileSync('apps-script/games-functions.txt','utf8')+'\n'+fs.readFileSync('apps-script/game-rewards-functions.txt','utf8')+'\n'+crossword;
fs.writeFileSync('apps-script/Code.gs',code);fs.writeFileSync('deliverables/VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt',code);
