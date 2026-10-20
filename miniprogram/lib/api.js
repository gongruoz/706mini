const config = require('../config');
const soon = require('./soon');
const mock = require('./mock/index');
function mode() {
  const selected = wx.getStorageSync('706.transport') || config.mode;
  return selected === 'mock' ? 'mock' : 'soon';
}
function adapter() { return mode() === 'mock' ? mock : soon; }
const api = {
  mode,
  isMock: () => mode() === 'mock',
  mock,
  setMode(value) {
    const next = value === 'mock' ? 'mock' : 'soon';
    wx.setStorageSync('706.transport', next);
  }
};
for (const method of ['call', 'login', 'logout', 'close', 'session', 'setSession']) api[method] = (...args) => adapter()[method](...args);
module.exports = api;
