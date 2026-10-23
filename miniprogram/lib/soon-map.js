// Pure soon JSON → screen records. Pages keep reading display_name, price_minor,
// starts_at, and the PUBLISHED / CONFIRMED words they already render.
const CITIES = [
  ['shanghai', '上海', 'Shanghai'],
  ['beijing', '北京', 'Beijing'],
  ['guangzhou', '广州', 'Guangzhou'],
  ['shenzhen', '深圳', 'Shenzhen'],
  ['hangzhou', '杭州', 'Hangzhou'],
  ['chengdu', '成都', 'Chengdu']
].map(([id, zh, en]) => ({ id, zh, en, timezone: 'Asia/Shanghai' }));

const EVENT_STATUS = { draft: 'DRAFT', pending: 'IN_REVIEW', published: 'PUBLISHED', cancelled: 'CANCELLED', closed: 'CANCELLED' };
const CAMPAIGN_STATUS = { draft: 'DRAFT', in_review: 'IN_REVIEW', changes_requested: 'CHANGES_REQUESTED', published: 'PUBLISHED' };
const REVIEW_STATUS = { pending: 'PENDING', approved: 'APPROVED', changes_requested: 'CHANGES_REQUESTED', superseded: 'SUPERSEDED' };

function eventStatus(status) {
  return EVENT_STATUS[status] || String(status || '').toUpperCase();
}

function campaignStatus(status) {
  return CAMPAIGN_STATUS[status] || eventStatus(status);
}

function priceMinor(event) {
  if (!event) return 0;
  if (event.ticket_price != null) return Number(event.ticket_price);
  if (event.has_non_wechat_price) return null;
  return 0;
}

function person(user) {
  if (!user) return null;
  const id = user.owner || user.id;
  return {
    id,
    owner: id,
    display_name: user.display_name || user.nickname || user.name || '',
    avatar_url: user.avatar_url || user.image_url || '',
    bio: user.bio || '',
    introduction: user.introduction || '',
    city: user.city || '',
    interests: user.interests || [],
    public_links: user.public_links || [],
    frequent_spaces: user.frequent_spaces || user.frequent_space_ids || [],
    share_activity: !!user.share_activity,
    visibility: user.visibility || 'PUBLIC',
    following_count: user.following_count || 0,
    followers_count: user.followers_count || 0,
    onboarded: !!user.onboarded,
    locale: user.locale || '',
    notification_preferences: user.notification_preferences || {},
    wechat: user.contact?.wechat || ''
  };
}

function groupKind(group) {
  const tags = group?.group_tags || [];
  if (tags.includes('space')) return 'SPACE';
  if (tags.includes('personal')) return 'PERSONAL';
  return 'ORGANIZATION';
}

function entity(group) {
  const kind = groupKind(group);
  return {
    id: group.id,
    type: 'entity',
    kind: kind === 'SPACE' ? 'SPACE' : 'ORGANIZATION',
    name: group.nickname || group.name || '',
    introduction: group.bio || group.introduction || '',
    cover_url: group.banner_image_url || group.featured_image_url || group.cover_url || '',
    avatar_url: group.image_url || group.avatar_url || '',
    city: group.city || '',
    address: group.address || '',
    opening_hours: group.opening_hours || '',
    public_links: group.public_links || [],
    public_contact: group.public_contact || '',
    allow_event_requests: !!group.allow_event_requests,
    status: group.active === false ? 'INACTIVE' : 'ACTIVE',
    followers_count: group.followers_count || 0,
    version: 1
  };
}

function registrationStatus(participant, ticketItem) {
  const status = participant?.status;
  if (status === 'cancelled') return 'CANCELLED';
  if (status === 'declined') return 'REJECTED';
  if (status === 'pending' || status === 'maybe') return 'REQUESTED';
  const awaiting = participant?.payment_status === 'pending' || (ticketItem?.status === 'pending' && Number(ticketItem.amount) > 0);
  if (status === 'attending' && awaiting) return 'APPROVED_AWAITING_PAYMENT';
  if (status === 'attending') return 'CONFIRMED';
  return 'REQUESTED';
}

// The existing soon contract stores additional event media as Markdown in content.
const eventMediaMarker = '\n\n<!-- 706-event-media -->\n';
function eventContent(content = '') {
  const at = content.lastIndexOf(eventMediaMarker);
  if (at < 0) return { description: content, media: [] };
  const lines = content.slice(at + eventMediaMarker.length).split('\n').filter(Boolean);
  const media = lines.map(line => {
    const match = line.match(/^(!?)\[([^\]]*)\]\(<([^>]+)>\)$/);
    return match && { type: match[1] ? 'image' : 'link', label: match[2], url: match[3] };
  });
  if (!media.length || media.some(item => !item)) return { description: content, media: [] };
  return { description: content.slice(0, at), media };
}
function encodeEventContent(form) {
  const description = form.description || '';
  const media = (form.media || []).filter(item => ['image', 'link'].includes(item.type) && item.url);
  if (!media.length) return description;
  return description + eventMediaMarker + media.map((item, index) => (item.type === 'image' ? '!' : '') + '[' + (item.type === 'image' ? 'Image ' : 'Link ') + (index + 1) + '](<' + item.url.replace(/\s/g, value => encodeURIComponent(value)).replace(/>/g, '%3E').replace(/</g, '%3C') + '>)').join('\n');
}
function eventCard(event, extra = {}) {
  const content = eventContent(event.description || event.content || '');
  const group = event.group || {};
  const kind = groupKind(group);
  const place = event.place || {};
  const owner = person(event.owner);
  const price = priceMinor(event);
  const capacity = event.max_participant == null || event.max_participant === '' ? null : Number(event.max_participant);
  const registered = Number(event.participant_count) || 0;
  const status = event.starts_at ? event.status : eventStatus(event.status);
  const spaceFromPlace = place.data && place.data.space_group_id;
  const registration = extra.registration || (event.current_participant ? registrationFrom(event.current_participant, null) : null);
  const endAt = Date.parse(event.ends_at || event.end_time);
  const ended = Number.isFinite(endAt) && endAt <= Date.now();
  const staff = !!(extra.can_edit || event.is_owner);
  return {
    id: event.id,
    type: 'event',
    owner: owner?.owner || event.owner_id || '',
    title: event.title || '',
    summary: event.summary || event.notes || '',
    description: content.description,
    media: event.media?.length ? event.media : content.media.length ? content.media : (event.cover_url || event.image_url ? [{ type: 'image', url: event.cover_url || event.image_url }] : []),
    cover_url: event.cover_url || event.image_url || '',
    starts_at: event.starts_at || event.start_time,
    ends_at: event.ends_at || event.end_time,
    city: event.city || '',
    status,
    visibility: 'PUBLIC',
    space_id: spaceFromPlace || (kind === 'SPACE' ? group.id : '') || event.space_id || '',
    organization_id: kind === 'ORGANIZATION' ? group.id : (event.organization_id || ''),
    organization_name: kind === 'ORGANIZATION' ? (group.nickname || group.name || '') : (event.organization_name || ''),
    venue_name: place.name || event.venue?.name || event.venue_name || '',
    venue_display: place.name || event.venue?.name || (kind === 'SPACE' ? (group.nickname || group.name) : '') || event.venue_display || '',
    address: place.address || event.address || '',
    host_display: owner?.display_name || event.host_display || '',
    initiator: owner || event.initiator || null,
    capacity: Number.isFinite(capacity) ? capacity : null,
    price_minor: price,
    registered,
    remaining: capacity == null || !Number.isFinite(capacity) ? null : Math.max(0, capacity - registered),
    approval_required: !!(event.require_approval ?? event.approval_required),
    tags: event.tags || [],
    participants: (event.participants || []).map(row => person(row.user || row)).filter(Boolean),
    registration: registration ? { ...registration, event: undefined } : null,
    can_edit: !!(extra.can_edit || event.is_owner),
    can_manage: !!(extra.can_edit || event.is_owner),
    can_register: status === 'PUBLISHED' && (!ended || staff),
    recommended: !!extra.recommended,
    comments: extra.comments || event.comments || [],
    campaigns: extra.campaigns || [],
    host_recent_count: extra.host_recent_count || event.host_recent_count || 0,
    comment_count: extra.comments ? extra.comments.length : (event.comment_count || 0),
    image_note: event.image_note || '',
    version: 1
  };
}

function registrationFrom(participant, event, ticketItem) {
  const card = event ? eventCard(event) : null;
  return {
    id: participant.id,
    type: 'registration',
    owner: participant.user?.id || participant.user_id || '',
    parent: card?.id || event?.id || '',
    status: registrationStatus(participant, ticketItem),
    display_name: participant.user?.nickname || participant.user?.name || '',
    motivation: participant.message || '',
    payment_status: participant.payment_status || null,
    pending_ticket_item_id: ticketItem?.id || null,
    payment_expires_at: null,
    contact_share_consent: false,
    version: 1,
    event: card,
    created_at: participant.registered_at || participant.created_at
  };
}

function campaignCard(campaign) {
  return {
    id: campaign.id,
    type: 'campaign',
    owner: campaign.owner_id || campaign.owner || '',
    title: campaign.title || '',
    kicker: campaign.kicker || '',
    introduction: campaign.introduction || '',
    cover_url: campaign.featured_image_url || campaign.cover_url || '',
    organization_id: campaign.group_id || campaign.organization_id || '',
    event_ids: campaign.event_ids || [],
    resource_links: campaign.resource_links || [],
    status: campaign.starts_at ? campaign.status : campaignStatus(campaign.status),
    visibility: 'PUBLIC',
    round: campaign.round || 1,
    version: 1,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at
  };
}

function cursorPage(items, params = {}, size = 30) {
  const start = params.cursor ? Number(params.cursor) : 0;
  const safe = Number.isFinite(start) && start > 0 ? start : 0;
  const slice = items.slice(safe, safe + size);
  const next = safe + size < items.length ? String(safe + size) : null;
  return { items: slice, total: items.length, has_more: !!next, next_cursor: next };
}

function pageResult(body, mapItem = x => x) {
  const meta = body?.meta || {};
  const items = (body?.data || []).map(mapItem);
  const next = meta.next_page;
  return { items, total: meta.total ?? items.length, has_more: !!next, next_cursor: next ? String(next) : null };
}

function comment(row, badge) {
  const author = person(row.user);
  return {
    id: row.id,
    parent: row.item_id,
    text: row.content || row.text || '',
    reply_to: row.reply_parent_id || row.reply_to || null,
    status: 'ACTIVE',
    created_at: row.created_at,
    author,
    owner: author?.owner || '',
    badge: badge || ''
  };
}

function feedItem(row) {
  const event = row.event?.starts_at ? row.event : eventCard(row.event || {});
  if (row.type === 'registration_rollup' || row.type === 'registrationRollup') {
    const actors = (row.actors || []).map(person).filter(Boolean);
    return { id: row.id, type: 'registrationRollup', key: 'REGISTRATION_ROLLUP', count: row.count || actors.length, actors, author: actors[0] || null, event, created_at: row.created_at };
  }
  return { id: row.id, type: 'recommendation', text: row.text || '', author: person(row.author), event, created_at: row.created_at };
}

function notification(activity) {
  const payload = activity.payload || {};
  const title = payload.title || payload.group_display_name || payload.group_name || '';
  const quoted = title ? `「${title}」` : '';
  const routes = {
    'registration/requested': ['REGISTRATION_REQUESTED', 'ADMIN', 'attendees', payload.event_id, `收到报名${quoted}`],
    'registration/confirmed': ['CONFIRMED', 'EVENT', 'event-access', payload.participant_id, `报名已确认${quoted}`],
    'comment/created': ['COMMENTED', 'SOCIAL', 'event', payload.event_id, `收到评论${quoted}`],
    'recommendation/created': ['COMMENTED', 'SOCIAL', 'event', payload.event_id, `收到推荐${quoted}`],
    'event/cancelled': ['EVENT_CANCELLED', 'EVENT', 'event', payload.event_id || activity.item_id, `活动已取消${quoted}`],
    'campaign/published': ['REVIEW_APPROVED', 'ADMIN', 'campaign', activity.item_id, `专题已发布${quoted}`],
    'group_invite/send': ['ROLE_INVITED', 'ADMIN', 'invitations', '', `收到管理员邀请${quoted}`],
    'group_invite/update_role': ['ROLE_INVITED', 'ADMIN', 'admins', payload.group_id || '', `管理员身份已更新${quoted}`]
  };
  const spec = routes[activity.action] || ['COMMENTED', 'EVENT', 'event', activity.item_id, quoted ? `新消息${quoted}` : '新消息'];
  const [key, category, route, id, description] = spec;
  return {
    id: activity.id,
    type: 'notification',
    key,
    category,
    status: activity.has_read ? 'READ' : 'UNREAD',
    description,
    created_at: activity.created_at,
    actor: person(activity.initiator),
    target: { route, id: id || '' }
  };
}

function reviewTask(review) {
  return {
    id: review.id,
    type: 'review',
    status: REVIEW_STATUS[review.status] || 'PENDING',
    subject_type: 'campaign',
    scope: 'INITIATOR',
    title: review.snapshot?.title || review.title || '',
    parent: review.campaign_id,
    note: review.note || '',
    round: review.round || 1,
    version: 1,
    created_at: review.created_at,
    updated_at: review.updated_at
  };
}

function eventReview(event) {
  const card = event.starts_at ? event : eventCard(event);
  const pending = card.status === 'IN_REVIEW';
  return {
    id: 'event-' + card.id,
    type: 'review',
    status: pending ? 'PENDING' : card.status === 'PUBLISHED' ? 'APPROVED' : card.status,
    subject_type: 'event',
    scope: 'ORGANIZATION',
    title: card.title,
    parent: card.id,
    round: 1,
    version: 1,
    subject: card,
    reviews: [{ id: 'event-' + card.id, scope: 'ORGANIZATION', status: pending ? 'PENDING' : 'APPROVED', note: '', round: 1 }]
  };
}

function applyEventFilters(items, params = {}) {
  const q = String(params.q || '').toLowerCase();
  return items.filter(event => {
    if (params.free_only && event.price_minor !== 0) return false;
    if (params.has_capacity && !(event.remaining == null || event.remaining > 0)) return false;
    if (params.tag && !(event.tags || []).includes(params.tag)) return false;
    if (q && ![event.title, event.summary, event.host_display, event.venue_display].join(' ').toLowerCase().includes(q)) return false;
    return true;
  });
}

function dateWindow(from, to) {
  const day = iso => new Date(Date.parse(iso) + 8 * 3600000).toISOString().slice(0, 10);
  return { start_date: day(from), end_date: day(new Date(Date.parse(to) - 1).toISOString()), timezone: 'Asia/Shanghai' };
}

function sendAuth(op, params = {}, hasSession = true) {
  if (!hasSession) return false;
  if (op === 'calendar' || op === 'search') return false;
  if (op === 'events' && !params.owner_id && !params.attendee_id) return false;
  if (op === 'campaigns' && !params.owner_id) return false;
  return true;
}

function knownCode(status, message) {
  const text = String(message || '');
  if (status === 401) return 'LOGIN_REQUIRED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404 && /wechat pay|payment/i.test(text)) return 'WECHAT_PAY_CONFIGURATION_REQUIRED';
  if (status === 404) return 'NOT_FOUND';
  if (/refund required/i.test(text)) return 'REFUND_POLICY_REQUIRED';
  if (/capacity|run out of ticket/i.test(text)) return 'CAPACITY_FULL';
  if (/note is required/i.test(text)) return 'REASON_REQUIRED';
  if (/miniprogram login is not configured|wechat login failed/i.test(text)) return 'WECHAT_LOGIN_CONFIGURATION_REQUIRED';
  if (/wechat pay setting is required|wechat pay is not configured/i.test(text)) return 'WECHAT_PAY_CONFIGURATION_REQUIRED';
  if (/not published or pending/i.test(text)) return 'EVENT_INVALID';
  if (/not a participant/i.test(text)) return 'NOT_FOUND';
  if (/cannot be submitted|membership exists|already have|only participate once|status changed|not pending/i.test(text)) return 'STATUS_CONFLICT';
  return null;
}

function config() {
  return { cities: CITIES, privacy_version: '706-2026-10-08', capabilities: { wechat_login: true, payment: false }, demo: false };
}

function reportType(route) {
  const text = String(route || '');
  if (text.endsWith('member/index')) return 'User';
  if (/space\/index|org\/index|entity/.test(text)) return 'Group';
  return 'Event';
}

function accessMethods(imageNote) {
  const methods = [{ type: 'ORGANIZER_WILL_CONTACT', value: '发起人将联系你' }];
  if (imageNote && /^https?:\/\//.test(imageNote)) methods.unshift({ type: 'GROUP_QR', value: imageNote });
  return { ...methods[0], methods };
}

module.exports = {
  eventContent, encodeEventContent, CITIES, eventStatus, campaignStatus, priceMinor, person, entity, groupKind, eventCard, registrationFrom,
  registrationStatus, campaignCard, cursorPage, pageResult, comment, feedItem, notification, reviewTask,
  eventReview, applyEventFilters, dateWindow, sendAuth, knownCode, config, accessMethods, reportType
};
