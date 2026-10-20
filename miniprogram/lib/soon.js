// Screen operations over soon /api/v1. Pages still call read/write; this file
// translates them. Public event lists omit the bearer token so a signed-in
// person still sees the city, not only their own groups.
const config = require('../config');
const map = require('./soon-map');
const SESSION = '706.session';

function session() {
  const saved = wx.getStorageSync(SESSION);
  return saved && saved.token ? saved : null;
}
function setSession(user) {
  if (!user || !user.id) { wx.removeStorageSync(SESSION); return; }
  const prev = wx.getStorageSync(SESSION) || {};
  wx.setStorageSync(SESSION, { id: user.id, token: user.token || prev.token || '', email: user.email || '', name: user.name || '' });
}
function logout() { wx.removeStorageSync(SESSION); clearFollowedIds(); return Promise.resolve(); }
function fail(code) { throw Object.assign(new Error(code), { code }); }
function httpError(status, body) {
  const serverMessage = body && (body.error || body.message) || '';
  const known = map.knownCode(status, serverMessage);
  return Object.assign(new Error(known || serverMessage || 'SERVER'), { code: known || '', status, serverMessage });
}
function queryString(query) {
  const parts = [];
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value == null || value === '') return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach(item => parts.push(encodeURIComponent(Array.isArray(value) ? key + '[]' : key) + '=' + encodeURIComponent(item)));
  });
  return parts.length ? '?' + parts.join('&') : '';
}
function dropSession() {
  wx.removeStorageSync(SESSION);
  clearFollowedIds();
}
function rejectedLogin() {
  return Object.assign(new Error('LOGIN_REQUIRED'), { code: 'LOGIN_REQUIRED', status: 401 });
}
function request({ method = 'GET', path, query, body, auth = true } = {}) {
  const token = auth ? session()?.token : '';
  if (auth && !token) return Promise.reject(rejectedLogin());
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.apiURI + '/api/v1' + path + queryString(query),
      method,
      data: method === 'GET' ? undefined : body,
      timeout: 20000,
      header: { 'content-type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      success(res) {
        if (res.statusCode === 401 && token) dropSession();
        if (res.statusCode === 204) return resolve(null);
        const data = res.data;
        if (res.statusCode >= 400) return reject(httpError(res.statusCode, data));
        resolve(typeof data === 'string' ? JSON.parse(data) : data);
      },
      fail(error) { reject(Object.assign(new Error(/domain|域名/i.test(error?.errMsg || '') ? 'DOMAIN_NOT_ALLOWED' : 'NETWORK'), { code: /domain|域名/i.test(error?.errMsg || '') ? 'DOMAIN_NOT_ALLOWED' : 'NETWORK' })); }
    });
  });
}
async function collect(path, query, auth) {
  const rows = [];
  let page = 1;
  for (let i = 0; i < 8; i++) {
    const body = await request({ path, query: { ...query, page, limit: query?.limit || 50 }, auth });
    rows.push(...(body?.data || []));
    if (!body?.meta?.next_page) break;
    page = body.meta.next_page;
  }
  return rows;
}
function splitId(id) {
  const text = String(id || '');
  const index = text.indexOf('~');
  return index < 0 ? { parentId: '', id: text } : { parentId: text.slice(0, index), id: text.slice(index + 1) };
}
function myId() {
  const id = session()?.id;
  if (!id) fail('LOGIN_REQUIRED');
  return id;
}
async function membershipsOf(userId) {
  const body = await request({ path: '/users/' + userId + '/groups' });
  return Array.isArray(body) ? body : (body?.data || []);
}
async function managedGroups() {
  const rows = await membershipsOf(myId());
  return rows.filter(row => row.active !== false && ['manager', 'owner'].includes(row.role));
}
async function personalGroup() {
  const id = myId();
  const slug = 'p-' + id;
  try { return await request({ path: '/groups/' + slug }); }
  catch (error) { if (error.status !== 404 && error.code !== 'NOT_FOUND') throw error; }
  const me = await request({ path: '/users/me' });
  return request({ method: 'POST', path: '/groups', body: { group: { name: slug, nickname: me.nickname || '个人', city: me.city || null, group_tags: ['personal'], can_publish_event: 'manager', timezone: 'Asia/Shanghai' } } });
}
async function ensurePlace(groupId, { name, address, city, spaceId }) {
  if (!name || !address) return null;
  const placeName = [groupId, spaceId || name, address].filter(Boolean).join(' · ').slice(0, 180);
  const place = await request({ method: 'POST', path: '/places', body: { place: { name: placeName, address, data: { city: city || '', space_group_id: spaceId || '' } } } });
  return place.address === address ? place.id : null;
}
function eventBody(form, groupId, placeId) {
  return {
    event: {
      title: form.title, content: form.description || '', notes: form.summary || '', image_url: form.cover_url || '',
      start_time: form.starts_at, end_time: form.ends_at, timezone: 'Asia/Shanghai', city: form.city || '',
      status: 'draft', visibility: 'normal', group_id: groupId, place_id: placeId, max_participant: form.capacity,
      require_approval: !!form.approval_required, tags: form.tags || []
    }
  };
}
async function saveTicket(eventId, price, capacity) {
  const detail = await request({ path: '/events/' + eventId, query: { include_participants: false } });
  const existing = (detail.tickets || []).find(ticket => ticket.status !== 'inactive' && (ticket.payment_methods || []).some(method => method.chain === 'wechat' && method.kind === 'fiat'));
  if (!(price > 0)) {
    if (existing) await request({ method: 'DELETE', path: '/events/' + eventId + '/tickets/' + existing.id });
    return detail;
  }
  const method = (existing?.payment_methods || []).find(item => item.chain === 'wechat' && item.kind === 'fiat');
  if (existing && Number(method?.price) === Number(price)) return detail;
  const payment = { chain: 'wechat', kind: 'fiat', price, currency: 'cny', ...(method ? { id: method.id } : {}) };
  const ticket = { quantity: capacity || existing?.quantity || 100000, payment_methods_attributes: [payment] };
  if (existing) await request({ method: 'PATCH', path: '/events/' + eventId + '/tickets/' + existing.id, body: { ticket } });
  else await request({ method: 'POST', path: '/events/' + eventId + '/tickets', body: { ticket: { title: '报名', ticket_type: 'event', status: 'normal', ...ticket } } });
  return detail;
}
let followedCache = null;
function clearFollowedIds() { followedCache = null; }
async function followedIds() {
  const token = session()?.token;
  if (!token) return new Set();
  const now = Date.now();
  if (followedCache?.token === token && followedCache.ids && now - followedCache.at < 20000) return followedCache.ids;
  if (followedCache?.token === token && followedCache.promise) return followedCache.promise;
  const promise = collect('/follows', { limit: 50 }, true).then(rows => {
    const ids = new Set(rows.map(row => row.target_id));
    followedCache = { token, at: Date.now(), ids };
    return ids;
  }).catch(error => {
    if (followedCache?.promise === promise) followedCache = null;
    if (error.status === 401 || error.code === 'LOGIN_REQUIRED') return new Set();
    throw error;
  });
  followedCache = { token, promise };
  return promise;
}

async function read(op, params = {}) {
  if (op === 'config') return map.config();
  if (op === 'me' && params.light) {
    if (!session()) fail('LOGIN_REQUIRED');
    return { profile: map.person(await request({ path: '/users/me' })) };
  }
  const auth = map.sendAuth(op, params, !!session());
  if (op === 'events' || op === 'calendar') {
    const window = params.from && params.to ? map.dateWindow(params.from, params.to) : {};
    const rows = await collect('/events', { city: params.city, collection: op === 'events' ? 'upcoming' : undefined, group_id: params.space_id || params.group_id, owner_id: params.owner_id, attendee_id: params.attendee_id, tags: params.tag ? [params.tag] : undefined, ...window, limit: 50 }, auth);
    const items = map.applyEventFilters(rows.map(row => map.eventCard(row)), params);
    if (op === 'calendar') return { items, total: items.length, generated_at: new Date().toISOString() };
    // The series picker reads this once and does not walk a cursor.
    return { items, total: items.length, has_more: false, next_cursor: null };
  }
  if (op === 'event') return eventDetail(params.id);
  if (op === 'campaigns') {
    const body = await request({ path: '/campaigns', query: { page: params.cursor || 1, limit: 30, owner_id: params.owner_id, group_id: params.organization_id }, auth });
    return map.pageResult(body, map.campaignCard);
  }
  if (op === 'campaign') {
    const campaign = map.campaignCard(await request({ path: '/campaigns/' + params.id, auth: !!session() }));
    const events = [];
    for (const id of campaign.event_ids) {
      try {
        const raw = await request({ path: '/events/' + id, query: { include_participants: false }, auth: !!session() });
        events.push(map.eventCard(raw));
      } catch { events.push({ id, unavailable: true }); }
    }
    const cities = [...new Set(events.map(event => event.city).filter(Boolean))];
    return { ...campaign, can_edit: campaign.owner === session()?.id, items: events, cities };
  }
  if (op === 'entities') {
    const kind = params.kind === 'SPACE' ? 'space' : params.kind === 'ORGANIZATION' ? 'organization' : '';
    const body = await request({ path: '/groups/directory', query: { page: params.cursor || 1, limit: 30, city: params.city, group_tags: kind ? [kind] : undefined, exclude_tags: ['personal'] }, auth: !!session() });
    return map.pageResult(body, map.entity);
  }
  if (op === 'entity') return entityDetail(params.id);
  if (op === 'member') return memberDetail(params.id);
  if (op === 'people') return people(params);
  if (op === 'search') return search(params);
  if (op === 'feed') return feed(params);
  if (op === 'comments') {
    const body = await request({ path: '/comments', query: { item_type: 'Event', item_id: params.id, comment_type: 'comment', page: params.cursor || 1, limit: 30 }, auth: !!session() });
    return map.pageResult(body, map.comment);
  }
  if (op === 'calendarShare') fail('NOT_FOUND');
  if (!session()) fail('LOGIN_REQUIRED');
  if (op === 'me') return me();
  if (op === 'selfContact') { const user = await request({ path: '/users/me' }); return { wechat: user.contact?.wechat || '' }; }
  if (op === 'registrationContact') return { wechat: '' };
  if (op === 'notifications') return notifications(params);
  if (op === 'relations') return relations(params);
  if (op === 'mine') return mine(params);
  if (op === 'draft') return draft(params);
  if (op === 'managed') { const groups = await Promise.all((await managedGroups()).map(row => request({ path: '/groups/' + row.group.id }))); return { items: groups.filter(group => !(group.group_tags || []).includes('personal')).map(map.entity) }; }
  if (op === 'reviews') return reviews(params);
  if (op === 'review') return review(params.id);
  if (op === 'progress') return progress(params.id);
  if (op === 'registration') return registration(params.id);
  if (op === 'attendees') return attendees(params.id);
  if (op === 'admins') return admins(params.id);
  if (op === 'invitations') return invitations();
  fail('UNKNOWN_OPERATION');
}

async function eventDetail(id) {
  const raw = await request({ path: '/events/' + id, query: { include_participants: false }, auth: !!session() });
  const [comments, recommendations, roster, hosted] = await Promise.all([
    request({ path: '/comments', query: { item_type: 'Event', item_id: id, comment_type: 'comment', limit: 100 }, auth: !!session() }).catch(() => ({ data: [] })),
    request({ path: '/comments', query: { item_type: 'Event', item_id: id, comment_type: 'recommendation', limit: 100 }, auth: !!session() }).catch(() => ({ data: [] })),
    request({ path: '/events/' + id + '/participants', query: { limit: 8 }, auth: !!session() }).catch(() => ({ data: [] })),
    raw.owner?.id ? request({ path: '/events', query: { owner_id: raw.owner.id, limit: 1 }, auth: false }).catch(() => ({ meta: { total: 0 } })) : { meta: { total: 0 } }
  ]);
  const campaigns = session() || true ? await request({ path: '/campaigns', query: { limit: 50 }, auth: false }).catch(() => ({ data: [] })) : { data: [] };
  const me = session();
  const mine = me?.id;
  const recommendedIds = new Set((recommendations.data || []).map(row => row.user?.id));
  const attendingIds = new Set((roster.data || []).map(row => row.user?.id));
  const managed = session() ? new Set((await managedGroups().catch(() => [])).map(row => row.group.id)) : new Set();
  const editorRoles = ['co_host', 'speaker', 'group_host', 'custom_host'];
  const cohost = !!(mine && (raw.event_roles || []).some(role => editorRoles.includes(role.role) && (role.item_id === mine || (role.email && me.email && role.email === me.email))));
  const card = map.eventCard(raw, {
    can_edit: !!(raw.is_owner || managed.has(raw.group?.id)),
    recommended: recommendedIds.has(mine),
    comments: (comments.data || []).map(row => map.comment(row, recommendedIds.has(row.user?.id) ? '已推荐' : attendingIds.has(row.user?.id) ? '已报名' : '')),
    campaigns: (campaigns.data || []).filter(item => (item.event_ids || []).includes(id)).map(map.campaignCard),
    host_recent_count: hosted.meta?.total || 0
  });
  card.participants = (roster.data || []).slice(0, 5).map(row => map.person(row.user)).filter(Boolean);
  card.can_check_in = !!(raw.is_owner || managed.has(raw.group?.id) || cohost);
  return card;
}
async function entityDetail(id) {
  const group = await request({ path: '/groups/' + id, auth: !!session() });
  const record = map.entity(group);
  const events = (await collect('/events', { group_id: id, limit: 50 }, false)).map(row => map.eventCard(row));
  const members = (group.memberships || []).map(row => map.person(row.user)).filter(Boolean);
  const followed = await followedIds();
  const managed = session() ? await managedGroups().catch(() => []) : [];
  const mine = managed.find(row => row.group?.id === id);
  return { ...record, items: events, members, following: followed.has(id), can_manage: !!mine, can_admin: mine?.role === 'owner' };
}
async function memberDetail(id) {
  const user = await request({ path: '/users/' + id, auth: !!session() });
  if (['MEMBERS', 'PRIVATE'].includes(user.visibility) && user.id !== session()?.id) fail('NOT_FOUND');
  const profile = map.person(user);
  const hosted = (await collect('/events', { owner_id: id, limit: 50 }, false)).map(row => map.eventCard(row));
  const attended = profile.share_activity ? (await collect('/events', { attendee_id: id, limit: 50 }, false)).map(row => map.eventCard(row)) : [];
  const items = [...new Map([...hosted, ...attended].map(event => [event.id, event])).values()];
  const spaces = [];
  for (const spaceId of profile.frequent_spaces) {
    try { spaces.push(map.entity(await request({ path: '/groups/' + spaceId, auth: false }))); } catch { /* a removed space drops out of the profile */ }
  }
  const block = await blockOf(id);
  return { ...profile, following: (await followedIds()).has(id), frequent_entities: spaces, activity_count: profile.share_activity ? items.length : hosted.length, items, muted: !!block, block_id: block?.id || '' };
}
async function blockOf(userId) {
  if (!session() || !userId || userId === session().id) return null;
  const rows = await collect('/blocks', { limit: 50 }, true).catch(() => []);
  return rows.find(row => row.target_user_id === userId) || null;
}
async function mute(params) {
  await request({ method: 'POST', path: '/blocks', body: { target_user_id: params.id } });
  return { ok: true };
}
async function unmute(params) {
  const id = params.block_id || (await blockOf(params.id))?.id;
  if (!id) return { ok: true };
  await request({ method: 'DELETE', path: '/blocks/' + id });
  return { ok: true };
}
async function people(params) {
  const [body, followed] = await Promise.all([
    request({ path: '/users/suggestions', query: { city: params.city, exclude: params.exclude || [], page: params.cursor || 1, limit: 8 }, auth: !!session() }),
    followedIds()
  ]);
  return map.pageResult(body, user => ({ ...map.person(user), reason: 'SAME_CITY', following: followed.has(user.id) }));
}
async function search(params) {
  const body = await request({ path: '/search', query: { keyword: params.q || '' }, auth: false });
  const events = (body.events || []).map(row => ({ ...map.eventCard(row), route: 'event' }));
  const groups = (body.groups || []).map(row => { const item = map.entity(row); return { ...item, route: (row.group_tags || []).includes('space') ? 'space' : 'org' }; });
  const users = (body.users || []).map(row => ({ ...map.person(row), route: 'member' }));
  const items = [...events, ...groups, ...users];
  if (params.city) items.sort((a, b) => Number((b.city || '') === params.city) - Number((a.city || '') === params.city));
  return { items };
}
async function feed(params) {
  if (!session()) return map.cursorPage([], params);
  try {
    const body = await request({ path: '/follows/feed', query: { city: params.city, page: params.cursor || 1, limit: 30 } });
    return map.pageResult(body, map.feedItem);
  } catch (error) {
    if (error.status === 401 || error.code === 'LOGIN_REQUIRED') return map.cursorPage([], params);
    throw error;
  }
}
async function me() {
  const user = await request({ path: '/users/me' });
  const profile = map.person(user);
  const roles = (await membershipsOf(user.id)).filter(row => row.active !== false && ['manager', 'owner'].includes(row.role)).map(row => ({ id: row.group.id + '~' + row.id, scope: 'ENTITY', role: row.role === 'owner' ? 'OWNER' : 'ADMIN', parent: row.group.id, status: 'ACTIVE' }));
  if (user.admin) roles.push({ scope: 'PLATFORM', role: 'OWNER', status: 'ACTIVE' });
  const campaigns = await request({ path: '/campaigns', query: { owner_id: user.id, limit: 1 } });
  if ((campaigns.meta?.total || 0) > 0 && !roles.length) roles.push({ scope: 'ENTITY', role: 'ADMIN', parent: '', status: 'ACTIVE' });
  const notes = await request({ path: '/activities', query: { limit: 100 } });
  return { profile, roles, following: profile.following_count, followers: profile.followers_count, unread: (notes.data || []).filter(row => !row.has_read).length };
}
async function notifications(params) {
  const rows = (await collect('/activities', { limit: 50 }, true)).map(map.notification).filter(row => !params.category || row.category === params.category);
  return map.cursorPage(rows, params);
}
async function relations(params) {
  const target = params.id || myId();
  const followers = params.mode === 'followers';
  const query = followers
    ? { direction: 'followers', target_type: 'User', target_id: target, include: 'profiles', limit: params.shelf ? 30 : 50 }
    : { user_id: target, include: 'profiles', limit: params.shelf ? 30 : 50 };
  let rows;
  try {
    rows = params.shelf
      ? ((await request({ path: '/follows', query: { ...query, page: 1 } })).data || [])
      : await collect('/follows', query, true);
  } catch (error) {
    if (params.shelf && (error.status === 401 || error.code === 'LOGIN_REQUIRED')) return { items: [], total: 0, has_more: false, next_cursor: null };
    throw error;
  }
  const followed = params.shelf && !followers ? null : await followedIds();
  const items = rows.map(row => {
    const following = id => (followed ? followed.has(id) : true);
    if (followers || row.target_type === 'User' && params.mode !== 'following') {
      const profile = map.person(followers ? row.user : row.target);
      return profile ? { ...profile, id: profile.owner, route: 'member', following: following(profile.owner) } : null;
    }
    if (row.target_type === 'Group') { const item = map.entity(row.target || { id: row.target_id }); return { ...item, route: item.kind === 'SPACE' ? 'space' : 'org', following: following(item.id) }; }
    const profile = map.person(row.target);
    return profile ? { ...profile, id: profile.owner, route: 'member', following: following(profile.owner) } : null;
  }).filter(Boolean);
  if (params.shelf) return { items, total: items.length, has_more: false, next_cursor: null };
  return map.cursorPage(items, params);
}
async function mine(params) {
  const id = myId();
  let items;
  if (params.kind === 'registration') {
    items = (await collect('/registrations', { limit: 50 }, true)).map(row => { const registration = map.registrationFrom(row.participant, row.event); registration.pending_ticket_item_id = row.pending_ticket_item_id || null; return registration; });
  } else if (params.kind === 'campaign') items = (await collect('/campaigns', { owner_id: id, limit: 50 }, true)).map(map.campaignCard);
  else items = (await collect('/events', { owner_id: id, limit: 50 }, true)).map(row => map.eventCard(row));
  if (params.status) items = items.filter(item => item.status === params.status);
  if (params.phase) items = items.filter(item => require('./mine-phase')(item) === params.phase);
  return map.cursorPage(items, params);
}
async function draft(params) {
  if (params.kind === 'campaign') return map.campaignCard(await request({ path: '/campaigns/' + params.id }));
  return eventDetail(params.id);
}
async function reviews(params) {
  const [campaignTasks, events] = await Promise.all([
    request({ path: '/reviews', query: { status: 'pending', page: params.cursor || 1, limit: 30 } }),
    request({ path: '/events/pending_approval', query: { limit: 30 } }).catch(() => ({ data: [] }))
  ]);
  const items = [...(campaignTasks.data || []).map(map.reviewTask), ...(events.data || []).map(event => map.eventReview(map.eventCard(event)))];
  return { items, total: items.length, has_more: !!campaignTasks.meta?.next_page, next_cursor: campaignTasks.meta?.next_page ? String(campaignTasks.meta.next_page) : null };
}
async function review(id) {
  if (String(id).startsWith('event-')) return map.eventReview(await eventDetail(id.slice(6)));
  const rows = await collect('/reviews', { limit: 50 }, true);
  const found = rows.find(row => row.id === id);
  if (!found) fail('NOT_FOUND');
  const campaign = map.campaignCard(await request({ path: '/campaigns/' + found.campaign_id }));
  const same = rows.filter(row => row.campaign_id === found.campaign_id && row.round === found.round).map(map.reviewTask);
  return { ...map.reviewTask(found), subject: campaign, reviews: same };
}
async function progress(id) {
  try {
    const campaign = map.campaignCard(await request({ path: '/campaigns/' + id }));
    const items = (await collect('/reviews', { limit: 50 }, true)).filter(row => row.campaign_id === id).map(map.reviewTask);
    return { subject: campaign, items };
  } catch (error) {
    if (error.status !== 404 && error.code !== 'NOT_FOUND') throw error;
  }
  const event = await eventDetail(id);
  const task = map.eventReview(event);
  return { subject: event, items: task.reviews };
}
async function registration(id) {
  const body = await request({ path: '/registrations/' + id });
  const record = map.registrationFrom(body.participant, body.event);
  record.pending_ticket_item_id = body.pending_ticket_item_id || null;
  record.event = { ...record.event, image_note: body.event?.image_note || '' };
  return record;
}
async function attendees(eventId) {
  const lists = await Promise.all(['', 'pending', 'declined'].map(status => collect('/events/' + eventId + '/participants', status ? { status, limit: 50 } : { limit: 50 }, true).catch(() => [])));
  const seen = new Set();
  const items = lists.flat().filter(row => seen.has(row.id) ? false : seen.add(row.id)).map(row => ({
    id: eventId + '~' + row.id,
    user_id: row.user?.id || '',
    status: map.registrationStatus(row),
    display_name: row.user?.nickname || row.user?.name || '',
    motivation: row.message || '',
    version: 1,
    can_read_contact: false,
    checked_in_at: row.checked_in_at || null
  }));
  return { items };
}
async function admins(groupId) {
  const group = await request({ path: '/groups/' + groupId });
  return { items: (group.memberships || []).filter(row => ['owner', 'manager'].includes(row.role)).map(row => ({ id: groupId + '~' + row.id, parent: groupId, role: row.role === 'owner' ? 'OWNER' : 'ADMIN', status: row.active === false ? 'REVOKED' : 'ACTIVE', owner: row.user?.id })) };
}
async function invitations() {
  const body = await request({ path: '/group_invites/pending' });
  const rows = Array.isArray(body) ? body : (body?.data || []);
  return { items: rows.map(row => ({ id: row.group.id + '~' + row.id, parent: row.group.id, status: 'PENDING', role: 'ADMIN', owner: session()?.id })) };
}

async function write(op, params = {}) {
  if (!session()) fail('LOGIN_REQUIRED');
  if (op === 'profile') return saveProfile(params);
  if (op === 'follow') return follow(params);
  if (op === 'mute') return params.enabled === false ? unmute(params) : mute(params);
  if (op === 'report') return report(params);
  if (op === 'recommend') return recommend(params);
  if (op === 'comment') return addComment(params);
  if (op === 'deleteComment') { await request({ method: 'POST', path: '/comments/' + params.id + '/remove' }); return { ok: true }; }
  if (op === 'read') return markRead(params.id);
  if (op === 'saveEvent') return saveEvent(params);
  if (op === 'saveCampaign') return saveCampaign(params);
  if (op === 'clone') return cloneEvent(params.id);
  if (op === 'submitEvent') return submitEvent(params.id);
  if (op === 'submitCampaign') return map.campaignCard(await request({ method: 'POST', path: '/campaigns/' + params.id + '/submit' }));
  if (op === 'review') return decideReview(params);
  if (op === 'register') return register(params);
  if (op === 'registrationDecision') return registrationDecision(params);
  if (op === 'checkIn') return checkIn(params);
  if (op === 'cancelRegistration') return cancelRegistration(params.id);
  if (op === 'registrationContact') return { wechat: '' };
  if (op === 'access') return access(params.id);
  if (op === 'cancelEvent') { await request({ method: 'DELETE', path: '/events/' + params.id }); return { ok: true }; }
  if (op === 'entity') return saveEntity(params);
  if (op === 'createSpace') return createSpace(params);
  if (op === 'invite') return invite(params);
  if (op === 'acceptInvite') return acceptInvite(params.id);
  if (op === 'revokeRole') return revokeRole(params.id);
  fail('UNKNOWN_OPERATION');
}

async function saveProfile(params) {
  if (params.complete && !params.privacy_consent) fail('CONSENT_REQUIRED');
  if (params.display_name !== undefined && !String(params.display_name).trim()) fail('NAME_REQUIRED');
  if (params.interests && (!Array.isArray(params.interests) || params.interests.length < 2 || params.interests.length > 5)) fail('INTERESTS_INVALID');
  const data = {};
  ['city', 'introduction', 'share_activity', 'visibility', 'locale', 'interests'].forEach(key => { if (params[key] !== undefined) data[key] = params[key]; });
  if (params.public_links) data.public_links = params.public_links;
  if (params.frequent_spaces) data.frequent_space_ids = params.frequent_spaces;
  if (params.notification_preferences) data.notification_preferences = params.notification_preferences;
  if (params.wechat !== undefined) data.contact = { wechat: params.wechat };
  if (params.complete) data.onboarded = true;
  const user = { data };
  if (params.display_name !== undefined) user.nickname = params.display_name;
  if (params.bio !== undefined) user.bio = params.bio;
  if (params.avatar_url !== undefined) user.image_url = params.avatar_url;
  const saved = map.person(await request({ method: 'PATCH', path: '/users/me', body: { user } }));
  for (const id of params.follow_spaces || []) await follow({ id, enabled: true }).catch(() => {});
  return { ...saved, wechat: params.wechat !== undefined ? params.wechat : saved.wechat };
}
async function follow(params) {
  clearFollowedIds();
  if (params.id === session()?.id) fail('CANNOT_FOLLOW_SELF');
  const rows = await collect('/follows', { limit: 50 }, true);
  const existing = rows.find(row => row.target_id === params.id);
  if (!params.enabled) {
    if (existing) await request({ method: 'DELETE', path: '/follows/' + existing.id });
    return { ok: true };
  }
  if (existing?.status === 'active') return existing;
  try { return await request({ method: 'POST', path: '/follows', body: { target_type: 'User', target_id: params.id } }); }
  catch (error) {
    if (error.status !== 422) throw error;
    return request({ method: 'POST', path: '/follows', body: { target_type: 'Group', target_id: params.id } });
  }
}
function report(params) {
  let route = '';
  try { const pages = getCurrentPages(); route = pages[pages.length - 1]?.route || ''; } catch { route = ''; }
  const target_type = map.reportType(route);
  if (!String(params.reason || '').trim()) fail('REASON_REQUIRED');
  return request({ method: 'POST', path: '/reports', body: { report: { target_type, target_id: params.id, reason: params.reason } } });
}
async function recommend(params) {
  const rows = await request({ path: '/comments', query: { item_type: 'Event', item_id: params.id, comment_type: 'recommendation', user_id: myId(), limit: 20 } });
  if (params.enabled === false) {
    for (const row of rows.data || []) await request({ method: 'POST', path: '/comments/' + row.id + '/remove' });
    return { ok: true };
  }
  if (!String(params.text || '').trim()) fail('TEXT_REQUIRED');
  return request({ method: 'POST', path: '/comments', body: { comment: { item_type: 'Event', item_id: params.id, comment_type: 'recommendation', content: params.text } } });
}
function addComment(params) {
  if (!String(params.text || '').trim()) fail('TEXT_REQUIRED');
  const comment = { item_type: 'Event', item_id: params.id, comment_type: 'comment', content: params.text };
  if (params.reply_to) comment.reply_parent_id = params.reply_to;
  return request({ method: 'POST', path: '/comments', body: { comment } });
}
async function markRead(id) {
  const ids = id ? [id] : (await request({ path: '/activities', query: { limit: 100 } })).data.filter(row => !row.has_read).map(row => row.id);
  if (ids.length) await request({ method: 'POST', path: '/activities/mark_read', body: { ids } });
  return { ok: true };
}
async function saveEvent(params) {
  const groupId = params.organization_id || params.space_id || (await personalGroup()).id;
  let placeId = null;
  if (!params.space_id && params.venue_name && params.address) placeId = await ensurePlace(groupId, { name: params.venue_name, address: params.address, city: params.city });
  if (params.space_id && params.space_id !== groupId) {
    const space = await request({ path: '/groups/' + params.space_id }).catch(() => null);
    if (space) placeId = await ensurePlace(groupId, { name: space.nickname || space.name, address: space.address || params.address || space.nickname || space.name, city: params.city || space.city, spaceId: space.id });
  }
  const body = eventBody(params, groupId, placeId);
  const fields = { ...body.event };
  delete fields.group_id;
  const saved = params.id
    ? await request({ method: 'PATCH', path: '/events/' + params.id, body: { event: fields } })
    : await request({ method: 'POST', path: '/events', body });
  if (params.price_minor > 0) await saveTicket(saved.id, params.price_minor, params.capacity);
  return eventDetail(saved.id);
}
async function saveCampaign(params) {
  const body = { campaign: { title: params.title || '', kicker: params.kicker || '', introduction: params.introduction || '', featured_image_url: params.cover_url || '', group_id: params.organization_id || null, event_ids: params.event_ids || [], resource_links: params.resource_links || [] } };
  const saved = params.id ? await request({ method: 'PATCH', path: '/campaigns/' + params.id, body }) : await request({ method: 'POST', path: '/campaigns', body });
  return map.campaignCard(saved);
}
async function cloneEvent(id) {
  const event = await request({ path: '/events/' + id, query: { include_participants: false } });
  const group = await personalGroup();
  const saved = await request({ method: 'POST', path: '/events', body: { event: { title: event.title, content: event.content || '', notes: event.notes || '', image_url: event.image_url || '', city: event.city, timezone: 'Asia/Shanghai', visibility: 'normal', status: 'draft', group_id: group.id, tags: event.tags || [] } } });
  return eventDetail(saved.id);
}
async function submitEvent(id) {
  const saved = await request({ method: 'PATCH', path: '/events/' + id, body: { event: { status: 'published' } } });
  return eventDetail(saved.id || id);
}
async function decideReview(params) {
  const approve = params.approve === true || params.approve === 'true';
  if (String(params.id).startsWith('event-')) {
    if (!approve) fail('STATUS_CONFLICT');
    await request({ method: 'POST', path: '/events/' + params.id.slice(6) + '/approve' });
    return { ok: true };
  }
  await request({ method: 'POST', path: '/reviews/' + params.id + '/decide', body: { decision: approve ? 'approved' : 'changes_requested', note: params.note || '' } });
  return { ok: true };
}
async function register(params) {
  if (!params.privacy_consent || !params.display_name) fail('CONSENT_REQUIRED');
  const event = await request({ path: '/events/' + params.id, query: { include_participants: false } });
  const endAt = Date.parse(event.end_time);
  const ended = Number.isFinite(endAt) && endAt <= Date.now();
  if (event.status !== 'published') fail('REGISTRATION_CLOSED');
  if (ended) {
    const managed = await managedGroups().catch(() => []);
    if (!(event.is_owner || managed.some(row => row.group?.id === event.group?.id))) fail('REGISTRATION_CLOSED');
  }
  const current = event.current_participant;
  if (current && !['cancelled', 'declined'].includes(current.status)) return map.registrationFrom(current, event);
  const price = map.priceMinor(event);
  if (price > 0 || event.has_non_wechat_price) {
    const ticket = (event.tickets || []).find(item => (item.payment_methods || []).some(method => method.chain === 'wechat' && method.kind === 'fiat')) || (event.tickets || [])[0];
    if (!ticket) fail('WECHAT_PAY_CONFIGURATION_REQUIRED');
    const paid = await request({ method: 'POST', path: '/events/' + params.id + '/tickets/' + ticket.id + '/rsvp', body: { message: params.motivation || '' } });
    return map.registrationFrom(paid.participant, event, paid.ticket_item);
  }
  const participant = await request({ method: 'POST', path: '/events/' + params.id + '/participants', body: { participant: { message: params.motivation || '' } } });
  return map.registrationFrom(participant, event);
}
async function registrationDecision(params) {
  const { parentId, id } = splitId(params.id);
  const approve = params.approve === true || params.approve === 'true';
  const participant = await request({ method: 'POST', path: '/events/' + parentId + '/participants/' + id + '/' + (approve ? 'approve' : 'reject') });
  return map.registrationFrom(participant, { id: parentId });
}
async function checkIn(params) {
  const { parentId } = splitId(params.id);
  if (!params.user_id || !parentId) fail('NOT_FOUND');
  return request({ method: 'POST', path: '/events/' + parentId + '/participants/check_in', body: { user_id: params.user_id } });
}
async function cancelRegistration(id) {
  const record = await registration(id);
  if (record.status === 'CONFIRMED' && record.event?.price_minor > 0) fail('REFUND_POLICY_REQUIRED');
  await request({ method: 'DELETE', path: '/events/' + record.parent + '/participants/' + id });
  return { ok: true };
}
async function access(id) {
  const record = await registration(id);
  if (record.status !== 'CONFIRMED') fail('ACCESS_NOT_GRANTED');
  return map.accessMethods(record.event?.image_note);
}
async function saveEntity(params) {
  const group = { nickname: params.name, bio: params.introduction, city: params.city, banner_image_url: params.cover_url, image_url: params.avatar_url, data: {} };
  ['opening_hours', 'address', 'public_contact', 'public_links', 'allow_event_requests'].forEach(key => { if (params[key] !== undefined) group.data[key] = params[key]; });
  return map.entity(await request({ method: 'PATCH', path: '/groups/' + params.id, body: { group } }));
}
function spaceSlug() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let body = '';
  for (let i = 0; i < 8; i++) body += alphabet[Math.floor(Math.random() * alphabet.length)];
  return 'sp' + body;
}
async function createSpace(params) {
  const nickname = String(params.name || '').trim();
  const city = String(params.city || '').trim();
  if (!nickname) fail('NAME_REQUIRED');
  if (!city) fail('VENUE_INVALID');
  const data = {};
  ['opening_hours', 'address', 'public_contact'].forEach(key => { if (String(params[key] || '').trim()) data[key] = String(params[key]).trim(); });
  if (params.allow_event_requests !== undefined) data.allow_event_requests = !!params.allow_event_requests;
  const group = { name: spaceSlug(), nickname, city, timezone: 'Asia/Shanghai', bio: String(params.introduction || '').trim(), banner_image_url: params.cover_url || '', group_tags: ['space'], can_publish_event: 'manager', data };
  return map.entity(await request({ method: 'POST', path: '/groups', body: { group } }));
}
async function invite(params) {
  const result = await request({ method: 'POST', path: '/groups/' + params.id + '/group_invites', body: { role: 'manager', receivers: [params.user_id] } });
  const row = result.results && result.results[0];
  if (row?.result === 'error') throw Object.assign(new Error(row.message || 'NOT_FOUND'), { code: row.message === 'membership exists' ? 'STATUS_CONFLICT' : 'NOT_FOUND' });
  return { ok: true, result: row?.result };
}
async function acceptInvite(id) {
  const { parentId, id: inviteId } = splitId(id);
  await request({ method: 'POST', path: '/groups/' + parentId + '/group_invites/' + inviteId + '/accept' });
  return { ok: true };
}
async function revokeRole(id) {
  const { parentId, id: membershipId } = splitId(id);
  const group = await request({ path: '/groups/' + parentId });
  const row = (group.memberships || []).find(item => item.id === membershipId);
  if (row?.role === 'owner') fail('FORBIDDEN');
  await request({ method: 'DELETE', path: '/groups/' + parentId + '/memberships/' + membershipId });
  return { ok: true };
}

async function payment(args) {
  const record = await registration(args.id);
  if (!record.pending_ticket_item_id) fail('STATUS_CONFLICT');
  try {
    const pay = await request({ method: 'POST', path: '/tickets/wechat_prepay', body: { ticket_item_id: record.pending_ticket_item_id } });
    return pay.pay_params;
  } catch (error) {
    if (error.status === 404) fail('WECHAT_PAY_CONFIGURATION_REQUIRED');
    throw error;
  }
}
function uploadFile(path) {
  const token = session()?.token;
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: config.apiURI + '/api/v1/upload/image', filePath: path, name: 'file',
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success(res) {
        let body = res.data;
        try { if (typeof body === 'string') body = JSON.parse(body); } catch { body = { error: 'MEDIA_INVALID' }; }
        if (res.statusCode >= 400) return reject(httpError(res.statusCode, body));
        resolve({ url: body.url, id: body.url, preview_url: body.url });
      },
      fail() { reject(Object.assign(new Error('NETWORK'), { code: 'NETWORK' })); }
    });
  });
}
async function login(mode, address, code) {
  const phone = mode === 'phone';
  const path = phone ? (code ? '/auth/verify_phone_code' : '/auth/request_phone_code') : (code ? '/auth/verify_code' : '/auth/request_code');
  try {
    const body = await request({ method: 'POST', path, body: phone ? { phone: address, code } : { email: address, code }, auth: false });
    if (body?.token) setSession({ id: body.user.id, token: body.token, email: body.user.email, name: body.user.name });
  } catch (error) {
    if (phone && error.status === 404) throw Object.assign(new Error('手机号登录暂未开通，请改用邮箱验证码。'), { code: '' });
    throw error;
  }
  return { demo: false };
}
async function call(name, args = {}) {
  if (name === 'read') return read(args.op, args.params || {});
  if (name === 'write') return write(args.op, args.params || {});
  if (name === 'payment') return payment(args);
  if (name === 'wechatLogin') {
    const body = await request({ method: 'POST', path: '/auth/wechat_miniprogram', body: { js_code: args.code }, auth: false });
    const user = { id: body.user.id, token: body.token, email: body.user.email, name: body.user.name };
    setSession(user);
    return { user };
  }
  if (name === 'calendarCode') { const calendar = await read('calendar', args.params || {}); return { items: calendar.items, code: null, demo: false }; }
  if (name === 'mediaUpload') return uploadFile(args.path);
  if (name === 'mediaPreview') return { url: String(args.id || '').startsWith('http') ? args.id : '' };
  if (name === 'mediaFinish') return { url: args.path, id: args.path, preview_url: args.path };
  fail('UNKNOWN_OPERATION');
}
module.exports = { call, login, logout, close() {}, session, setSession };
