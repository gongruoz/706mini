// Synthetic offline fixtures inspired by dist's business situations, never real accounts.
const VERSION='2026-10-09-native-details-r12';
const cities=[['shanghai','上海','Shanghai'],['beijing','北京','Beijing'],['guangzhou','广州','Guangzhou'],['shenzhen','深圳','Shenzhen'],['hangzhou','杭州','Hangzhou'],['chengdu','成都','Chengdu']].map(([id,zh,en])=>({id,zh,en,timezone:'Asia/Shanghai'}));
const personas=[['demo-member','林叶 · 演示成员'],['demo-host','禾舟 · 演示发起人'],['demo-admin','星桥 · 演示运营'],['demo-new','初芽 · 演示新人'],['','游客']].map(([id,label])=>({id,label}));
function seed(){
 const localDay=new Date(Date.now()+8*3600000).toISOString().slice(0,10);const base=new Date(localDay+'T00:00:00+08:00');const anchor=base.toISOString();
 const at=(day,hour=11)=>new Date(base.getTime()+day*86400000+hour*3600000).toISOString();
 const rows=[];let seq=0;
 const add=(type,id,data)=>{const r={id,type,owner:'demo-host',parent:'',status:'ACTIVE',version:1,created_at:at(-4,seq++%12),updated_at:at(0),...data};rows.push(r);return r;};
 const members=[...personas.filter(p=>p.id),...['云汀','夏枝','月弦','山岚','石溪','微澜','青禾','松果'].map((n,i)=>({id:'demo-peer-'+i,label:n+' · 虚构成员'}))];
 members.forEach((p,i)=>add('profile','profile-'+p.id,{owner:p.id,display_name:p.label,bio:['城市观察 · 桌游','社区放映 · 散步','空间运营 · 共读'][i%3],introduction:'这是离线演示中的合成人物，用来检查社区关系和权限。',city:i===8?'hangzhou':'shanghai',interests:['reading','outdoor'],visibility:i===10?'MEMBERS':'PUBLIC',share_activity:i%2===0,onboarded:p.id!=='demo-new',notification_preferences:{enabled:true},avatar_url:'/assets/demo/avatar-'+i%4+'.png'}));
 [['demo-space','SPACE','706 演示客厅','shanghai'],['demo-space-hz','SPACE','纸舟演示书屋','hangzhou'],['demo-org','ORGANIZATION','城市共同生活演示小组','shanghai']].forEach(([id,kind,name,city])=>add('entity',id,{kind,name,city,introduction:'虚构空间与组织，仅供导入工程评审。',address:'演示地址 · 不对应实际场地',opening_hours:'10:00–22:00（演示）',public_contact:'演示联系入口，无真实联系方式',cover_url:'/assets/demo/cover-1.png'}));
 add('role','demo-role-platform',{owner:'demo-admin',scope:'PLATFORM',role:'OWNER'});
 add('role','demo-role-host',{owner:'demo-host',parent:'demo-org',scope:'ENTITY',role:'OWNER'});
 add('role','demo-role-space',{owner:'demo-host',parent:'demo-space',scope:'ENTITY',role:'OWNER'});
 add('role','demo-role-peer',{owner:'demo-peer-0',parent:'demo-space',scope:'ENTITY',role:'ADMIN'});
 const specs=[
 ['film','秋日放映：城市游牧者',1,3000,true,8,'screening'],
 ['walk','苏州河慢走：寻找城市缝隙',2,0,false,16,'outdoor'],
 ['workshop','社区功能许愿工作坊',3,0,true,12,'reading'],
 ['frisbee','傍晚飞盘｜零基础友好',4,2000,false,2,'outdoor'],
 ['reading','周末共读：我们如何一起生活',6,0,false,null,'reading'],
 ['dinner','陌生人晚餐 · 杭州演示场',8,2500,false,8,'outdoor'],
 ['next-film','下周放映与映后圆圈',10,0,false,20,'screening'],
 ['month-walk','月底城市记录漫步',20,0,false,20,'outdoor'],
 ['free-wait','免费满员 · 候补递补练习',5,0,false,1,'reading'],
 ['no-wait','满员且关闭候补',5,0,false,1,'reading'],
 ['ended','已经结束的社区共读',-7,0,false,12,'reading'],
 ['cancelled','取消的城市散步',7,0,false,12,'outdoor'],
 ['draft','待完善的周末共读',9,0,true,16,'reading'],
 ['review','三方审核中的工作坊',12,0,false,18,'reading'],
 ['returned','退回修改的放映',13,0,false,12,'screening']
 ];
 specs.forEach(([key,title,day,price,approval,capacity,tag],i)=>{
 const r=add('event','demo-'+key,{title,summary:'沿用原型活动主题的合成演示；可检查报名、候补、审核与通知。',description:'一起从城市生活中寻找连接。\n活动包含开场介绍、小组交流和共同记录。此活动为本地虚构数据，不接受实际报名。',fit_description:'欢迎第一次参与的伙伴；无需相关经验。',city:key==='dinner'?'hangzhou':'shanghai',space_id:key==='dinner'?'demo-space-hz':'demo-space',organization_id:'demo-org',venue_display:key==='dinner'?'纸舟演示书屋':'706 演示客厅',address:'演示地址 · 不对应实际场地',host_display:'禾舟 · 演示发起人 & 演示小组',starts_at:at(day),ends_at:at(day,14),price_minor:price,capacity,approval_required:approval,waitlist_enabled:key!=='no-wait',tags:[tag],visibility:'PUBLIC',status:key==='draft'?'DRAFT':key==='review'?'IN_REVIEW':key==='returned'?'CHANGES_REQUESTED':key==='cancelled'?'CANCELLED':'PUBLISHED',round:['review','returned'].includes(key)?1:0,cover_url:'/assets/demo/cover-'+i%4+'.png'});
 add('eventSecret','access-'+key,{parent:r.id,access:{type:'ORGANIZER_WILL_CONTACT',value:'演示参与方式：工作人员将在活动前联系你。不会发送实际消息。'}});
 });
 const reg=(id,event,owner,status,extra={})=>add('registration',id,{parent:'demo-'+event,owner,status,display_name:members.find(x=>x.id===owner)?.label||'演示成员',motivation:'想认识一起观察城市的伙伴（演示）。',approval_status:status==='REQUESTED'?'PENDING':'APPROVED',contact_share_consent:false,payment_expires_at:new Date(Date.now()+1800000).toISOString(),...extra});
 reg('demo-reg-confirmed','reading','demo-member','CONFIRMED');
 reg('demo-reg-requested','workshop','demo-member','REQUESTED');
 reg('demo-reg-payment','film','demo-member','APPROVED_AWAITING_PAYMENT');
 reg('demo-reg-rejected','walk','demo-member','REJECTED');
 reg('demo-reg-cancelled','next-film','demo-member','CANCELLED');
 reg('demo-reg-expired','dinner','demo-member','EXPIRED');
 reg('demo-reg-paid','film','demo-peer-1','CONFIRMED');
 reg('demo-reg-full-1','frisbee','demo-peer-0','CONFIRMED');reg('demo-reg-full-2','frisbee','demo-peer-2','CONFIRMED');
 reg('demo-reg-wait','frisbee','demo-member','WAITLISTED');
 reg('demo-reg-release','free-wait','demo-member','CONFIRMED');reg('demo-reg-promote','free-wait','demo-host','WAITLISTED');
 reg('demo-reg-closed','no-wait','demo-peer-0','CONFIRMED');
 reg('demo-reg-common','reading','demo-peer-0','CONFIRMED');
 reg('demo-reg-host-request','film','demo-peer-3','REQUESTED',{contact_share_consent:true});
 add('contact','demo-contact',{owner:'demo-peer-3',wechat:'DEMO_ONLY_NOT_A_REAL_CONTACT'});
 add('contact','demo-self-contact',{owner:'demo-member',wechat:'DEMO_MEMBER_NO_REAL_ACCOUNT'});
 add('media','demo-access-image',{owner:'demo-host',url:'/assets/demo/access-placeholder.png',private:true});
 rows.find(r=>r.id==='access-reading').access={type:'GROUP_QR',value:'706-media:demo-access-image'};
 rows.find(r=>r.id==='access-film').access={type:'ORGANIZER_WECHAT',value:'DEMO_ONLY_NOT_A_REAL_CONTACT · 演示号码，请勿添加'};
 rows.find(r=>r.id==='demo-walk').owner='demo-member';
 rows.find(r=>r.id==='demo-walk').host_display='林叶 · 演示成员';
 ['PLATFORM','ORGANIZATION','SPACE'].forEach((scope,i)=>add('review','demo-review-'+i,{parent:'demo-review',title:'三方审核中的工作坊',scope,entity_id:scope==='SPACE'?'demo-space':'demo-org',status:'PENDING',subject_type:'event',round:1}));
 add('review','demo-review-returned',{parent:'demo-returned',title:'退回修改的放映',scope:'PLATFORM',status:'CHANGES_REQUESTED',subject_type:'event',round:1,note:'请补充活动的适合人群与无障碍说明（演示）。'});
 [['demo-campaign','PUBLISHED','我们为什么留在这里？'],['demo-campaign-draft','DRAFT','城市里的共同生活'],['demo-campaign-review','IN_REVIEW','正在等待关联确认的专题']].forEach(([id,status,title])=>add('campaign',id,{status,title,kicker:'多城联动 · 706 客厅对话（演示）',introduction:'用放映、散步、共读记录城市里的连接。所有成员与地点均为合成演示。',event_ids:['demo-film','demo-walk','demo-workshop','demo-dinner'],resource_links:['https://example.com/demo-resource'],organization_id:'demo-org',visibility:'PUBLIC',cover_url:'/assets/demo/cover-2.png',round:status==='IN_REVIEW'?1:0}));
 ['PLATFORM','ORGANIZATION','INITIATOR'].forEach((scope,i)=>add('review','demo-campaign-task-'+i,{parent:'demo-campaign-review',title:'专题关联审核',scope,entity_id:'demo-org',event_id:'demo-film',status:'PENDING',subject_type:'campaign',round:1}));
 add('review','demo-campaign-other-owner',{parent:'demo-campaign-review',owner:'demo-member',title:'散步发起人关联确认',scope:'INITIATOR',event_id:'demo-walk',status:'PENDING',subject_type:'campaign',round:1});
 add('invitation','demo-invite',{owner:'demo-member',parent:'demo-space',inviter:'demo-host',role:'ADMIN',status:'PENDING'});
 [['demo-member','demo-host'],['demo-peer-0','demo-member'],['demo-member','demo-space'],['demo-peer-1','demo-space']].forEach(([owner,parent],i)=>add('follow','demo-follow-'+i,{owner,parent}));
 ['demo-member','demo-peer-2','demo-peer-3'].forEach((owner,i)=>add('recommendation','demo-rec-'+i,{owner,parent:i===2?'demo-walk':'demo-film',text:['期待映后一起聊城市居住。','欢迎第一次参加的伙伴。','慢走的时候最容易发现新风景。'][i]}));
 add('comment','demo-comment',{owner:'demo-peer-0',parent:'demo-film',text:'第一次参与也可以吗？（演示）'});
 add('comment','demo-reply',{owner:'demo-host',parent:'demo-film',reply_to:'demo-comment',text:'欢迎！我们会先做简单介绍。（演示）'});
 for(const owner of ['demo-member','demo-host','demo-admin'])['EVENT','SOCIAL','ADMIN'].forEach((category,i)=>add('notification','demo-note-'+owner+'-'+i,{owner,category,status:i===1?'READ':'UNREAD',key:['CONFIRMED','COMMENTED','ROLE_INVITED'][i],target:i===2?{route:'invitations'}:{route:'event',id:'demo-film'}}));
 const sourceMap=require('./restore-prototype')(rows,add,at);
 nodeContent(rows);
 return {version:VERSION,anchor,rows,sourceMap,serial:100,commands:{},persona:'demo-member',scenario:'normal'};
}
// Add only missing synthetic public editorial links. Never derive hosts from roles.
function nodeContent(rows){
 const examples=[['demo-space','demo-host'],['demo-sola-space','demo-peer-1'],['demo-space-hz','demo-peer-1']];
 for(const [id,host]of examples){const space=rows.find(r=>r.id===id);if(!space||space.public_links!==undefined)continue;
  space.public_links=[
   {kind:'host',user_id:host,role:'空间主理人',role_en:'Space host'},
   {kind:'official_account',label:space.name+' · 演示公众号',username:'',demo:true},
   {id:id+'-recap-1',kind:'recap',label:'把一张桌子留给陌生人',published_at:'2026-09-28',cover_url:'/assets/demo/cover-2.png',demo:true,excerpt:'这是一篇虚构的空间回顾，用来预览文章入口。一次相聚之后，大家留在桌边继续聊天，从居住、迁徙聊到如何一起经营一个客厅。正式内容将由空间提供真实公众号文章链接。'},
   {id:id+'-recap-2',kind:'recap',label:'周末客厅：一起做饭、散步和聊天',published_at:'2026-09-12',cover_url:'/assets/demo/cover-3.png',demo:true,excerpt:'这是离线演示文章，不对应真实公众号。回顾可以记录活动之外的相处方式，让第一次到访的人了解空间的日常。'}
  ];
 }
}
module.exports={seed,cities,personas,VERSION,nodeContent};
