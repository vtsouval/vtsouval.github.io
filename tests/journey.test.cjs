const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/journey.js'), 'utf8');
function page(hash = '', compact = false) {
  function node() {
    return { dataset: {}, style:{setProperty() {}}, children:[], attributes:{}, listeners:{}, classList:{add(){}},
      append(...items) { for (const item of items) { if(item.parentNode) item.parentNode.children=item.parentNode.children.filter(child=>child!==item); item.parentNode=this; this.children.push(item); } },
      setAttribute(k,v) { this.attributes[k]=v; }, toggleAttribute(){},
      getAttribute(k) { return this.attributes[k]; },
      addEventListener(k,v) { this.listeners[k]=v; },
      cloneNode() { return node(); },
      querySelector(selector) { const name=selector.startsWith('.')?selector.slice(1):selector; return this.children.find(n=>n.className===name) || this.children.map(n=>n.querySelector(selector)).find(Boolean) || null; },
      querySelectorAll() { return []; },
      getBoundingClientRect() { return {left:0,top:100,bottom:144,width:44,height:44}; },
      scrollTo(options) { this.lastScroll=options; }, scrollLeft:0,clientWidth:300,offsetWidth:44,
      focus(){},scrollIntoView(){throw new Error('initialization must not scroll the page');}
    };
  }
  const panels=['2012','2024','Present'].map((year,i)=>{
    const panel=Object.assign(node(),{id:'journey-'+[2012,2024,2026][i],dataset:{year,label:year,tone:'community'}});
    const heading=Object.assign(node(),{className:'journey-detail-heading'});
    heading.append(Object.assign(node(),{className:'journey-detail-icon svg'}));
    panel.append(heading, Object.assign(node(),{className:'journey-events'}), Object.assign(node(),{className:'journey-year-note'}));
    return panel;
  });
  const selectors=Object.fromEntries(['journey-stops','journey-map','journey-road-base','journey-road-traveled','journey-previous','journey-next','journey-position','journey-year-select','journey-stage','journey-connector','journey-controls','journey-map-inner'].map(k=>['.'+k,node()]));
  const journey=node();journey.querySelectorAll=()=>panels;journey.querySelector=s=>selectors[s];
  const window={location:{hash},listeners:{},matchMedia:query=>({matches:query.includes('max-width')&&compact}),addEventListener(k,v){this.listeners[k]=v;}};
  selectors['.journey-connector'].append(Object.assign(node(),{className:'path'}));
  const document={querySelector:()=>journey,createElement:()=>node(),documentElement:node(),listeners:{},addEventListener(k,v){this.listeners[k]=v;}};
  vm.runInNewContext(source,{document,window,getComputedStyle:()=>({left:'0',top:'0',width:'8',height:'8',getPropertyValue:()=> '76'}),requestAnimationFrame:fn=>fn()});
  return {panels,selectors,window,document,selected:()=>panels.find(p=>!p.hidden)?.dataset.year};
}
test('fresh desktop and mobile visits select Present without jumping the page',()=>{
  for(const compact of [false,true]) {
    const p=page('',compact);assert.equal(p.selected(),'Present');
    assert.equal(p.selectors['.journey-year-select'].value,'2');
    assert.equal(p.selectors['.journey-next'].disabled,true);
    assert.ok(p.selectors['.journey-map'].lastScroll,'the selected stop is visible');
  }
});
test('fresh visits keep the year summary visible and all its details collapsed',()=>{
  for(const compact of [false,true]) {
    const p=page('',compact), panel=p.panels[2];
    const details=panel.querySelector('.journey-details');
    assert.ok(details, 'all dated events and additional notes have one disclosure container');
    assert.equal(details.hidden,true);
    assert.equal(panel.querySelector('.journey-detail-heading').hidden,undefined);
    assert.deepEqual(details.children.map(n=>n.className),['journey-events','journey-year-note']);
    const toggle=panel.querySelector('.journey-toggle');
    assert.equal(toggle.attributes['aria-expanded'],'false');
    assert.equal(toggle.attributes['aria-controls'],details.id);
  }
});
test('the full header button and selected year stop both toggle details',()=>{
  for(const compact of [false,true]) {
    const p=page('',compact), panel=p.panels[2];
    const toggle=panel.querySelector('.journey-toggle');
    assert.ok(toggle, 'a native button provides Enter and Space activation');
    toggle.listeners.click();
    assert.equal(panel.querySelector('.journey-details').hidden,false);
    assert.equal(toggle.attributes['aria-expanded'],'true');
    toggle.listeners.click();
    assert.equal(panel.querySelector('.journey-details').hidden,true);
    const tab=p.selectors['.journey-stops'].children[2];
    tab.listeners.click();
    assert.equal(panel.querySelector('.journey-details').hidden,false);
    tab.listeners.click();
    assert.equal(panel.querySelector('.journey-details').hidden,true);
  }
});
test('year navigation opens the selected year and closes other years',()=>{
  const p=page(), tabs=p.selectors['.journey-stops'].children;
  tabs[1].listeners.click();
  assert.equal(p.selected(),'2024');
  assert.equal(p.panels[1].querySelector('.journey-details').hidden,false);
  assert.equal(p.panels[2].querySelector('.journey-details').hidden,true);
  let prevented=false;
  p.selectors['.journey-stops'].listeners.keydown({target:tabs[1],key:'ArrowLeft',preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(p.selected(),'2012');
  assert.equal(p.panels[0].querySelector('.journey-details').hidden,false);
  p.selectors['.journey-next'].listeners.click();
  assert.equal(p.selected(),'2024');
  assert.equal(p.panels[1].querySelector('.journey-details').hidden,false);
  const mobile=page('',true), picker=mobile.selectors['.journey-year-select'];
  picker.value='0';picker.listeners.change();
  assert.equal(mobile.selected(),'2012');
  assert.equal(mobile.panels[0].querySelector('.journey-details').hidden,false);
});
test('direct year links open details, including re-opening an unchanged hash',()=>{
  const p=page('#journey-2024');
  assert.equal(p.panels[1].querySelector('.journey-details')?.hidden,false);
  p.panels[1].querySelector('.journey-toggle').listeners.click();
  assert.equal(p.panels[1].querySelector('.journey-details').hidden,true);
  // Navigation/scroll handlers may prevent the anchor's native default action.
  p.document.listeners.click({defaultPrevented:true,target:{closest:()=>({getAttribute:()=> '#journey-2024'})}});
  assert.equal(p.panels[1].querySelector('.journey-details').hidden,false);
  p.window.location.hash='#journey-2012';p.window.listeners.hashchange();
  assert.equal(p.panels[0].querySelector('.journey-details').hidden,false);
});
test('explicit year links override Present, while unrelated hashes use Present',()=>{
  assert.equal(page('#journey-2024').selected(),'2024');
  assert.equal(page('#publications').selected(),'Present');
  const p=page();p.window.location.hash='#journey-2012';p.window.listeners.hashchange();
  assert.equal(p.selected(),'2012');
});
