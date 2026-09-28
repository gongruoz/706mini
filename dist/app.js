const people = [
  { id:'jiang', name:'Jiang', initial:'江', color:'#ddff6a', bio:'城市研究 · 桌游发起人', city:'上海', following:false },
  { id:'qiao', name:'阿乔', initial:'乔', color:'#ffd7cb', bio:'产品设计 · 放映组织者', city:'上海', following:true },
  { id:'shing', name:'Shing', initial:'S', color:'#dce7ff', bio:'开发者 · 关心公共空间', city:'上海', following:false },
  { id:'maomao', name:'毛毛', initial:'毛', color:'#ffeaa6', bio:'自由写作者 · 徒步爱好者', city:'上海', following:false },
  { id:'ning', name:'宁宁', initial:'宁', color:'#d8f2e3', bio:'社区运营 · 手作老师', city:'杭州', following:true },
  { id:'xiaobei', name:'小北', initial:'北', color:'#f5dbff', bio:'独立策展 · 社区厨房', city:'上海', following:false },
  { id:'yiming', name:'一鸣', initial:'鸣', color:'#ccefe9', bio:'摄影师 · 城市漫游', city:'上海', following:false },
  { id:'chenmo', name:'陈墨', initial:'墨', color:'#ffe2a8', bio:'心理咨询 · 读书会', city:'上海', following:false }
];

const events = [
  {
    id:'film', title:'秋日放映：城市游牧者', date:'周六', day:'26', time:'19:30–22:00', city:'上海',
    venue:'706 青年空间', address:'静安区愚园路 1088 号', price:30, spots:8, joined:12,
    host:'阿乔', org:'Sola 放映组', color:'linear-gradient(135deg,#3657cf,#24285e 65%,#131425)',
    summary:'一起看一部关于城市、居住与漂泊的纪录片。映后围成一圈，聊聊我们为什么留在一座城市。',
    fit:'对城市生活、社区与纪录片感兴趣的人。不需要任何电影背景。', approval:true, campaign:'dialog2026'
  },
  {
    id:'walk', title:'苏州河慢走：寻找城市缝隙', date:'周日', day:'27', time:'15:00–18:00', city:'上海',
    venue:'M50 创意园门口', address:'普陀区莫干山路 50 号', price:0, spots:5, joined:15,
    host:'毛毛', org:'个人发起', color:'linear-gradient(135deg,#25745f,#163d34 68%,#0d2420)',
    summary:'不赶路的城市散步。沿苏州河记录桥下、旧厂房和正在变化的社区，最后找地方一起吃饭。',
    fit:'愿意走路、观察和聊天的人。全程约 5 公里。', approval:false
  },
  {
    id:'workshop', title:'社区功能许愿工作坊', date:'周三', day:'30', time:'19:00–21:30', city:'上海',
    venue:'706 青年空间', address:'静安区愚园路 1088 号', price:0, spots:12, joined:8,
    host:'Jiang', org:'706 产品小组', color:'linear-gradient(135deg,#ee784b,#9e3528 70%,#4f1918)',
    summary:'把你希望社区拥有的功能画出来。我们会一起讨论活动、空间、成员和信息流应该怎么连接。',
    fit:'706 社区成员，以及对共创产品感兴趣的人。', approval:false, campaign:'dialog2026'
  },
  {
    id:'frisbee', title:'傍晚飞盘｜零基础友好', date:'10月3日', day:'03', time:'17:00–19:00', city:'上海',
    venue:'徐汇滨江草坪', address:'龙腾大道与瑞宁路交叉口', price:20, spots:0, joined:24,
    host:'Shing', org:'飞盘散人局', color:'linear-gradient(135deg,#8c6c1a,#44320a 65%,#201802)',
    summary:'没有固定队伍，也不卷技术。先做基础练习，再分组玩几轮，日落之后一起去附近吃饭。',
    fit:'第一次玩飞盘也可以参加，现场提供飞盘。', approval:false
  }
];

const campaign = {
  id:'dialog2026', title:'我们为什么留在这里？', kicker:'12 城联动 · 706 客厅对话',
  summary:'从一部电影、一顿晚餐或一次散步开始，在不同城市同时讨论居住、迁徙与社区。每个城市由本地成员独立发起，共用同一个主题与资料包。',
  cities:['上海','杭州','北京','广州','成都'], cover:'linear-gradient(135deg,#6b3be8,#ef6650 62%,#ffbf4b)'
};

const calendarWeeks = [
  {month:'九月',days:[['一','15','无'],['二','16','无'],['三','17','无'],['四','18','无'],['五','19','无'],['六','20','无'],['日','21','无']]},
  {month:'九月',days:[['一','22','无'],['二','23','无'],['三','24','无'],['四','25','无'],['五','26','周六'],['六','27','周日'],['日','28','无']]},
  {month:'九月',days:[['一','29','无'],['二','30','周三'],['三','1','无'],['四','2','无'],['五','3','10月3日'],['六','4','无'],['日','5','无']]},
  {month:'十月',days:[['一','6','无'],['二','7','无'],['三','8','无'],['四','9','无'],['五','10','无'],['六','11','无'],['日','12','无']]},
  {month:'十月',days:[['一','13','无'],['二','14','无'],['三','15','无'],['四','16','无'],['五','17','无'],['六','18','无'],['日','19','无']]}
];

const cityNames={上海:'Shanghai',北京:'Beijing',广州:'Guangzhou',深圳:'Shenzhen',杭州:'Hangzhou',成都:'Chengdu'};
const englishPhrases={
  '发现有意思的人':'People you may like','换几个':'Refresh','动态':'Updates','发现':'Discover','消息':'Messages','我的':'Me','发布活动':'Create event','706 社区':'706 Community',
  '关注':'Following','被关注':'Followers','编辑资料':'Edit profile','管理员待办':'Admin tasks','活动草稿':'Event drafts','我报名的活动':'My registrations','我发布的活动':'My events','我管理的组织':'Organizations I manage','我管理的空间':'Spaces I manage','更多':'More',
  '城市':'City','语言':'Language','简体中文':'Simplified Chinese','通知设置':'Notifications','隐私与安全':'Privacy & safety','关于 706 社区':'About 706 Community','反馈与建议':'Feedback','当前城市':'Current city','选择城市':'Choose a city','选择语言':'Choose a language',
  '选择界面语言':'Choose interface language','按你的语言和所在城市，提供更合适的活动与社区信息。':'Choose your language and city for more relevant events and community updates.','活动与推荐会优先显示这个城市的内容。':'Events and recommendations from this city will appear first.','切换后，界面导航、操作与系统提示会立即更新。':'Navigation, actions, and system messages update immediately.','通知设置将在正式版接入':'Notification settings will be available in the full release','隐私与安全设置将在正式版接入':'Privacy settings will be available in the full release','已切换至':'Switched to ',
  '搜索活动、成员、组织或空间':'Search events, people, groups, or spaces','搜索':'Search','主要导航':'Primary navigation','活动系列':'Event series','活动筛选':'Event filters','城市研究 / 社区产品':'Urban research / community product',
  '本周':'This week','下周':'Next week','日历':'Calendar','九月':'September','十月':'October','上一周':'Previous week','下一周':'Next week','全部空间':'All spaces','不限':'Any','免费':'Free','有名额':'Spots available','共读':'Reading','放映':'Screening','户外':'Outdoor',
  '本周活动':'Events this week','下周活动':'Events next week','近期活动':'Upcoming events','名额已满':'Full','报名中':'Open','你已报名':'Registered','人报名':' registered','剩余 ':'','个名额':' spots left','余 ':'','查看系列':'View series','等城市同步发生':'across multiple cities',
  '全部':'All','管理':'Admin','活动':'Events','互动':'Social','全部标为已读':'Mark all read','一场活动等待你审核':'An event is waiting for review','活动报名申请已通过':'Registration approved','阿乔关注了你':'Aqiao followed you','活动地点有更新':'Event location updated','你已成为空间管理员':'You are now a space admin','2 场活动正在等待审核':'2 events are waiting for review','新的审核都处理完了':'All reviews are up to date',
  '「城市里的陌生人晚餐」申请使用 706 青年空间。':'“Dinner with Strangers in the City” requested to use 706 Youth Space.','下一步：完成付款并查看活动群或组织者联系方式。':'Next: complete payment and view the event group or organizer contact.','你们现在互相关注，可以在动态里看到彼此的活动。':'You now follow each other and can see each other’s events in Updates.','「苏州河慢走」集合点改为 M50 创意园 3 号门。':'The Suzhou Creek Walk meeting point changed to Gate 3 of M50 Creative Park.','现在可以管理 706 青年空间的信息与活动审核。':'You can now manage 706 Youth Space information and event reviews.',
  '昨天':'Yesterday','今天':'Today','周一':'Mon','周二':'Tue','周三':'Wed','周四':'Thu','周五':'Fri','周六':'Sat','周日':'Sun','一':'M','二':'T','三':'W','四':'T','五':'F','六':'S','日':'S',
  '报名活动':'Register','加入候补':'Join waitlist','确认报名':'Confirm registration','提交申请':'Submit request','取消':'Cancel','完成':'Done','返回':'Back','保存':'Save','筛选':'Filter','查看':'View','关注者':'Followers',
  '发起方':'Host','大家说':'Community notes','活动介绍':'About this event','适合谁':'Who it is for','地点':'Location','时间':'Time','报名':'Register','推荐':'Recommend','评论':'Comments','分享':'Share',
  '发起者':'Initiator','组织/品牌':'Organizer','空间节点':'Venue',
  '成员主页':'Member profile','组织':'Organization','空间':'Space','成员':'Members','管理员设置':'Admin settings','审核待办':'Review queue','活动审核':'Event review','审核进度':'Review status','审核中':'In review','当前进度':'Current status',
  '个人资料已保存':'Profile saved','空间资料已保存':'Space saved','活动系列已保存':'Series saved','已全部标为已读':'All messages marked as read','页面已重新加载':'Page refreshed','反馈入口将在正式版接入':'Feedback will be available in the full release',
  '已关注':'Following','＋ 关注':'＋ Follow','已取消关注':'Unfollowed','关注状态已更新':'Follow status updated','报名成功':'Registration complete','报名申请已提交':'Registration submitted','微信号已复制':'WeChat ID copied','支付成功，参与方式已解锁':'Payment complete — access unlocked'
};

const state = {
  view:'feed', tab:'feed', history:[], activeEvent:'film', activePerson:'qiao', activeEntity:'space',
  dateFilter:'全部', messageFilter:'全部', browseMode:'time', selectedDate:'本周', selectedSpace:'全部空间', calendarOpen:false, calendarWeek:1, peopleOffset:0, recommended:{}, joined:{}, unread:4,
  language:localStorage.getItem('706-language')||'zh', city:localStorage.getItem('706-city')||'上海',
  publishStep:1, publishSubmitted:false, approvalDone:false,
  draftMedia:[{type:'image',label:'活动封面.jpg'}], activeRelation:'following', registrationFilter:'全部', myEventFilter:'全部', spacePickerOpen:false,
  draft:{ title:'周末共读：我们如何一起生活', summary:'选一篇不长的文章，一起读完再聊。', date:'2026-10-04', start:'14:00', end:'16:30', city:'上海', venue:'706 青年空间', identity:'以个人身份发布', org:'不关联组织', quota:'16', paid:false, price:'30', attendeeApproval:true, joinMethods:['group'], detail:'我们会提前一天把文章发到群里。不要求提前读完，也欢迎只带着问题来。' },
  profileDraft:{name:'Jiang',city:'上海',bio:'城市研究 / 社区产品',intro:'关注城市里的公共生活，也喜欢组织桌游和陌生人晚餐。',workLinks:['https://jiang.example.com','https://notion.site/jiang-projects'],socialLinks:['小红书 @jiang_in_city','即刻 @Jiang706'],wechat:'jiang706',spaces:['706 青年空间','Sola 共创空间']},
  spaceDraft:{name:'706 青年空间',city:'上海',address:'静安区愚园路 1088 号',intro:'一个欢迎活动、讨论和偶遇发生的共享空间。',hours:'每日 10:00–22:00',contact:'Shing · 微信 shing706'}
};

const app = document.getElementById('app');
const layer = document.getElementById('layer');
const toastEl = document.getElementById('toast');

function icon(name){
  const paths = {
    feed:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/>',
    discover:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    message:'<path d="M4 5h16v11H8l-4 4z"/>',
    me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function avatar(person,size=''){ return `<span class="avatar ${size}" style="--avatar:${person.color}">${person.initial}</span>`; }
function person(id){ return people.find(p=>p.id===id) || people[0]; }
function eventBy(id){ return events.find(e=>e.id===id) || events[0]; }
function displayCity(city){ return state.language==='en'?(cityNames[city]||city):city; }
function eventSource(e,variant=''){
  return `<div class="event-source ${variant}"><span><b>发起者</b><em>${e.host}</em></span><span><b>组织/品牌</b><em>${e.org}</em></span><span><b>空间节点</b><em>${e.venue}</em></span></div>`;
}

function nav(){
  const items=[['feed','动态'],['discover','发现'],['messages','消息'],['me','我的']];
  return `<nav class="nav" aria-label="主要导航">${items.map(([id,label])=>`<button class="nav-item ${state.tab===id?'active':''}" data-action="tab" data-id="${id}">${icon(id==='messages'?'message':id)}<span>${label}</span>${id==='messages'&&state.unread?'<i class="nav-dot"></i>':''}</button>`).join('')}</nav>`;
}

function shell(body,{fab=false,navVisible=true}={}){
  return `${body}${fab?'<button class="fab" data-action="publish" aria-label="发布活动">＋</button>':''}${navVisible?nav():''}`;
}

function topbar(title,eyebrow='',right=''){
  return `<header class="topbar"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h1>${title}</h1></div>${right}</header>`;
}

function eventMini(e){
  return `<div class="event-mini" data-action="event" data-id="${e.id}" role="button" tabindex="0">
    <div class="event-cover" style="--cover:${e.color}"><span class="cover-tag">${e.venue}</span><div><h3>${e.title}</h3><p>${e.date} ${e.time.split('–')[0]} · ${e.spots?`余 ${e.spots} 个名额`:'名额已满'}</p></div></div>
    ${eventSource(e,'on-dark')}
    <div class="event-mini-foot"><span>${e.price?`¥${e.price}`:'免费'} · ${e.joined} 人报名</span><span class="stack">${avatar(person('jiang'),'xs')}${avatar(person('shing'),'xs')}<span class="avatar xs" style="--avatar:#eee">+${Math.max(e.joined-2,1)}</span></span></div>
  </div>`;
}

function eventRow(e){
  return `<article class="event-row" data-action="event" data-id="${e.id}">
    <div class="event-thumb" style="--cover:${e.color}"><div class="date-block"><span>${e.date.includes('周')?e.date:'10月'}</span><strong>${e.day}</strong></div></div>
    <div class="event-row-main"><div class="row-status"><span class="badge ${e.spots?'open':'ended'}">${e.spots?'报名中':'名额已满'}</span>${state.joined[e.id]?'<span class="badge upcoming">你已报名</span>':''}</div><h3>${e.title}</h3><p>${e.time}</p>${eventSource(e,'compact')}<p>${e.price?`¥${e.price}`:'免费'} · ${e.spots?`剩余 ${e.spots} 个名额`:'名额已满'}</p><div class="tiny-people">${avatar(person('qiao'),'xs')}${avatar(person('jiang'),'xs')}<span>${e.joined} 人报名</span></div></div>
  </article>`;
}

function renderFeed(){
  const relations={jiang:'你们共同参加过 2 场活动',qiao:'TA 关注了你',shing:'你们都关注 706 青年空间',maomao:'你们推荐过同一场活动',ning:'你们参加过同一场活动',xiaobei:'你们都关注社区厨房',yiming:'你们都喜欢城市漫游',chenmo:'你们都关注线下共读'};
  const visiblePeople=Array.from({length:4},(_,i)=>people[(state.peopleOffset+i)%people.length]);
  const cards=visiblePeople.map(p=>`<article class="person-card" data-action="member" data-id="${p.id}">${avatar(p)}<strong>${p.name}</strong><p>${p.bio}</p><small class="relation-hint">${relations[p.id]}</small><button class="follow ${p.following||state.recommended[p.id]?'active':''}" data-action="follow" data-id="${p.id}">${p.following||state.recommended[p.id]?'已关注':'＋ 关注'}</button></article>`).join('');
  const e1=events[0],e2=events[2];
  const body=`<section class="screen"><div class="main-toolbar"><button class="city-pill" data-action="city">${displayCity(state.city)}⌄</button></div>
    <section class="section tight"><div class="section-title"><h2>发现有意思的人</h2><button class="refresh-people" data-action="refresh-people">换几个</button></div><div class="h-scroll">${cards}</div></section>
    <article class="post featured"><div class="post-head">${avatar(person('qiao'),'sm')}<div class="post-meta"><strong>阿乔推荐了一场活动</strong><span>18 分钟前 · ${displayCity(state.city)}</span></div><button class="more">···</button></div><p class="post-copy">“周六晚上一起看一部关于城市与漂泊的电影，映后想聊聊我们为什么留在这里。”</p>${eventMini(e1)}</article>
    <article class="post"><div class="post-head">${avatar(person('jiang'),'sm')}<div class="post-meta"><strong>Jiang、Shing 和 6 位同城成员报名了</strong><span>今天 09:12 · 合并动态</span></div><button class="more">···</button></div><p class="post-copy">大家正在一起设计 706 小程序的下一步。</p>${eventMini(e2)}</article>
    <div style="height:16px"></div></section>`;
  return shell(body,{fab:true});
}

function renderDiscover(){
  const spaceFilters=[{id:'全部空间',name:'全部空间',meta:'4 场活动'},{id:'706 青年空间',name:'706 青年空间',meta:'2 场活动'},{id:'M50 创意园门口',name:'M50 创意园',meta:'1 场活动'},{id:'徐汇滨江草坪',name:'徐汇滨江',meta:'1 场活动'}];
  const keywordFilters=['全部','免费','有名额','共读','放映','户外'];
  const matchesDate=e=>state.selectedDate==='本周'&&!e.date.startsWith('10月')||state.selectedDate==='下周'&&e.date.startsWith('10月')||e.date===state.selectedDate;
  const matchesSpace=e=>state.selectedSpace==='全部空间'||e.venue===state.selectedSpace;
  const matchesKeyword=e=>state.dateFilter==='全部'||state.dateFilter==='免费'&&e.price===0||state.dateFilter==='有名额'&&e.spots>0||state.dateFilter==='共读'&&e.title.includes('共读')||state.dateFilter==='放映'&&e.title.includes('放映')||state.dateFilter==='户外'&&['walk','frisbee'].includes(e.id);
  const filtered=events.filter(e=>matchesDate(e)&&matchesSpace(e)&&matchesKeyword(e));
  const dateTitle=['本周','下周'].includes(state.selectedDate)?state.selectedDate:state.selectedDate;
  const resultTitle=state.selectedSpace==='全部空间'?`${dateTitle}活动`:`${state.selectedSpace} · ${dateTitle}`;
  const visibleWeek=calendarWeeks[state.calendarWeek];
  const body=`<section class="screen gray"><div class="discover-toolbar"><button class="city-pill" data-action="city">${displayCity(state.city)}⌄</button><label class="search"><span>⌕</span><input data-action="search" placeholder="搜索活动、成员、组织或空间" aria-label="搜索" /></label></div>
    <div class="campaign-carousel compact" aria-label="活动系列"><article class="campaign-card" data-action="campaign"><small>${campaign.kicker}</small><h2>${campaign.title}</h2><p>${campaign.cities.slice(0,4).join(' · ')} 等城市同步发生</p><span>查看系列 ›</span></article><article class="campaign-card alt" data-action="campaign"><small>8 城联动 · 社区行动月</small><h2>把客厅打开</h2><p>从一次邻里晚餐开始认识附近的人</p><span>查看系列 ›</span></article></div>
    <section class="filter-stack" aria-label="活动筛选">
      <div class="filter-rail date-rail"><button class="rail-chip ${state.selectedDate==='本周'?'active':''}" data-action="date-filter" data-id="本周">本周</button><button class="rail-chip ${state.selectedDate==='下周'?'active':''}" data-action="date-filter" data-id="下周">下周</button><button class="rail-chip calendar-trigger ${state.calendarOpen?'open':''}" data-action="toggle-calendar">日历 <i>${state.calendarOpen?'⌃':'⌄'}</i></button></div>
      ${state.calendarOpen?`<div class="calendar-expand weekly-calendar"><strong class="calendar-month">${visibleWeek.month}</strong><div class="calendar-week-view"><button class="week-arrow" data-action="calendar-week" data-id="prev" aria-label="上一周" ${state.calendarWeek===0?'disabled':''}>‹</button><div class="week-days">${visibleWeek.days.map(([weekday,day,id])=>`<button class="${id!=='无'?'has-event':''} ${state.selectedDate===id?'active':''}" data-action="date-filter" data-id="${id}"><span>${weekday}</span><strong>${day}</strong>${id!=='无'?'<i></i>':''}</button>`).join('')}</div><button class="week-arrow" data-action="calendar-week" data-id="next" aria-label="下一周" ${state.calendarWeek===calendarWeeks.length-1?'disabled':''}>›</button></div></div>`:''}
      <div class="filter-rail">${spaceFilters.map(x=>`<button class="rail-chip ${state.selectedSpace===x.id?'active':''}" data-action="space-filter" data-id="${x.id}">${x.name}</button>`).join('')}</div>
      <div class="filter-rail">${keywordFilters.map(x=>`<button class="rail-chip ${state.dateFilter===x?'active':''}" data-action="keyword-filter" data-id="${x}">${x==='全部'?'不限':x}</button>`).join('')}</div>
    </section>
    <div class="section-title list-heading" style="padding:0 19px"><h2>${resultTitle}</h2><span>${filtered.length} 场</span></div>
    ${filtered.length?filtered.map(eventRow).join(''):`<div class="empty"><div class="empty-icon">⌕</div><h2>暂时没有活动</h2><p>换个时间看看，或者发起一场你想参加的活动。</p><button class="secondary" data-action="filter" data-id="全部">清除筛选</button></div>`}
  </section>`;
  return shell(body,{fab:true});
}

function renderMessages(){
  const messages=[
    {type:'管理',title:'一场活动等待你审核',copy:'「城市里的陌生人晚餐」申请使用 706 青年空间。',time:'10:22',icon:'审',unread:true,action:'approvals'},
    {type:'活动',title:'活动报名申请已通过',copy:'下一步：完成付款并查看活动群或组织者联系方式。',time:'昨天',icon:'票',unread:true,action:'event-access',id:'film'},
    {type:'互动',title:'阿乔关注了你',copy:'你们现在互相关注，可以在动态里看到彼此的活动。',time:'昨天',icon:'友',unread:true,action:'member',id:'qiao'},
    {type:'活动',title:'活动地点有更新',copy:'「苏州河慢走」集合点改为 M50 创意园 3 号门。',time:'周四',icon:'更',unread:false,action:'event',id:'walk'},
    {type:'管理',title:'你已成为空间管理员',copy:'现在可以管理 706 青年空间的信息与活动审核。',time:'周一',icon:'管',unread:false,action:'space'}
  ];
  const shown=messages.filter(m=>state.messageFilter==='全部'||m.type===state.messageFilter);
  const body=`<section class="screen"><div class="main-safe-area"></div>
    <div class="message-toolbar"><div class="message-tabs">${['全部','管理','活动','互动'].map(x=>`<button class="chip ${state.messageFilter===x?'active':''}" data-action="message-filter" data-id="${x}">${x}</button>`).join('')}</div><button class="readall-inline" data-action="readall">全部标为已读</button></div>
    ${shown.map(m=>`<article class="message-item ${m.unread&&state.unread?'unread':''}" data-action="${m.action}" ${m.id?`data-id="${m.id}"`:''}><span class="msg-icon">${m.icon}</span><div class="msg-body"><strong>${m.title}<time>${m.time}</time></strong><p>${m.copy}</p></div></article>`).join('')}
  </section>`;
  return shell(body);
}

function renderMe(){
  const body=`<section class="screen gray"><div class="main-safe-area"></div>
    <section class="profile-hero"><div class="profile-top" data-action="member" data-id="jiang">${avatar(person('jiang'))}<div><h2>Jiang</h2><p>${displayCity(state.city)} · 城市研究 / 社区产品</p></div><button class="profile-edit" data-action="edit-profile">编辑资料</button></div><div class="stats two"><button class="stat" data-action="relations" data-id="following"><strong>18</strong><span>关注</span></button><button class="stat" data-action="relations" data-id="followers"><strong>42</strong><span>被关注</span></button></div></section>
    <article class="admin-card" data-action="approvals"><div><strong>管理员待办</strong><p>${state.approvalDone?'新的审核都处理完了':'2 场活动正在等待审核'}</p></div><span class="count">${state.approvalDone?'0':'2'}</span></article>
    <div class="menu-group"><button class="menu-row" data-action="publish"><span class="row-icon">＋</span><span>发布活动</span><small>›</small></button><button class="menu-row" data-action="drafts"><span class="row-icon">稿</span><span>活动草稿</span><small>1 ›</small></button><button class="menu-row" data-action="my-registrations"><span class="row-icon">票</span><span>我报名的活动</span><small>3 场 ›</small></button><button class="menu-row" data-action="my-events"><span class="row-icon">旗</span><span>我发布的活动</span><small>2 场 ›</small></button></div>
    <div class="menu-group"><button class="menu-row" data-action="org"><span class="row-icon">组</span><span>我管理的组织</span><small>706 产品小组 ›</small></button><button class="menu-row" data-action="space"><span class="row-icon">屋</span><span>我管理的空间</span><small>706 青年空间 ›</small></button></div>
    <div class="menu-group settings-group"><button class="menu-row" data-action="more"><span class="row-icon">•••</span><span>更多</span><small>›</small></button></div>
  </section>`;
  return shell(body);
}

function renderMore(){
  const languageLabel=state.language==='zh'?'简体中文':'English';
  const cityLabel=displayCity(state.city);
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>更多</h2><span></span></header><div class="settings-intro"><strong>706 社区</strong><p>按你的语言和所在城市，提供更合适的活动与社区信息。</p></div><div class="menu-group preference-group"><button class="menu-row preference-row" data-action="choose-city"><span class="row-icon">城</span><span><b>城市</b><em>当前城市</em></span><small>${cityLabel} ›</small></button><button class="menu-row preference-row" data-action="choose-language"><span class="row-icon">文</span><span><b>语言</b><em>选择界面语言</em></span><small>${languageLabel} ›</small></button></div><div class="menu-group"><button class="menu-row" data-action="notice-settings"><span class="row-icon">铃</span><span>通知设置</span><small>›</small></button><button class="menu-row" data-action="privacy"><span class="row-icon">盾</span><span>隐私与安全</span><small>›</small></button></div><div class="menu-group"><button class="menu-row" data-action="wx-about"><span class="row-icon">i</span><span>关于 706 社区</span><small>›</small></button><button class="menu-row" data-action="wx-feedback"><span class="row-icon">✎</span><span>反馈与建议</span><small>›</small></button></div></section>`;
}

function renderEvent(){
  const e=eventBy(state.activeEvent); const isJoined=state.joined[e.id];
  return `<section class="screen no-nav"><header class="topbar transparent"><button class="back" data-action="back">‹</button><span></span></header>
    <section class="detail-hero" style="--cover:${e.color}"><span class="cover-tag">${e.spots?'报名中':'名额已满'}</span><h1>${e.title}</h1><p>${e.date} ${e.time} · ${e.city}</p></section>
    ${e.campaign?`<button class="campaign-link" data-action="campaign"><span>多城联动系列</span><strong>${campaign.title}</strong><b>›</b></button>`:''}
    <div class="social-proof"><span class="stack">${avatar(person('qiao'),'xs')}${avatar(person('jiang'),'xs')}${avatar(person('shing'),'xs')}</span><span><strong>阿乔和 Jiang</strong> 等 ${e.joined} 人已经报名</span></div>
    <section class="detail-section"><div class="facts"><div class="fact"><span class="fact-icon">日</span><div><strong>${e.date} · ${e.time}</strong><span>活动开始前 2 小时停止报名</span></div></div><div class="fact"><span class="fact-icon">地</span><div><strong>${e.venue}</strong><span>${e.address}</span></div></div><div class="fact"><span class="fact-icon">票</span><div><strong>${e.price?`¥${e.price} / 人`:'免费参加'}</strong><span>${e.spots?`还剩 ${e.spots} 个名额`:'可以加入候补'}</span></div></div></div></section>
    <section class="detail-section"><h2>关于活动</h2><p>${e.summary}</p><div class="tags"><span class="tag">城市</span><span class="tag">轻松交流</span><span class="tag">新朋友友好</span></div></section>
    <section class="detail-section"><h2>适合谁参加</h2><p>${e.fit}</p></section>
    <section class="detail-section"><h2>发起方</h2><article class="entity-card" data-action="member" data-id="qiao">${avatar(person('qiao'),'sm')}<div><strong>${e.host}</strong><span>发起人 · 最近组织 5 场活动</span></div><b>›</b></article><article class="entity-card" data-action="space"><span class="avatar sm" style="--avatar:#ffe0b0">屋</span><div><strong>${e.venue}</strong><span>${e.org}</span></div><b>›</b></article></section>
    <section class="detail-section"><div class="section-title"><h2>大家说</h2><button data-action="comment">写评论</button></div>
      <article class="response-card">${avatar(person('jiang'),'sm')}<div><strong>Jiang <em>已报名</em></strong><p>很想听听大家怎么理解“留下来”。</p><button data-action="reply" data-id="jiang">回复</button><div class="reply"><b>阿乔：</b>映后会留出大约 45 分钟讨论，欢迎带着问题来。</div></div></article>
      <article class="response-card">${avatar(person('shing'),'sm')}<div><strong>Shing <em>已推荐</em></strong><p>朋友推荐了这部片，第一次来 706。</p><button data-action="reply" data-id="shing">回复</button></div></article>
    </section>
  </section><div class="bottom-action"><button class="secondary" data-action="recommend" data-id="${e.id}">${state.recommended[e.id]?'已推荐':'推荐'}</button><button class="primary" data-action="signup" data-id="${e.id}" ${isJoined?'disabled':''}>${isJoined?'报名审核中':e.spots?(e.approval?'申请报名':'立即报名'):'加入候补'}</button></div>`;
}

function renderMember(){
  const p=person(state.activePerson); const followed=p.following||state.recommended[p.id];
  const self=p.id==='jiang';
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>成员主页</h2><span></span></header><div class="page-action-row"><button class="toolbar-action" data-action="${self?'edit-profile':'member-more'}">${self?'编辑资料':'更多操作'}</button></div>
    <section class="member-hero">${avatar(p)}<h1>${p.name}</h1><p>${p.city} · ${p.bio}<br>${self?state.profileDraft.intro:'喜欢把陌生人聚到一张桌子边，聊一些没有标准答案的问题。'}</p><div class="tags"><span class="tag">城市观察</span><span class="tag">纪录片</span><span class="tag">社区空间</span></div><div class="member-actions">${self?'<button class="secondary" data-action="edit-profile">编辑个人资料</button>':`<button class="secondary" data-action="follow" data-id="${p.id}">${followed?'已关注':'＋ 关注'}</button>`}<button class="secondary" data-action="share">分享主页</button></div><div class="profile-relations"><button data-action="relations" data-id="following"><b>${self?'18':'32'}</b><span>关注</span></button><button data-action="relations" data-id="followers"><b>${self?'42':'128'}</b><span>关注者</span></button><button><b>${self?'16':'23'}</b><span>共同活动</span></button></div></section>
    <section class="detail-section"><h2>作品与社交</h2><div class="profile-links"><button data-action="external-link"><span>作</span><div><strong>作品与项目</strong><small>${self?state.profileDraft.workLinks[0]:'qiao.design/works'}</small></div><b>›</b></button><button data-action="external-link"><span>社</span><div><strong>社交媒体</strong><small>${self?state.profileDraft.socialLinks[0]:'小红书 @qiao_in_city'}</small></div><b>›</b></button></div></section>
    <section class="detail-section"><h2>常出没于</h2><article class="entity-card" data-action="org"><span class="avatar sm" style="--avatar:#eadfff">组</span><div><strong>706 产品小组</strong><span>成员 · 参与产品共创</span></div><b>›</b></article><article class="entity-card" data-action="space"><span class="avatar sm" style="--avatar:#ffe0b0">屋</span><div><strong>706 青年空间</strong><span>最近参加过 6 场活动</span></div><b>›</b></article></section>
    <section class="detail-section"><h2>活动历史</h2>${eventRow(events[0])}${eventRow(events[2])}</section>
  </section>`;
}

function renderEntity(type){
  const isSpace=type==='space';
  state.activeEntity=type;
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>${isSpace?'空间':'组织'}</h2><span></span></header><div class="page-action-row"><button class="toolbar-action" data-action="manage-entity">管理${isSpace?'空间':'组织'}</button></div>
    <section class="member-hero" style="background:${isSpace?'linear-gradient(145deg,#523915,#a56b25)':'linear-gradient(145deg,#202750,#6c4bc5)'}"><span class="avatar" style="--avatar:${isSpace?'#ffe0b0':'#eadfff'}">${isSpace?'屋':'组'}</span><h1>${isSpace?'706 青年空间':'Sola 放映组'}</h1><p>${isSpace?'上海 · 静安区愚园路 1088 号':'上海 · 关注城市、空间与人的独立放映小组'}<br>${isSpace?'一个欢迎活动、讨论和偶遇发生的共享空间。':'用电影打开现实里的讨论，也认识一起看电影的人。'}</p><div class="member-actions"><button class="secondary" data-action="follow-entity">＋ 关注${isSpace?'空间':'组织'}</button><button class="secondary" data-action="share">分享${isSpace?'空间':'组织'}</button></div></section>
    <section class="detail-section"><div class="section-title"><h2>近期活动</h2><button data-action="entity-events">查看全部 ›</button></div>${eventRow(events[0])}${eventRow(isSpace?events[2]:events[1])}</section>
    <section class="detail-section"><div class="section-title"><h2>最近活跃的成员</h2><button data-action="entity-members">查看全部 ›</button></div><div class="h-scroll">${people.slice(0,4).map(p=>`<article class="person-card" data-action="member" data-id="${p.id}">${avatar(p)}<strong>${p.name}</strong><p>${p.bio}</p></article>`).join('')}</div></section>
  </section>`;
}

function renderEntityEvents(){
  const isSpace=state.activeEntity==='space';
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>全部活动</h2><span></span></header><div class="notice">${isSpace?'706 青年空间':'Sola 放映组'}发布或承办的活动</div><div class="chips"><button class="chip active">即将开始</button><button class="chip">已结束</button></div>${events.map(eventRow).join('')}</section>`;
}

function renderEntityMembers(){
  const isSpace=state.activeEntity==='space';
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>活跃成员</h2><span></span></header><div class="notice">近期在${isSpace?'这个空间参加或发起过活动':'这个组织的活动中有回应'}的成员，按最近活跃时间排列。</div><section class="member-list">${people.map(p=>`<article class="member-list-card" data-action="member" data-id="${p.id}">${avatar(p,'sm')}<div><strong>${p.name}</strong><span>${p.bio} · ${p.city}</span></div><button class="follow-inline ${p.following||state.recommended[p.id]?'active':''}" data-action="follow" data-id="${p.id}">${p.following||state.recommended[p.id]?'已关注':'关注'}</button></article>`).join('')}</section></section>`;
}

function formHeader(title,saveAction='save-form'){
  return `<header class="topbar slim"><button class="back" data-action="back">‹</button><h2>${title}</h2><span></span></header><div class="page-action-row"><button class="toolbar-action primary-tool" data-action="${saveAction}">保存</button></div>`;
}

function renderEditEntity(){
  const d=state.spaceDraft;
  return `<section class="screen no-nav">${formHeader('编辑空间资料','save-space')}<main class="form-page edit-form"><div class="media-cover" style="--cover:linear-gradient(145deg,#523915,#a56b25)"><span>屋</span><button data-action="change-cover">更换封面</button></div><div class="field"><label>空间名称</label><input class="input" data-scope="spaceDraft" data-bind="name" value="${d.name}"></div><div class="grid-2"><div class="field"><label>城市</label><input class="input" data-scope="spaceDraft" data-bind="city" value="${d.city}"></div><div class="field"><label>开放时间</label><input class="input" data-scope="spaceDraft" data-bind="hours" value="${d.hours}"></div></div><div class="field"><label>详细地址</label><input class="input" data-scope="spaceDraft" data-bind="address" value="${d.address}"></div><div class="field"><label>空间介绍</label><textarea class="textarea" data-scope="spaceDraft" data-bind="intro">${d.intro}</textarea></div><div class="field"><label>对外联系人</label><input class="input" data-scope="spaceDraft" data-bind="contact" value="${d.contact}"><small>仅在需要联系空间时向活动发起人展示。</small></div><div class="option-row"><div><strong>允许活动申请使用空间</strong><small>提交后进入空间管理员审核</small></div><button class="switch on" aria-label="允许活动申请"></button></div></main></section>`;
}

function renderAdmins(){
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>管理员设置</h2><span></span></header><div class="page-action-row"><button class="toolbar-action" data-action="invite-admin">＋ 添加管理员</button></div><div class="notice">管理员可以编辑空间资料、处理活动审核和邀请其他管理员。</div><section class="member-list"><article class="member-list-card">${avatar(person('shing'),'sm')}<div><strong>Shing</strong><span>空间负责人 · 全部权限</span></div><span class="badge">Owner</span></article><article class="member-list-card">${avatar(person('qiao'),'sm')}<div><strong>阿乔</strong><span>活动审核、资料编辑</span></div><button class="plain-btn" data-action="admin-permission">权限 ›</button></article><article class="member-list-card">${avatar(person('jiang'),'sm')}<div><strong>Jiang</strong><span>仅活动审核</span></div><button class="plain-btn" data-action="admin-permission">权限 ›</button></article></section><div class="notice">移除管理员不会影响其普通成员身份，也不会删除其已发布的活动。</div></section>`;
}

function renderEditProfile(){
  const d=state.profileDraft;
  const linkRows=(type,items)=>items.map((value,i)=>`<div class="repeat-row"><input class="input" data-profile-list="${type}" data-index="${i}" value="${value}"><button data-action="remove-profile-link" data-id="${type}:${i}" aria-label="删除这条链接">×</button></div>`).join('');
  const allSpaces=['706 青年空间','Sola 共创空间','杭州 706 客厅'];
  return `<section class="screen no-nav">${formHeader('编辑个人资料','save-profile')}<main class="form-page edit-form"><div class="avatar-editor">${avatar(person('jiang'))}<button data-action="change-avatar">更换头像</button></div><div class="field"><label>昵称</label><input class="input" data-scope="profileDraft" data-bind="name" value="${d.name}"></div><div class="field"><label>个人微信号</label><input class="input" data-scope="profileDraft" data-bind="wechat" value="${d.wechat}"><small>默认不公开；报名活动时会明确征得同意后分享给组织者。</small></div><div class="grid-2"><div class="field"><label>当前城市</label><input class="input" data-scope="profileDraft" data-bind="city" value="${d.city}"></div><div class="field"><label>身份关键词</label><input class="input" data-scope="profileDraft" data-bind="bio" value="${d.bio}"></div></div><div class="field"><label>自我介绍</label><textarea class="textarea" data-scope="profileDraft" data-bind="intro">${d.intro}</textarea><small>可以回答：你最近在关心什么？希望在社区里遇见谁？</small></div><div class="field"><div class="field-title"><label>作品链接</label><button data-action="add-profile-link" data-id="workLinks">＋ 添加</button></div>${linkRows('workLinks',d.workLinks)}</div><div class="field"><div class="field-title"><label>社交媒体链接</label><button data-action="add-profile-link" data-id="socialLinks">＋ 添加</button></div>${linkRows('socialLinks',d.socialLinks)}</div><div class="field"><label>常出没的空间</label><button class="multi-select-trigger" data-action="toggle-space-picker"><span>${d.spaces.join('、')}</span><b>⌄</b></button>${state.spacePickerOpen?`<div class="multi-select-menu">${allSpaces.map(space=>`<button class="${d.spaces.includes(space)?'selected':''}" data-action="toggle-profile-space" data-id="${space}"><span>${d.spaces.includes(space)?'✓':'○'}</span>${space}</button>`).join('')}</div>`:''}<small>可以多选；这些空间会展示在个人主页的“常出没于”。</small></div></main></section>`;
}

function renderRelations(){
  const followers=state.activeRelation==='followers';
  const list=followers?people.slice(1,7):people.slice(0,6);
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>社交关系</h2><span></span></header><div class="message-tabs"><button class="chip ${!followers?'active':''}" data-action="relation-tab" data-id="following">关注 18</button><button class="chip ${followers?'active':''}" data-action="relation-tab" data-id="followers">关注者 42</button></div><section class="member-list">${list.map(p=>`<article class="member-list-card" data-action="member" data-id="${p.id}">${avatar(p,'sm')}<div><strong>${p.name}</strong><span>${p.bio} · ${p.city}</span></div><button class="follow-inline ${p.following||state.recommended[p.id]?'active':''}" data-action="follow" data-id="${p.id}">${p.following||state.recommended[p.id]?'已关注':'关注'}</button></article>`).join('')}</section></section>`;
}

function renderDrafts(){
  const d=state.draft;
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>活动草稿</h2><span></span></header><article class="draft-card"><div class="draft-cover" style="--cover:linear-gradient(135deg,#385cca,#1c245e)"></div><div><span class="badge orange">编辑至第 ${state.publishStep} 步</span><h3>${d.title}</h3><p>${d.date} · ${d.venue}</p><small>保存于今天 16:42</small></div><button class="primary" data-action="edit-draft">继续编辑</button></article></section>`;
}

function renderRegistrations(){
  const rows=[
    {status:'待审核',tone:'waiting',event:events[2],copy:'发起人通常会在 24 小时内处理',action:'event',button:'查看活动'},
    {status:'待付款',tone:'paying',event:events[0],copy:'申请已通过，请在 30 分钟内完成付款',action:'event-access',button:'去付款'},
    {status:'即将开始',tone:'upcoming',event:events[1],copy:'集合点已更新为 M50 创意园 3 号门',action:'event',button:'查看详情'},
    {status:'已结束',tone:'ended',event:events[3],copy:'活动已结束，可以再次报名同类活动',action:'event',button:'查看记录'}
  ];
  const shown=state.registrationFilter==='全部'?rows:rows.filter(x=>x.status===state.registrationFilter);
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>我报名的活动</h2><span></span></header><div class="segment-scroll">${['全部','待审核','待付款','即将开始','已结束'].map(x=>`<button class="${state.registrationFilter===x?'active':''}" data-action="registration-filter" data-id="${x}">${x}</button>`).join('')}</div><div class="registration-list">${shown.map(x=>`<article class="registration-card"><div class="registration-cover" style="--cover:${x.event.color}"><span class="badge ${x.tone}">${x.status}</span></div><div class="registration-content"><h3>${x.event.title}</h3><p>${x.event.date} ${x.event.time} · ${x.event.venue}</p><small>${x.copy}</small><button data-action="${x.action}" data-id="${x.event.id}">${x.button} ›</button></div></article>`).join('')}</div></section>`;
}

function renderMyEvents(){
  const rows=[
    {status:'审核中',event:{...events[2],title:'周末共读：我们如何一起生活'},meta:'等待 706 青年空间审核',actions:[['approval-progress','查看进度'],['edit-draft','编辑']]},
    {status:'已发布',event:events[0],meta:'12 人报名 · 8 个剩余名额',actions:[['event','查看活动'],['attendee-list','报名名单']]},
    {status:'已结束',event:events[1],meta:'15 人报名 · 4 条活动回应',actions:[['event','查看记录'],['rerun-event','再办一场']]},
    {status:'草稿',event:{...events[3],title:state.draft.title},meta:'保存于今天 16:42',actions:[['edit-draft','继续编辑']]}
  ];
  const shown=state.myEventFilter==='全部'?rows:rows.filter(x=>x.status===state.myEventFilter);
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>我发布的活动</h2><span></span></header><div class="segment-scroll">${['全部','审核中','已发布','已结束','草稿'].map(x=>`<button class="${state.myEventFilter===x?'active':''}" data-action="my-event-filter" data-id="${x}">${x}</button>`).join('')}</div><div class="registration-list">${shown.map(x=>`<article class="my-event-card"><div class="my-event-head"><span class="badge">${x.status}</span><small>${x.meta}</small></div><h3>${x.event.title}</h3><p>${x.event.date} ${x.event.time} · ${x.event.venue}</p><div class="card-actions">${x.actions.map(([action,label])=>`<button data-action="${action}" data-id="${x.event.id}">${label}</button>`).join('')}</div></article>`).join('')}</div></section>`;
}

function renderCalendar(){
  const days=[['26','六',2],['27','日',1],['28','一',0],['29','二',1],['30','三',2],['01','四',0],['02','五',1]];
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>活动日历</h2><span></span></header><div class="calendar-toolbar"><button class="month-switch">‹</button><strong>2026 年 9 月</strong><button class="month-switch">›</button></div><div class="calendar-strip">${days.map((d,i)=>`<button class="calendar-day ${i===0?'active':''}"><span>周${d[1]}</span><strong>${d[0]}</strong>${d[2]?`<i>${d[2]}</i>`:''}</button>`).join('')}</div><div class="section-title" style="padding:4px 19px"><h2>9月26日 · 周六</h2><span>2 场</span></div>${eventRow(events[0])}${eventRow(events[2])}<div class="section-title" style="padding:15px 19px 4px"><h2>即将发生</h2></div>${eventRow(events[1])}</section>`;
}

function renderSpaces(){
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>按空间发现</h2><button class="plain-btn" data-action="city">上海⌄</button></header><div class="notice">先选择一个空间，再查看那里近期发生的活动和活跃成员。</div><div class="space-list"><article data-action="space" style="--cover:linear-gradient(135deg,#8b5a20,#4f3213)"><span>静安 · 1.2 km</span><h2>706 青年空间</h2><p>本周 4 场活动 · 36 位成员活跃</p><b>查看活动 ›</b></article><article data-action="org" style="--cover:linear-gradient(135deg,#5c4dc2,#282257)"><span>徐汇 · 3.8 km</span><h2>Sola 共创空间</h2><p>本周 2 场活动 · 12 位成员活跃</p><b>查看活动 ›</b></article></div></section>`;
}

function renderCampaign(){
  return `<section class="screen no-nav"><header class="topbar transparent"><button class="back" data-action="back">‹</button><span></span></header><section class="campaign-hero" style="--cover:${campaign.cover}"><small>${campaign.kicker}</small><h1>${campaign.title}</h1><p>${campaign.cities.join(' · ')}</p></section><div class="campaign-action-row"><button data-action="share">分享系列</button><button class="primary-small" data-action="campaign-edit">管理系列</button></div><section class="detail-section"><h2>关于这个系列</h2><p>${campaign.summary}</p><div class="profile-links"><button data-action="external-link"><span>文</span><div><strong>参与者资料包</strong><small>统一主题说明、讨论问题和视觉素材</small></div><b>›</b></button></div></section><section class="detail-section"><div class="section-title"><h2>各城市活动</h2><span>5 个节点</span></div>${eventRow(events[0])}<article class="event-row"><div class="event-thumb" style="--cover:linear-gradient(135deg,#19715b,#102f28)"></div><div class="event-row-main"><h3>客厅对话：迁徙之后</h3><p>10月2日 19:00 · 杭州 706 客厅</p><p>免费 · 剩余 6 个名额</p></div></article>${eventRow(events[2])}</section></section>`;
}

function renderCampaignEdit(){
  return `<section class="screen no-nav">${formHeader('编辑活动系列','save-campaign')}<main class="form-page edit-form"><div class="media-cover" style="--cover:${campaign.cover}"><button data-action="change-cover">更换系列封面</button></div><div class="field"><label>系列名称</label><input class="input" value="${campaign.title}"></div><div class="field"><label>总介绍</label><textarea class="textarea">${campaign.summary}</textarea></div><div class="field"><label>资料与外部链接</label><input class="input" value="https://706.community/dialog-kit"></div><div class="section-title"><h2>系列中的活动</h2><button data-action="campaign-add-event">＋ 添加活动</button></div>${eventRow(events[0])}${eventRow(events[2])}</main></section>`;
}

function renderEventAccess(){
  const e=eventBy(state.activeEvent);
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>报名已通过</h2><span></span></header><section class="status-hero"><div class="success-icon">✓</div><h1>你可以参加了</h1><p>${e.title}</p></section><section class="detail-section"><h2>下一步</h2>${e.price?`<article class="next-step"><span>1</span><div><strong>完成活动付款</strong><p>¥${e.price} · 请在 30 分钟内完成</p></div><button data-action="pay-event">去付款</button></article>`:''}<article class="next-step"><span>${e.price?'2':'1'}</span><div><strong>加入活动微信群</strong><p>付款后显示二维码；群内会发布行前提醒。</p></div><button data-action="show-group">查看</button></article><article class="next-step"><span>${e.price?'3':'2'}</span><div><strong>联系活动组织者</strong><p>阿乔 · 微信 qiao706；你报名时同意分享的微信号也会提供给她。</p></div><button data-action="copy-wechat">复制</button></article></section><div class="notice">有些活动不会提供群聊。届时这里会说明“组织者稍后会与你联络”，或显示公开联系人。</div></section>`;
}

function renderActivityPreview(){
  const d=state.draft;
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>活动预览</h2><span></span></header><section class="detail-hero" style="--cover:linear-gradient(135deg,#385cca,#1c245e)"><span class="cover-tag">审核后发布</span><h1>${d.title}</h1><p>10月4日 ${d.start}–${d.end} · ${d.city}</p></section><section class="detail-section"><h2>活动介绍</h2><p>${d.summary}</p></section><section class="detail-section"><div class="facts"><div class="fact"><span class="fact-icon">地</span><div><strong>${d.venue}</strong><span>${d.city}</span></div></div><div class="fact"><span class="fact-icon">票</span><div><strong>${d.paid?`¥${d.price}`:'免费'} · ${d.quota} 人</strong><span>报名${d.attendeeApproval?'需要':'不需要'}发起人审核</span></div></div></div></section></section>`;
}

function renderPublish(){
  if(state.publishSubmitted) return `<section class="screen no-nav"><div class="success"><div><div class="success-icon">✓</div><h1>活动已提交审核</h1><p>平台运营和空间管理员会同时收到申请。<br>你可以在“我发布的活动”中查看进度。</p><button class="primary dark" data-action="approval-progress">查看审核进度</button><button class="plain-btn" data-action="home" style="display:block;margin:12px auto">回到动态</button></div></div></section>`;
  const d=state.draft; let fields=''; let title=''; let intro='';
  if(state.publishStep===1){
    title='活动是什么？'; intro='先把时间、地点和主题说清楚，其他内容之后还可以继续编辑。';
    fields=`<div class="field"><label>活动名称</label><input class="input" data-bind="title" value="${d.title}" /></div><div class="field"><label>一句话介绍</label><textarea class="textarea" data-bind="summary">${d.summary}</textarea></div><div class="field"><label>图片、视频与链接</label><div class="media-grid">${state.draftMedia.map((m,i)=>`<div class="media-item ${m.type}"><span>${m.type==='image'?'图':m.type==='video'?'影':'链'}</span><small>${m.label}</small><button data-action="remove-media" data-id="${i}">×</button></div>`).join('')}<button class="media-add" data-action="add-media" data-id="image">＋ 图片</button><button class="media-add" data-action="add-media" data-id="video">＋ 视频</button><button class="media-add" data-action="add-media" data-id="link">＋ 链接</button></div><small>最多 9 张图片、1 个视频和 3 个外部链接；第一张图片作为活动卡片封面。</small></div><div class="field"><label>日期</label><input class="input" type="date" data-bind="date" value="${d.date}" /></div><div class="grid-2"><div class="field"><label>开始时间</label><input class="input" type="time" data-bind="start" value="${d.start}" /></div><div class="field"><label>结束时间</label><input class="input" type="time" data-bind="end" value="${d.end}" /></div></div><div class="grid-2"><div class="field"><label>城市</label><select class="select" data-bind="city"><option>上海</option><option>杭州</option><option>北京</option></select></div><div class="field"><label>空间／地点</label><select class="select" data-bind="venue"><option>706 青年空间</option><option>Sola 共创空间</option><option>自行填写地点</option></select></div></div><div class="field"><label>以什么身份发布</label><select class="select" data-bind="identity"><option>以个人身份发布</option><option>以 706 产品小组发布</option></select><small>选择组织身份后，需要对应组织管理员审核。</small></div>`;
  } else if(state.publishStep===2){
    title='大家如何参加？'; intro='设置名额、费用和报名方式。报名后的联系信息不会公开。';
    fields=`<div class="field"><label>活动名额</label><input class="input" type="number" data-bind="quota" value="${d.quota}" /></div><div class="option-row"><div><strong>这是付费活动</strong><small>支持任意金额，不设价格上限</small></div><button class="switch ${d.paid?'on':''}" data-action="toggle-paid" aria-label="切换付费活动"></button></div>${d.paid?`<div class="field"><label>每人费用（元）</label><input class="input" type="number" inputmode="decimal" min="0.01" step="0.01" data-bind="price" value="${d.price}" /><small>审核通过后，参与者先完成微信支付，再看到入群或联系信息。</small></div>`:''}<div class="option-row"><div><strong>报名需要发起人审核</strong><small>${d.paid?'审核通过 → 微信支付 → 获得参与方式':'审核通过后直接获得参与方式'}</small></div><button class="switch ${d.attendeeApproval?'on':''}" data-action="toggle-approval" aria-label="切换报名审核"></button></div><div class="field"><label>报名成功后如何参与（可多选）</label><div class="choice-list">${[['group','展示微信群二维码','适合需要统一通知的活动'],['wechat','展示组织者微信','参与者主动添加联系人'],['contact','组织者稍后联系','把参与者微信分享给组织者']].map(([id,label,desc])=>`<button class="choice ${d.joinMethods.includes(id)?'active':''}" data-action="join-method" data-id="${id}"><span>${d.joinMethods.includes(id)?'✓':'○'}</span><div><strong>${label}</strong><small>${desc}</small></div></button>`).join('')}</div><small>可以组合多种方式；只对报名成功且已完成付款的人显示。</small></div><div class="field"><label>补充活动介绍</label><textarea class="textarea" data-bind="detail">${d.detail}</textarea></div>`;
  } else {
    title='确认并提交'; intro='所有活动公开前都需要审核。关联组织或空间时，相应管理员会同时收到申请。';
    fields=`<button class="preview-card" data-action="activity-preview"><div class="preview-cover" style="--cover:linear-gradient(135deg,#385cca,#1c245e)"><span>动态卡片预览</span></div><div><h3>${d.title}</h3><p>10月4日 ${d.start}–${d.end} · ${d.venue}</p><small>${d.paid?`¥${d.price}`:'免费'} · ${d.quota} 人 · 点击查看完整预览</small></div></button><div class="review-card"><div class="review-row"><span>发布身份</span><b>${d.identity}</b></div><div class="review-row"><span>报名后</span><b>${d.joinMethods.map(x=>x==='group'?'群二维码':x==='wechat'?'组织者微信':'组织者联系').join('、')}</b></div></div><div class="review-card"><h3>将由这些人审核</h3><div class="approval-list"><div class="approval-row"><span class="status-dot"></span><div><strong>706 上海运营</strong><span>所有活动的基础审核</span></div><span>待提交</span></div><div class="approval-row"><span class="status-dot"></span><div><strong>706 青年空间</strong><span>确认时间与空间安排</span></div><span>待提交</span></div></div></div><div class="notice">提交后，你可以随时查看卡在哪个环节，以及可以联系谁。</div>`;
  }
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="publish-back">‹</button><h2>发布活动</h2><button class="plain-btn" data-action="save-draft">存草稿</button></header><main class="form-page"><div class="steps">${[1,2,3].map(n=>`<span class="step-line ${n<=state.publishStep?'done':''}"></span>`).join('')}</div><div class="form-intro"><h1>${title}</h1><p>${intro}</p></div>${fields}</main></section><div class="bottom-action">${state.publishStep>1?'<button class="secondary" data-action="publish-prev">上一步</button>':''}<button class="primary" data-action="publish-next">${state.publishStep===3?'提交审核':'继续'}</button></div>`;
}

function renderApprovals(){
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>审核待办</h2><span></span></header><div class="page-action-row"><button class="toolbar-action" data-action="filters">筛选</button></div><div class="notice">活动会同时交给平台、组织和空间审核。所有必要审核通过后才会公开。</div>${state.approvalDone?'<div class="empty"><div class="empty-icon">✓</div><h2>审核完成</h2><p>新的待办会通过消息通知你。</p></div>':`<article class="approve-card" data-action="approval-detail"><span class="badge">等待空间审核</span><h3>城市里的陌生人晚餐</h3><p>发起人：宁宁 · 10月6日 19:00</p><footer><span>申请使用 706 青年空间</span><b>查看 ›</b></footer></article><article class="approve-card" data-action="approval-detail"><span class="badge orange">重新提交</span><h3>女性写作共读会</h3><p>发起人：毛毛 · 10月8日 19:30</p><footer><span>已按意见调整人数</span><b>查看 ›</b></footer></article>`}</section>`;
}

function renderApprovalDetail(){
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>活动审核</h2><span></span></header><div class="page-action-row"><button class="toolbar-action" data-action="copy-wechat">联系发起人</button></div><section class="detail-section"><span class="badge">等待你的审核</span><h1 style="font-size:25px;margin:13px 0 7px">城市里的陌生人晚餐</h1><p>6 位第一次见面的人，一起做饭、吃饭，再聊一个今晚才揭晓的问题。</p></section><section class="detail-section"><div class="facts"><div class="fact"><span class="fact-icon">日</span><div><strong>10月6日 19:00–22:00</strong><span>周二晚间</span></div></div><div class="fact"><span class="fact-icon">地</span><div><strong>706 青年空间</strong><span>申请使用厨房和公共区域</span></div></div><div class="fact"><span class="fact-icon">人</span><div><strong>6 个名额 · 免费</strong><span>报名需要发起人审核</span></div></div></div></section><section class="detail-section"><h2>其他审核方</h2><div class="approval-list"><div class="approval-row"><span class="status-dot ok"></span><div><strong>706 上海运营</strong><span>阿乔 · 今天 10:16</span></div><b>已通过</b></div><div class="approval-row"><span class="status-dot"></span><div><strong>706 青年空间</strong><span>当前由你处理</span></div><b>待审核</b></div></div></section><section class="detail-section"><h2>发起人备注</h2><p>需要使用厨房的基础厨具，会在结束后完成清洁。希望提前半小时进入布置。</p></section></section><div class="bottom-action"><button class="secondary" data-action="return-approval">退回修改</button><button class="primary dark" data-action="approve">通过审核</button></div>`;
}

function renderProgress(){
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>审核进度</h2><button class="plain-btn">联系负责人</button></header><section class="detail-section"><span class="badge">审核中</span><h1 style="font-size:23px;margin:12px 0 6px">${state.draft.title}</h1><p>提交于今天 10:48。所有必要审核通过后会自动公开。</p></section><section class="detail-section"><h2>当前进度</h2><div class="approval-list"><div class="approval-row"><span class="status-dot ok"></span><div><strong>706 上海运营</strong><span>阿乔 · 已通过</span></div><b>完成</b></div><div class="approval-row"><span class="status-dot"></span><div><strong>706 青年空间</strong><span>等待 Shing 审核</span></div><b>等待中</b></div></div></section><div class="notice">空间审核通常会在 24 小时内完成。如果比较紧急，可以联系 Shing。</div></section>`;
}

function renderSimple(title,copy){
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>${title}</h2><span></span></header><div class="empty"><div class="empty-icon">✦</div><h2>${title}</h2><p>${copy}</p><button class="secondary" data-action="back">返回</button></div></section>`;
}

function render(){
  let html='';
  switch(state.view){
    case 'feed': html=renderFeed(); break; case 'discover': html=renderDiscover(); break; case 'messages': html=renderMessages(); break; case 'me': html=renderMe(); break;
    case 'event': html=renderEvent(); break; case 'member': html=renderMember(); break; case 'space': html=renderEntity('space'); break; case 'org': html=renderEntity('org'); break;
    case 'entity-events': html=renderEntityEvents(); break; case 'entity-members': html=renderEntityMembers(); break;
    case 'edit-entity': html=renderEditEntity(); break; case 'admins': html=renderAdmins(); break; case 'edit-profile': html=renderEditProfile(); break; case 'relations': html=renderRelations(); break;
    case 'calendar': html=renderCalendar(); break; case 'spaces': html=renderSpaces(); break; case 'campaign': html=renderCampaign(); break; case 'campaign-edit': html=renderCampaignEdit(); break;
    case 'event-access': html=renderEventAccess(); break; case 'activity-preview': html=renderActivityPreview(); break;
    case 'publish': html=renderPublish(); break; case 'approvals': html=renderApprovals(); break; case 'approval-detail': html=renderApprovalDetail(); break; case 'approval-progress': html=renderProgress(); break;
    case 'registrations': html=renderRegistrations(); break;
    case 'my-events': html=renderMyEvents(); break;
    case 'drafts': html=renderDrafts(); break;
    case 'following': html=renderRelations(); break;
    case 'more': html=renderMore(); break;
    default: html=renderFeed();
  }
  app.innerHTML=html;
  localizeElement(app);
  document.documentElement.lang=state.language==='en'?'en':'zh-CN';
}

function go(view,opts={}){
  state.history.push(state.view); state.view=view;
  if(opts.id){ if(view==='event'||view==='event-access') state.activeEvent=opts.id; if(view==='member') state.activePerson=opts.id; }
  render(); scrollTop();
}
function scrollTop(){ const s=app.querySelector('.screen'); if(s) s.scrollTop=0; }
function back(){ state.view=state.history.pop()||state.tab; render(); scrollTop(); }
function translateText(text){
  if(state.language!=='en'||!text) return text;
  const lead=text.match(/^\s*/)?.[0]||'',tail=text.match(/\s*$/)?.[0]||'',core=text.trim();
  if(!core) return text;
  if(englishPhrases[core]) return `${lead}${englishPhrases[core]}${tail}`;
  let translated=core;
  Object.entries(englishPhrases).filter(([key])=>key.length>=4).sort((a,b)=>b[0].length-a[0].length).forEach(([zh,en])=>{ translated=translated.split(zh).join(en); });
  translated=translated.replace(/周一/g,'Mon').replace(/周二/g,'Tue').replace(/周三/g,'Wed').replace(/周四/g,'Thu').replace(/周五/g,'Fri').replace(/周六/g,'Sat').replace(/周日/g,'Sun');
  translated=translated.replace(/剩余\s*(\d+)\s*个名额/g,'$1 spots left').replace(/余\s*(\d+)\s*个名额/g,'$1 spots left').replace(/(\d+)\s*人报名/g,'$1 registered').replace(/免费/g,'Free');
  translated=translated.replace(/(\d+)\s*场/g,'$1 events').replace(/(\d+)\s*分钟前/g,'$1 min ago').replace(/(\d+)\s*个待办/g,'$1 pending');
  return `${lead}${translated}${tail}`;
}
function localizeElement(root){
  if(state.language!=='en'||!root) return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let node;
  while((node=walker.nextNode())) node.nodeValue=translateText(node.nodeValue);
  root.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{ if(el.placeholder) el.placeholder=translateText(el.placeholder); if(el.getAttribute('aria-label')) el.setAttribute('aria-label',translateText(el.getAttribute('aria-label'))); });
}
function showToast(text){ toastEl.textContent=translateText(text); toastEl.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toastEl.classList.remove('show'),1900); }
function closeSheet(){ layer.innerHTML=''; }

new MutationObserver(()=>localizeElement(layer)).observe(layer,{childList:true,subtree:true});

function signupSheet(id){
  const e=eventBy(id);
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${e.spots?'报名活动':'加入候补'}</h2><p>${e.title}<br>报名与参与状态会公开展示；报名后，你的个人微信号 <strong>${state.profileDraft.wechat}</strong> 会分享给活动组织者，用于确认参与和发送活动通知。</p><div class="field"><label>怎么称呼你</label><input class="input" value="Jiang" /></div><div class="field"><label>为什么想参加？</label><textarea class="textarea" placeholder="简单说说你的兴趣或期待">对城市里的公共空间很感兴趣，也想认识一起做社区的人。</textarea></div><label class="consent"><input type="checkbox" checked /> 我同意向组织者分享个人微信号，并知道报名和参与状态会展示在社区中</label><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary" data-action="submit-signup" data-id="${id}">${e.spots?(e.approval?'提交申请':'确认报名'):'加入候补'}</button></div></section></div>`;
}

function commentSheet(replyTo=''){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet comments-sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><div class="sheet-title-row"><h2>评论与回复 · 4</h2><button data-action="close-sheet">完成</button></div><div class="comment-list"><article>${avatar(person('jiang'),'sm')}<div><strong>Jiang <time>12 分钟前</time></strong><p>很想听听大家怎么理解“留下来”。映后讨论大概会持续多久？</p><button data-action="reply" data-id="jiang">回复</button><div class="reply"><b>阿乔：</b>会留出大约 45 分钟，也欢迎只听不发言。</div></div></article><article>${avatar(person('shing'),'sm')}<div><strong>Shing <time>8 分钟前</time></strong><p>第一次来 706，需要提前多久到？</p><button data-action="reply" data-id="shing">回复</button></div></article></div><div class="comment-composer">${replyTo?`<small>回复 ${person(replyTo).name}</small>`:''}<textarea class="textarea" placeholder="写评论或回复">${replyTo?'谢谢分享，我也想听听你的看法。':''}</textarea><button class="primary" data-action="post-comment">发布</button></div></section></div>`;
}

function recommendSheet(id){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>推荐给社区</h2><p>你的推荐会出现在关注者的动态中，可以附上一句话。</p><textarea class="textarea" placeholder="为什么推荐这场活动？">这个主题很适合第一次来 706 的朋友，一起去吧。</textarea><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary" data-action="submit-recommend" data-id="${id}">发布推荐</button></div></section></div>`;
}

function miniProgramSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><div class="mini-program-head"><span class="mini-program-logo">706</span><div><h2>706 社区</h2><p>让活动更容易发生，也让人更容易彼此发现。</p></div></div><div class="menu-group sheet-menu"><button class="menu-row" data-action="wx-about"><span class="row-icon">i</span><span>关于 706 社区</span><small>›</small></button><button class="menu-row" data-action="wx-refresh"><span class="row-icon">↻</span><span>重新加载页面</span><small>›</small></button><button class="menu-row" data-action="wx-feedback"><span class="row-icon">✎</span><span>反馈与建议</span><small>›</small></button></div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function citySheet(){
  const cities=['上海','北京','广州','深圳','杭州','成都'];
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet preference-sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>选择城市</h2><p>活动与推荐会优先显示这个城市的内容。</p><div class="choice-list">${cities.map(city=>`<button class="choice setting-choice ${state.city===city?'active':''}" data-action="city-select" data-id="${city}"><span>城</span><div><strong>${displayCity(city)}</strong><small>${state.language==='en'?city:cityNames[city]}</small></div><b>${state.city===city?'✓':''}</b></button>`).join('')}</div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function languageSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet preference-sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>选择语言</h2><p>切换后，界面导航、操作与系统提示会立即更新。</p><div class="choice-list"><button class="choice setting-choice ${state.language==='zh'?'active':''}" data-action="language-select" data-id="zh"><span>中</span><div><strong>简体中文</strong><small>Chinese (Simplified)</small></div><b>${state.language==='zh'?'✓':''}</b></button><button class="choice setting-choice ${state.language==='en'?'active':''}" data-action="language-select" data-id="en"><span>EN</span><div><strong>English</strong><small>English</small></div><b>${state.language==='en'?'✓':''}</b></button></div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function manageEntitySheet(){
  const isSpace=state.activeEntity==='space';
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${isSpace?'空间':'组织'}管理</h2><p>这些入口只有管理员可见，普通成员不会看到顶部的“管理”。</p><div class="menu-group sheet-menu"><button class="menu-row" data-action="manage-edit"><span class="row-icon">编</span><span>编辑${isSpace?'空间':'组织'}资料</span><small>›</small></button><button class="menu-row" data-action="approvals"><span class="row-icon">审</span><span>活动审核</span><small>2 个待办 ›</small></button><button class="menu-row" data-action="manage-admins"><span class="row-icon">人</span><span>管理员设置</span><small>›</small></button></div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function memberMoreSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>成员主页操作</h2><p>这些操作不会影响你已经参与的活动。</p><div class="menu-group sheet-menu"><button class="menu-row" data-action="share"><span class="row-icon">链</span><span>复制主页链接</span><small>›</small></button><button class="menu-row" data-action="mute-member"><span class="row-icon">静</span><span>不看 TA 的动态</span><small>›</small></button><button class="menu-row" data-action="report-member"><span class="row-icon">!</span><span>举报成员</span><small>›</small></button></div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function peopleWhySheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>为什么推荐这些人？</h2><p>“发现有意思的人”会优先展示与你有真实社区关联的成员。</p><div class="reason-list"><div><span>友</span><p><strong>TA 关注了你</strong><small>有机会建立双向关注</small></p></div><div><span>同</span><p><strong>参加过相同活动</strong><small>你们共同参加过 2 场活动</small></p></div><div><span>屋</span><p><strong>关注同一个空间</strong><small>你们都关注 706 青年空间</small></p></div><div><span>荐</span><p><strong>推荐过同一场活动</strong><small>兴趣和判断可能相近</small></p></div></div><button class="secondary sheet-close" data-action="close-sheet">知道了</button></section></div>`;
}

function paymentSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>确认活动付款</h2><p>秋日放映：城市游牧者</p><div class="payment-total"><span>应付金额</span><strong>¥30.00</strong></div><div class="notice">付款成功后立即显示活动群和组织者联系方式。取消报名与退款规则由活动组织者处理。</div><div class="sheet-actions"><button class="secondary" data-action="close-sheet">稍后支付</button><button class="primary" data-action="confirm-pay">微信支付</button></div></section></div>`;
}

function groupSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet center-sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>活动微信群</h2><div class="qr-placeholder">群二维码</div><p>长按识别二维码加入群聊。二维码仅对报名成功且已付款的参与者显示。</p><button class="secondary sheet-close" data-action="close-sheet">完成</button></section></div>`;
}

function returnSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>退回修改</h2><p>请具体说明需要调整的地方，发起人会收到通知。</p><textarea class="textarea">空间 18:30 前还有其他活动，请将布置时间改为 18:40 以后。</textarea><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary dark" data-action="confirm-return">发送修改意见</button></div></section></div>`;
}

function bindField(e){
  const list=e.target.dataset.profileList;
  if(list){ state.profileDraft[list][Number(e.target.dataset.index)]=e.target.value; return; }
  const key=e.target.dataset.bind; if(!key) return; const scope=e.target.dataset.scope||'draft'; state[scope][key]=e.target.value;
}
app.addEventListener('input',bindField);
app.addEventListener('change',bindField);

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]'); if(!btn) return;
  if(btn.classList.contains('sheet-backdrop')&&e.target!==btn) return;
  const a=btn.dataset.action,id=btn.dataset.id;
  if(a==='tab'){ state.tab=id; state.view=id; state.history=[]; if(id==='messages') state.unread=0; render(); scrollTop(); }
  else if(a==='back'||a==='publish-back'){ if(a==='publish-back'&&state.publishStep>1){ state.publishStep--; render(); } else back(); }
  else if(a==='home'){ state.tab='feed'; state.view='feed'; state.history=[]; render(); }
  else if(a==='event') go('event',{id});
  else if(a==='member') go('member',{id:id||'jiang'});
  else if(a==='space'){ state.activeEntity='space'; go('space'); } else if(a==='org'){ state.activeEntity='org'; go('org'); }
  else if(a==='publish'){ state.publishStep=1; state.publishSubmitted=false; go('publish'); }
  else if(a==='follow'){ state.recommended[id]=!state.recommended[id]; render(); showToast(state.recommended[id]?'已关注，TA 的活动会优先出现':'已取消关注'); }
  else if(a==='follow-entity'){ const label=state.activeEntity==='space'?'空间':'组织'; btn.textContent=btn.textContent.includes('＋')?`已关注${label}`:`＋ 关注${label}`; showToast('关注状态已更新'); }
  else if(a==='entity-events') go('entity-events'); else if(a==='entity-members') go('entity-members');
  else if(a==='manage-entity') manageEntitySheet();
  else if(a==='manage-edit'){ closeSheet(); go('edit-entity'); }
  else if(a==='manage-admins'){ closeSheet(); go('admins'); }
  else if(a==='save-space'){ back(); showToast('空间资料已保存'); }
  else if(a==='save-profile'){ back(); showToast('个人资料已保存'); }
  else if(a==='save-campaign'){ back(); showToast('活动系列已保存'); }
  else if(a==='edit-profile') go('edit-profile');
  else if(a==='more') go('more');
  else if(a==='member-more') memberMoreSheet();
  else if(a==='people-why') peopleWhySheet();
  else if(a==='relations'){ state.activeRelation=id||'following'; go('relations'); }
  else if(a==='relation-tab'){ state.activeRelation=id; render(); }
  else if(a==='recommend') recommendSheet(id||state.activeEvent);
  else if(a==='submit-recommend'){ state.recommended[id]=true; closeSheet(); render(); showToast('推荐已发布到动态'); }
  else if(a==='comment') commentSheet(); else if(a==='reply') commentSheet(id); else if(a==='post-comment'){ closeSheet(); showToast('回应已发布'); }
  else if(a==='share') showToast('已打开微信分享面板（模拟）');
  else if(a==='city'||a==='choose-city') citySheet();
  else if(a==='choose-language') languageSheet();
  else if(a==='city-select'){ state.city=id; localStorage.setItem('706-city',id); closeSheet(); render(); showToast(state.language==='en'?`Switched to ${displayCity(id)}`:`已切换至${id}`); }
  else if(a==='language-select'){ state.language=id; localStorage.setItem('706-language',id); closeSheet(); render(); showToast(id==='en'?'Language changed to English':'已切换为简体中文'); }
  else if(a==='notice-settings') showToast('通知设置将在正式版接入');
  else if(a==='privacy') showToast('隐私与安全设置将在正式版接入');
  else if(a==='wx-more'||a==='settings') miniProgramSheet();
  else if(a==='wx-home'){ closeSheet(); state.tab='feed'; state.view='feed'; state.history=[]; render(); showToast('已回到小程序首页'); }
  else if(a==='wx-about'){ closeSheet(); showToast('706 社区小程序 · MVP'); }
  else if(a==='wx-refresh'){ closeSheet(); render(); showToast('页面已重新加载'); }
  else if(a==='wx-feedback'){ closeSheet(); showToast('反馈入口将在正式版接入'); }
  else if(a==='signup') signupSheet(id); else if(a==='submit-signup'){ state.joined[id]=true; closeSheet(); render(); showToast(eventBy(id).approval?'报名申请已提交':'报名成功'); }
  else if(a==='event-access'){ go('event-access',{id}); }
  else if(a==='pay-event') paymentSheet(); else if(a==='confirm-pay'){ closeSheet(); showToast('支付成功，参与方式已解锁'); }
  else if(a==='show-group') groupSheet(); else if(a==='copy-wechat'){ showToast('微信号已复制'); }
  else if(a==='close-sheet') closeSheet();
  else if(a==='filter'){ state.dateFilter=id; render(); } else if(a==='message-filter'){ state.messageFilter=id; render(); }
  else if(a==='browse-mode'){ state.browseMode=id; render(); }
  else if(a==='browse-filter'){ if(state.browseMode==='time') state.selectedDate=id; else state.selectedSpace=id; render(); }
  else if(a==='toggle-calendar'){ state.calendarOpen=!state.calendarOpen; render(); }
  else if(a==='calendar-week'){ state.calendarWeek=Math.max(0,Math.min(calendarWeeks.length-1,state.calendarWeek+(id==='next'?1:-1))); render(); }
  else if(a==='date-filter'){ if(id!=='无'){ state.selectedDate=id; state.calendarOpen=false; render(); } }
  else if(a==='space-filter'){ state.selectedSpace=id; render(); }
  else if(a==='keyword-filter'){ state.dateFilter=id; render(); }
  else if(a==='readall'){ state.unread=0; render(); showToast('已全部标为已读'); }
  else if(a==='refresh-people'){ state.peopleOffset=(state.peopleOffset+2)%people.length; render(); }
  else if(a==='approvals'){ closeSheet(); go('approvals'); } else if(a==='approval-detail') go('approval-detail');
  else if(a==='approve'){ state.approvalDone=true; back(); showToast('已通过审核，发起人将收到通知'); }
  else if(a==='return-approval') returnSheet(); else if(a==='confirm-return'){ state.approvalDone=true; closeSheet(); back(); showToast('修改意见已发送'); }
  else if(a==='toggle-paid'){ state.draft.paid=!state.draft.paid; render(); }
  else if(a==='toggle-approval'){ state.draft.attendeeApproval=!state.draft.attendeeApproval; render(); }
  else if(a==='join-method'){ const list=state.draft.joinMethods; const index=list.indexOf(id); if(index>=0&&list.length>1) list.splice(index,1); else if(index<0) list.push(id); render(); }
  else if(a==='add-profile-link'){ state.profileDraft[id].push(''); render(); }
  else if(a==='remove-profile-link'){ const [list,index]=id.split(':'); state.profileDraft[list].splice(Number(index),1); render(); }
  else if(a==='toggle-space-picker'){ state.spacePickerOpen=!state.spacePickerOpen; render(); }
  else if(a==='toggle-profile-space'){ const list=state.profileDraft.spaces; const index=list.indexOf(id); if(index>=0&&list.length>1) list.splice(index,1); else if(index<0) list.push(id); render(); }
  else if(a==='add-media'){ const counts={image:'活动现场.jpg',video:'活动介绍.mp4',link:'资料链接'}; state.draftMedia.push({type:id,label:counts[id]}); render(); showToast(`已添加${id==='image'?'图片':id==='video'?'视频':'链接'}`); }
  else if(a==='remove-media'){ state.draftMedia.splice(Number(id),1); render(); }
  else if(a==='publish-next'){ if(state.publishStep===2&&state.draft.paid&&(!state.draft.price||Number(state.draft.price)<=0)){ showToast('请输入大于 0 的活动价格'); } else if(state.publishStep<3){ state.publishStep++; render(); scrollTop(); } else { state.publishSubmitted=true; render(); } }
  else if(a==='publish-prev'){ state.publishStep--; render(); scrollTop(); }
  else if(a==='save-draft'){ showToast('草稿已保存'); }
  else if(a==='approval-progress') go('approval-progress');
  else if(a==='edit-draft'){ state.publishStep=1; state.publishSubmitted=false; go('publish'); }
  else if(a==='calendar'||a==='date') { state.tab='discover'; state.view='discover'; state.browseMode='time'; render(); }
  else if(a==='spaces') { state.tab='discover'; state.view='discover'; state.browseMode='space'; render(); }
  else if(a==='campaign') go('campaign'); else if(a==='campaign-edit') go('campaign-edit'); else if(a==='activity-preview') go('activity-preview');
  else if(a==='campaign-add-event') showToast('已打开活动选择器（演示）');
  else if(a==='registration-filter'){ state.registrationFilter=id; render(); }
  else if(a==='my-event-filter'){ state.myEventFilter=id; render(); }
  else if(a==='attendee-list') showToast('已打开报名名单（交互演示）');
  else if(a==='rerun-event'){ state.publishStep=1; state.publishSubmitted=false; state.draft.title=`再办一场：${eventBy(id).title}`; go('publish'); }
  else if(a==='invite-admin') showToast('已打开管理员邀请（演示）'); else if(a==='admin-permission') showToast('已打开权限设置（演示）');
  else if(['change-cover','change-avatar','external-link','mute-member','report-member'].includes(a)) showToast('这是交互模型中的演示入口');
  else if(a==='my-registrations') go('registrations'); else if(a==='my-events') go('my-events'); else if(a==='drafts') go('drafts'); else if(a==='following') go('following');
  else if(['city','shuffle','filters','search'].includes(a)) showToast('这是交互模型中的演示入口');
},true);

document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-action="event"]')) e.target.click(); });

function registerWebMCP(){
  const ctx=document.modelContext; if(!ctx?.registerTool) return;
  const controller=new AbortController();
  const register=tool=>Promise.resolve(ctx.registerTool(tool,{signal:controller.signal})).catch(()=>{});
  register({name:'list_community_events',title:'查看社区活动',description:'查看 706 社区近期活动及其时间、地点、费用和名额。',inputSchema:{type:'object',properties:{freeOnly:{type:'boolean'}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){return events.filter(e=>!input?.freeOnly||e.price===0).map(({id,title,date,time,venue,price,spots})=>({id,title,date,time,venue,price,spots}));}});
  register({name:'open_event_creation',title:'开始发布活动',description:'在当前页面打开活动发布流程，不会直接提交或公开活动。',inputSchema:{type:'object',properties:{title:{type:'string'}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(input?.title) state.draft.title=input.title; state.publishStep=1; state.publishSubmitted=false; state.history.push(state.view); state.view='publish'; render(); return {status:'draft_opened',title:state.draft.title};}});
  register({name:'open_event',title:'打开活动详情',description:'按活动 ID 打开活动详情。',inputSchema:{type:'object',properties:{eventId:{type:'string',enum:events.map(e=>e.id)}},required:['eventId'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!events.some(e=>e.id===input.eventId)) throw new Error('活动不存在'); go('event',{id:input.eventId}); return {status:'opened',eventId:input.eventId};}});
}

render();
registerWebMCP();
