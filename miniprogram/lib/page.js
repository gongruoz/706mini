const api=require('./api'),prefs=require('./preferences'),i18n=require('./i18n'),theme=require('./theme'),dates=require('./dates'),forms=require('./forms'),icons=require('./icons');
const illustrations=require('./illustrations');
const presentation=theme;
const tabs=['feed','discover','messages','me'];
let activeTab='feed';
function tabState(locale,route){const current=tabs.includes(route)?route:activeTab,t=i18n.dictionary(locale);return {tab:current,tabIndex:Math.max(0,tabs.indexOf(current)),tabItems:tabs.map(key=>({key,label:t[key]||key,icon:illustrations[key]}))};}
// Pure presentation rules share the existing page module's lazy-load boundary.
const editorial={
 nodeBanners(cityNodes,followed,city,cityName,locale){
  const en=locale==='en',unique=[...new Map(followed.filter(x=>x.kind==='SPACE'&&(!x.status||x.status==='ACTIVE')).map(x=>[x.id,x])).values()].sort((a,b)=>Number(b.city===city)-Number(a.city===city)),suggestions=unique.length?unique:cityNodes.filter(x=>x.kind==='SPACE').slice(0,2);
  return suggestions.slice(0,4).map(x=>({...x,cityLabel:en?(String(x.city||'').charAt(0).toUpperCase()+String(x.city||'').slice(1)):({shanghai:'上海',hangzhou:'杭州',beijing:'北京',chengdu:'成都',guangzhou:'广州',shenzhen:'深圳'}[x.city]||x.city),route:'space',title:x.name,context:unique.length?(en?'Following':'已关注'):(en?'In your city':'同城探索'),summary:x.introduction||x.address||''}));
 },
 entityLinks(record){
  const links=Array.isArray(record.public_links)?record.public_links:[],accounts=links.filter(x=>x.kind==='official_account'&&x.label),recaps=links.filter(x=>x.kind==='recap'&&x.label&&(x.demo||editorial.articleUrl(x.url)));
  return {hosts:links.filter(x=>x.kind==='host'&&typeof x.user_id==='string'&&x.user_id),account:accounts[0]||null,recaps:[...new Map(recaps.map(x=>[x.url||x.id||x.label,x])).values()]};
 },
 articleUrl(url){return typeof url==='string'&&/^https:\/\/mp\.weixin\.qq\.com\/s(?:\/[^\s]+|\?[^\s]+)$/.test(url)?url:'';},
 periodLabel(range,mode,locale){
  const first=dates.localDate(new Date(range.from)),last=dates.localDate(new Date(Date.parse(range.to)-86400000)),[year,month,day]=first.split('-').map(Number),[endYear,endMonth,endDay]=last.split('-').map(Number),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if(mode==='month')return locale==='en'?months[month-1]+' '+year:year+'年'+month+'月';
  if(locale==='en')return months[month-1]+' '+day+(year!==endYear?', '+year:'')+' — '+(month!==endMonth||year!==endYear?months[endMonth-1]+' ':'')+endDay+', '+endYear;
  return year+'年'+month+'月'+day+'日—'+(year!==endYear?endYear+'年':'')+(month!==endMonth||year!==endYear?endMonth+'月':'')+endDay+'日';
 },
 eventDate(event,locale,now=new Date()){
  const start=dates.format(event.starts_at),end=dates.format(event.ends_at);if(!start)return '';
  const en=locale==='en',date=start.slice(0,10),parts=date.split('-').map(Number),weekday=new Date(date+'T12:00:00+08:00').getUTCDay(),year=parts[0]!==Number(dates.localDate(now).slice(0,4));
  const day=en?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][weekday]:['周日','周一','周二','周三','周四','周五','周六'][weekday];
  const label=en?`${day}, ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parts[1]-1]} ${parts[2]}${year?', '+parts[0]:''}`:`${year?parts[0]+'年':''}${parts[1]}月${parts[2]}日（${day}）`;
  return label+' '+start.slice(11,16)+(end?'–'+(end.slice(0,10)!==date?end.slice(5,10)+' ':'')+end.slice(11,16):'');
 },
 eventState(event,t,locale,now=Date.now()){
  const en=locale==='en';let key='available',label=en?'Open':'报名中';
  if(event.status==='CANCELLED'){key='cancelled';label=t.CANCELLED;}
  else if(event.ends_at&&Date.parse(event.ends_at)<=now){key='ended';label=en?'Ended':'已结束';}
  else if(event.status!=='PUBLISHED'){key='neutral';label=t[event.status]||event.status||'';}
  else if(event.remaining===0){key=event.waitlist_enabled?'waitlist':'full';label:event.waitlist_enabled?(en?'Waitlist':'可候补'):t.full;}
  return {bookingState:key,bookingOpen:key==='available',bookingLabel:label};
 },
 people(items,currentUser){return items.filter(x=>(x.owner||x.id)!==currentUser).slice(0,4);},
 feedIdentity(item,locale){const en=locale==='en',names=(item.actors||[]).slice(0,2).map(x=>x.display_name).filter(Boolean),more=Math.max(0,(item.count||0)-names.length);if(item.key==='REGISTRATION_ROLLUP')return {subject:names.join(en?' & ':'、'),action:en?(more?'+ '+more+' ':'')+'joined an event':(more?'等 '+item.count+' 位成员':'')+'报名了'};return {subject:item.author?.display_name||'',action:en?'recommends an event':'推荐了一场活动'};},
 feedHeadline(item,locale){const identity=editorial.feedIdentity(item,locale);return identity.subject+(locale==='en'?' ':'')+identity.action;},
 notifications(items,locale){const result=items.map(x=>({...x,needsAttention:['REVIEW_REQUESTED','REGISTRATION_REQUESTED','APPROVED_AWAITING_PAYMENT'].includes(x.key)})).sort((a,b)=>Number(b.needsAttention)-Number(a.needsAttention));return result.map((x,i)=>({...x,notificationGroup:x.needsAttention&&(i===0||!result[i-1].needsAttention)?(locale==='en'?'Needs attention':'需要关注'):''}));},
 developerVisible(runtime,demo){if(demo)return true;try{return ['develop','trial'].includes(runtime.getAccountInfoSync().miniProgram.envVersion);}catch{return false;}},
 registrationAction(status,locale){const labels={CONFIRMED:['查看参与方式','How to participate'],APPROVED_AWAITING_PAYMENT:['去付款 · 保留名额','Pay to secure your place'],REQUESTED:['查看报名进度','View application'],WAITLISTED:['查看候补进度','View waitlist']};return labels[status]?.[locale==='en'?1:0]||(locale==='en'?'View registration':'查看报名详情');},
 reviewGuidance(status,locale){const copy={IN_REVIEW:['正在等待必要审核方处理。你可以在下面查看每一方的进度。','Waiting for the required reviewers. Check each review below.'],CHANGES_REQUESTED:['有内容需要修改。查看审核意见，修改后重新提交。','Changes requested. Read the notes, edit and resubmit.'],PUBLISHED:['已通过必要审核，内容已公开。','All required reviews passed. This is now public.'],DRAFT:['这是草稿，尚未提交审核。','This is a draft and has not been submitted.'],CANCELLED:['已取消，不再接受报名。','Cancelled. Registration is no longer available.']};return (copy[status]||['查看下面的审核记录与意见。','See the review records and notes below.'])[locale==='en'?1:0];}
};
function normalize(item,t,locale){const result=normalizeBase(item,t,locale),event=item.event||item;const galleryUrls=[...new Set([...(event.cover_url?[event.cover_url]:[]),...(event.media||[]).filter(x=>x.type==='image'&&x.url).map(x=>x.url)])];return {...result,galleryUrls,...editorial.eventState(event,t,locale),dateLine:editorial.eventDate(event,locale),feedIdentity:editorial.feedIdentity(item,locale),feedHeadline:editorial.feedHeadline(item,locale),registrationAction:editorial.registrationAction(item.registration?.status||item.status,locale),reviewGuidance:editorial.reviewGuidance(item.status,locale),event:result.event};}
let pendingTabPreview=null; // One navigation only; tabBar URLs cannot carry query parameters.
const homeCache={key:'',at:0,payload:null};
function homeKey(){const p=prefs.get();return (api.session()?.id||'anonymous')+'|'+p.city+'|'+p.locale;}
function rememberHome(payload){const key=homeKey();const previous=homeCache.key===key?homeCache.payload:null;homeCache.key=key;homeCache.at=Date.now();homeCache.payload={...previous,...payload};}
function restoreHome(page){if(homeCache.key!==homeKey()||!homeCache.payload||Date.now()-homeCache.at>120000)return;page.setData({...homeCache.payload,loading:false,error:''});}
function go(route,id='',extra={}){const query=Object.entries({...extra,...(id?{id}:{})}).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');const url='/pages/'+route+'/index'+(query?'?'+query:'');if(!tabs.includes(route))return wx.navigateTo({url});activeTab=route;const stack=typeof getCurrentPages==='function'?getCurrentPages():[];const current=stack[stack.length-1];if(stack.length===1&&current&&current.route==='pages/'+route+'/index'&&!query)return;return wx.reLaunch({url});}
const formKinds={publish:'event','campaign-create':'campaign','campaign-edit':'campaign','edit-profile':'profile',onboarding:'profile','edit-entity':'entity','create-space':'space'};
function canManageCommunity(roles){return (roles||[]).some(role=>role.scope==='PLATFORM'||(role.scope==='ENTITY'&&role.parent&&(role.role==='OWNER'||role.role==='ADMIN')));}
function eventHost(e){const person=e.initiator?.display_name||e.host_display||'',org=e.organization_name||'';return org&&!['个人发起','Personal','Independent'].includes(org)&&!person.includes(org)?[person,org].filter(Boolean).join(' & '):person||org;}
function normalizeBase(item,t,locale){const e=item.event||item,phase=require('./mine-phase')(item);const notificationMatch=String(item.description||'').match(/^(.*?)(「[^」]+」)(.*)$/);const registered=Number(e.registered)||0,total=e.capacity==null?null:Number(e.capacity),known=Number.isFinite(total);return {...item,hostLine:eventHost(e),capacityDisplay:known?registered+'/'+total:registered+(locale==='en'?' going':' 人参加'),capacityLabel:known?(locale==='en'?registered+' registered out of '+total+' places':'已报名 '+registered+' 人，共 '+total+' 个名额'):(locale==='en'?registered+' registered, unlimited capacity':'已报名 '+registered+' 人，不限名额'),notificationTime:item.display_time||dates.format(item.created_at,locale),notificationParts:notificationMatch?notificationMatch.slice(1):null,notificationIcon:item.category==='ADMIN'?'review':item.category==='SOCIAL'?'new':'ticket',phase,phaseLabel:phase==='ENDED'?(locale==='en'?'Ended':'已结束'):phase==='UPCOMING'?(locale==='en'?'Upcoming':'即将开始'):t[phase]||phase,cityLabel:locale==='en'?item.city:({shanghai:'上海',beijing:'北京',guangzhou:'广州',shenzhen:'深圳',hangzhou:'杭州',chengdu:'成都'}[item.city]||item.city),activeRegistration:item.registration&&!['CANCELLED','REJECTED','EXPIRED','REFUNDED'].includes(item.registration.status),title:item.title||item.event?.title||item.display_name||item.name||t[item.key]||'',statusLabel:t[item.status]||item.status||'',dateLabel:dates.format(e.starts_at,locale),dateOnly:dates.format(e.starts_at,locale).slice(0,10),timeOnly:dates.format(e.starts_at,locale).slice(11,16),endTime:dates.format(e.ends_at,locale).slice(11,16),participantNames:(e.participants||[]).slice().sort((a,b)=>Number(b.owner===e.owner)-Number(a.owner===e.owner)).slice(0,2).map(x=>x.display_name).join(locale==='en'?' and ':'和 '),detailParticipants:(e.participants||[]).slice().sort((a,b)=>Number(b.owner===e.owner)-Number(a.owner===e.owner)).slice(0,3),participantOverflow:Math.max(0,(e.registered||0)-(e.participants||[]).length),feeLabel:e.price_minor===0?t.free:e.price_minor!=null?'¥'+(e.price_minor/100).toFixed(2):'',route:item.route||(['event','campaign'].includes(item.type)?item.type:item.type==='registration'?'event-access':item.type==='review'?(item.subject_type==='campaign'?'campaign-approval-detail':'approval-detail'):item.type==='entity'?(item.kind==='SPACE'?'space':'org'):'member'),event:item.event?normalize(item.event,t,locale):null};}
module.exports=function createPage(route){const boot=prefs.get(),bootT=i18n.dictionary(boot.locale),cachedHome=route==='feed'&&homeCache.key===homeKey()&&homeCache.payload&&Date.now()-homeCache.at<120000?homeCache.payload:null;return {
 data:{route,...tabState(boot.locale,route),illustrations,themeAccent:theme.tokens.accent,themeInk:theme.tokens.ink,isTask:presentation.isTask(route),keyboardHeight:0,galleryIndex:0,dragIndex:-1,dragTarget:-1,dragX:0,dragY:0,nodeCards:cachedHome?.nodeCards||[],nodeIndex:0,entityContent:{hosts:[],recaps:[],account:null},externalContent:null,isMainTab:tabs.includes(route),headerHeight:96,menuTop:48,menuHeight:32,menuRightInset:116,theme:theme.style(),icons,t:bootT,locale:boot.locale,city:boot.city,sheetCopy:{},loading:!cachedHome,busy:false,error:'',items:cachedHome?.items||[],people:cachedHome?.people||[],campaigns:[],spaces:[],organizations:[],form:{},fields:[],step:1,formKind:route==='create-space'?'':(formKinds[route]||''),sheet:'',sheetForm:{},filters:{},offset:0,calendarMode:'week',days:[],record:null,cityName:'',selectedDate:'',hasMore:!!cachedHome?.hasMore,nextCursor:cachedHome?.nextCursor||null,consent:false,shareContact:false},
 onLoad(options){this.options=options||{};this.updateNavigationLayout();if(pendingTabPreview?.route===route){this.options=pendingTabPreview.options;pendingTabPreview=null;}this.setData({optionsId:this.options.id||'',reviewIndex:api.isMock()&&this.options.reviewIndex!==undefined?Number(this.options.reviewIndex):-1});this.filters={};this.calendarSelectionInitialized=false;this.commandKeys={};this.refreshLanguage();const kind=formKinds[route];if(kind){const cached=wx.getStorageSync(this.draftKey());const fresh=route==='publish'&&!this.options.id&&!cached;this.endFollowsStart=fresh;const seed={city:prefs.get().city,price_minor:0,capacity:'',approval_required:false,waitlist_enabled:true,event_ids:[],interests:[],...(fresh?dates.eventWindow():{})};this.setData({form:cached||forms.toForm(seed),step:api.isMock()&&Number(this.options.step)||wx.getStorageSync(this.draftKey()+'.step')||1});this.updateFields();}},
 onShow(){if(tabs.includes(route))activeTab=route;this.updateNavigationLayout();this.setData({...tabState(prefs.get().locale,route),keyboardHeight:0,access:null,reviewCount:0,needsLogin:false,canRegister:false,contact:null});this.refreshLanguage();if(route==='feed')restoreHome(this);this.load();},
 onUnload(){clearTimeout(this.saveTimer);}, keyboardChange(e){this.setData({keyboardHeight:Math.max(0,Number(e.detail.height)||0)});},
 onResize(){this.updateNavigationLayout();},
 updateNavigationLayout(){this.setData({...require('./navigation-layout')(wx),developerVisible:editorial.developerVisible(wx,api.isMock()),formSteps:forms.stepInfo(formKinds[route],prefs.get().locale)});},
 back(){wx.navigateBack({delta:1,fail:()=>go('feed')});},
 onPageScroll(e){this.reviewScrollTop=e.scrollTop;},
 reviewScroll(e){if(!api.isMock()||this.data.reviewIndex<0)return;wx.pageScrollTo({scrollTop:Math.max(0,(this.reviewScrollTop||0)+Number(e.currentTarget.dataset.delta)*500),duration:0});},
 onPullDownRefresh(){this.load().finally(()=>wx.stopPullDownRefresh());},
 onReachBottom(){if(this.data.hasMore&&!this.data.loading)this.load(true);},
 onShareAppMessage(){return {title:this.data.record?.title||'706',path:'/pages/'+route+'/index'+(this.options.id?'?id='+encodeURIComponent(this.options.id):'')};},
 refreshPeople(){return this.run(async()=>{this.peopleOffset=(this.peopleOffset||0)+2;const r=await this.read('people',api.isMock()?{prototype:true,offset:this.peopleOffset}:{city:this.data.city,exclude:[this.data.currentUser,...this.data.people.map(x=>x.owner)]});this.setData({people:editorial.people(r.items,this.data.currentUser)});});},
 refreshLanguage(){const p=prefs.get(),t=i18n.dictionary(p.locale);this.setData({t,sheetCopy:require('./sheet-copy')(p.locale),locale:p.locale,city:p.city,title:t[route]||'706',demo:api.isMock(),mode:api.mode(),demoName:api.isMock()?api.mock.personas.find(x=>x.id===api.session()?.id)?.label||'游客':'',currentUser:api.session()?.id||'',cityName:this.config?.cities.find(c=>c.id===p.city)?.[p.locale==='en'?'en':'zh']||t.city});if(!tabs.includes(route))wx.setNavigationBarTitle({title:t[route]||'706',demo:api.isMock(),mode:api.mode(),demoName:api.isMock()?api.mock.personas.find(x=>x.id===api.session()?.id)?.label||'游客':'',currentUser:api.session()?.id||'',cityName:this.config?.cities.find(c=>c.id===p.city)?.[p.locale==='en'?'en':'zh']||t.city});this.setData(tabState(p.locale,route));},
 tabVisibility(visible){visible=visible&&!presentation.isTask(route)&&!['event','activity-preview'].includes(route);const bar=this.getTabBar?.();if(bar)bar.setData({hidden:!visible});},
 draftKey(){return '706.draft.'+api.mode()+'.'+(api.isMock()?api.mock.state().version+'.':'')+route+'.'+(this.options.id||'new')+'.'+(api.session()?.id||'anonymous');},
 read(op,params={}){return api.call('read',{op,params});},
 async allMine(kind){let items=[],cursor;do{const r=await this.read('mine',{kind,cursor});items.push(...r.items);cursor=r.has_more?r.next_cursor:null;}while(cursor);return items;},
 async allRead(op,params={}){let items=[],cursor;const seen=new Set();do{const r=await this.read(op,{...params,cursor});items.push(...(r.items||[]));cursor=r.has_more?r.next_cursor:null;if(cursor&&seen.has(cursor))throw Error('CURSOR_INVALID');if(cursor)seen.add(cursor);}while(cursor);return [...new Map(items.map(x=>[x.id||x.owner,x])).values()];},
 async loadNodes(){
  const city=this.data.city,en=this.data.locale==='en',directory=api.isMock()?this.allRead('entities',{kind:'SPACE',city,directory:true}).then(items=>({items})):this.read('entities',{kind:'SPACE',city,directory:true}),follows=api.session()?(api.isMock()?this.allRead('relations',{mode:'following'}).then(items=>({items})):this.read('relations',{mode:'following',shelf:true})):Promise.resolve({items:[]}),settled=await Promise.allSettled([directory,follows]),cityNodes=settled[0].status==='fulfilled'?(settled[0].value.items||[]):[],followed=settled[1].status==='fulfilled'?(settled[1].value.items||[]).filter(x=>x.kind==='SPACE'):[];
  const nodeCards=editorial.nodeBanners(cityNodes,followed,city,this.data.cityName,this.data.locale);
  this.setData({nodeCards,nodeIndex:0,nodesError:settled.some(x=>x.status==='rejected')?(en?'Some spaces could not load.':'部分节点暂未加载。'):'',followedNodeCount:followed.length});
 },
 async write(op,params={}){const fingerprint=op+JSON.stringify(params);const key=this.commandKeys[fingerprint]||(this.commandKeys[fingerprint]='cmd-'+Date.now()+'-'+Math.random().toString(36).slice(2));const r=await api.call('write',{op,params,key});delete this.commandKeys[fingerprint];return r;},
 async load(append=false){
  append=append===true;
  if(this.data.loading&&this.loadingPromise)return this.loadingPromise;
  this.homeCityReloaded=false;
  this.setData({loading:true,error:'',contact:null,access:null});
  this.loadingPromise=this.loadData(append).catch(e=>{const needsLogin=/LOGIN_REQUIRED|VERIFIED_LOGIN/.test(e.message||e.code||'');this.setData({error:i18n.message(e,this.data.t),needsLogin,...(needsLogin?{record:null,items:[],form:{},fields:[],me:null,managed:[],reviewCount:0,contact:null,access:null}: {})});}).finally(()=>{this.setData({loading:false});this.loadingPromise=null;if(!this.data.error)this.applyPreview();});return this.loadingPromise;
 },
 applyPreview(){if(!api.isMock()||this.previewApplied)return;this.previewApplied=true;if(this.options.submitted)this.setData({submitted:true});if(this.options.sheet)this.sheet({currentTarget:{dataset:{kind:this.options.sheet}}});},
 async loadData(append){
  if(['login','feedback'].includes(route))return;const profileSync=route==='review-lab'?null:prefs.sync();if(route!=='feed'&&profileSync)await profileSync;this.refreshLanguage();const t=this.data.t,p=prefs.get(),id=this.options.id;let result;
  if(route==='review-lab'){this.loadLab();return;}
  if(!this.config){this.config=await this.read('config');this.setData({cities:this.config.cities,cityName:this.config.cities.find(c=>c.id===p.city)?.[p.locale==='en'?'en':'zh']});}
  if(route==='calendar'&&this.options.scene&&!this.shareLoaded){const share=await this.read('calendarShare',{id:decodeURIComponent(this.options.scene)});this.filters=share.params;this.shareLoaded=true;this.calendarSelectionInitialized=true;const start=share.params.from;this.sharedRange={from:start,to:share.params.to};const month=Date.parse(share.params.to)-Date.parse(start)>7*86400000;const base=dates.range(month?'month':'week');const a=dates.localDate(new Date(start)).split('-').map(Number),b=dates.localDate(new Date(base.from)).split('-').map(Number);const offset=month?(a[0]-b[0])*12+a[1]-b[1]:Math.floor((Date.parse(start)-Date.parse(base.from))/604800000);this.setData({calendarMode:month?'month':'week',offset,selectedDate:Date.parse(share.params.to)-Date.parse(start)===86400000?dates.localDate(new Date(start)):'',city:share.params.city,cityName:this.config.cities.find(c=>c.id===share.params.city)?.[p.locale==='en'?'en':'zh']});}
  const params={...this.filters,city:this.filters.city||p.city,cursor:append?this.data.nextCursor:null};this.setData({city:params.city,cityName:this.config.cities.find(c=>c.id===params.city)?.[p.locale==='en'?'en':'zh']});
  if(route==='feed'){
   const peopleTask=append?Promise.resolve():this.read('people',api.isMock()?{prototype:true,offset:this.peopleOffset||0}:{city:p.city,exclude:[this.data.currentUser]}).then(people=>{this.setData({people:editorial.people(people.items,this.data.currentUser)});}).catch(()=>{});
   const nodesTask=append?Promise.resolve():this.loadNodes();
   result=await this.read('feed',{...params,prototype:api.isMock()});
   if(this.data.currentUser&&!api.session())this.refreshLanguage();
   const feedItems=(result.items||[]).map(x=>normalize(x,t,p.locale));
   const combined=append?[...this.data.items,...feedItems.filter(x=>!this.data.items.some(i=>i.id===x.id))]:feedItems;
   const payload={items:combined,nextCursor:result.next_cursor||null,hasMore:!!result.has_more,total:result.total??feedItems.length};
   this.setData({...payload,loading:false});
   await Promise.all([peopleTask,nodesTask,profileSync&&profileSync.catch(()=>{})]);
   const next=prefs.get();
   if(!append&&(next.city!==p.city||next.locale!==p.locale)&&!this.homeCityReloaded){this.homeCityReloaded=true;this.refreshLanguage();return this.loadData(false);}
   rememberHome({...payload,people:this.data.people,nodeCards:this.data.nodeCards});
   return;
  }
  else if(route==='discover'||route==='calendar'){
   let range=dates.range(this.data.calendarMode,this.data.offset,this.data.selectedDate);if(this.sharedRange){const days=[];for(let n=Date.parse(this.sharedRange.from);n<Date.parse(this.sharedRange.to);n+=86400000){const date=dates.localDate(new Date(n));days.push({date,label:Number(date.slice(-2))});}range={...this.sharedRange,days,label:days[0].date+' — '+days[days.length-1].date};}this.setData({rangeLabel:editorial.periodLabel(range,'week',p.locale),monthLabel:editorial.periodLabel(range,'month',p.locale)});
   const all=await this.read('calendar',{...params,from:range.from,to:range.to});
   if(route==='calendar')this.calendarSelectionInitialized=true;
   let days=range.days.map(d=>({...d,count:all.items.filter(e=>Date.parse(e.starts_at)<Date.parse(d.date+'T00:00:00+08:00')+86400000&&Date.parse(e.ends_at)>Date.parse(d.date+'T00:00:00+08:00')).length}));
   if(this.data.calendarMode==='month'){const weekday=(new Date(new Date(range.from).getTime()+8*3600000).getUTCDay()+6)%7;days=[...Array.from({length:weekday},(_,i)=>({date:'blank-'+i,label:'',disabled:true})),...days];}
   days=days.map(d=>({...d,selected:d.date===this.data.selectedDate,events:all.items.filter(e=>Date.parse(e.starts_at)<Date.parse(d.date+'T00:00:00+08:00')+86400000&&Date.parse(e.ends_at)>Date.parse(d.date+'T00:00:00+08:00')).map(e=>({id:e.id,title:e.title})),weekday:d.disabled?'':['日','一','二','三','四','五','六'][new Date(d.date+'T12:00:00+08:00').getUTCDay()]}));this.setData({days,monthLabel:editorial.periodLabel(range,'month',p.locale),weekdays:this.data.locale==='en'?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['一','二','三','四','五','六','日'],rangeSpaceCount:new Set(all.items.map(x=>x.space_id||x.venue_display)).size});const items=this.data.selectedDate?all.items.filter(e=>Date.parse(e.starts_at)<Date.parse(this.data.selectedDate+'T00:00:00+08:00')+86400000&&Date.parse(e.ends_at)>Date.parse(this.data.selectedDate+'T00:00:00+08:00')):all.items;
   const dayKeys=this.data.selectedDate?[this.data.selectedDate]:days.filter(d=>!d.disabled).map(d=>d.date);const timeline=require('./calendar-layout').timeline(all.items.map(e=>normalize(e,t,p.locale)),dayKeys),firstEvent=timeline.days.flatMap(d=>d.events).sort((a,b)=>a.top-b.top)[0];this.setData({timeline,timelineScrollLeft:0,timelineScrollTop:Math.max(0,(firstEvent?.top||0)-120)*(wx.getWindowInfo?wx.getWindowInfo().windowWidth/750:0.5)});result={items};if(route==='discover'){const c=await this.read('campaigns',params);this.setData({campaigns:c.items});}
   if(route==='discover'){const currentWeek=dates.range('week'),summary=this.data.offset||Object.keys(this.filters).some(key=>key!=='city')?await this.read('calendar',{city:params.city,from:currentWeek.from,to:currentWeek.to}):all;this.setData({calendarSummaryTotal:summary.total??summary.items.length,calendarSummarySpaces:new Set(summary.items.map(x=>x.space_id||x.venue_display||x.venue_name).filter(Boolean)).size});}
   const s=await this.read('entities',{kind:'SPACE',city:params.city});this.setData({spaces:api.isMock()?s.items.filter(x=>['demo-space','demo-m50','demo-riverside'].includes(x.id)):s.items});
  }
  else if(route==='event'){const r=await this.read('event',{id});this.setData({record:normalize(r,t,p.locale),comments:r.comments,detailThreads:(r.comments||[]).filter(x=>!x.reply_to&&x.source_surface!=='sheet').map(x=>({...x,replies:(r.comments||[]).filter(y=>y.reply_to===x.id)})),commentThreads:(r.comments||[]).filter(x=>!x.reply_to&&x.source_surface!=='detail').map(x=>({...x,replies:(r.comments||[]).filter(y=>y.reply_to===x.id)})),items:[],canRegister:r.can_register});return;}
  else if(route==='campaign'){const r=await this.read('campaign',{id});this.setData({record:{...r,citySummary:(r.cities||[]).join(' · ')}});result={items:(r.items||[]).map(event=>({...event,type:'event',route:'event'}))};}
  else if(['member','space','org','entity-events','entity-members'].includes(route)){
   const r=await this.read(route==='member'?'member':'entity',{id});this.setData({record:normalize(r,t,p.locale),memberLinks:route==='member'?['work','social'].map((kind,i)=>(r.public_links||[]).find(x=>x.kind===kind||(!x.kind&&x.label===(i?'社交媒体':'作品与项目')))).filter(Boolean):[]});result={items:route==='entity-members'?(r.members||[]).map(x=>({...x,id:x.owner,route:'member'})):r.items};
   if(route==='space'||route==='org'){
    const links=editorial.entityLinks(r),hosts=await Promise.all(links.hosts.map(async link=>{try{const host=await this.read('member',{id:link.user_id});return {...host,roleLabel:p.locale==='en'?(link.role_en||'Host'):(link.role||'负责人')};}catch{return null;}}));
    const upcoming=(r.items||[]).filter(x=>Date.parse(x.ends_at)>Date.now()).sort((a,b)=>String(a.starts_at).localeCompare(String(b.starts_at)));
    this.setData({entityContent:{...links,hosts:hosts.filter(Boolean)},upcomingCount:upcoming.length,showAllRecaps:false});result={items:upcoming.slice(0,3)};
   }
  }
  else if(route==='spaces'){
   const following=this.options.scope==='following';this.setData({spacesScope:following?'following':'city',title:following?(p.locale==='en'?'Spaces I follow':'我关注的节点'):(p.locale==='en'?this.data.cityName+' spaces':this.data.cityName+'的节点')});
   if(following){if(!api.session())throw Error('LOGIN_REQUIRED');result={items:(await this.allRead('relations',{mode:'following'})).filter(x=>x.kind==='SPACE').sort((a,b)=>Number(b.city===p.city)-Number(a.city===p.city))};}
   else result=await this.read('entities',{...params,kind:'SPACE',directory:true});
  }
  else if(route==='messages')result=await this.read('notifications',{category:this.data.category||'',cursor:params.cursor});
  else if(route==='me'){
   const [r,e,events,registrations,campaigns]=await Promise.all([this.read('me'),this.read('managed'),this.allMine('event'),this.allMine('registration'),this.allMine('campaign')]);const counts=require('./personal-summary')(events,registrations,campaigns);const en=p.locale==='en';
   const allowed=canManageCommunity(r.roles);
   const reviewCount=allowed?(await this.read('reviews')).total||0:0;
   const manageRows=allowed?[{icon:'home',label:en?'Manage':'管理',route:'manage',value:e.items.length?String(e.items.length):''},{icon:'review',label:en?'Admin tasks':'管理员待办',route:'approvals',value:reviewCount?String(reviewCount):(en?'Done':'已完成')}]:[];
   const menuGroups=[
    {id:'participation',title:en?'My participation':'我的参与',rows:[{icon:'ticket',label:en?'My registrations':'我报名的活动',route:'registrations',value:counts.registrations+(en?' upcoming':' 场')}]},
    {id:'hosting',title:en?'My creations':'我的发起',rows:[{icon:'publish',label:en?'Create event':'发布活动',route:'publish'},{icon:'draft',label:en?'Event drafts':'活动草稿',route:'drafts',value:String(counts.drafts)},{icon:'flag',label:en?'My events':'我发布的活动',route:'my-events',value:counts.events+(en?' active':' 场')},{icon:'series',label:en?'Create series':'发起专题',route:'campaign-create'},{icon:'series',label:en?'My series':'我发起的专题',route:'my-campaigns',value:counts.campaigns+(en?' in review':' 个审核中')}]},
    {id:'manage',title:en?'Manage':'管理',rows:manageRows},
    {id:'managed',title:en?'My management':'我的管理',rows:e.items.sort((a,b)=>(a.kind==='ORGANIZATION'?0:1)-(b.kind==='ORGANIZATION'?0:1)).map(x=>({icon:x.kind==='SPACE'?'home':'org',label:x.name,route:x.kind==='SPACE'?'space':'org',id:x.id}))},
    {id:'preferences',title:en?'Preferences':'偏好与设置',rows:[{icon:'city',label:t.city,kind:'city',value:this.data.cityName},{icon:'language',label:t.language,kind:'language',value:en?'English':'简体中文'},{icon:'more',label:t.more,route:'more'}]}
   ].filter(group=>group.rows.length);
   this.setData({record:r.profile,me:r,managed:e.items,counts,menuGroups,reviewCount});return;
  }
  else if(route==='manage'){
   if(!api.session()){this.setData({needsLogin:true});throw Error('LOGIN_REQUIRED');}
   const me=await this.read('me');
   if(!canManageCommunity(me.roles)){this.setData({canManage:false,managed:[]});return;}
   const managed=await this.read('managed');
   this.setData({canManage:true,managed:(managed.items||[]).sort((a,b)=>(a.kind==='ORGANIZATION'?0:1)-(b.kind==='ORGANIZATION'?0:1))});
   return;
  }
  else if(route==='more'||route==='privacy'){const r=await this.read('me');this.setData({me:r,record:r.profile});return;}
  else if(['relations','following'].includes(route)){this.setData({relationMode:this.data.relationMode||this.options.mode||'following'});const counts=this.options.id?await this.read('member',{id:this.options.id}):await this.read('me');this.setData({followingCount:counts.following_count??counts.following,followersCount:counts.followers_count??counts.followers});result=await this.read('relations',{id:this.options.id,mode:this.data.relationMode,cursor:params.cursor});}
  else if(['registrations','my-events','drafts','my-campaigns'].includes(route))result=await this.read('mine',{kind:route==='registrations'?'registration':route==='my-campaigns'?'campaign':'event',status:route==='drafts'?'DRAFT':undefined,phase:this.data.minePhase||'',cursor:params.cursor});
  else if(route==='approvals'){result=await this.read('reviews',params);result={...result,items:(result.items||[]).map(task=>({...task,type:'review',route:task.subject_type==='campaign'?'campaign-approval-detail':'approval-detail'}))};if(api.isMock()&&this.options.done)result={items:result.items.filter(x=>x.subject_type==='campaign')};}
  else if(['approval-detail','campaign-approval-detail'].includes(route)){const r=await this.read('review',{id});const linkedReviewEvents=await Promise.all((r.subject.event_ids||[]).map(async eventId=>{try{return normalize(await this.read('event',{id:eventId}),t,p.locale);}catch(error){return {id:eventId,unavailable:true,error:i18n.message(error,t)};}}));this.setData({record:r,subject:normalize(r.subject,t,p.locale),reviewSteps:(r.reviews||[]).filter(x=>x.status!=='SUPERSEDED'),linkedReviewEvents});return;}
  else if(['approval-progress','campaign-review-progress'].includes(route)){const r=await this.read('progress',{id});this.setData({record:normalize(r.subject,t,p.locale)});result={items:r.items.filter(x=>x.status!=='SUPERSEDED')};}
  else if(route==='event-access'){const r=await this.read('registration',{id});const access=r.status==='CONFIRMED'?await this.write('access',{id}):null,types=(access?.methods||[access]).filter(Boolean).map(x=>x.type);this.setData({record:normalize(r,t,p.locale),paymentDeadline:dates.format(r.payment_expires_at,p.locale),accessHasGroup:types.includes('GROUP_QR'),accessHasContact:types.includes('ORGANIZER_WECHAT'),accessWillContact:types.includes('ORGANIZER_WILL_CONTACT')});return;}
  else if(route==='attendees')result=await this.read('attendees',{id});
  else if(route==='admins')result=await this.read('admins',{id});
  else if(route==='invitations')result=await this.read('invitations');
  else if(formKinds[route]){
   if(!api.session()){this.setData({needsLogin:true});throw Error('LOGIN_REQUIRED');}
   const kind=formKinds[route];let r=null;
   if(kind==='space'){if(!canManageCommunity((await this.read('me')).roles)){this.setData({formKind:'',fields:[],canManage:false});return;}this.setData({canManage:true,formKind:'space'});}
   if(!this.formLoaded){if(kind==='profile'){r=(await this.read('me')).profile;const contact=await this.read('selfContact');r={...r,wechat:contact.wechat};}else if(kind==='entity')r=await this.read('entity',{id});else if(kind==='space')r={city:p.city,allow_event_requests:true};else if(id)r=await this.read('draft',{id,kind});
    const cached=wx.getStorageSync(this.draftKey());this.setData({form:cached|| (r?forms.toForm(r):this.data.form),record:kind==='space'?null:r});this.formLoaded=true;}
   if(kind!=='space'){const es=await this.read('managed');const spaces=await this.read('entities',{kind:'SPACE'});
   this.setData({organizations:es.items.filter(e=>e.kind==='ORGANIZATION'),spaces:spaces.items});}
   if(kind==='campaign'){const ev=await this.read('events',{});const mine=await this.read('mine',{kind:'event'});const options=[...ev.items,...mine.items.filter(e=>e.status==='IN_REVIEW')];for(const selected of this.data.form.event_ids||[])if(!options.some(e=>e.id===selected))options.push(await this.read('event',{id:selected}));this.setData({eventOptions:[...new Map(options.map(e=>[e.id,normalize(e,t,p.locale)])).values()]});}
   this.updateFields();await this.refreshMedia();return;
  }
  else if(route==='activity-preview'){const r=await this.read('draft',{id});this.setData({record:normalize(r,t,p.locale)});await this.refreshMedia();return;}
  else if(['more','privacy','feedback','login'].includes(route))return;
  if(result){const items=(result.items||[]).map(x=>normalize(x,t,p.locale));let combined=append?[...this.data.items,...items.filter(x=>!this.data.items.some(i=>i.id===x.id))]:items;if(route==='messages')combined=editorial.notifications(combined,p.locale);this.setData({items:combined,nextCursor:result.next_cursor||null,hasMore:!!result.has_more,total:result.total??items.length});}
 },
 navigate(e){if(this.data.sheet)this.closeSheet();const d=e.currentTarget.dataset;if(d.route==='space'&&!d.id)return;if(d.route==='review-lab'){wx.reLaunch({url:'/pages/review-lab/index'});return;}go(d.route,d.id||'',d.extra||{});},
 menuEntry(e){if(e.currentTarget.dataset.kind)return this.sheet(e);return this.navigate(e);},
 openItem(e){if(['attendees','admins','invitations','approval-progress','campaign-review-progress'].includes(route))return;const item=this.data.items[Number(e.currentTarget.dataset.index)];if(route==='messages'){this.run(async()=>{await this.write('read',{id:item.id});if(item.target?.route)go(item.target.route,item.target.id);});}else if(route==='approvals')go(item.subject_type==='campaign'?'campaign-approval-detail':'approval-detail',item.id);else go(item.route,item.route==='member'?(item.owner||item.id):item.id);},
 openEvent(e){const d=e.currentTarget.dataset;go(d.route==='activity-preview'?'activity-preview':'event',d.id);},
 mineFilter(e){this.setData({minePhase:e.currentTarget.dataset.phase});this.load();},
 bannerChange(e){this.setData({bannerIndex:e.detail.current});},
 nodeChange(e){this.setData({nodeIndex:e.detail.current});},
 nodeScope(e){this.options.scope=e.currentTarget.dataset.scope;this.setData({items:[],nextCursor:null});return this.load();},
 retryNodes(){return this.run(()=>this.loadNodes());},
 toggleRecaps(){this.setData({showAllRecaps:!this.data.showAllRecaps});},
 openOfficial(){
  const account=this.data.entityContent?.account;if(!account)return;
  const fallback=()=>{this.setData({sheet:'official',externalContent:account});};
  if(api.isMock()||account.demo||!/^gh_[a-zA-Z0-9_]+$/.test(account.username||'')||typeof wx.openOfficialAccountProfile!=='function')return fallback();
  try{wx.openOfficialAccountProfile({username:account.username,fail:fallback});}catch{fallback();}
 },
 openRecap(e){
  const article=this.data.entityContent?.recaps[Number(e.currentTarget.dataset.index)];if(!article)return;
  const fallback=()=>this.setData({sheet:'recap',externalContent:article}),url=editorial.articleUrl(article.url);
  if(api.isMock()||article.demo||!url||typeof wx.openOfficialAccountArticle!=='function')return fallback();
  try{wx.openOfficialAccountArticle({url,fail:fallback});}catch{fallback();}
 },
 bannerMove(e){const total=this.data.campaigns.length;this.setData({bannerIndex:((this.data.bannerIndex||0)+Number(e.currentTarget.dataset.delta)+total)%total});},
 async run(fn){if(this.data.busy)return;this.setData({busy:true,error:''});try{return await fn();}catch(e){this.setData({error:i18n.message(e,this.data.t),needsLogin:/LOGIN_REQUIRED|VERIFIED_LOGIN/.test(e.message||'')});}finally{this.setData({busy:false});}},
 login(){go('login');},
 chooseCity(){this.sheet({currentTarget:{dataset:{kind:'city'}}});},
 selectCity(e){const id=e.currentTarget.dataset.id,c=this.config.cities.find(c=>c.id===id);if(!c)return;this.sharedRange=null;delete this.filters.city;prefs.set({city:id});this.closeSheet();this.setData({city:id,cityName:c[this.data.locale==='en'?'en':'zh']});this.run(async()=>{if(api.session())await this.write('profile',{city:id});await this.load();});},
 selectLanguage(e){prefs.set({locale:e.currentTarget.dataset.locale});this.closeSheet();this.refreshLanguage();this.updateFields();this.run(async()=>{if(api.session())await this.write('profile',{locale:prefs.get().locale});await this.load();});},
 reloadPage(){this.closeSheet();this.load();},
 toggleLanguage(){prefs.set({locale:this.data.locale==='en'?'zh-CN':'en'});if(api.session())this.run(()=>this.write('profile',{locale:prefs.get().locale}));this.refreshLanguage();this.updateFields();this.load();},
 logout(){this.run(async()=>{await api.logout();wx.reLaunch({url:'/pages/feed/index'});});},
 searchInput(e){this.setData({query:e.detail.value});},
 search(){this.run(async()=>{if(!this.data.query)return this.load();const r=await this.read('search',{q:this.data.query,city:this.data.city});this.setData({items:r.items.map(x=>normalize(x,this.data.t,this.data.locale)),searching:true});});},
 timelineScrolled(e){this.timelineActualLeft=e.detail.scrollLeft;},
 moveTimeline(e){const width=wx.getWindowInfo?wx.getWindowInfo().windowWidth:375,scale=width/750,viewport=(750-56-86)*scale,max=Math.max(0,(this.data.timeline.days.length*310)*scale-viewport);this.setData({timelineScrollLeft:Math.min(max,Math.max(0,(this.timelineActualLeft||0)+Number(e.currentTarget.dataset.delta)*620*scale))});},
 filter(e){this.sharedRange=null;const {key,value}=e.currentTarget.dataset;if(key==='clearTags'){delete this.filters.tag;delete this.filters.free_only;delete this.filters.has_capacity;}else if(key==='date'){this.calendarSelectionInitialized=true;this.setData({offset:value==='next'?1:0,selectedDate:'',calendarMode:'week'});}else{this.filters[key]=value;if(value===false||value==='')delete this.filters[key];}this.setData({filters:{...this.filters}});return this.load();},
 clearFilters(){this.sharedRange=null;this.calendarSelectionInitialized=true;this.filters={};this.setData({filters:{},selectedDate:'',offset:0,query:'',searching:false});return this.load();},
 period(e){this.sharedRange=null;this.calendarSelectionInitialized=true;this.setData({offset:this.data.offset+Number(e.currentTarget.dataset.delta),selectedDate:''});return this.load();},
 calendarMode(e){this.sharedRange=null;this.calendarSelectionInitialized=true;this.setData({calendarMode:e.currentTarget.dataset.mode,offset:0,selectedDate:''});return this.load();},
 clearDate(){this.sharedRange=null;this.calendarSelectionInitialized=true;this.setData({selectedDate:''});return this.load();},
 selectDay(e){const day=e.currentTarget.dataset.date;if(!day||day.startsWith('blank-'))return;this.sharedRange=null;this.calendarSelectionInitialized=true;this.setData({selectedDate:this.data.selectedDate===day?'':day});return this.load();},
 relationTab(e){this.setData({relationMode:e.currentTarget.dataset.mode});this.load();},
 category(e){this.setData({category:e.currentTarget.dataset.value});this.load();},
 personFollow(e){if(e.currentTarget.dataset.enabled!==false)return this.follow(e);wx.showActionSheet({itemList:[this.data.t.unfollow],success:r=>{if(r.tapIndex===0)this.follow(e);}});},
 follow(e){const d=e.currentTarget.dataset;this.run(async()=>{await this.write('follow',{id:d.id,enabled:d.enabled!==false});await this.load();});},
 sheet(e){const d=e.currentTarget.dataset,kind=d.kind;this.run(async()=>{if(kind==='city'&&!this.config){this.config=await this.read('config');this.setData({cities:this.config.cities});}if(kind==='manage'&&!this.data.record?.can_manage)throw Error('FORBIDDEN');let values={};if(kind==='register'){const me=await this.read('me');values={display_name:me.profile.display_name,motivation:api.isMock()?'对城市里的公共空间很感兴趣，也想认识一起做社区的人。':''};}if(kind==='recommend')values={text:api.isMock()?'这个主题很适合第一次来 706 的朋友，一起去吧。':''};if(kind==='comment'){values={reply_to:d.reply||'',text:d.reply&&api.isMock()?'谢谢分享，我也想听听你的看法。':''};const list=this.data.comments||[];const threads=list.filter(x=>!x.reply_to&&(d.reply?x.id===d.reply:x.source_surface!=='detail')).map(x=>({...x,replies:list.filter(y=>y.reply_to===x.id)}));this.setData({commentThreads:threads,commentCount:threads.reduce((n,x)=>n+1+x.replies.length,0)});}if(kind==='return')values={note:api.isMock()?(route==='campaign-approval-detail'?'请补充各城市活动如何呼应专题主题，并替换一张缺少来源说明的图片。':'空间 18:30 前还有其他活动，请将布置时间改为 18:40 以后。'):''};if(kind==='group'){let access=await this.write('access',{id:this.options.id});const methods=[];for(const m of access?.methods||[access]){if(!m)continue;methods.push(m.type==='GROUP_QR'&&m.value?.startsWith('706-media:')?{...m,value:(await api.call('mediaPreview',{id:m.value.slice(10),registration:this.options.id})).url}:m);}this.setData({access:{...access,methods}});}if(kind==='report'&&route==='feedback')values=this.data.sheetForm;this.sheetSnapshot=JSON.stringify(values);this.tabVisibility(false);this.setData({sheet:kind,sheetForm:values,consent:false,shareContact:false});});},
 requestCloseSheet(){if(this.data.busy)return;if(this.sheetSnapshot!==undefined&&JSON.stringify(this.data.sheetForm)!==this.sheetSnapshot){const en=this.data.locale==='en';wx.showModal({title:en?'Discard this edit?':'放弃这次编辑？',content:en?'Your changes have not been sent. Closing will discard this edit.':'内容尚未发送，关闭后将放弃这次编辑。',confirmText:en?'Discard':'放弃编辑',cancelText:en?'Keep editing':'继续编辑',success:r=>{if(r.confirm)this.closeSheet();}});return;}this.closeSheet();}, closeSheet(){this.setData({sheet:'',keyboardHeight:0});this.tabVisibility(true);},
 sheetInput(e){this.setData({['sheetForm.'+e.currentTarget.dataset.key]:e.detail.value});},
 consent(e){this.setData({consent:e.detail.value.length>0});},
 contactConsent(e){this.setData({shareContact:e.detail.value.length>0});},
 submitSheet(){this.run(async()=>{const kind=this.data.sheet;let result;
  if(kind==='register')result=await this.write('register',{id:this.options.id,...this.data.sheetForm,privacy_consent:this.data.consent,contact_share_consent:this.data.shareContact});
  else if(kind==='invite')result=await this.write('invite',{id:this.options.id,...this.data.sheetForm});
  else result=await this.write(kind,{id:this.options.id,...this.data.sheetForm});
  this.closeSheet();if(kind==='report'){this.setData({sheetForm:{}});wx.showToast({title:this.data.t.saved,icon:'success'});}if(kind==='register')go('event-access',result.id);else await this.load();});},
 action(e){const {op,id,approve,version,userId,enabled,blockId}=e.currentTarget.dataset;this.run(async()=>{const p={id:id||this.options.id,version:version||this.data.record?.version,...(approve===undefined?{}:{approve}),...(userId?{user_id:userId}:{}),...(enabled===undefined?{}:{enabled:enabled!==false&&enabled!=='false'&&enabled!=='0'&&enabled!==0}),...(blockId?{block_id:blockId}:{})};
  if(op==='review'&&!approve){if(!this.data.sheetForm.note){this.setData({error:this.data.t.REASON_REQUIRED});return;}p.note=this.data.sheetForm.note;}
  if(['cancelEvent','cancelRegistration','revokeRole'].includes(op)){const yes=await new Promise(resolve=>wx.showModal({title:this.data.t[op]||this.data.t.confirm,success:r=>resolve(r.confirm)}));if(!yes)return;}
  if(op==='payment'){this.closeSheet();if(api.isMock()){const choice=await new Promise(resolve=>wx.showModal({title:'模拟支付',content:'仅改变本地演示状态，不会扣款。',success:r=>resolve(r.confirm)}));if(choice){await api.call('payment',p);await this.load();}return;}const r=await api.call('payment',p);await new Promise((resolve,reject)=>wx.requestPayment({...r,success:resolve,fail:reject}));await this.load();return;}
  if(op==='registrationContact'){const contact=await this.write('registrationContact',p);this.setData({contact:contact.wechat||this.data.t.noContact});return;}
  if(op==='withdrawRecommendation'){await this.write('recommend',{id:p.id,enabled:false});await this.load();return;}
  const r=await this.write(op,p);
  if(op==='clone'){go('publish',r.id);return;}if(op==='access'){if(r?.type==='GROUP_QR'&&r.value?.startsWith('706-media:')){const asset=await api.call('mediaPreview',{id:r.value.slice(10),registration:p.id});r.value=asset.url;}this.setData({access:r});return;}
  this.closeSheet();await this.load();
 });},
 updateFields(){
  const kind=formKinds[route];if(!kind)return;
  const {form,t,locale}=this.data,multi=['publish','campaign-create','onboarding'].includes(route),lang=locale==='en'?'en':'zh';
  const fields=forms.fields(kind,multi?this.data.step:0,t,form).map(f=>({...f,dateDisplay:f.type==='datetime'?dates.format(f.value).slice(0,10):'',timeDisplay:f.type==='datetime'?dates.format(f.value).slice(11,16):'',display:f.type==='datetime'?dates.format(f.value):f.type==='space'?this.data.spaces.find(x=>x.id===f.value)?.name:f.type==='organization'?this.data.organizations.find(x=>x.id===f.value)?.name:f.type==='city'?this.config?.cities.find(x=>x.id===f.value)?.[lang]:f.value}));
  this.setData({
   fields,mediaCoverIndex:(form.media||[]).findIndex(x=>x.type==='image'),previewEvent:kind==='event'?normalize({id:form.id||'',title:form.title||'',status:'DRAFT',starts_at:form.starts_at,ends_at:form.ends_at,cover_url:(form.media||[]).find(x=>x.type==='image')?.url||'',price_minor:form.paid?Math.round(Number(form.price_minor||0)*100):0,capacity:form.capacity===''?null:form.capacity,registered:0,venue_display:this.data.spaces.find(x=>x.id===form.space_id)?.name||form.venue_name||'',host_display:form.host_display||''},t,locale):null,formSteps:forms.stepInfo(kind,locale),formStartDisplay:dates.format(form.starts_at),formEndDisplay:dates.format(form.ends_at),
   interestOptions:forms.interestOptions(form.interests||[],locale),
   accessOptions:['GROUP_QR','ORGANIZER_WECHAT','ORGANIZER_WILL_CONTACT'].map(value=>({value,label:t[value],selected:(form.join_methods||[]).includes(value),content:form.access_values?.[value]||''})),
   spaces:this.data.spaces.map(x=>({...x,selected:(form.follow_spaces||form.frequent_spaces||[]).includes(x.id)})),
   venueName:this.data.spaces.find(x=>x.id===form.space_id)?.name||form.venue_name||'',
   spaceNames:[t.choose,...this.data.spaces.map(x=>x.name)],organizationNames:[t.personal,...this.data.organizations.map(x=>x.name)],
   eventOptions:(this.data.eventOptions||[]).map(x=>({...x,selected:(form.event_ids||[]).includes(x.id),cityLabel:this.config?.cities.find(c=>c.id===x.city)?.[lang]||x.city}))
  });
  if(route==='campaign-edit'){
   const keys=['media','title','introduction','resource_links','event_ids'],labels=locale==='en'?['Series cover','Series name','Introduction','Resources and external links','Events in this series']:['系列封面','系列名称','总介绍','资料与外部链接','系列中的活动'];
   const selected=form.event_ids||[],options=this.data.eventOptions||[];
   this.setData({fields:keys.map((key,i)=>({...this.data.fields.find(f=>f.key===key),label:labels[i]})),visibleEventOptions:this.data.showEventPicker?options:selected.map(id=>options.find(x=>x.id===id)).filter(Boolean)});
  }
 },
 listInput(e){const d=e.currentTarget.dataset,list=[...(this.data.form[d.key]||[])];list[Number(d.index)]=e.detail.value;this.setData({['form.'+d.key]:list});this.persist();},
 listAdd(e){const key=e.currentTarget.dataset.key;this.setData({['form.'+key]:[...(this.data.form[key]||[]),'']});this.persist();},
 listRemove(e){const d=e.currentTarget.dataset;this.setData({['form.'+d.key]:(this.data.form[d.key]||[]).filter((_,i)=>i!==Number(d.index))});this.persist();},
 interestsChange(e){this.setData({'form.interests':e.detail.value});this.updateFields();this.persist();},
 methodsChange(e){this.setData({'form.join_methods':e.detail.value});this.updateFields();this.persist();},
 accessInput(e){this.setData({['form.access_values.'+e.currentTarget.dataset.type]:e.detail.value});this.persist();},
 mediaTouchStart(e){if(this.data.busy)return;const touch=e.touches?.[0],index=Number(e.currentTarget.dataset.index);this.mediaTouch=touch&&this.data.form.media?.[index]?.type==='image'?{index,x:touch.clientX,y:touch.clientY}:null;},
 mediaIgnoreDrag(){this.mediaTouch=null;},
 mediaDragStart(){const touch=this.mediaTouch;if(!touch||this.data.busy)return;wx.createSelectorQuery().selectAll('.media-tile').boundingClientRect(rects=>{if(this.mediaTouch!==touch||!rects?.length)return;this.mediaRects=rects;this.setData({dragIndex:touch.index,dragTarget:touch.index,dragX:0,dragY:0});wx.vibrateShort?.({type:'light'});}).exec();},
 mediaDragMove(e){const touch=e.touches?.[0],start=this.mediaTouch;if(!touch||!start||this.data.dragIndex<0)return;const rects=this.mediaRects||[];let target=this.data.dragIndex,distance=Infinity;rects.forEach((rect,index)=>{const dx=touch.clientX-(rect.left+rect.width/2),dy=touch.clientY-(rect.top+rect.height/2),next=dx*dx+dy*dy;if(next<distance){target=index;distance=next;}});this.setData({dragX:touch.clientX-start.x,dragY:touch.clientY-start.y,dragTarget:target});},
 mediaDragEnd(){const from=this.data.dragIndex,to=this.data.dragTarget,media=(this.data.form.media||[]).slice();this.mediaDragCancel();if(from<0||to<0||from===to||from>=media.length||to>=media.length)return;const [asset]=media.splice(from,1);media.splice(to,0,asset);this.setData({'form.media':media});this.updateFields();this.persist();},
 mediaDragCancel(){this.mediaTouch=null;this.mediaRects=null;this.setData({dragIndex:-1,dragTarget:-1,dragX:0,dragY:0});},
 mediaRemove(e){if(this.data.busy||this.data.dragIndex>=0)return;this.setData({'form.media':(this.data.form.media||[]).filter((_,i)=>i!==Number(e.currentTarget.dataset.index))});this.updateFields();this.persist();},
 mediaLink(){if((this.data.form.media||[]).filter(x=>x.type==='link').length>=3){this.setData({error:this.data.t.MEDIA_LIMIT});return;}this.setData({'form.media':[...(this.data.form.media||[]),{type:'link',url:'',label:''}]});this.persist();},
 mediaLinkInput(e){const list=[...(this.data.form.media||[])],i=Number(e.currentTarget.dataset.index);list[i]={...list[i],url:e.detail.value,label:e.detail.value};this.setData({'form.media':list});this.persist();},
 formatCopy(e){const key='introduction',prefix=e.currentTarget.dataset.kind==='title'?'\n## ':e.currentTarget.dataset.kind==='quote'?'\n> ':'\n\n';this.setData({['form.'+key]:(this.data.form[key]||'')+prefix});this.persist();},
 restartForm(){this.setData({submitted:false,step:1});this.updateFields();},
  input(e){const k=e.currentTarget.dataset.key;this.setData({['form.'+k]:e.detail.value,['formErrors.'+k]:''});this.updateFields();this.persist();},
 switchInput(e){this.input(e);},
 select(e){const {key,type}=e.currentTarget.dataset;const v=Number(e.detail.value);let value;
  if(type==='city')value=this.config.cities[v].id;
  if(type==='space')value=v===0?'':this.data.spaces[v-1].id;
  if(type==='organization')value=v===0?'':this.data.organizations[v-1].id;
  if(type==='access')value=['GROUP_QR','ORGANIZER_WECHAT','ORGANIZER_WILL_CONTACT'][v];
  this.setData({['form.'+key]:value});this.updateFields();this.persist();
 },
 upload(e){const d=e.currentTarget.dataset,key=d.key,type=d.type||'image',isMedia=key==='media',isPrivate=key==='access_value'||key==='access_values.GROUP_QR';return this.run(async()=>{
  if(type==='video')throw Object.assign(new Error('MEDIA_TYPE_INVALID'),{code:'MEDIA_TYPE_INVALID'});
  const existing=this.data.form.media||[],limit=this.data.formKind==='campaign'?12:9,remaining=limit-existing.filter(x=>x.type===type).length,count=isMedia&&!d.replace?Math.min(9,remaining):1;
  if(count<1)throw Error('MEDIA_LIMIT');
  let selected;try{selected=await new Promise((resolve,reject)=>wx.chooseMedia({count,mediaType:[type],success:resolve,fail:reject}));}catch(error){if(/cancel/i.test(error.errMsg||error.message||''))return;throw error;}
  const files=selected.tempFiles||[];if(!files.length)return;if(files.length>count)throw Error('MEDIA_LIMIT');if(files.some(file=>file.size>10*1024*1024))throw Error('MEDIA_INVALID');
  if(isPrivate&&!api.isMock())throw Object.assign(new Error('群二维码暂不保存。请选择「发起者会联系你」。'),{code:'ACCESS_INVALID'});
  for(const file of files){const path=file.tempFilePath;let asset;
   if(api.isMock()){const saved=await new Promise((resolve,reject)=>wx.getFileSystemManager().saveFile({tempFilePath:path,success:r=>resolve(r.savedFilePath),fail:reject}));asset=api.mock.localMedia(saved);}else asset=await api.call('mediaUpload',{path,type});
   if(isMedia){const media=(this.data.form.media||[]).slice(),item={type,url:asset.url,label:path.split('/').pop()},cover=media.findIndex(x=>x.type==='image');if(d.replace&&cover>=0)media[cover]=item;else media.push(item);this.setData({'form.media':media});}
   else this.setData({['form.'+key]:isPrivate?'706-media:'+asset.id:asset.url,['mediaPreviews.'+key]:asset.preview_url||asset.url});
   this.updateFields();this.persist();
  }
 });},
 dateInput(e){const key=e.currentTarget.dataset.key;const old=this.data.form[key]?dates.format(this.data.form[key]):dates.localDate()+' 12:00';const next=e.currentTarget.dataset.part==='date'?e.detail.value+' '+old.slice(11,16):old.slice(0,10)+' '+e.detail.value;const iso=new Date(next.replace(' ','T')+':00+08:00').toISOString();const patch={['form.'+key]:iso};if(key==='ends_at')this.endFollowsStart=false;if(key==='starts_at'&&this.endFollowsStart)patch['form.ends_at']=new Date(Date.parse(iso)+3600000).toISOString();this.setData(patch);this.updateFields();this.persist();},
 spaceSelection(e){this.setData({'form.follow_spaces':e.detail.value,'form.frequent_spaces':e.detail.value});this.updateFields();this.persist();},
 preference(e){const kind=e.currentTarget.dataset.kind;return this.run(async()=>{const me=await this.read('me');if(kind==='share_activity'){await this.write('profile',{share_activity:!me.profile?.share_activity});wx.showToast({title:this.data.t.saved});}else if(kind==='visibility'){const visibility=me.profile?.visibility==='PUBLIC'?'MEMBERS':'PUBLIC';await this.write('profile',{visibility});wx.showToast({title:this.data.t.saved});}else{const enabled=!me.profile?.notification_preferences?.enabled;await this.write('profile',{notification_preferences:{enabled}});wx.showToast({title:this.data.t.saved});}await this.load();});},
 eventSelection(e){const next=e.detail.value,previous=this.data.form.event_ids||[];this.setData({'form.event_ids':[...previous.filter(id=>next.includes(id)),...next.filter(id=>!previous.includes(id))]});this.persist();},
 toggleEventPicker(){this.setData({showEventPicker:!this.data.showEventPicker});this.updateFields();},
 persist(){wx.setStorageSync(this.draftKey(),this.data.form);wx.setStorageSync(this.draftKey()+'.step',this.data.step);this.setData({draftSaved:true});},
 validateForm(submit=false){const kind=formKinds[route],errors=forms.validate(kind,this.data.form,{step:submit?0:this.data.step,submit,consent:route!=='onboarding'||this.data.consent,locale:this.data.locale});this.setData({formErrors:errors});const key=Object.keys(errors)[0];if(!key)return true;const step= forms.fieldStep(kind,key);if(['publish','campaign-create','onboarding'].includes(route)&&step<=3)this.setData({step});this.updateFields();wx.nextTick?.(()=>wx.pageScrollTo?.({selector:'#field-'+key,duration:0}));return false;},
 step(e){const delta=Number(e.currentTarget.dataset.delta);if(delta>0&&!this.validateForm())return;this.setData({step:Math.max(1,Math.min(3,this.data.step+delta)),formErrors:{}});this.updateFields();this.persist();wx.pageScrollTo?.({scrollTop:0,duration:0});},
 saveDraft(){this.persist();wx.showToast({title:this.data.t.formSaved,icon:'none'});},
 saveForm(e){const submit=e?.currentTarget?.dataset?.submit||(route==='campaign-edit'&&this.data.record?.status==='PUBLISHED');if((submit||formKinds[route]==='space')&&!this.validateForm(true))return;this.run(async()=>{
  const kind=formKinds[route], p=forms.payload(kind,this.data.form);
  if(kind==='space'){if(!canManageCommunity((await this.read('me')).roles))return;const created=await this.write('createSpace',p);wx.removeStorageSync(this.draftKey());wx.removeStorageSync(this.draftKey()+'.step');wx.redirectTo({url:'/pages/space/index?id='+encodeURIComponent(created.id)});return;}
  let op=kind==='event'?'saveEvent':kind==='campaign'?'saveCampaign':kind==='profile'?'profile':'entity';
  if(kind==='profile'&&route==='onboarding'){p.complete=!!submit;p.privacy_consent=this.data.consent;}
  if(kind==='entity')p.id=this.options.id;
  if(op==='registrationContact'){const contact=await this.write('registrationContact',p);this.setData({contact:contact.wechat||this.data.t.noContact});return;}
  if(op==='withdrawRecommendation'){await this.write('recommend',{id:p.id,enabled:false});await this.load();return;}
  const r=await this.write(op,p);this.setData({form:forms.toForm({...r,...(kind==='event'?{access:p.access}:{}),...(kind==='profile'?{wechat:p.wechat,follow_spaces:p.follow_spaces}:{})}),record:r});this.persist();
  if(submit&&(kind==='event'||kind==='campaign')){await this.write(kind==='event'?'submitEvent':'submitCampaign',{id:r.id,version:r.version});wx.removeStorageSync(this.draftKey());wx.removeStorageSync(this.draftKey()+'.step');this.setData({submitted:true,submittedId:r.id});}
  else if(kind==='profile'&&submit){wx.removeStorageSync(this.draftKey());wx.removeStorageSync(this.draftKey()+'.step');this.setData({submitted:true});}
  else wx.showToast({title:this.data.t.saved,icon:'success'});
  this.updateFields();
 });},
 loginInput(e){this.setData({[e.currentTarget.dataset.key]:e.detail.value});},
 sendCode(){this.run(async()=>{await api.login(this.data.loginMode||'phone',this.data.address);this.setData({codeSent:true});if(api.isMock())wx.showToast({title:'演示验证码：706000',icon:'none'});});},
 verifyCode(){this.run(async()=>{if(!String(this.data.code||'').trim())throw Error('CODE_REQUIRED');await api.login(this.data.loginMode||'phone',this.data.address,this.data.code);const me=await this.read('me');prefs.fromProfile(me.profile);if(me.profile?.onboarded)go('me');else go('onboarding');});},
 loginMode(){this.setData({loginMode:this.data.loginMode==='email'?'phone':'email',codeSent:false});},
 wechatLogin(){this.run(async()=>{if(api.isMock()){await api.call('wechatLogin');go('me');return;}const r=await new Promise((resolve,reject)=>wx.login({success:resolve,fail:reject}));const login=await api.call('wechatLogin',{code:r.code});api.setSession(login.user);const me=await this.read('me');prefs.fromProfile(me.profile);go(me.profile?.onboarded?'me':'onboarding');});},
 copy(e){wx.setClipboardData({data:e.currentTarget.dataset.value});},
 async refreshMedia(){const values=this.data.formKind?this.data.form:this.data.record||{};const out={};for(const key of ['cover_url','avatar_url','access_value']){const value=values[key];if(!value)continue;const match=value.match(/(?:706-media:|\/community\/media\/)([^/?]+)$/);if(!match)continue;try{out[key]=(await api.call('mediaPreview',{id:match[1]})).url;}catch{out[key]=key==='access_value'?'':value;}}this.setData({mediaPreviews:out});},
 galleryChange(e){this.setData({galleryIndex:e.detail.current});},
 previewImage(e){const d=e.currentTarget.dataset,urls=d.gallery?this.data.record?.galleryUrls:[d.url];if(urls?.length)wx.previewImage({current:d.url||urls[Number(d.index)||0],urls});},
 coverError(e){const id=e.currentTarget.dataset.id,clear=x=>x.id===id?{...x,cover_url:''}:x;this.setData({items:this.data.items.map(x=>({...clear(x),...(x.event?{event:clear(x.event)}:{})}))});},
 poster(){this.run(async()=>{
  const range=this.sharedRange||dates.range(this.data.calendarMode,this.data.offset);const params={...this.filters,city:this.data.city,from:range.from,to:range.to};
  if(this.data.selectedDate){params.from=new Date(this.data.selectedDate+'T00:00:00+08:00').toISOString();params.to=new Date(new Date(params.from).getTime()+86400000).toISOString();}
  const share=await api.call('calendarCode',{params}),items=share.items,renderer=require('./calendar-poster'),plan=renderer.layout(items,this.data.locale);
  const codePath=wx.env.USER_DATA_PATH+'/706-calendar-code.png';if(share.code)await new Promise((resolve,reject)=>wx.getFileSystemManager().writeFile({filePath:codePath,data:share.code,encoding:'base64',success:resolve,fail:reject}));
  const covers=await Promise.all(items.map(x=>x.cover_url?new Promise(resolve=>wx.getImageInfo({src:x.cover_url,success:r=>resolve({path:x.cover_url.startsWith('/')?x.cover_url:r.path,width:r.width,height:r.height}),fail:()=>resolve(null)})):Promise.resolve(null)));
  const period=dates.localDate(new Date(params.from))+' — '+dates.localDate(new Date(Date.parse(params.to)-86400000)),en=this.data.locale==='en',title=this.data.selectedDate?(en?'Daily events':'当日活动日历'):this.data.calendarMode==='month'?(en?['January','February','March','April','May','June','July','August','September','October','November','December'][Number(period.slice(5,7))-1]+' events':Number(period.slice(5,7))+' 月活动日历'):(en?'This week’s events':'本周活动日历'),space=this.data.spaces.find(x=>x.id===params.space_id)?.name||this.data.t.allSpaces,tag=[params.free_only?this.data.t.free:'',params.has_capacity?this.data.t.capacity:'',params.tag?this.data.t[params.tag]:''].filter(Boolean).join(' · ')||this.data.t.any;
  this.setData({posterHeight:plan.height,posterWidth:plan.width,posterPeriod:period,posterTitle:title});await new Promise(resolve=>wx.nextTick(resolve));
  const c=wx.createCanvasContext('poster',this);renderer.draw(c,plan,{city:this.data.cityName,title,period,filters:space+' · '+tag,notice:this.data.t.posterNotice,demo:share.demo,codePath:share.code?codePath:'',covers});
  await new Promise(resolve=>c.draw(false,resolve));const r=await new Promise((resolve,reject)=>wx.canvasToTempFilePath({canvasId:'poster',width:plan.width,height:plan.height,success:resolve,fail:reject},this));this.setData({posterPath:r.tempFilePath,sheet:'poster'});
 });},
 loadLab(){const catalog=require('./mock/catalog').map((e,index)=>({...e,index})),pending=require('./mock/pending-review');const pendingCatalog=[...pending.originalQueries.map(query=>catalog.find(e=>e.sourceQuery===query)),...pending.extraRoutes.map(route=>catalog.find(e=>e.route===route))].filter(Boolean).map(e=>({...e,label:e.label.replace(/^原型 · /,''),note:e.route==='onboarding'||e.route==='campaign-create'?'进入现有表单；各步骤及成功态请在页面内操作。':e.route==='event-access'&&e.options?.sheet==='payment'?'需要有效待付款凭证；过期时保留现状，不自动重置。':e.route==='event-access'&&e.options?.sheet==='group'?'需先在现有报名凭证完成模拟支付，已确认后再打开；不自动改状态。':e.options?.submitted?'直接展示成功态；完整提交流程请从发布第一步进入。':''}));this.setData({catalog,pendingCatalog,developerPersonas:api.isMock()?api.mock.personas:[]});},
 labOpen(e){const entry=this.data.catalog[Number(e.currentTarget.dataset.index)];if(!api.isMock()){this.setData({error:'合成页面目录仅用于离线演示模式。'});return;}api.mock.configure({persona:entry.persona||'demo-member',scenario:'normal'});prefs.set({city:'shanghai'});const options={...entry.options,...(e.currentTarget.dataset.pending?{}:{reviewIndex:e.currentTarget.dataset.index}),...(entry.id?{id:entry.id}:{})};pendingTabPreview=null;const query=Object.entries(options).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');wx.reLaunch({url:'/pages/'+entry.route+'/index'+(query?'?'+query:'')});},
 labQuery(e){const q=e.detail.value.toLowerCase();this.setData({filteredCatalog:this.data.catalog.filter(c=>[c.label,c.sourceQuery,c.route,String(c.index)].join(' ').toLowerCase().includes(q))});},
 reviewNext(e){const catalog=require('./mock/catalog'),index=this.data.reviewIndex+Number(e.currentTarget.dataset.delta);if(index<0||index>=catalog.length)return;this.closeSheet();this.setData({catalog});this.labOpen({currentTarget:{dataset:{index}}});},
  labPersona(e){api.mock.configure({persona:e.currentTarget.dataset.id});wx.reLaunch({url:'/pages/review-lab/index'});},
 labScenario(e){api.mock.configure({scenario:e.currentTarget.dataset.id});wx.reLaunch({url:'/pages/discover/index'});},
 labReset(){wx.showModal({title:'重置演示数据',content:'清空本地演示修改、草稿、身份与筛选，不影响 706 服务上的数据。',success:r=>{if(!r.confirm)return;const keys=wx.getStorageInfoSync().keys;keys.filter(k=>k.startsWith('706.draft.mock.')||k.startsWith('706.preferences.mock.')).forEach(k=>wx.removeStorageSync(k));api.mock.reset();wx.reLaunch({url:'/pages/review-lab/index'});}});},
 labMode(){const next=api.isMock()?'soon':'mock';wx.showModal({title:next==='soon'?'连接 706 服务':'切换离线演示',content:next==='soon'?'真实模式使用独立账号，操作会保存到 706 服务。开发者工具里请勾选不校验合法域名。':'所有演示操作仅保存在本机。',success:r=>{if(!r.confirm)return;api.setMode(next);wx.reLaunch({url:'/pages/review-lab/index'});}});},
 savePoster(){return this.run(async()=>{await new Promise((resolve,reject)=>wx.saveImageToPhotosAlbum({filePath:this.data.posterPath,success:resolve,fail:reject}));wx.showToast({title:this.data.locale==='en'?'Poster saved':'海报已保存',icon:'success'});});}
};};
module.exports.editorial=editorial;
