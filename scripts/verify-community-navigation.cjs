// Offline contract checks; these do not stand in for native visual QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const store = new Map([['706.transport', 'mock']]);
let currentRoute = 'feed', relaunches = [];
global.wx = {
  getStorageSync: key => store.get(key),
  setStorageSync: (key, value) => store.set(key, structuredClone(value)),
  removeStorageSync: key => store.delete(key),
  setNavigationBarTitle() {},
  reLaunch(options) { relaunches.push(options.url); options.success?.(); options.complete?.(); },
  navigateTo(options) { relaunches.push(options.url); },
  request() { throw Error('Unexpected network'); }
};
global.getCurrentPages = () => [{route:'pages/' + currentRoute + '/index'}];
const factory = require('../miniprogram/lib/page');
const prefs = require('../miniprogram/lib/preferences');
const theme = require('../miniprogram/lib/theme');
const icons = require('../miniprogram/lib/illustrations');
const routes = ['feed', 'discover', 'messages', 'me'];
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const tokens = css => Object.fromEntries(css.split(';').map(pair => pair.split(':')));

for (const locale of ['zh-CN', 'en']) {
  prefs.set({locale});
  for (const route of [...routes, 'space', 'event', 'calendar']) {
    const page = factory(route);
    page.data = structuredClone(page.data);
    page.setData = values => Object.assign(page.data, values);
    page.refreshLanguage();
    assert.deepEqual(page.data.tabItems.map(item => item.key), routes);
    assert(page.data.tabItems.every(item => item.icon === icons[item.key] && item.label));
    assert(!page.data.tabItems.some(item => item.emoji));
    if (routes.includes(route)) assert.equal(page.data.tab, route);
    const actual = tokens(page.data.theme);
    for (const key of ['navigationSurface', 'navigationAccent', 'navigationInk', 'navigationGutter', 'tabHeight', 'tabIconSize', 'tabBarSpace']) {
      assert.equal(actual['--' + key], theme.tokens[key], route + ': ' + key);
    }
  }
}
for (const route of routes) {
  const asset = path.join(__dirname, '../miniprogram', icons[route]);
  const png = fs.readFileSync(asset);
  assert.equal(png.readUInt32BE(16), 96);
  assert.equal(png.readUInt32BE(20), 96);
}
const markup = read('miniprogram/templates/screen.wxml');
const navigation = markup.slice(markup.indexOf('<view wx:if="{{!sheet && !isTask && !keyboardHeight}}" class="navigation-shell"'));
assert(navigation.includes('src="{{item.icon}}"'));
assert(navigation.includes('aria-selected="{{tab === item.key}}"'));
assert(!/Inverse|navigation-emoji|navigation-selection|translateX/.test(navigation));
const css = read('miniprogram/custom-tab-bar/index.wxss');
assert(css.includes('border-radius:var(--pill)'));
assert(css.includes('background:var(--navigationSurface)'));
// 5rpx inset + 1rpx outline preserves the previous 6rpx outer geometry.
assert(css.includes('padding:5rpx;border:1rpx solid rgba(35,35,35,.16)'));
assert(css.includes('box-shadow:0 10rpx 32rpx rgba(0,0,0,.045),0 2rpx 6rpx rgba(0,0,0,.018)'));
assert(css.includes('border:var(--stroke) solid transparent'));
assert(css.includes('border-color:var(--navigationInk)'));
assert(css.includes('transition:none'));
assert(!read('miniprogram/styles/community.wxss').includes('.community-edition .navigation-capsule'));

// White-card pass: change UI surfaces, not the original images or their colors.
const bodyCss = read('miniprogram/styles/community.wxss');
// Post kinds share a type hierarchy; only their semantic copy changes.
const postMarkup = markup.match(/<view wx:if="\{\{route === 'feed' && !searching\}\}"[^\n]+/)[0];
assert(postMarkup.includes('class="feed-person-name">{{item.feedIdentity.subject}}'));
assert(postMarkup.includes('class="feed-action-label"> {{item.feedIdentity.action}}'));
assert(!postMarkup.includes('<block wx:if='));
assert(!/\.feed-attendance\s+\.feed-quote\{/.test(bodyCss));
assert(bodyCss.includes('.feed-quote{display:block;font-size:var(--typeBody);font-weight:400;line-height:1.7'));
assert(bodyCss.includes('.feed-person-name{font-size:inherit;font-weight:600;color:var(--ink)}'));
const model = factory.editorial;
for (const locale of ['zh-CN', 'en']) {
  const en = locale === 'en';
  const rec = {author:{display_name:'禾舟'}};
  assert.deepEqual(model.feedIdentity(rec, locale), {subject:'禾舟',action:en?'recommends an event':'推荐了一场活动'});
  for (const count of [1, 2, 8]) {
    const rollup = {key:'REGISTRATION_ROLLUP',count,actors:[{display_name:'林叶'},{display_name:'星桥'}].slice(0,count)};
    const identity = model.feedIdentity(rollup, locale);
    assert.equal(identity.subject, count === 1 ? '林叶' : en ? '林叶 & 星桥' : '林叶、星桥');
    assert.equal(identity.action, en ? (count > 2 ? '+ 6 ' : '')+'joined an event' : (count > 2 ? '等 8 位成员' : '')+'报名了');
    assert.equal(model.feedHeadline(rollup,locale), identity.subject+(en?' ':'')+identity.action);
  }
}
// The search action is a white circle inset 2px from the native-height field.
assert(markup.includes('--search-button-size:{{menuHeight - 4}}px'));
const searchButtonCss = bodyCss.match(/\.search-capsule>\.search-submit\{([^}]+)\}/)[1];
assert(searchButtonCss.includes('width:var(--search-button-size)!important'));
assert(searchButtonCss.includes('height:var(--search-button-size)'));
assert(searchButtonCss.includes('border-radius:50%'));
assert(searchButtonCss.includes('background:var(--surface)'));
assert(searchButtonCss.includes('border:1rpx solid rgba(35,35,35,.2)'));
assert(searchButtonCss.includes('box-shadow:0 2rpx 6rpx rgba(0,0,0,.06)'));
assert(markup.includes('class="search-submit" aria-label="{{t.search}}" bindtap="search"'));
assert.equal(theme.community.peopleSurface, '#FFFFFF');
assert.equal(theme.community.invitation, '#FFFFFF');
assert.equal(Number.parseFloat(theme.community.eventArtWidth) / Number.parseFloat(theme.community.eventArtHeight), 3/4);
assert.equal(Number.parseFloat(theme.community.eventRadius), Number.parseFloat(theme.community.eventArtRadius) + Number.parseFloat(theme.community.eventRim));
assert(bodyCss.includes('padding:var(--eventRim)'));
assert(bodyCss.includes('border-radius:var(--eventArtRadius)'));
assert(bodyCss.includes('min-width:44px;min-height:44px'));
assert(bodyCss.includes('.community-edition.is-english .person-copy{padding-right:156rpx}'));
assert(bodyCss.includes('width:100rpx!important;min-width:44px;min-height:44px'));
assert(bodyCss.includes('height:56rpx'));
assert(markup.includes('<text class="person-follow-label">'));
assert(markup.includes('hover-class="person-follow-pressed"'));
const iconSource = read('scripts/build-community-icons.cjs');
const navigationDrawings = [...iconSource.matchAll(/^  (feed|discover|messages|me): (.+),$/gm)];
assert.equal(navigationDrawings.length, 4);
assert(navigationDrawings.every(([, , drawing]) => !/fill=/.test(drawing)));
assert(iconSource.includes('stroke-width="2"'));
assert(iconSource.includes('stroke-linecap="round" stroke-linejoin="round"'));
assert(navigationDrawings.find(([, name]) => name === 'discover')[2].includes('M10 18c1 6 11 6 12 0'));
assert(!/grayscale|backdrop-filter/.test(bodyCss));
assert.equal((markup.match(/class="fab"/g) || []).length, 1);
assert(bodyCss.includes('bottom:calc(176rpx + env(safe-area-inset-bottom))'));
assert(!markup.includes('header-publish'));
assert(!bodyCss.includes('header-publish'));
assert(markup.includes('aria-pressed="{{!!item.following}}"'));
assert(markup.includes('catchtap="personFollow"'));
assert(markup.includes('src="{{item.avatar_url}}"'));
assert(markup.includes('src="{{e.cover_url}}" mode="aspectFill"'));

// The retained native custom-tab component must share the same resources too.
let definition;
global.Component = value => { definition = value; };
require('../miniprogram/custom-tab-bar/index');
const component = {...definition.methods, data:structuredClone(definition.data)};
component.setData = values => Object.assign(component.data, values);
for (const route of routes) {
  currentRoute = route;
  component.sync();
  assert.equal(component.data.selected, routes.indexOf(route));
  assert(component.data.items.every(item => item.icon === icons[item.key]));
}
component.sync('feed');
component.switchTab({currentTarget:{dataset:{index:1}}});
assert.equal(relaunches.at(-1), '/pages/discover/index');
assert.equal(component.data.selected, 1);
assert.equal(component.data.switching, false);
const count = relaunches.length;
component.switchTab({currentTarget:{dataset:{index:1}}});
assert.equal(relaunches.length, count);
console.log('Community navigation: shared tokens/icons on 7 routes in 2 languages, bundled 96px assets, native component switching, stable selected geometry passed; networkCalls=0.');
