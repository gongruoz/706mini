# 706mini 所需的 RESTful API

2026-10-19。本文按页面 read/write 调用，整理过一套 706 自己的 `/api/v1` 形状（65 个接口）。屏幕动作落到 soon 已有路由和字段上的设计以 [soon-call.md](soon-call.md) 为准。本文留下作动作清单和平行方案记录。它不启动接线。

设计对象仍以 [design-schema.md](design-schema.md) 为准。当前客户端不走下面这些路径。`miniprogram/lib/api.js` 只在 mock 与 Montana 之间切换。Montana 用 `POST /runtime/auth/*` 发验证码，业务函数走 `wss://…/runtime/session` 上的 `community:read`、`community:write`、`community:payment`、`community:wechatLogin`、`community:mediaUpload`、`community:mediaFinish`、`community:mediaPreview`、`community:calendarCode`。下面每个接口都注明它对应哪一次调用。

## 约定

- 前缀：`/api/v1`。请求和响应都是 JSON，UTF-8。时间是 ISO 字符串。金额是整数分 `price_minor`。id 是字符串。
- 登录后的请求带 `Authorization: Bearer <access_token>`。
- 会改数据的请求带 `Idempotency-Key`。同一用户、同一 key、同一正文返回第一次的结果。同一 key 配不同正文返回 `409 IDEMPOTENCY_CONFLICT`。客户端今天用 `write` 的 `key` 做这件事。
- 带 `version` 的更新，版本不一致返回 `409 VERSION_CONFLICT`。状态不允许该动作时返回 `409 STATUS_CONFLICT`。
- 列表默认每页 30 条，与 mock 的 `page()` 一致。查询参数 `cursor` 可空，`limit` 最大 30。

```json
{ "items": [], "total": 0, "has_more": false, "next_cursor": null }
```

`cursor` 无效时返回 `400 CURSOR_INVALID`。

- 错误正文：`{ "error": { "code": "FORBIDDEN", "message": "" } }`。客户端用 `code` 查文案。
- 公开读接口可以不带登录。写接口、本人数据、管理数据没有会话时返回 `401 LOGIN_REQUIRED`。
- 活动卡片、成员公开资料、动态聚合都是读模型，不另设存储接口。算法见设计 schema 的「页面派生读模型」。

本地能力不进这套 API：表单未提交前的草稿在微信存储里；日历海报由客户端绘制；公众号资料和文章由微信接口打开。

## 接口一览

共 65 个。查询方式不同但路径相同的，算一个接口，并在正文写明两种用法。

| # | 方法与路径 | 取代的调用 | 登录 |
| --- | --- | --- | --- |
| 1 | POST /auth/phone/codes | login('phone') 发码 | 否 |
| 2 | POST /auth/phone/sessions | login('phone') 验码 | 否 |
| 3 | POST /auth/email/codes | login('email') 发码 | 否 |
| 4 | POST /auth/email/sessions | login('email') 验码 | 否 |
| 5 | POST /auth/wechat/sessions | wechatLogin | 否 |
| 6 | POST /auth/refresh | socket init 里的 refresh-token | 否 |
| 7 | DELETE /auth/session | POST /runtime/signout | 是 |
| 8 | GET /config | read config | 否 |
| 9 | POST /media | mediaUpload | 是 |
| 10 | POST /media/:id/complete | mediaFinish | 是 |
| 11 | GET /media/:id | mediaPreview | 视隐私 |
| 12 | GET /me | read me | 是 |
| 13 | PATCH /me | write profile | 是 |
| 14 | GET /me/contact | read selfContact | 是 |
| 15 | GET /members/:id | read member | 否 |
| 16 | GET /people | read people | 否 |
| 17 | GET /follows | read relations | 视对象 |
| 18 | PUT /me/follows/:subjectType/:id | write follow | 是 |
| 19 | POST /me/mutes | write mute | 是 |
| 20 | GET /entities | read entities | 否 |
| 21 | GET /entities/:id | read entity | 否 |
| 22 | PATCH /entities/:id | write entity | 是 |
| 23 | GET /me/entities | read managed | 是 |
| 24 | GET /entities/:id/roles | read admins | 是 |
| 25 | GET /me/invitations | read invitations | 是 |
| 26 | POST /entities/:id/invitations | write invite | 是 |
| 27 | POST /invitations/:id/accept | write acceptInvite | 是 |
| 28 | POST /roles/:id/revoke | write revokeRole | 是 |
| 29 | GET /events | read events | 否 |
| 30 | GET /calendar | read calendar | 否 |
| 31 | POST /calendar-shares | calendarCode | 否 |
| 32 | GET /calendar-shares/:id | read calendarShare | 否 |
| 33 | GET /events/:id | read event，以及可编辑时的 read draft | 否 |
| 34 | POST /events | write saveEvent 新建 | 是 |
| 35 | PATCH /events/:id | write saveEvent 更新 | 是 |
| 36 | POST /events/:id/submit | write submitEvent | 是 |
| 37 | POST /events/:id/cancel | write cancelEvent | 是 |
| 38 | POST /events/:id/clone | write clone | 是 |
| 39 | POST /events/:id/registrations | write register | 是 |
| 40 | GET /registrations/:id | read registration | 是 |
| 41 | POST /registrations/:id/cancel | write cancelRegistration | 是 |
| 42 | POST /registrations/:id/decision | write registrationDecision | 是 |
| 43 | GET /events/:id/registrations | read attendees | 是 |
| 44 | GET /registrations/:id/contact | write registrationContact | 是 |
| 45 | GET /registrations/:id/access | write access | 是 |
| 46 | POST /registrations/:id/payment | payment | 是 |
| 47 | GET /campaigns | read campaigns | 否 |
| 48 | GET /campaigns/:id | read campaign，可编辑时含草稿 | 否 |
| 49 | POST /campaigns | write saveCampaign 新建 | 是 |
| 50 | PATCH /campaigns/:id | write saveCampaign 更新 | 是 |
| 51 | POST /campaigns/:id/submit | write submitCampaign | 是 |
| 52 | GET /reviews | read reviews 与 read progress | 是 |
| 53 | GET /reviews/:id | read review | 是 |
| 54 | POST /reviews/:id/decision | write review | 是 |
| 55 | GET /feed | read feed | 否 |
| 56 | GET /search | read search | 否 |
| 57 | GET /me/items | read mine | 是 |
| 58 | GET /notifications | read notifications | 是 |
| 59 | POST /notifications/:id/read | write read 单条 | 是 |
| 60 | POST /notifications/read | write read 全部 | 是 |
| 61 | GET /events/:id/comments | read comments | 否 |
| 62 | POST /events/:id/comments | write comment | 是 |
| 63 | DELETE /comments/:id | write deleteComment | 是 |
| 64 | PUT /events/:id/recommendation | write recommend | 是 |
| 65 | POST /reports | write report | 是 |

撤回推荐是 `DELETE /events/:id/recommendation`，与第 64 条同一资源，不另编号。当前页面把评论嵌在活动详情里；第 61 条用于超过一页之后的续读。

## 会话

验证码接口不创建会话。验码成功才返回令牌，并让客户端丢掉旧 socket。对应今天的 `login(mode, address, code)`：无 `code` 时发码，有 `code` 时验码。

| 接口 | 正文 | 成功 |
| --- | --- | --- |
| POST /auth/phone/codes | `{ "phone": "" }` | `202`，无会话 |
| POST /auth/email/codes | `{ "email": "" }` | `202`，无会话 |
| POST /auth/phone/sessions | `{ "phone": "", "code": "" }` | `{ "access_token", "refresh_token", "user": { "id" } }` |
| POST /auth/email/sessions | `{ "email": "", "code": "" }` | 同上 |
| POST /auth/wechat/sessions | `{ "code": "" }` | 同上。`code` 来自 `wx.login` |
| POST /auth/refresh | `{ "refresh_token": "" }` | 新的 access token 与 refresh token |
| DELETE /auth/session | `{ "refresh_token": "" }` | `204`。客户端随后清本地会话 |

空验证码是客户端自己的 `CODE_REQUIRED`，不会发请求。`read.config.capabilities.wechat_login` 为假时，界面不把微信登录当可用能力。

## 配置与媒体

### GET /config

无需登录。响应：

```json
{
  "cities": [{ "id": "shanghai", "zh": "上海", "en": "Shanghai", "timezone": "Asia/Shanghai" }],
  "privacy_version": "706-2026-10-08",
  "capabilities": { "wechat_login": false, "payment": false }
}
```

城市 id 以这份列表为准。`capabilities.payment === false` 时，付款界面只能走演示，不能调起真实微信支付。

### 媒体

上传分三步。第 9、10 条是本 API。字节 PUT 到返回的签名地址，不经过本服务。

1. `POST /media`，正文 `{ "extension": "jpg", "private": false }`。响应 `{ "id", "upload_url", "path" }`。群码和私有图 `private: true`。
2. 客户端 `PUT upload_url`，Content-Type 按扩展名。文件大于 10MB 时客户端直接拒绝，服务端也应拒绝。
3. `POST /media/:id/complete`，正文 `{ "path": "" }`。响应 `{ "id", "url", "preview_url" }`。

公开图的 `url` 可以放进活动 `media[]` 或资料字段。私有图在表单里记为 `706-media:{id}`。

`GET /media/:id` 返回 `{ "url" }`。公开媒体的主人或平台角色可以预览。私有群码还要带 `registration_id`：该报名已确认，且参与方式里确实引用了这个媒体 id；否则 `403 FORBIDDEN`。

数量限制在活动和专题的保存接口执行：活动图片最多 9、视频 1、链接 3；专题图片最多 12。链接必须是 http(s)。超出返回 `422 MEDIA_LIMIT` 或 `422 MEDIA_INVALID`。

## 本人与成员

### GET /me

```json
{
  "profile": {},
  "roles": [],
  "following": 0,
  "followers": 0,
  "unread": 0
}
```

`profile` 是本人的完整资料，含非公开字段。`roles` 是仍为 `ACTIVE` 的角色。计数字段是数量，不是列表。

### PATCH /me

只接受这些字段：`display_name`、`avatar_url`、`city`、`bio`、`interests`、`introduction`、`public_links`、`frequent_spaces`、`locale`、`notification_preferences`、`visibility`、`share_activity`、`wechat`、`follow_spaces`、`complete`、`privacy_consent`。

- `display_name` 传入则不能为空白，否则 `422 NAME_REQUIRED`。
- `interests` 传入则必须是 2–5 项，否则 `422 INTERESTS_INVALID`。
- `complete: true` 且没有 `privacy_consent` 时返回 `422 CONSENT_REQUIRED`，成功后 `onboarded` 为真。
- `wechat` 写入私有联系方式，响应里的公开资料不带回明文。
- `follow_spaces` 是实体 id 数组。服务端对每个 id 执行一次关注，等价于多次调用第 18 条。

城市和语言切换也走这条接口，正文分别只有 `city` 或 `locale`。

### GET /me/contact

响应 `{ "wechat": "" }`。没有记录时是空字符串。

### GET /members/:id

`:id` 是账户 id，也就是 `profile.owner`，不是 profile 记录自己的 id。响应是公开资料，另加：

`following`、`following_count`、`followers_count`、`activity_count`、`frequent_entities`、`items`。

`share_activity` 为假时不返回他参加的活动。资料不是 `PUBLIC` 且 `ACTIVE` 时返回 `404 NOT_FOUND`。`items` 里的活动用活动卡片。

### GET /people

查询：`city`、`exclude`（账户 id，可重复）。响应是一页公开资料，每项带 `reason` 和 `following`。排除当前用户。推荐原因的取值见设计 schema。

### GET /follows

查询：`subject` 默认当前用户；`mode` 为 `following` 或 `followers`。

`following` 的每一项是当前主体关注的人或实体。人使用公开资料并带 `route: "member"`。实体带 `route: "space"` 或 `"org"`。`followers` 只列出人。看别人的列表时，对方资料必须公开。未登录查看「我关注的节点」返回 `401`。

### PUT /me/follows/:subjectType/:id

`subjectType` 是 `members` 或 `entities`。正文 `{ "enabled": true }`。已有关系只改 `ACTIVE` / `INACTIVE`，不另建一行。不能关注自己，返回 `422 CANNOT_FOLLOW_SELF`。对象不存在返回 `404`。

### POST /me/mutes

正文 `{ "id": "" }`，`id` 是被屏蔽成员的账户 id。当前界面没有取消屏蔽，因此不设删除接口。动态读取时排除被屏蔽作者。

## 实体与权限

`kind` 只有 `SPACE` 与 `ORGANIZATION`。

### GET /entities

查询：`kind`、`city`、`directory`。`directory=true` 时每项附加 `event_count` 和 `active_member_count`，并只保留允许进目录的实体。响应是公开实体页。非管理人的对象不带 `public_contact`。

### GET /entities/:id

响应在实体字段之外附加：`following`、`can_manage`、`can_admin`、`items`（活动卡片）、`members`（公开且允许分享参与的人）。管理人能看到 `public_contact`。

### PATCH /entities/:id

管理人。正文可含 `name`、`introduction`、`cover_url`、`avatar_url`、`address`、`opening_hours`、`public_contact`、`public_links`、`city`、`allow_event_requests`，以及 `version`。设计表单使用其中的封面、名称、城市、开放时间、地址、介绍、公开联系方式和是否接受活动申请。

### GET /me/entities

当前用户能管理的实体，不分页包装为 `{ "items": [] }`。发布页用它区分可选空间和组织。

### GET /entities/:id/roles

仅该实体的 OWNER，或平台角色。`items` 是 `role` 记录。

### GET /me/invitations

`items` 是发给当前用户、状态为 `PENDING` 的邀请。

### POST /entities/:id/invitations

OWNER 或平台角色。正文 `{ "user_id": "" }`。对方必须有成员资料。成功后对方收到 `ROLE_INVITED` 通知。角色固定为实体 `ADMIN`。

### POST /invitations/:id/accept

只有被邀请人可以接受仍为 `PENDING` 的邀请。邀请人必须仍是该实体 OWNER 或平台角色，否则 `403 INVITATION_REVOKED`。被邀请人若已是 OWNER，返回 `409 STATUS_CONFLICT`。成功后写入或恢复一条 `ADMIN` 角色。

### POST /roles/:id/revoke

实体 OWNER。不能撤销 `OWNER` 和平台角色。同一人在该实体上的角色改为 `REVOKED`，他尚未接受的邀请也改为 `REVOKED`。

## 活动与日历

公开列表和日历只含 `PUBLISHED`，且 `visibility` 不是 `MEMBERS` 或 `UNLISTED`。每项是活动卡片。

### GET /events

查询：`city`、`from`、`to`、`space_id`、`tag`、`free_only`、`has_capacity`、`q`、`cursor`。`from` / `to` 按活动时间段相交过滤。`has_capacity` 保留剩余名额为 null 或大于 0 的活动。`q` 匹配标题、摘要、发起人展示名和地点展示名。

专题编辑页还会单独请求本人的 `IN_REVIEW` 活动，那一部分走 `GET /me/items?kind=event`，不放进这条公开列表。

### GET /calendar

查询与活动列表相同，但响应是 `{ "items", "generated_at" }`，不分页。发现页用它做本周总览；日历页用它画时间范围。本周总览不带下方的免费、名额、空间筛选。

### POST /calendar-shares

无需登录。正文是筛选参数：`city`、`from`、`to`，以及当时的其他筛选。响应：

```json
{ "id": "", "params": {}, "items": [], "code": "" }
```

`items` 是按 `params` 取出的活动卡片，供当次海报使用。`code` 是小程序码 PNG 的 base64，scene 为分享 id。微信码未配置时返回 `503 WECHAT_CODE_CONFIGURATION_REQUIRED`；生成失败返回 `503 WECHAT_CODE_UNAVAILABLE`。演示模式可以返回 `code: null`，客户端不写码图。

### GET /calendar-shares/:id

响应 `{ "params": {} }`。客户端再用这些参数重新请求日历。

### GET /events/:id

公开活动谁都可以读。非公开活动只有可编辑的人能读，否则 `403 FORBIDDEN`。

响应是活动卡片，另加 `can_edit`、`can_register`、`host_recent_count`、`campaigns`、`comments`。`comments` 带第一页和分页字段。`can_register` 在活动公开、且距开始超过 120 分钟时为真。

调用者可编辑时，响应附加 `eventSecret.access`。这就是今天的 `read draft`。公开读者看不到群码和发起人微信。

### POST /events

创建草稿。正文是设计 schema 里的活动保存字段，包含 `access`。`visibility` 由服务端写成 `PUBLIC`，`status` 写成 `DRAFT`。响应是保存后的活动，含新的 `id` 和 `version`。

### PATCH /events/:id

可编辑者。正文带 `version` 和要改的字段。允许的状态：`DRAFT`、`CHANGES_REQUESTED`、`IN_REVIEW`。`IN_REVIEW` 下保存会使本轮未决审核变为 `SUPERSEDED`。其他状态返回 `409 STATUS_CONFLICT`。

`access` 有值时整份替换该活动的参与方式。

### POST /events/:id/submit

正文 `{ "version": 1 }`。只接受 `DRAFT` 或 `CHANGES_REQUESTED`。服务端执行活动提交校验：标题、介绍、城市、未来的开始时间、更晚的结束时间、地点、容量、价格、参与方式、组织权限。失败时返回对应的 `422`：`EVENT_INVALID`、`CAPACITY_INVALID`、`PRICE_INVALID`、`VENUE_INVALID`、`FORBIDDEN`。

成功后 `status` 为 `IN_REVIEW`，`round` 加 1，并按平台、组织、空间生成审核任务。

### POST /events/:id/cancel

正文 `{ "version": 1 }`。可编辑者。若 `price_minor > 0` 且存在 `CONFIRMED` 报名，返回 `409 REFUND_POLICY_REQUIRED`，不取消。否则活动变为 `CANCELLED`，未结束的报名变为 `CANCELLED`，并通知报名人。

### POST /events/:id/clone

任何能看见该活动的登录用户。复制标题、摘要、介绍、标签和封面，成为新的 `DRAFT`。容量清空，价格为 0，不复制报名和私有参与方式。响应是新活动。客户端接着打开发布页。

## 报名与付款

报名状态和名额规则见设计 schema。占用名额的是 `CONFIRMED`，加上未过期的 `APPROVED_AWAITING_PAYMENT`。

### POST /events/:id/registrations

正文：`display_name`、`motivation`、`privacy_consent`、`contact_share_consent`。

活动必须公开，且距开始超过 120 分钟，否则 `409 REGISTRATION_CLOSED`。没有称呼或没有隐私同意时 `422 CONSENT_REQUIRED`。已有未结束报名则直接返回那一条。已满且不允许候补时 `409 CAPACITY_FULL`。

服务端写入 `consent_version`，其值等于当时 `GET /config` 的 `privacy_version`。付费且通过审核的报名得到 `payment_expires_at`。响应是报名记录。客户端转到报名凭证页。

### GET /registrations/:id

报名人本人，或活动的可编辑者。响应含报名、嵌套的活动卡片、`can_manage`。

### POST /registrations/:id/cancel

仅报名人。已确认的付费报名返回 `409 REFUND_POLICY_REQUIRED`。成功后再尝试递补候补。

### POST /registrations/:id/decision

活动的可编辑者。正文 `{ "version": 1, "approve": true }`。只处理 `REQUESTED`。同意后按容量、价格和候补规则进入下一状态。拒绝则变为 `REJECTED`。

### GET /events/:id/registrations

活动的可编辑者。每项是报名，并带 `can_read_contact`。

### GET /registrations/:id/contact

活动的可编辑者，且该报名同意共享、状态属于 `REQUESTED`、`APPROVED_AWAITING_PAYMENT`、`CONFIRMED`、活动仍公开。响应 `{ "wechat": "" }`。否则 `403 ACCESS_NOT_GRANTED`。

这条在现有客户端里走 `write`，只是因为写通道能带幂等 key。它不修改数据，所以这里用 GET，不要求 `Idempotency-Key`。

### GET /registrations/:id/access

报名人本人，或活动的可编辑者。报名必须是 `CONFIRMED`，活动必须公开。过期返回 `410 ACCESS_EXPIRED`。响应是参与方式：`type`、`value`、`methods`。没有配置时，响应可以是「发起者将联系你」，且不包含真实联系方式。

群码的 `value` 仍可能是 `706-media:{id}`。客户端再请求 `GET /media/:id?registration_id=` 换成可显示的地址。

### POST /registrations/:id/payment

仅报名人，且状态为未过期的 `APPROVED_AWAITING_PAYMENT`。响应是 `wx.requestPayment` 需要的字段：`timeStamp`、`nonceStr`、`package`、`signType`、`paySign`。客户端付款成功后重新读取报名。支付结果以服务端回调为准，不由客户端声明成功。

`capabilities.payment === false` 时，这个接口不被正式客户端调用。演示付款留在 mock，不作为本接口的成功路径。

退款接口不在本清单里。付费取消返回 `REFUND_POLICY_REQUIRED`，直到退款规则单独定下来。

## 专题

### GET /campaigns

已发布专题的分页。发现页使用。

### GET /campaigns/:id

公开专题谁都可以读。响应含专题字段、`can_edit`、`items`（关联且仍公开的活动卡片）。可编辑者能读草稿和审核中的专题。

### POST /campaigns 与 PATCH /campaigns/:id

创建或保存。字段：`title`、`kicker`、`introduction`、`cover_url`、`organization_id`、`event_ids`、`resource_links`、`media`，更新时加 `version`。

新建为 `DRAFT`。更新允许 `DRAFT`、`CHANGES_REQUESTED`、`PUBLISHED`。只有所有者可改。审核中的专题若再次进入可保存状态，本轮任务按活动的同一规则作废。

### POST /campaigns/:id/submit

正文 `{ "version": 1 }`。要求标题、介绍、至少一场活动。每场活动须为 `PUBLISHED` 或 `IN_REVIEW`。有组织时提交人须能管理该组织。失败码：`422 CAMPAIGN_INVALID`、`422 EVENT_INVALID`、`403 FORBIDDEN`。

审核任务包括平台、所属组织，以及每个关联活动的发起人。

## 审核

### GET /reviews

两种查询，都要登录。

- 不带 `subject_id`：当前用户能处理的 `PENDING` 任务。同一主体只留一条，并带主体 `title`。审核列表用它。
- `subject_id`：该活动或专题的全部审核记录。只有可编辑者能读。进度页自己滤掉 `SUPERSEDED`。

### GET /reviews/:id

审核人。响应含任务、`subject` 全量、同一 `round` 的 `reviews`。客户端再按 `subject.event_ids` 逐个请求活动详情。

### POST /reviews/:id/decision

正文 `{ "version": 1, "approve": false, "note": "" }`。任务必须是当前轮的 `PENDING`，主体必须是 `IN_REVIEW`。拒绝时 `note` 必填，否则 `422 REASON_REQUIRED`。

发起人拒绝只从专题里去掉对应活动。其他拒绝把主体改为 `CHANGES_REQUESTED`。本轮必审任务都通过后，主体改为 `PUBLISHED`；专题若已经没有活动，则改为 `CHANGES_REQUESTED`。主体所有者收到通知。

## 动态、搜索与我的

### GET /feed

查询：`city`、`cursor`。未登录时只按城市给出公开动态，不应用屏蔽。登录后去掉当前用户屏蔽的作者。

`items` 混有两种元素：

- 推荐：推荐记录、`author`、嵌套活动卡片。
- 聚合报名：`type` 为 `registrationRollup`，没有独立存储。字段是 `id`、`key`、`author`、`count`、`actors`、`event`、`created_at`。

### GET /search

查询：`q`、`city`。`items` 混合活动卡片、实体和成员。实体带 `route` `space` 或 `org`。成员的 `id` 用账户 id，`route` 为 `member`。同城结果排在前面。空查询不调用此接口，客户端回到原列表。

### GET /me/items

查询：`kind` 为 `event`、`registration` 或 `campaign`；可选 `status`、`phase`、`cursor`。

报名项嵌套活动卡片。活动项是卡片再加 `comment_count`。`phase` 由客户端的 `mine-phase.js` 定义：已结束的已发布活动或已确认报名为 `ENDED`，其余用记录自己的状态。服务端按同一规则过滤。草稿页传 `status=DRAFT`。

## 消息

### GET /notifications

查询：`category` 为 `EVENT`、`SOCIAL`、`ADMIN` 或空；`cursor`。只返回当前用户的消息。每项在通知字段之外，有 `actor` 公开资料或 null。

### POST /notifications/:id/read

把这一条标为 `READ`。只有收件人。

### POST /notifications/read

把当前用户全部未读标为 `READ`。需求里有「全部已读」。当前消息页打开一条时只调用单条接口。

## 评论、推荐与举报

### GET /events/:id/comments

活动对调用者可见。分页的评论，每项含 `author`、`badge`、`reply_to`。`badge` 由服务端计算，值为空、`已推荐` 或 `已报名`。

`GET /events/:id` 已经带上第一页。本接口用于后续页。

### POST /events/:id/comments

正文 `{ "text": "", "reply_to": null }`。`text` 不能空白，否则 `422 TEXT_REQUIRED`。`reply_to` 必须属于同一活动。成功后通知活动发起人。

### DELETE /comments/:id

作者或平台角色。评论变为 `DELETED`，正文清空。其他人 `403`。

### PUT /events/:id/recommendation

正文 `{ "text": "" }`。一人一场保留一条。再次发布更新正文并把状态设为 `ACTIVE`。活动必须对调用者可见。

### DELETE /events/:id/recommendation

撤回当前用户对这场活动的推荐：状态改为 `INACTIVE`，保留原文。对应界面上的 `withdrawRecommendation`。

### POST /reports

正文 `{ "id": "", "reason": "" }`。`id` 是被举报对象，反馈页可以空着。`reason` 必填，否则 `422 REASON_REQUIRED`。新记录状态为 `OPEN`。

## 错误码

| HTTP | code | 何时 |
| --- | --- | --- |
| 401 | LOGIN_REQUIRED | 写操作或本人数据没有会话 |
| 403 | FORBIDDEN | 没有管理、编辑或查看权限 |
| 403 | ACCESS_NOT_GRANTED | 报名联系方式或参与方式的条件不满足 |
| 403 | INVITATION_REVOKED | 邀请人已不再是所有者 |
| 404 | NOT_FOUND | 记录不存在，或成员资料不公开 |
| 409 | VERSION_CONFLICT | version 落后 |
| 409 | STATUS_CONFLICT | 当前状态不允许这个动作 |
| 409 | IDEMPOTENCY_CONFLICT | 同一个 key 配了不同正文 |
| 409 | REGISTRATION_CLOSED | 报名已过开始前 120 分钟，或活动不公开 |
| 409 | CAPACITY_FULL | 已满且关闭候补 |
| 409 | REFUND_POLICY_REQUIRED | 付费确认报名或付费活动被取消 |
| 410 | ACCESS_EXPIRED | 参与方式已过期 |
| 422 | NAME_REQUIRED、INTERESTS_INVALID、CONSENT_REQUIRED、TEXT_REQUIRED、REASON_REQUIRED | 字段不合法 |
| 422 | EVENT_INVALID、CAMPAIGN_INVALID、CAPACITY_INVALID、PRICE_INVALID、VENUE_INVALID | 提交校验失败 |
| 422 | CANNOT_FOLLOW_SELF、MEDIA_INVALID、MEDIA_LIMIT | 关注或媒体不合法 |
| 400 | CURSOR_INVALID | 分页游标不存在 |
| 503 | WECHAT_CODE_CONFIGURATION_REQUIRED、WECHAT_CODE_UNAVAILABLE | 日历小程序码 |

网络失败、超时和微信域名白名单是客户端传输错误：`NETWORK`、`TIMEOUT`、`DOMAIN_NOT_ALLOWED`。它们不是服务端业务码。

## 现有实现对照

| 本契约 | 今天的小程序 | soon 源码里相近的入口 |
| --- | --- | --- |
| 手机、邮箱验码与刷新 | Montana `/runtime/auth/send_*`、`verify_*`，刷新在 socket init | `POST /api/v1/auth/request_phone_code`、`verify_phone_code`、`request_code`、`verify_code`。没有按本契约返回的刷新接口 |
| 微信登录 | `community:wechatLogin` | `POST /api/v1/auth/bind_wechat`，用途是绑定，不是本契约的建会话 |
| 活动公开读、草稿、审核、专题 | `community:read/write` 的 event 与 campaign | `resources :events` 要求 group，状态词是 draft、pending、published 等。没有专题资源 |
| 报名、候补、待支付 | registration 读写 | `events/:id/participants` 与 `tickets/:id/rsvp`。状态词和支付模型不同 |
| 微信支付参数 | `community:payment` 返回调起参数 | `POST /api/v1/tickets/wechat_prepay`，挂在票上 |
| 关注、屏蔽、推荐帖 | follow、mute、recommendation | 无同形资源。`comments` 的 star 不是推荐帖 |
| 站内消息 | notification | `GET /api/v1/activities` 与 `mark_read`。字段是 action、has_read，没有 category 和 target.route |
| 空间与组织 | entity | `groups`、`venues`、`places` 三套资源 |
| 媒体签名上传 | mediaUpload、PUT、mediaFinish | `POST /api/v1/upload/image` 与 `upload/file`，一步上传，不是本契约的三步 |

这些 soon 路由可以当作实现时的材料。它们现在不是 706 小程序的接口。

## 有意不列入的能力

- 退款执行。取消付费对象时停在 `REFUND_POLICY_REQUIRED`。
- 拒绝管理员邀请。界面只有接受。
- 取消屏蔽。界面只有屏蔽。
- 删除服务端草稿。未提交内容在本地存储；服务端草稿没有删除动作。
- 微信订阅消息。需求里登记过，当前页面没有调用。
- 业务事件推送。现有 socket 只回请求结果，没有订阅接口。
- soon 已有而 706 页面未使用的票券、商店、投票、黑客松、徽章、OAuth 管理和联邦接口。
