/* DOM-level regression checks. Install jsdom or set JSDOM_PATH. Does not claim layout testing. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const oldResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...args) { return oldResolve.call(this, request.startsWith('@/') ? path.join(base,request.slice(2)) : request, parent, ...args); };
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (mod,file) => mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const {JSDOM} = require(process.env.JSDOM_PATH || 'jsdom');
const dom = new JSDOM('<div id="root"></div>',{url:'http://localhost'});
global.window=dom.window;global.document=dom.window.document;global.navigator=dom.window.navigator;global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react');const {act}=React;const {createRoot}=require('react-dom/client');
const Question=require('../components/audit/QuestionRenderer.tsx').default;
const {questions,sections}=require('../lib/questions.ts');
const {scoreAnswers}=require('../lib/score.ts');
const {pickDivisions}=require('../lib/links.ts');
assert.equal(questions.length,27);assert.equal(new Set(questions.map(q=>q.id.split('_')[0])).size,25);assert.equal(sections.length,6);
const q=questions.find(q=>q.type==='scale'&&q.min!==0);
let value;const root=createRoot(document.getElementById('root'));
function Harness(){const [v,setV]=React.useState();return React.createElement(Question,{question:q,value:v,onChange:n=>{value=n;setV(n);}});}
act(()=>root.render(React.createElement(Harness)));
const buttons=document.querySelectorAll('button');buttons[0].focus();
act(()=>buttons[0].dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
assert.equal(value,1);assert.equal(document.activeElement,buttons[0]);
act(()=>buttons[0].dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
assert.equal(value,2);assert.equal(document.activeElement,buttons[1]);assert.equal(buttons[1].getAttribute('aria-checked'),'true');
assert.equal([...buttons].filter(b=>b.tabIndex===0).length,1);
const result=scoreAnswers({});for(const score of Object.values(result.readiness_scores)) assert.ok(score>=0&&score<=100);
for(const dimension of ['strategy','data','culture','tech','governance']) { const scores={strategy:90,data:90,culture:90,tech:90,governance:90,[dimension]:10}; assert.equal(pickDivisions(scores).gap,dimension);assert.ok(pickDivisions(scores).picks.length); }
act(()=>root.unmount());
console.log('PASS: 25 question groups / 27 fields, six sections, keyboard rating selection/focus, bounded scoring and five division routes.');
