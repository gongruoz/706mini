// Offline presentation contracts. Native screenshots and real-device checks are separate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const store=new Map([['706.transport','mock']]);
global.wx={getStorageSync:k=>store.get(k),setStorageSync:(k,v)=>store.set(k,structuredClone(v)),removeStorageSync:k=>store.delete(k),setNavigationBarTitle(){},request(){throw Error('Unexpected network');}};
global.getCurrentPages=()=>[];
const theme=require('../miniprogram/lib/theme'),factory=require('../miniprogram/lib/page'),icons=require('../miniprogram/lib/illustrations');
const routes=JSON.parse(read('miniprogram/app.json')).pages.map(p=>p.split('/')[1]);
const prefs=require('../miniprogram/lib/preferences');
for(const locale of ['zh-CN','en']){
 prefs.set({locale});
 for(const route of routes){const p=factory(route);assert.equal(p.data.theme,theme.style(),route);assert.deepEqual(p.data.illustrations,icons,route);assert.equal(p.data.isTask,theme.taskRoutes.includes(route),route);assert.equal(p.data.themeAccent,theme.tokens.accent);}
}
assert.equal(theme.community,theme.tokens);
assert.equal(theme.style('paper'),theme.style('community'));
assert.equal(theme.tokens.eventArtWidth,'264rpx');assert.equal(theme.tokens.eventArtHeight,'352rpx');
for(const value of Object.values(icons).flat())assert(fs.existsSync(path.join(root,'miniprogram',value)),value);
const markup=read('miniprogram/templates/screen.wxml'),sheets=read('miniprogram/templates/sheets.wxml'),css=read('miniprogram/styles/editorial.wxss');
assert(markup.includes('!sheet && !isTask && !keyboardHeight'));
assert(markup.includes('class="row form-actions"'));
assert(css.includes('.screen.task-page{padding-bottom:'));
assert(css.includes('.screen.keyboard-open .form-actions{position:static'));
assert(css.includes('border-radius:var(--radiusSheet)'));
assert(markup.includes('e:previewEvent,illustrations:illustrations,t:t,previewOnly:true'));
assert(markup.includes('e:item.event,illustrations:illustrations,t:t'));
assert(!/✅|🎉|⏳|🗑|➕/.test(markup+sheets));
assert(sheets.includes('class="text-button sheet-cancel" disabled="{{busy}}"'));
assert(sheets.includes('bindtap="requestCloseSheet"'));
assert(sheets.includes('color="{{themeInk}}"'));
assert(markup.includes('error && !sheet'));
assert(!markup.includes('illustrations ? \'community-edition\''));
const p=factory('publish');p.data=structuredClone(p.data);p.setData=v=>Object.assign(p.data,v);p.options={};
p.data.form={title:'Public title',starts_at:'2099-01-01T12:00:00+08:00',ends_at:'2099-01-01T14:00:00+08:00',city:'shanghai',media:[],paid:true,price_minor:'30',capacity:'20',access_values:{GROUP_QR:'PRIVATE_CODE',ORGANIZER_WECHAT:'PRIVATE_CONTACT'}};
p.updateFields();assert.equal(p.data.previewEvent.title,'Public title');assert.equal(p.data.previewEvent.price_minor,3000);assert(!JSON.stringify(p.data.previewEvent).includes('PRIVATE_'));
p.keyboardChange({detail:{height:300}});assert.equal(p.data.keyboardHeight,300);p.closeSheet();assert.equal(p.data.keyboardHeight,0);
(async()=>{
 p.data.form={title:'Keep my input'};p.data.sheet='recommend';p.data.sheetForm={text:'Keep my note'};
 let confirmation;wx.showModal=options=>{confirmation=options;};p.sheetSnapshot=JSON.stringify({text:'Original note'});p.requestCloseSheet();assert(confirmation);confirmation.success({confirm:false});assert.equal(p.data.sheetForm.text,'Keep my note');assert.equal(p.data.sheet,'recommend');
 let release;const pending=p.run(()=>new Promise(resolve=>release=resolve));assert(p.data.busy);p.requestCloseSheet();assert.equal(p.data.sheet,'recommend');
 let repeated=false;await p.run(()=>{repeated=true;});assert(!repeated);release();await pending;assert(!p.data.busy);
 await p.run(()=>{throw Error('TEST_FAILURE');});assert(p.data.error);assert(!p.data.error.includes('TEST_FAILURE'));assert.equal(p.data.form.title,'Keep my input');assert.equal(p.data.sheetForm.text,'Keep my note');assert(!p.data.busy);
 console.log('Global design: '+routes.length+' routes × 2 languages; shared palette/icons, task chrome, public-only preview, duplicate-submit guard, preserved failure input passed; networkCalls=0.');
})().catch(e=>{console.error(e);process.exitCode=1;});
