const test = require('node:test');
const assert = require('node:assert/strict');
const map = require('../miniprogram/lib/soon-map');

test('a WeChat ticket price stays in fen and a free event is zero', () => {
  assert.equal(map.priceMinor({ ticket_price: 2500, has_non_wechat_price: false }), 2500);
  assert.equal(map.priceMinor({ ticket_price: null, has_non_wechat_price: false }), 0);
  assert.equal(map.priceMinor({ ticket_price: null, has_non_wechat_price: true }), null);
});

test('event and registration words match the screens', () => {
  const card = map.eventCard({
    id: 'evt', title: '共读', status: 'published', start_time: '2026-11-01T10:00:00.000Z', end_time: '2026-11-01T12:00:00.000Z',
    ticket_price: 0, has_non_wechat_price: false, max_participant: 8, participant_count: 3, city: 'shanghai',
    owner: { id: 'host', nickname: '禾舟' }, group: { id: 'space', nickname: '706 青年空间', group_tags: ['space'] }
  });
  assert.equal(card.status, 'PUBLISHED');
  assert.equal(card.price_minor, 0);
  assert.equal(card.starts_at, '2026-11-01T10:00:00.000Z');
  assert.equal(card.space_id, 'space');
  assert.equal(card.host_display, '禾舟');
  assert.equal(card.remaining, 5);
  const open = map.eventCard({ id: 'evt', status: 'published', start_time: '2020-01-01T00:00:00.000Z', end_time: '2099-01-01T00:00:00.000Z' });
  assert.equal(open.can_register, true);
  const ended = map.eventCard({ id: 'evt', status: 'published', start_time: '2020-01-01T00:00:00.000Z', end_time: '2020-01-01T02:00:00.000Z' });
  assert.equal(ended.can_register, false);
  const staff = map.eventCard({ id: 'evt', status: 'published', start_time: '2020-01-01T00:00:00.000Z', end_time: '2020-01-01T02:00:00.000Z', is_owner: true }, { can_edit: true });
  assert.equal(staff.can_register, true);
  const paid = map.registrationFrom({ id: 'reg', status: 'attending', payment_status: 'pending', user: { id: 'guest', nickname: '来客' } }, { id: 'evt', status: 'published', start_time: '2026-11-01T10:00:00.000Z' }, { id: 'item', status: 'pending', amount: 1000 });
  assert.equal(paid.status, 'APPROVED_AWAITING_PAYMENT');
  assert.equal(map.registrationStatus({ status: 'attending', payment_status: 'succeeded' }), 'CONFIRMED');
  assert.equal(map.registrationStatus({ status: 'pending' }), 'REQUESTED');
  assert.equal(map.registrationStatus({ status: 'declined' }), 'REJECTED');
});

test('inbox copy keeps the title the message row splits on', () => {
  const note = map.notification({ id: 'act', action: 'registration/requested', has_read: false, created_at: '2026-10-20T00:00:00Z', payload: { event_id: 'evt', title: '共读' }, initiator: { id: 'host', nickname: '禾舟' } });
  assert.equal(note.key, 'REGISTRATION_REQUESTED');
  assert.equal(note.category, 'ADMIN');
  assert.equal(note.status, 'UNREAD');
  assert.equal(note.target.route, 'attendees');
  assert.match(note.description, /「共读」/);
  assert.equal(note.actor.display_name, '禾舟');
});

test('the follow feed rollup uses the headline key', () => {
  const item = map.feedItem({ type: 'registration_rollup', id: 'attendance-evt', count: 2, created_at: '2026-10-20T00:00:00Z', actors: [{ id: 'a', nickname: '甲' }], event: { id: 'evt', title: '共读', status: 'published', start_time: '2026-11-01T10:00:00.000Z', end_time: '2026-11-01T12:00:00.000Z' } });
  assert.equal(item.key, 'REGISTRATION_ROLLUP');
  assert.equal(item.event.status, 'PUBLISHED');
  assert.equal(item.actors[0].display_name, '甲');
});

test('public event lists do not send the bearer token', () => {
  assert.equal(map.sendAuth('calendar', { city: 'shanghai' }, true), false);
  assert.equal(map.sendAuth('events', { city: 'shanghai' }, true), false);
  assert.equal(map.sendAuth('events', { owner_id: 'me' }, true), true);
  assert.equal(map.sendAuth('event', { id: 'evt' }, true), true);
  assert.equal(map.sendAuth('campaigns', {}, true), false);
  assert.equal(map.sendAuth('me', {}, false), false);
});

test('calendar dates use the Shanghai day of an exclusive end', () => {
  const window = map.dateWindow('2026-10-19T16:00:00.000Z', '2026-10-26T16:00:00.000Z');
  assert.equal(window.start_date, '2026-10-20');
  assert.equal(window.end_date, '2026-10-26');
  assert.equal(window.timezone, 'Asia/Shanghai');
});

test('reports follow the page that opened the sheet', () => {
  assert.equal(map.reportType('pages/member/index'), 'User');
  assert.equal(map.reportType('pages/space/index'), 'Group');
  assert.equal(map.reportType('pages/event/index'), 'Event');
});

test('server errors map onto the words the screens already translate', () => {
  assert.equal(map.knownCode(422, 'refund required before cancel'), 'REFUND_POLICY_REQUIRED');
  assert.equal(map.knownCode(404, 'Not found'), 'NOT_FOUND');
  assert.equal(map.knownCode(404, 'wechat pay is not configured'), 'WECHAT_PAY_CONFIGURATION_REQUIRED');
  assert.equal(map.knownCode(401, 'Unauthorized'), 'LOGIN_REQUIRED');
  assert.equal(map.knownCode(422, 'user is not a participant of this event'), 'NOT_FOUND');
});

test('event gallery survives the soon content round trip without losing prose or signed URLs', () => {
  const description = '第一段\n\n![作者原有图片](https://example.org/original.jpg)\n保留正文';
  const media = [{ type: 'image', url: 'https://example.org/a.jpg?key=a%2Fb&x=1' }, { type: 'image', url: 'https://example.org/b(2).jpg' }, { type: 'link', url: 'https://example.org/info' }];
  const content = map.encodeEventContent({ description, media });
  const event = map.eventCard({ id: 'gallery', content, image_url: media[0].url });
  assert.equal(event.description, description);
  assert.deepEqual(event.media.map(x => [x.type, x.url]), media.map(x => [x.type, x.url]));
  assert.equal(map.eventCard({ image_url: 'https://example.org/old.jpg' }).media[0].url, 'https://example.org/old.jpg');
  assert.deepEqual(map.eventCard({}).media, []);
  assert.equal(map.eventContent('normal <!-- comment -->').description, 'normal <!-- comment -->');
  assert.equal(map.encodeEventContent({ description: 'text', media: [] }), 'text');
});
