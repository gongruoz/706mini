const test = require('node:test');
const assert = require('node:assert/strict');
let definition;
global.Component = value => { definition = value; };
require('../miniprogram/components/ui-icon-button/index');

test('the icon control forwards one action and suppresses disabled actions', () => {
  const events = [];
  const control = { data: { disabled: false }, triggerEvent: name => events.push(name) };
  definition.methods.onPress.call(control);
  assert.deepEqual(events, ['press']);
  control.data.disabled = true;
  definition.methods.onPress.call(control);
  assert.deepEqual(events, ['press']);
});
