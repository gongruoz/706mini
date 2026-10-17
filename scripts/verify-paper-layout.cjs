// Data/markup contract checks only. Visual proportions still require simulator QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const store = new Map();
global.wx = {
  getStorageSync: key => store.get(key),
  setStorageSync: (key, value) => store.set(key, structuredClone(value)),
  removeStorageSync: key => store.delete(key),
  setNavigationBarTitle() {},
  request() { throw Error('Unexpected network request'); }
};
const layout = require('../miniprogram/lib/navigation-layout');
const theme = require('../miniprogram/lib/theme');
const prefs = require('../miniprogram/lib/preferences');
const factory = require('../miniprogram/lib/page');
const mock = require('../miniprogram/lib/mock');

async function event(record, locale) {
  prefs.set({locale});
  const page = factory('event');
  page.data = structuredClone(page.data);
  page.setData = values => Object.assign(page.data, values);
  page.onLoad({id:'layout-fixture'});
  page.config = {cities:[]};
  page.read = async op => {
    assert.equal(op, 'event');
    return {...record, comments:[]};
  };
  await page.load();
  assert.equal(page.data.error, '');
  return page.data.record;
}

(async () => {
  mock.reset();
  for (const width of [320, 375, 430]) {
    const actual = layout({
      getWindowInfo: () => ({windowWidth:width,statusBarHeight:47}),
      getMenuButtonBoundingClientRect: () => ({top:55,height:32,left:width-94})
    });
    assert.equal(actual.menuTop,55);
    assert.equal(actual.menuHeight,32);
    assert.equal(actual.menuRightInset,106);
    assert.equal(actual.headerHeight,111);
  }
  assert.equal(layout({}).menuHeight,32);
  assert.equal(layout({getMenuButtonBoundingClientRect(){throw Error('unavailable');}}).menuRightInset,116);
  assert.equal(theme.tokens.stickerWidth,'368rpx');
  assert.equal(theme.tokens.eventArtSize,'216rpx');
  const base = {id:'layout-fixture',type:'event',status:'PUBLISHED',starts_at:'2099-10-17T11:30:00Z',ends_at:'2099-10-17T14:00:00Z',registered:12,capacity:20,remaining:8,price_minor:3000,initiator:{display_name:'阿乔'},organization_name:'Sola 放映组'};
  for (const locale of ['zh-CN','en']) {
    const normalized = await event(base,locale);
    assert.equal(normalized.capacityDisplay,'12/20');
    assert.equal(normalized.hostLine,'阿乔 & Sola 放映组');
    assert.equal(normalized.bookingOpen,true);
    assert.match(normalized.capacityLabel,/12/);
    const unlimited = await event({...base,capacity:null,remaining:null},locale);
    assert.equal(unlimited.capacityDisplay,locale==='en'?'12 going':'12 人参加');
    assert(!unlimited.capacityDisplay.includes('/'));
    const full = await event({...base,remaining:0},locale);
    assert.equal(full.bookingOpen,false);
    const cancelled = await event({...base,status:'CANCELLED'},locale);
    assert.equal(cancelled.bookingOpen,false);
  }
  assert.equal((await event({...base,organization_name:'个人发起'},'zh-CN')).hostLine,'阿乔');
  assert.equal((await event({...base,initiator:{display_name:'Sola 放映组'}},'zh-CN')).hostLine,'Sola 放映组');
  const markup = fs.readFileSync(path.join(__dirname,'../miniprogram/templates/screen.wxml'),'utf8');
  const card = markup.slice(0,markup.indexOf('</template>'));
  assert.equal((card.match(/class="event-capacity"/g)||[]).length,1);
  assert(!card.includes('<button class="event-capacity'));
  assert(!/participant|cover-time|attendance-status|event-card-footer/.test(card));
  assert(!/demo-banner|合并动态|➡️|↗️/.test(markup));
  assert(markup.includes('settings-menu developer-entry'));
  assert(markup.includes('class="event-management"'));
  assert(!markup.includes('main-page-label'));
  assert(!markup.includes('bindtap="markRead"'));
  assert(!markup.includes('class="banner-controls"'));
  assert(!markup.includes('class="timeline-viewport"'));
  const app = JSON.parse(fs.readFileSync(path.join(__dirname,'../miniprogram/app.json'),'utf8'));
  assert.equal(app.window.navigationStyle,'custom');
  let backCalls=0,home;
  wx.navigateBack = options => {backCalls++; options.fail();};
  wx.switchTab = options => {home=options.url;};
  factory('event').back();
  assert.equal(backCalls,1);
  assert.equal(home,'/pages/feed/index');
  assert.equal(theme.tokens.chromeClear,'rgba(250,249,245,0)');
  console.log('Paper layout contracts: native header 320/375/430, fallback, bilingual capacity/host states, compact card and developer entry passed; networkCalls=0.');
})().catch(error => {console.error(error);process.exitCode=1;});
