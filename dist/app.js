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
    fit:'对城市生活、社区与纪录片感兴趣的人。不需要任何电影背景。', approval:true
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
    fit:'706 社区成员，以及对共创产品感兴趣的人。', approval:false
  },
  {
    id:'frisbee', title:'傍晚飞盘｜零基础友好', date:'10月3日', day:'03', time:'17:00–19:00', city:'上海',
    venue:'徐汇滨江草坪', address:'龙腾大道与瑞宁路交叉口', price:20, spots:0, joined:24,
    host:'Shing', org:'飞盘散人局', color:'linear-gradient(135deg,#8c6c1a,#44320a 65%,#201802)',
    summary:'没有固定队伍，也不卷技术。先做基础练习，再分组玩几轮，日落之后一起去附近吃饭。',
    fit:'第一次玩飞盘也可以参加，现场提供飞盘。', approval:false
  }
];

const state = {
  view:'feed', tab:'feed', history:[], activeEvent:'film', activePerson:'qiao', activeEntity:'space',
  dateFilter:'全部', messageFilter:'全部', recommended:{}, joined:{}, unread:4,
  publishStep:1, publishSubmitted:false, approvalDone:false,
  draft:{ title:'周末共读：我们如何一起生活', summary:'选一篇不长的文章，一起读完再聊。', date:'2026-10-04', start:'14:00', end:'16:30', city:'上海', venue:'706 青年空间', identity:'以个人身份发布', org:'不关联组织', quota:'16', paid:false, price:'30', attendeeApproval:true, joinMethod:'审核通过后展示微信群二维码', detail:'我们会提前一天把文章发到群里。不要求提前读完，也欢迎只带着问题来。' }
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
    <div class="event-mini-foot"><span>${e.price?`¥${e.price}`:'免费'} · ${e.joined} 人已参加</span><span class="stack">${avatar(person('jiang'),'xs')}${avatar(person('shing'),'xs')}<span class="avatar xs" style="--avatar:#eee">+${Math.max(e.joined-2,1)}</span></span></div>
  </div>`;
}

function eventRow(e){
  return `<article class="event-row" data-action="event" data-id="${e.id}">
    <div class="date-block"><span>${e.date.includes('周')?e.date:'10月'}</span><strong>${e.day}</strong></div>
    <div class="event-row-main"><h3>${e.title}</h3><p>${e.time} · ${e.venue}</p><p>${e.price?`¥${e.price}`:'免费'} · ${e.spots?`剩余 ${e.spots} 个名额`:'名额已满'}</p><div class="tiny-people">${avatar(person('qiao'),'xs')}${avatar(person('jiang'),'xs')}<span>${e.joined} 人参加</span></div></div>
  </article>`;
}

function renderFeed(){
  const cards=people.slice(0,4).map(p=>`<article class="person-card">${avatar(p)}<strong>${p.name}</strong><p>${p.bio}</p><button class="follow ${p.following||state.recommended[p.id]?'active':''}" data-action="follow" data-id="${p.id}">${p.following||state.recommended[p.id]?'已关注':'＋ 关注'}</button></article>`).join('');
  const e1=events[0],e2=events[2];
  const body=`<section class="screen">${topbar('社区动态','星期六 · 9月26日','<button class="city-pill" data-action="city">上海⌄</button>')}
    <section class="section tight"><div class="section-title"><h2>同城值得认识的人</h2><button data-action="shuffle">换一批</button></div><div class="h-scroll">${cards}</div></section>
    <div class="feed-kicker">关注的人与同城正在发生</div>
    <article class="post featured"><div class="post-head">${avatar(person('qiao'),'sm')}<div class="post-meta"><strong>阿乔推荐了一场活动</strong><span>18 分钟前 · 上海</span></div><button class="more">···</button></div><p class="post-copy">“周六晚上一起看一部关于城市与漂泊的电影，映后想聊聊我们为什么留在这里。”</p>${eventMini(e1)}<div class="post-actions"><button class="soft-btn ${state.recommended.film?'on':''}" data-action="recommend" data-id="film">${state.recommended.film?'已推荐':'推荐'}</button><button class="soft-btn" data-action="comment">评论 4</button><button class="soft-btn" data-action="share">分享</button></div></article>
    <article class="post"><div class="post-head">${avatar(person('jiang'),'sm')}<div class="post-meta"><strong>Jiang、Shing 和 6 位同城成员报名了</strong><span>今天 09:12 · 合并动态</span></div><button class="more">···</button></div><p class="post-copy">大家正在一起设计 706 小程序的下一步。</p>${eventMini(e2)}<div class="post-actions"><button class="soft-btn" data-action="recommend" data-id="workshop">推荐</button><button class="soft-btn" data-action="comment">评论 7</button><button class="soft-btn" data-action="share">分享</button></div></article>
    <div style="height:16px"></div></section>`;
  return shell(body,{fab:true});
}

function renderDiscover(){
  const filtered=events.filter(e=>state.dateFilter==='全部'||state.dateFilter==='本周末'&&['周六','周日'].includes(e.date)||state.dateFilter==='免费'&&e.price===0||state.dateFilter==='有名额'&&e.spots>0);
  const body=`<section class="screen gray">${topbar('发现活动','上海 · 近期活动','<button class="city-pill" data-action="city">上海⌄</button>')}
    <div class="search-wrap"><label class="search"><span>⌕</span><input data-action="search" placeholder="搜索活动、成员、组织或空间" aria-label="搜索" /></label></div>
    <div class="chips">${['全部','本周末','免费','有名额'].map(x=>`<button class="chip ${state.dateFilter===x?'active':''}" data-action="filter" data-id="${x}">${x}</button>`).join('')}<button class="chip" data-action="date">选择日期</button></div>
    <div class="section-title" style="padding:0 19px"><h2>${state.dateFilter==='全部'?'接下来可以参加':state.dateFilter}</h2><button data-action="filters">更多筛选</button></div>
    ${filtered.length?filtered.map(eventRow).join(''):`<div class="empty"><div class="empty-icon">⌕</div><h2>暂时没有活动</h2><p>换个时间看看，或者发起一场你想参加的活动。</p><button class="secondary" data-action="filter" data-id="全部">清除筛选</button></div>`}
    <div class="section-title" style="padding:13px 19px 10px"><h2>常去的空间</h2><button>查看全部</button></div>
    <div class="places"><article class="place-card" data-action="space"><small>静安 · 1.2 km</small><h3>706 青年空间</h3><small>本周有 4 场活动</small></article><article class="place-card" data-action="org"><small>徐汇 · 社区伙伴</small><h3>Sola 共创空间</h3><small>最近 12 位成员来过</small></article></div>
  </section>`;
  return shell(body,{fab:true});
}

function renderMessages(){
  const messages=[
    {type:'审核',title:'一场活动等待你审核',copy:'「城市里的陌生人晚餐」申请使用 706 青年空间。',time:'10:22',icon:'审',unread:true,action:'approvals'},
    {type:'报名',title:'活动报名申请已通过',copy:'你可以参加「秋日放映：城市游牧者」，请在 30 分钟内完成付款。',time:'昨天',icon:'票',unread:true,action:'event',id:'film'},
    {type:'互动',title:'阿乔关注了你',copy:'你们现在互相关注，可以在动态里看到彼此的活动。',time:'昨天',icon:'友',unread:true,action:'member',id:'qiao'},
    {type:'活动',title:'活动地点有更新',copy:'「苏州河慢走」集合点改为 M50 创意园 3 号门。',time:'周四',icon:'更',unread:false,action:'event',id:'walk'},
    {type:'系统',title:'你已成为空间管理员',copy:'现在可以管理 706 青年空间的信息与活动审核。',time:'周一',icon:'管',unread:false,action:'space'}
  ];
  const shown=messages.filter(m=>state.messageFilter==='全部'||m.type===state.messageFilter);
  const body=`<section class="screen">${topbar('消息',state.unread?`${state.unread} 条未读`:'已全部读完','<button class="plain-btn" data-action="readall">全部已读</button>')}
    <div class="message-tabs">${['全部','审核','报名','互动'].map(x=>`<button class="chip ${state.messageFilter===x?'active':''}" data-action="message-filter" data-id="${x}">${x}</button>`).join('')}</div>
    ${shown.map(m=>`<article class="message-item ${m.unread&&state.unread?'unread':''}" data-action="${m.action}" ${m.id?`data-id="${m.id}"`:''}><span class="msg-icon">${m.icon}</span><div class="msg-body"><strong>${m.title}<time>${m.time}</time></strong><p>${m.copy}</p></div></article>`).join('')}
  </section>`;
  return shell(body);
}

function renderMe(){
  const body=`<section class="screen gray">${topbar('我的','','<button class="icon-btn" data-action="settings">⚙</button>')}
    <section class="profile-hero" data-action="member" data-id="jiang"><div class="profile-top">${avatar(person('jiang'))}<div><h2>Jiang</h2><p>上海 · 城市研究 / 社区产品</p></div></div><div class="stats"><div class="stat"><strong>18</strong><span>关注</span></div><div class="stat"><strong>42</strong><span>被关注</span></div><div class="stat"><strong>16</strong><span>参与活动</span></div></div></section>
    <article class="admin-card" data-action="approvals"><div><strong>管理员待办</strong><p>${state.approvalDone?'新的审核都处理完了':'2 场活动正在等待审核'}</p></div><span class="count">${state.approvalDone?'0':'2'}</span></article>
    <div class="menu-group"><button class="menu-row" data-action="my-registrations"><span class="row-icon">票</span><span>我的报名</span><small>3 场 ›</small></button><button class="menu-row" data-action="my-events"><span class="row-icon">旗</span><span>我发布的活动</span><small>2 场 ›</small></button><button class="menu-row" data-action="publish"><span class="row-icon">＋</span><span>发布活动</span><small>›</small></button><button class="menu-row" data-action="drafts"><span class="row-icon">稿</span><span>草稿</span><small>1 ›</small></button></div>
    <div class="menu-group"><button class="menu-row" data-action="org"><span class="row-icon">组</span><span>我管理的组织</span><small>706 产品小组 ›</small></button><button class="menu-row" data-action="space"><span class="row-icon">屋</span><span>我管理的空间</span><small>706 青年空间 ›</small></button><button class="menu-row" data-action="following"><span class="row-icon">友</span><span>我的关注</span><small>18 ›</small></button></div>
  </section>`;
  return shell(body);
}

function renderEvent(){
  const e=eventBy(state.activeEvent); const isJoined=state.joined[e.id];
  return `<section class="screen no-nav"><header class="topbar transparent"><button class="back" data-action="back">‹</button><span></span></header>
    <section class="detail-hero" style="--cover:${e.color}"><span class="cover-tag">${e.spots?'报名中':'名额已满'}</span><h1>${e.title}</h1><p>${e.date} ${e.time} · ${e.city}</p></section>
    <div class="social-proof"><span class="stack">${avatar(person('qiao'),'xs')}${avatar(person('jiang'),'xs')}${avatar(person('shing'),'xs')}</span><span><strong>阿乔和 Jiang</strong> 等 ${e.joined} 人已经参加</span></div>
    <section class="detail-section"><div class="facts"><div class="fact"><span class="fact-icon">日</span><div><strong>${e.date} · ${e.time}</strong><span>活动开始前 2 小时停止报名</span></div></div><div class="fact"><span class="fact-icon">地</span><div><strong>${e.venue}</strong><span>${e.address}</span></div></div><div class="fact"><span class="fact-icon">票</span><div><strong>${e.price?`¥${e.price} / 人`:'免费参加'}</strong><span>${e.spots?`还剩 ${e.spots} 个名额`:'可以加入候补'}</span></div></div></div></section>
    <section class="detail-section"><h2>关于活动</h2><p>${e.summary}</p><div class="tags"><span class="tag">城市</span><span class="tag">轻松交流</span><span class="tag">新朋友友好</span></div></section>
    <section class="detail-section"><h2>适合谁参加</h2><p>${e.fit}</p></section>
    <section class="detail-section"><h2>发起人和空间</h2><article class="entity-card" data-action="member" data-id="qiao">${avatar(person('qiao'),'sm')}<div><strong>${e.host}</strong><span>发起人 · 最近组织 5 场活动</span></div><b>›</b></article><article class="entity-card" data-action="space"><span class="avatar sm" style="--avatar:#ffe0b0">屋</span><div><strong>${e.venue}</strong><span>${e.org}</span></div><b>›</b></article></section>
    <section class="detail-section"><div class="section-title"><h2>大家为什么想来</h2><button data-action="comment">写评论</button></div><article class="entity-card">${avatar(person('jiang'),'sm')}<div><strong>Jiang</strong><span>很想听听大家怎么理解“留下来”。</span></div></article><article class="entity-card">${avatar(person('shing'),'sm')}<div><strong>Shing</strong><span>朋友推荐了这部片，第一次来 706。</span></div></article></section>
  </section><div class="bottom-action"><button class="secondary" data-action="recommend" data-id="${e.id}">${state.recommended[e.id]?'已推荐':'推荐'}</button><button class="primary" data-action="signup" data-id="${e.id}" ${isJoined?'disabled':''}>${isJoined?'报名审核中':e.spots?(e.approval?'申请报名':'立即报名'):'加入候补'}</button></div>`;
}

function renderMember(){
  const p=person(state.activePerson); const followed=p.following||state.recommended[p.id];
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>成员主页</h2><button class="plain-btn">···</button></header>
    <section class="member-hero">${avatar(p)}<h1>${p.name}</h1><p>${p.city} · ${p.bio}<br>喜欢把陌生人聚到一张桌子边，聊一些没有标准答案的问题。</p><div class="tags"><span class="tag">城市观察</span><span class="tag">纪录片</span><span class="tag">社区空间</span></div><div class="member-actions"><button class="secondary" data-action="follow" data-id="${p.id}">${followed?'已关注':'＋ 关注'}</button><button class="secondary" data-action="share">分享主页</button></div></section>
    <section class="detail-section"><h2>最近参与</h2>${eventRow(events[0])}${eventRow(events[2])}</section>
    <section class="detail-section"><h2>常去的空间</h2><article class="entity-card" data-action="space"><span class="avatar sm" style="--avatar:#ffe0b0">屋</span><div><strong>706 青年空间</strong><span>最近参加过 6 场活动</span></div><b>›</b></article></section>
  </section>`;
}

function renderEntity(type){
  const isSpace=type==='space';
  state.activeEntity=type;
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>${isSpace?'空间':'组织'}</h2><button class="manage-link" data-action="manage-entity">管理</button></header>
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

function renderPublish(){
  if(state.publishSubmitted) return `<section class="screen no-nav"><div class="success"><div><div class="success-icon">✓</div><h1>活动已提交审核</h1><p>平台运营和空间管理员会同时收到申请。<br>你可以在“我发布的活动”中查看进度。</p><button class="primary dark" data-action="approval-progress">查看审核进度</button><button class="plain-btn" data-action="home" style="display:block;margin:12px auto">回到动态</button></div></div></section>`;
  const d=state.draft; let fields=''; let title=''; let intro='';
  if(state.publishStep===1){
    title='活动是什么？'; intro='先把时间、地点和主题说清楚，其他内容之后还可以继续编辑。';
    fields=`<div class="field"><label>活动名称</label><input class="input" data-bind="title" value="${d.title}" /></div><div class="field"><label>一句话介绍</label><textarea class="textarea" data-bind="summary">${d.summary}</textarea></div><div class="field"><label>日期</label><input class="input" type="date" data-bind="date" value="${d.date}" /></div><div class="grid-2"><div class="field"><label>开始时间</label><input class="input" type="time" data-bind="start" value="${d.start}" /></div><div class="field"><label>结束时间</label><input class="input" type="time" data-bind="end" value="${d.end}" /></div></div><div class="grid-2"><div class="field"><label>城市</label><select class="select" data-bind="city"><option>上海</option><option>杭州</option><option>北京</option></select></div><div class="field"><label>空间／地点</label><select class="select" data-bind="venue"><option>706 青年空间</option><option>Sola 共创空间</option><option>自行填写地点</option></select></div></div><div class="field"><label>以什么身份发布</label><select class="select" data-bind="identity"><option>以个人身份发布</option><option>以 706 产品小组发布</option></select><small>选择组织身份后，需要对应组织管理员审核。</small></div>`;
  } else if(state.publishStep===2){
    title='大家如何参加？'; intro='设置名额、费用和报名方式。报名后的联系信息不会公开。';
    fields=`<div class="field"><label>活动名额</label><input class="input" type="number" data-bind="quota" value="${d.quota}" /></div><div class="option-row"><div><strong>这是付费活动</strong><small>支持任意金额，不设价格上限</small></div><button class="switch ${d.paid?'on':''}" data-action="toggle-paid" aria-label="切换付费活动"></button></div>${d.paid?`<div class="field"><label>每人费用（元）</label><input class="input" type="number" inputmode="decimal" min="0.01" step="0.01" data-bind="price" value="${d.price}" /><small>可输入任意正数金额，支持小数。</small></div>`:''}<div class="option-row"><div><strong>报名需要发起人审核</strong><small>付费活动将先审核，后付款</small></div><button class="switch ${d.attendeeApproval?'on':''}" data-action="toggle-approval" aria-label="切换报名审核"></button></div><div class="field"><label>报名成功后如何参与</label><textarea class="textarea" data-bind="joinMethod">${d.joinMethod}</textarea><small>群二维码、公开联系人或其他参与方式，只对报名成功的人显示。</small></div><div class="field"><label>补充活动介绍</label><textarea class="textarea" data-bind="detail">${d.detail}</textarea></div>`;
  } else {
    title='确认并提交'; intro='所有活动公开前都需要审核。关联组织或空间时，相应管理员会同时收到申请。';
    fields=`<div class="review-card"><h3>${d.title}</h3><div class="review-row"><span>时间</span><b>10月4日 ${d.start}–${d.end}</b></div><div class="review-row"><span>地点</span><b>${d.venue}</b></div><div class="review-row"><span>发布身份</span><b>${d.identity}</b></div><div class="review-row"><span>参与方式</span><b>${d.paid?`¥${d.price}`:'免费'} · ${d.quota} 人</b></div></div><div class="review-card"><h3>将由这些人审核</h3><div class="approval-list"><div class="approval-row"><span class="status-dot"></span><div><strong>706 上海运营</strong><span>所有活动的基础审核</span></div><span>待提交</span></div><div class="approval-row"><span class="status-dot"></span><div><strong>706 青年空间</strong><span>确认时间与空间安排</span></div><span>待提交</span></div></div></div><div class="notice">提交后，你可以随时查看卡在哪个环节，以及可以联系谁。</div>`;
  }
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="publish-back">‹</button><h2>发布活动</h2><button class="plain-btn" data-action="save-draft">存草稿</button></header><main class="form-page"><div class="steps">${[1,2,3].map(n=>`<span class="step-line ${n<=state.publishStep?'done':''}"></span>`).join('')}</div><div class="form-intro"><h1>${title}</h1><p>${intro}</p></div>${fields}</main></section><div class="bottom-action">${state.publishStep>1?'<button class="secondary" data-action="publish-prev">上一步</button>':''}<button class="primary" data-action="publish-next">${state.publishStep===3?'提交审核':'继续'}</button></div>`;
}

function renderApprovals(){
  return `<section class="screen gray no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>审核待办</h2><button class="plain-btn">筛选</button></header><div class="notice">活动会同时交给平台、组织和空间审核。所有必要审核通过后才会公开。</div>${state.approvalDone?'<div class="empty"><div class="empty-icon">✓</div><h2>审核完成</h2><p>新的待办会通过消息通知你。</p></div>':`<article class="approve-card" data-action="approval-detail"><span class="badge">等待空间审核</span><h3>城市里的陌生人晚餐</h3><p>发起人：宁宁 · 10月6日 19:00</p><footer><span>申请使用 706 青年空间</span><b>查看 ›</b></footer></article><article class="approve-card" data-action="approval-detail"><span class="badge orange">重新提交</span><h3>女性写作共读会</h3><p>发起人：毛毛 · 10月8日 19:30</p><footer><span>已按意见调整人数</span><b>查看 ›</b></footer></article>`}</section>`;
}

function renderApprovalDetail(){
  return `<section class="screen no-nav"><header class="topbar slim"><button class="back" data-action="back">‹</button><h2>活动审核</h2><button class="plain-btn">联系发起人</button></header><section class="detail-section"><span class="badge">等待你的审核</span><h1 style="font-size:25px;margin:13px 0 7px">城市里的陌生人晚餐</h1><p>6 位第一次见面的人，一起做饭、吃饭，再聊一个今晚才揭晓的问题。</p></section><section class="detail-section"><div class="facts"><div class="fact"><span class="fact-icon">日</span><div><strong>10月6日 19:00–22:00</strong><span>周二晚间</span></div></div><div class="fact"><span class="fact-icon">地</span><div><strong>706 青年空间</strong><span>申请使用厨房和公共区域</span></div></div><div class="fact"><span class="fact-icon">人</span><div><strong>6 个名额 · 免费</strong><span>报名需要发起人审核</span></div></div></div></section><section class="detail-section"><h2>其他审核方</h2><div class="approval-list"><div class="approval-row"><span class="status-dot ok"></span><div><strong>706 上海运营</strong><span>阿乔 · 今天 10:16</span></div><b>已通过</b></div><div class="approval-row"><span class="status-dot"></span><div><strong>706 青年空间</strong><span>当前由你处理</span></div><b>待审核</b></div></div></section><section class="detail-section"><h2>发起人备注</h2><p>需要使用厨房的基础厨具，会在结束后完成清洁。希望提前半小时进入布置。</p></section></section><div class="bottom-action"><button class="secondary" data-action="return-approval">退回修改</button><button class="primary dark" data-action="approve">通过审核</button></div>`;
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
    case 'publish': html=renderPublish(); break; case 'approvals': html=renderApprovals(); break; case 'approval-detail': html=renderApprovalDetail(); break; case 'approval-progress': html=renderProgress(); break;
    case 'registrations': html=renderSimple('我的报名','这里会集中展示待审核、待付款、即将开始和已经结束的活动。'); break;
    case 'my-events': html=renderSimple('我发布的活动','可以查看草稿、审核进度、报名名单，以及从旧活动再办一场。'); break;
    case 'drafts': html=renderSimple('活动草稿','你有一份“周末共读”的草稿，可以从发布入口继续编辑。'); break;
    case 'following': html=renderSimple('我的关注','你关注的人、组织和空间会共同影响动态首页。'); break;
    default: html=renderFeed();
  }
  app.innerHTML=html;
}

function go(view,opts={}){
  state.history.push(state.view); state.view=view;
  if(opts.id){ if(view==='event') state.activeEvent=opts.id; if(view==='member') state.activePerson=opts.id; }
  render(); scrollTop();
}
function scrollTop(){ const s=app.querySelector('.screen'); if(s) s.scrollTop=0; }
function back(){ state.view=state.history.pop()||state.tab; render(); scrollTop(); }
function showToast(text){ toastEl.textContent=text; toastEl.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toastEl.classList.remove('show'),1900); }
function closeSheet(){ layer.innerHTML=''; }

function signupSheet(id){
  const e=eventBy(id);
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${e.spots?'报名活动':'加入候补'}</h2><p>${e.title}<br>你的报名和参与状态会公开展示，联系方式和报名回答只对发起人可见。</p><div class="field"><label>怎么称呼你</label><input class="input" value="Jiang" /></div><div class="field"><label>为什么想参加？</label><textarea class="textarea" placeholder="简单说说你的兴趣或期待">对城市里的公共空间很感兴趣，也想认识一起做社区的人。</textarea></div><label style="display:flex;gap:9px;align-items:flex-start;font-size:12px;line-height:1.45"><input type="checkbox" checked /> 我知道报名和参与状态会展示在社区中</label><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary" data-action="submit-signup" data-id="${id}">${e.spots?(e.approval?'提交申请':'确认报名'):'加入候补'}</button></div></section></div>`;
}

function commentSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>写下回应</h2><p>评论会公开显示在活动详情中。</p><textarea class="textarea" placeholder="你想说什么？">这个主题很有意思，想知道映后讨论会持续多久？</textarea><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary" data-action="post-comment">发布评论</button></div></section></div>`;
}

function recommendSheet(id){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>推荐给社区</h2><p>你的推荐会出现在关注者的动态中，可以附上一句话。</p><textarea class="textarea" placeholder="为什么推荐这场活动？">这个主题很适合第一次来 706 的朋友，一起去吧。</textarea><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary" data-action="submit-recommend" data-id="${id}">发布推荐</button></div></section></div>`;
}

function miniProgramSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><div class="mini-program-head"><span class="mini-program-logo">706</span><div><h2>706 社区</h2><p>让活动更容易发生，也让人更容易彼此发现。</p></div></div><div class="menu-group sheet-menu"><button class="menu-row" data-action="wx-about"><span class="row-icon">i</span><span>关于 706 社区</span><small>›</small></button><button class="menu-row" data-action="wx-refresh"><span class="row-icon">↻</span><span>重新加载页面</span><small>›</small></button><button class="menu-row" data-action="wx-feedback"><span class="row-icon">✎</span><span>反馈与建议</span><small>›</small></button></div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function manageEntitySheet(){
  const isSpace=state.activeEntity==='space';
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${isSpace?'空间':'组织'}管理</h2><p>这些入口只有管理员可见，普通成员不会看到顶部的“管理”。</p><div class="menu-group sheet-menu"><button class="menu-row" data-action="manage-edit"><span class="row-icon">编</span><span>编辑${isSpace?'空间':'组织'}资料</span><small>›</small></button><button class="menu-row" data-action="approvals"><span class="row-icon">审</span><span>活动审核</span><small>2 个待办 ›</small></button><button class="menu-row" data-action="manage-admins"><span class="row-icon">人</span><span>管理员设置</span><small>›</small></button></div><button class="secondary sheet-close" data-action="close-sheet">取消</button></section></div>`;
}

function returnSheet(){
  layer.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"><section class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>退回修改</h2><p>请具体说明需要调整的地方，发起人会收到通知。</p><textarea class="textarea">空间 18:30 前还有其他活动，请将布置时间改为 18:40 以后。</textarea><div class="sheet-actions"><button class="secondary" data-action="close-sheet">取消</button><button class="primary dark" data-action="confirm-return">发送修改意见</button></div></section></div>`;
}

app.addEventListener('input',e=>{ const key=e.target.dataset.bind; if(key) state.draft[key]=e.target.value; });
app.addEventListener('change',e=>{ const key=e.target.dataset.bind; if(key) state.draft[key]=e.target.value; });

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]'); if(!btn) return;
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
  else if(a==='manage-edit'){ closeSheet(); showToast('已进入资料编辑（交互演示）'); }
  else if(a==='manage-admins'){ closeSheet(); showToast('已进入管理员设置（交互演示）'); }
  else if(a==='recommend') recommendSheet(id||state.activeEvent);
  else if(a==='submit-recommend'){ state.recommended[id]=true; closeSheet(); render(); showToast('推荐已发布到动态'); }
  else if(a==='comment') commentSheet(); else if(a==='post-comment'){ closeSheet(); showToast('评论已发布'); }
  else if(a==='share') showToast('已打开微信分享面板（模拟）');
  else if(a==='wx-more'||a==='settings') miniProgramSheet();
  else if(a==='wx-home'){ closeSheet(); state.tab='feed'; state.view='feed'; state.history=[]; render(); showToast('已回到小程序首页'); }
  else if(a==='wx-about'){ closeSheet(); showToast('706 社区小程序 · MVP'); }
  else if(a==='wx-refresh'){ closeSheet(); render(); showToast('页面已重新加载'); }
  else if(a==='wx-feedback'){ closeSheet(); showToast('反馈入口将在正式版接入'); }
  else if(a==='signup') signupSheet(id); else if(a==='submit-signup'){ state.joined[id]=true; closeSheet(); render(); showToast(eventBy(id).approval?'报名申请已提交':'报名成功'); }
  else if(a==='close-sheet') closeSheet();
  else if(a==='filter'){ state.dateFilter=id; render(); } else if(a==='message-filter'){ state.messageFilter=id; render(); }
  else if(a==='readall'){ state.unread=0; render(); showToast('已全部标为已读'); }
  else if(a==='approvals'){ closeSheet(); go('approvals'); } else if(a==='approval-detail') go('approval-detail');
  else if(a==='approve'){ state.approvalDone=true; back(); showToast('已通过审核，发起人将收到通知'); }
  else if(a==='return-approval') returnSheet(); else if(a==='confirm-return'){ state.approvalDone=true; closeSheet(); back(); showToast('修改意见已发送'); }
  else if(a==='toggle-paid'){ state.draft.paid=!state.draft.paid; render(); }
  else if(a==='toggle-approval'){ state.draft.attendeeApproval=!state.draft.attendeeApproval; render(); }
  else if(a==='publish-next'){ if(state.publishStep===2&&state.draft.paid&&(!state.draft.price||Number(state.draft.price)<=0)){ showToast('请输入大于 0 的活动价格'); } else if(state.publishStep<3){ state.publishStep++; render(); scrollTop(); } else { state.publishSubmitted=true; render(); } }
  else if(a==='publish-prev'){ state.publishStep--; render(); scrollTop(); }
  else if(a==='save-draft'){ showToast('草稿已保存'); }
  else if(a==='approval-progress') go('approval-progress');
  else if(a==='my-registrations') go('registrations'); else if(a==='my-events') go('my-events'); else if(a==='drafts') go('drafts'); else if(a==='following') go('following');
  else if(['city','shuffle','date','filters','search'].includes(a)) showToast('这是交互模型中的演示入口');
});

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
