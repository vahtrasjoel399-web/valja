// Exercise the actual UI event handlers and API together using a small DOM adapter.
// Layout and browser rendering require a separate browser check.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createHandler } = require('../server/photo-admin.cjs');
const source = fs.readFileSync('script.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const data = source.slice(source.indexOf('    let CATS'), source.indexOf('    /* current visible list'));
const translations = source.slice(source.indexOf('    const I18N'), source.indexOf('    function applyLang'));
const admin = source.slice(source.indexOf("    const adminModal"), source.indexOf("    adminModal.addEventListener('keydown'"));
const env = { ADMIN_USER: 'admin-test', ADMIN_PASSWORD: 'private-test-password', SESSION_SECRET: 'long-test-secret-at-least-32-characters' };
function sharedServer() {
  const hidden = new Map();
  const store = { list: async () => [...hidden.keys()], hide: async (id, revision) => hidden.set(id, revision), restore: async (id, revision) => hidden.get(id) === revision && hidden.delete(id), allowLogin: async () => true };
  return { store, handler: createHandler({ env, store }) };
}
function browser(handler, lang = 'ru') {
  const elements = new Map(); const local = new Map(); let cookie = ''; let failNetwork = false;
  class Element {
    constructor(id) {
      this.id=id; this.innerHTML=''; this.textContent=''; this.value=''; this.style={}; this.dataset={}; this.handlers={}; this.disabled=false; this.classes=new Set();
      this.classList={ add:(...v)=>v.forEach(s=>this.classes.add(s)), remove:(...v)=>v.forEach(s=>this.classes.delete(s)), contains:s=>this.classes.has(s), toggle:(s,on)=>{on=on??!this.classes.has(s);on?this.classes.add(s):this.classes.delete(s);} };
    }
    addEventListener(name, handler) { this.handlers[name]=handler; }
    closest() { return this; }
    focus() { document.activeElement=this; }
    querySelectorAll(selector) {
      if(this.id==='adminPanel') return [...elements.values()].filter(e=>e.id.startsWith('admin'));
      return [...this.innerHTML.matchAll(/data-del="([^"]+)"/g)].map(m=>{const b=new Element('delete');b.dataset.del=m[1];return b;});
    }
    querySelector(selector) { return selector==='[data-del]'?this.querySelectorAll(selector)[0]:get(this.id+'Submit'); }
    click() { return this.handlers.click?.({target:this}); }
  }
  const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
  const document={getElementById:get,body:{style:{}},activeElement:null};
  get('lightbox').classList.add('hidden'); get('adminModal').classList.add('hidden');
  const context={ document, crypto: require('node:crypto').webcrypto, AbortController, setTimeout, clearTimeout,
    localStorage:{getItem:k=>local.get(k)??null,setItem:(k,v)=>local.set(k,v)},
    fetch: async (url, options) => {
      assert.equal(url,'/api/portfolio'); if(failNetwork)throw Error('network');
      const response={headers:{},setHeader(k,v){this.headers[k]=v;},end(data){this.body=JSON.parse(data);}};
      await handler({method:options.method,body:options.body,headers:{host:'example.ee',cookie,'content-type':options.headers?.['Content-Type'],'x-photo-admin':options.headers?.['X-Photo-Admin']},socket:{remoteAddress:'127.0.0.1'}},response);
      if(response.headers['Set-Cookie'])cookie=response.headers['Set-Cookie'].split(';')[0];
      return {ok:response.statusCode===200,json:async()=>response.body};
    }
  };
  vm.createContext(context);
  vm.runInContext(data+'\nlet current = [];\n'+translations+'\nconst lb = document.getElementById("lightbox"); function close() {}\n'+admin,context);
  vm.runInContext(`currentLang = '${lang}';`,context);
  const run=script=>vm.runInContext(script,context);
  return {get,run,local,networkFailure:v=>failNetwork=v,count:()=>get('adminList').querySelectorAll('[data-del]').length,
    async login(){get('adminUser').value=env.ADMIN_USER;get('adminPass').value=env.ADMIN_PASSWORD;const form=get('adminLoginForm');await form.handlers.submit({preventDefault(){},target:form});},
    async del(id){const button=get('adminList').querySelectorAll('[data-del]').find(b=>b.dataset.del===id);assert.ok(button);await get('adminList').handlers.click({target:button});}
  };
}
test('admin removes an existing site photo, a second browser sees removal, and undo restores it',async()=>{
  const server=sharedServer();const admin=browser(server.handler); const visitor=browser(server.handler);
  await admin.run('refreshPortfolio()');await admin.login();assert.equal(admin.count(),73);
  await admin.del('assets/portfolio/04.jpg');assert.equal(admin.count(),72);
  assert.ok(!admin.get('gallery').innerHTML.includes('assets/portfolio/04.jpg'));
  await visitor.run('refreshPortfolio()');assert.ok(!visitor.get('gallery').innerHTML.includes('assets/portfolio/04.jpg'));
  assert.ok(admin.get('adminStatus').textContent.includes('для всех'));
  await admin.get('adminUndo').click();assert.equal(admin.count(),73);
  await visitor.run('refreshPortfolio()');assert.ok(visitor.get('gallery').innerHTML.includes('assets/portfolio/04.jpg'));
});
test('network failure keeps the photo and does not show successful deletion',async()=>{
  const app=browser(sharedServer().handler);await app.run('refreshPortfolio()');await app.login();app.networkFailure(true);
  await app.del('assets/portfolio/04.jpg');assert.equal(app.count(),73);assert.ok(app.get('adminStatus').textContent.includes('не подтверждено'));
});
test('missing setup keeps the public gallery and explains why admin changes are unavailable',async()=>{
  const app=browser(createHandler({env:{}}));await app.run('refreshPortfolio()');assert.ok(app.get('gallery').innerHTML.includes('assets/portfolio/04.jpg'));
  await app.login();assert.ok(app.get('adminError').textContent.includes('Подключите базу'));
});
test('old local deletions are not silently published, and local uploads still support delete and undo',async()=>{
  const server=sharedServer();const app=browser(server.handler);
  app.local.set('val_hidden_photos',JSON.stringify(['assets/portfolio/04.jpg']));
  app.local.set('val_admin_photos',JSON.stringify([{id:'a1',url:'data:image/png;base64,AAAA',cat:'family',r:'3/4',title:'<img src=x onerror=alert(1)>'}]));
  await app.run('refreshPortfolio()');await app.login();assert.equal(app.count(),74);
  assert.ok(app.get('gallery').innerHTML.includes('assets/portfolio/04.jpg'));
  assert.ok(app.get('adminList').innerHTML.includes('&lt;img'));
  await app.del('a1');assert.equal(app.count(),73);assert.deepEqual(await server.store.list(),[]);
  await app.get('adminUndo').click();assert.equal(app.count(),74);
});
test('all three languages render deletion labels and every DOM ID exists',async()=>{
  for(const [lang,label] of [['ru','Удалить'],['et','Kustuta'],['en','Delete']]){const app=browser(sharedServer().handler,lang);await app.login();assert.ok(app.get('adminList').innerHTML.includes(label));}
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const m of source.matchAll(/getElementById\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),m[1]);
});
