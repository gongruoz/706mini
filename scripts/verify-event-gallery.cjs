const assert=require('node:assert/strict');
const store=new Map();let picked=0,selection=[],failSave='',preview;
global.wx={getStorageSync:k=>store.get(k),setStorageSync:(k,v)=>store.set(k,v),removeStorageSync:k=>store.delete(k),chooseMedia:o=>{picked=o.count;o.success({tempFiles:selection});},getFileSystemManager:()=>({saveFile:o=>o.tempFilePath===failSave?o.fail(Error('save failed')):o.success({savedFilePath:o.tempFilePath})}),previewImage:o=>{preview=o;}};
require('../miniprogram/config').mode='mock';const api=require('../miniprogram/lib/api');api.mock.reset();const factory=require('../miniprogram/lib/page');
function page(){const p=factory('publish');p.data=structuredClone(p.data);p.options={};p.setData=function(values){for(const [key,value] of Object.entries(values)){const keys=key.split('.');let target=this.data;while(keys.length>1){const k=keys.shift();target=target[k]||(target[k]={});}target[keys[0]]=value;}};p.data.form={media:[],interests:[]};return p;}
const event={currentTarget:{dataset:{key:'media',type:'image'}}};const file=n=>({tempFilePath:'/tmp/gallery-'+n+'.png',size:1024});
(async()=>{
 const p=page();selection=[file(1),file(2),file(3)];await p.upload(event);assert.equal(picked,9);assert.equal(p.data.form.media.length,3);assert.deepEqual(p.data.form.media.map(x=>x.label),['gallery-1.png','gallery-2.png','gallery-3.png']);
 selection=[file(4)];await p.upload(event);assert.equal(picked,6);assert.equal(p.data.form.media.length,4);
 const before=structuredClone(p.data.form.media);selection=[{...file(5),size:11*1024*1024}];await p.upload(event);assert.deepEqual(p.data.form.media,before);assert(p.data.error);
 selection=[file(6),file(7)];failSave=file(7).tempFilePath;await p.upload(event);assert.equal(p.data.form.media.length,5);assert(p.data.error);assert.equal(p.data.busy,false);
 p.data.record={galleryUrls:['a','b','c']};p.previewImage({currentTarget:{dataset:{gallery:true,url:'b'}}});assert.deepEqual(preview,{current:'b',urls:['a','b','c']});p.galleryChange({detail:{current:2}});assert.equal(p.data.galleryIndex,2);
 const rects=[{left:0,top:0,width:100,height:100},{left:110,top:0,width:100,height:100},{left:0,top:110,width:100,height:100}];
 wx.createSelectorQuery=()=>({selectAll(){return this;},boundingClientRect(callback){callback(rects);return this;},exec(){}});
 p.data.form.media=[{type:'image',url:'a'},{type:'image',url:'b'},{type:'image',url:'c'}];
 const touch=(index,x,y)=>({currentTarget:{dataset:{index}},touches:[{clientX:x,clientY:y}]});
 p.mediaTouchStart(touch(0,50,50));p.mediaDragStart();assert.equal(p.data.dragIndex,0);p.mediaDragMove(touch(0,50,160));assert.equal(p.data.dragTarget,2);p.mediaDragEnd();assert.deepEqual(p.data.form.media.map(x=>x.url),['b','c','a']);assert.equal(p.data.dragIndex,-1);
 const payload=require('../miniprogram/lib/forms').payload('event',p.data.form);assert.equal(payload.cover_url,'b');assert.deepEqual(payload.media.map(x=>x.url),['b','c','a']);
 p.mediaTouchStart(touch(0,50,50));p.mediaDragStart();p.mediaDragMove(touch(0,160,50));p.mediaDragCancel();p.mediaDragEnd();assert.deepEqual(p.data.form.media.map(x=>x.url),['b','c','a']);
 p.data.form.media=Array.from({length:9},(_,n)=>({type:'image',url:String(n)}));picked=0;await p.upload(event);assert.equal(picked,0);assert(p.data.error);
 console.log('Event gallery: multi-select capacity/order, oversize rejection, partial-failure draft retention, preview, swipe, cross-row reorder/cover and cancelled-drag rollback passed; no network.');
})().catch(error=>{console.error(error);process.exitCode=1;});
