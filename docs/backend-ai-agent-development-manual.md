# 706 社区小程序：后端 AI Agent 开发手册

> 文档定位：供负责后端架构、数据建模、接口实现、权限与审核、支付和消息系统的 AI Agent 使用。  
> 产品基准：当前 706 移动端交互原型与已确认的产品批注。  
> 版本日期：2026-09-28。

## 1. 使用方式与约束

本手册同时描述“当前产品已经明确的行为”和“后端建议实现”。AI Agent 开发时遵循以下优先级：

1. 用户最新确认的产品批注；
2. 本手册中的产品规则与验收标准；
3. 当前前端原型的页面、字段和交互；
4. 后端为了可靠性提出的内部实现方案。

如果原型与本手册冲突，不要静默选择其中一个。先保留向后兼容的接口，再记录冲突和建议处理方式。不要因为原型暂时用静态数据，就把演示状态、固定日期或假数据写死在服务端。

建议后端以 `/api/v1` 作为首个正式版本；所有写接口支持幂等；所有管理动作保留审计日志；所有时间使用带时区的 ISO 8601，业务默认时区为 `Asia/Shanghai`。

## 2. 产品目标与原则

706 是以线下活动、社区成员、组织/品牌和空间节点为核心的城市社区产品。它不是单纯的票务工具，后端模型必须同时支持：

- 发现活动，也发现人、组织和空间；
- 个人或组织发起活动，并关联举办空间；
- 平台、组织、空间多方审核；
- 免费、付费、免审、需发起人审核、候补等不同参与方式；
- 报名成功后按权限解锁群二维码或联系人；
- 通过报名、推荐、关注和评论形成社区动态；
- 同一产品提供完整中文和英文界面；
- 用户可切换城市，内容按城市优先展示。

产品原则：简单、体贴、宽敞、一致。接口设计也应遵守同样原则：字段稳定、状态清楚、失败可恢复、敏感信息按需暴露。

## 3. 核心术语

| 中文 | 建议英文/代码名 | 含义 |
|---|---|---|
| 成员 | `User` / `Profile` | 使用产品的个人；账号与公开资料分离 |
| 发起者 | `EventInitiator` | 对活动负责的个人，可同时代表组织/品牌 |
| 组织/品牌 | `Organization` | 发起活动或运营系列的主体 |
| 空间节点 / 地点 | `Space` / `Venue` | 活动举办地点；界面对用户统一显示“地点” |
| 活动 | `Event` | 可报名的活动主体 |
| 场次 | `EventOccurrence` | 活动在具体时间地点的一次发生；MVP 可一活动一场次，但模型应可扩展 |
| 活动系列 | `Campaign` | 跨城市或同主题活动集合 |
| 报名 | `Registration` | 用户申请、获批、付款、确认或候补的全过程 |
| 参与方式 | `AccessGrant` | 报名成功后可见的群二维码、微信号或联系说明 |
| 审核 | `Review` | 平台、组织或空间管理员对活动发布申请的决定 |
| 推荐 | `Recommendation` | 成员向关注者推荐活动，并可附推荐语 |
| 动态 | `FeedItem` | 推荐、报名、关注等社区事件形成的信息流条目 |

## 4. 信息架构

### 4.1 底部主导航

产品固定四个一级入口，不再在页面顶部重复显示页名：

1. **动态 `feed`**：关注关系、同城成员、推荐与报名动态。
2. **发现 `discover`**：搜索、活动系列、日期/地点/标签筛选、活动列表。
3. **消息 `messages`**：管理、活动、互动通知。
4. **我的 `me`**：个人资料、发布和报名记录、组织与空间管理、更多设置。

一级页面需要保留当前 tab；二级页面进入后可返回原入口。后端不维护前端路由历史，但深链应能直接打开活动、成员、组织、空间、系列和审核详情。

### 4.2 页面与后端能力矩阵

| 页面 | 主要读取 | 主要写入 |
|---|---|---|
| 动态 | 推荐成员、个性化动态、活动卡片 | 关注/取消关注、打开推荐理由 |
| 发现 | 城市、搜索、系列、筛选选项、活动列表 | 保存当前城市（可本地+账号同步） |
| 消息 | 分类通知、未读数 | 单条已读、全部已读 |
| 我的 | 个人资料、统计、管理员待办、管理实体 | 编辑资料、进入发布/管理流程 |
| 更多 | 城市、语言、通知偏好、隐私设置 | 更新城市、语言与偏好 |
| 活动详情 | 活动、发起方、地点、报名状态、讨论 | 报名、候补、推荐、评论、分享记录 |
| 发布活动 | 草稿、可用身份、组织、地点、媒体 | 自动存草稿、提交审核 |
| 审核 | 待办、审核链、活动快照 | 通过、退回修改 |
| 报名结果 | 报名、付款、参与方式 | 支付、取消报名、复制/查看参与方式 |
| 成员主页 | 公开资料、关注关系、共同关联 | 关注、屏蔽、举报 |
| 组织/空间 | 资料、活动、成员、管理员权限 | 关注、编辑、邀请管理员、审核活动 |
| 活动系列 | 系列资料、城市节点、活动 | 管理系列、添加/移除活动 |

## 5. 全局界面与交互规则

### 5.1 城市与语言

- 城市选择出现在“动态”和“发现”左上方；“我的 → 更多”也必须有“城市”入口。
- 当前支持：上海、北京、广州、深圳、杭州、成都。城市表必须来自服务端配置，不应长期硬编码。
- 城市影响活动、系列、成员推荐和动态排序，但不应隐藏用户明确搜索到的其他城市内容。
- 语言入口位于“我的 → 更多”，支持 `zh-CN` 和 `en`。
- 语言切换后，导航、按钮、系统提示和服务端系统文案立即切换。
- 用户自建内容（活动名、成员介绍、组织名、地址等）保持原文；除非未来另有人工或机器翻译字段，不要自动覆盖。
- 匿名用户可用本地偏好；登录后将 `city_id` 和 `locale` 同步到账户。

### 5.2 加载、空状态和错误

所有列表接口都必须可表达：首次加载、增量加载、空结果、部分失败、全部失败。推荐约定：

- 首屏：骨架屏，不用全屏转圈遮挡已有内容；
- 翻页失败：保留已加载数据，提供重试；
- 空筛选：显示“没有符合这些条件的活动”，并允许清空筛选；
- 写入失败：保持用户已填写内容，返回稳定错误码和可显示的中文/英文信息；
- 权限变化：返回 `403` 与具体原因，不把不存在和无权访问混成一个模糊错误；
- 已下架/已取消内容：详情仍可向相关成员展示状态，不直接变成无解释的 `404`。

### 5.3 分页与排序

动态、活动、消息、评论、成员均使用 cursor 分页：

```json
{
  "items": [],
  "next_cursor": "opaque-token-or-null",
  "has_more": false
}
```

游标必须是不透明值。不要让客户端依赖数据库自增 ID。推荐排序接口同时返回 `rank_reason` 或可选的解释字段，便于产品展示“共同参加过活动”等推荐理由。

### 5.4 活动卡片统一契约

动态、发现、日历、组织/空间主页、系列页、“我报名的活动”和“我发布的活动”会使用不同视觉卡片，但应复用同一个 `EventCardDTO`。

所有卡片必须展示：

- 活动标题、日期/时间、报名状态；
- 费用、剩余名额或满员状态；
- `发起者：个人 & 组织/品牌`；
- `地点：空间节点或自定义地点`；
- 必要时显示报名人数和当前用户状态。

卡片**不显示发起者头像**；头像只在活动详情页“发起方”区域展示。个人发起时仍使用统一格式，例如 `发起者：毛毛 & 个人发起`。

建议 DTO：

```ts
interface EventCardDTO {
  event_id: string;
  title: string;
  cover: MediaRef | null;
  occurrence: {
    starts_at: string;
    ends_at: string;
    timezone: string;
    date_label: string;
  };
  attribution: {
    initiator: PublicProfileRef;
    organization: PublicEntityRef | null;
    organization_display_name: string; // 无组织时为“个人发起”
    venue: PublicVenueRef;
    host_display: string;              // 如“阿乔 & Sola 放映组”
    venue_display: string;             // 如“706 青年空间”
  };
  pricing: { type: "FREE" | "PAID"; amount_minor: number; currency: "CNY" };
  capacity: { total: number | null; remaining: number | null; registered: number };
  status: EventPublicStatus;
  registration: { status: RegistrationStatus | null; actionable: boolean };
  tags: string[];
}
```

后端应提供已经整理好的公开展示 DTO，避免每个前端页面自行拼接发起者、组织和地点，造成不一致。

## 6. 各页面详细逻辑

### 6.1 动态

页面顺序：城市选择 → “发现有意思的人” → 社区动态卡片 → 发布活动悬浮按钮。

“发现有意思的人”一次返回一小组成员，并提供“换几个”。推荐理由优先使用真实社区关系：

- 对方关注了你；
- 共同参加过活动；
- 关注同一个空间；
- 推荐过同一场活动；
- 同城且兴趣或组织关联相近。

“换几个”应排除当前已显示成员，短期内避免重复；当候选池不足时允许循环。关注操作可乐观更新，失败则回滚。

动态条目至少支持：

- 成员推荐活动并附推荐语；
- 多位同城成员报名同一活动的合并动态；
- 未来可扩展活动更新、组织发布和新成员加入。

动态页不显示“推荐、评论、分享”三个快捷按钮；这些操作进入活动详情后进行。

### 6.2 发现

顶部为城市按钮和搜索框。搜索对象包括活动、成员、组织和空间；服务端返回混合结果并标注类型。

活动系列 carousel 与容器边缘保持统一留白。系列卡片展示联动城市、主题和查看入口。

筛选固定为三行，不使用“日/地/签”等总起列名，也不使用“日历/空间”两个大 tab：

1. 日期：`本周`、`下周`、`日历`；
2. 地点：`全部空间`、具体空间节点；
3. 标签：`不限`、`免费`、`有名额`、`共读`、`放映`、`户外`等。

日历交互：

- 点击“日历”展开恰好 7 天；
- 左上角只显示月份，如“九月”；
- 左右箭头分别查看上周和下周；
- 不显示“按周浏览”，不采用上下滚动切换周；
- 有活动的日期可显示轻量标记；选择日期后更新结果；
- 跨月的一周允许同时出现两个月日期，月份标签采用该周起始日或产品定义的主月份，并在返回数据中明确。

筛选组合为 AND：日期 AND 地点 AND 标签。标签中的“不限”清空标签限制。列表标题和数量必须来自实际查询结果。

推荐查询：

```http
GET /api/v1/events?city_id=shanghai&from=2026-09-22T00:00:00%2B08:00&to=2026-09-29T00:00:00%2B08:00&space_id=space_706&tags=screening&has_capacity=true&cursor=...
```

### 6.3 消息

筛选项：全部、管理、活动、互动。“全部标为已读”与筛选项位于同一水平区域。

通知类型建议：

- `REVIEW_REQUESTED`、`REVIEW_APPROVED`、`CHANGES_REQUESTED`；
- `REGISTRATION_REQUESTED`、`REGISTRATION_APPROVED`、`REGISTRATION_REJECTED`；
- `PAYMENT_REQUIRED`、`PAYMENT_SUCCEEDED`、`REFUND_UPDATED`；
- `EVENT_UPDATED`、`EVENT_CANCELLED`、`EVENT_REMINDER`；
- `FOLLOWED`、`COMMENTED`、`REPLIED`、`RECOMMENDED`；
- `ROLE_GRANTED`、`ROLE_REVOKED`。

未读数是服务端事实。打开消息 tab 不等于全部已读；只有用户执行“全部标为已读”或实际打开单条后才更新。前端原型当前打开 tab 会清零，仅为演示，正式后端不可据此实现。

### 6.4 我的

顶部不重复显示“我的”。个人卡片展示头像、昵称、城市、简介、关注数和被关注数；“参与活动”统计已确认移除，因为下方已有报名入口。

管理员待办只对有待处理权限的用户显示，展示数量和摘要。

第一组菜单顺序固定：

1. 发布活动；
2. 活动草稿；
3. 我报名的活动；
4. 我发布的活动。

第二组展示“我管理的组织”和“我管理的空间”。不再重复展示“我的关注”，因为个人卡片上方已有关注统计入口。

页面最下方入口为“更多”，其中包含城市、语言、通知、隐私、安全、关于和反馈。

### 6.5 活动详情

详情结构：封面与标题 → 系列入口（如有）→ 报名社交证明 → 时间/地点/费用/名额 → 活动介绍 → 适合谁 → 发起方 → 大家说 → 底部固定操作。

发起方区域展示个人发起者头像和名称，以及组织/品牌；地点区域展示空间节点。点击可进入对应主页。详情允许显示头像，卡片不显示。

底部主要操作：推荐、报名/申请/候补。评论和分享位于详情内，不出现在动态卡片外层。

报名按钮文案由服务端 viewer state 决定：

- 有名额、无需审核：`确认报名`；
- 有名额、需要审核：`提交申请`；
- 无名额、允许候补：`加入候补`；
- 已报名：进入报名状态/参与方式；
- 报名关闭或活动结束：禁用并解释原因。

### 6.6 成员、组织与空间

成员主页展示公开资料、关注关系、共同活动/空间等关联、成员发起或参与的公开活动。更多操作包括复制链接、不看其动态、举报。

组织和空间主页均包含：资料、关注按钮、活动列表、成员或管理员列表。管理员额外看到“管理”：

- 编辑资料；
- 活动审核；
- 管理员设置。

空间应保存城市、完整地址、营业/开放时间、联系人、地图坐标、容量与设施等可扩展字段。公开接口只返回允许展示的联系人信息。

### 6.7 活动系列

系列包含封面、名称、介绍、参与城市、资料链接和活动集合。系列管理员可添加/移除活动。活动可以不属于系列；MVP 中一个活动最多属于一个系列，模型可使用中间表为未来多系列预留。

## 7. 完整业务流程与状态机

### 7.1 活动发布与审核

发布分三步：

1. 活动是什么：名称、简介、媒体、日期时间、城市、地点、发布身份；
2. 如何参加：名额、收费、报名是否审核、报名后参与方式、详细说明；
3. 确认提交：卡片预览、身份、参与方式、所有审核方。

草稿随时保存。提交时服务端重新验证，不信任客户端预览。

建议状态：

```text
DRAFT
  -> SUBMITTED
  -> IN_REVIEW
       -> CHANGES_REQUESTED -> DRAFT/RESUBMITTED -> IN_REVIEW
       -> APPROVED -> PUBLISHED
       -> REJECTED
PUBLISHED -> CANCELLED | ENDED | ARCHIVED
```

审核方按关联关系生成：

- 平台运营：所有活动必需；
- 组织管理员：以组织身份发布时必需；
- 空间管理员：使用受管空间时必需；
- 特殊内容或收费活动可追加风控审核。

所有必需审核通过后，活动才自动公开。任何审核方退回修改，活动进入 `CHANGES_REQUESTED`，必须保存结构化原因和可读说明。重新提交应创建新审核轮次，保留历史快照，不覆盖旧决定。

同一审核动作必须幂等。并发审核使用 `version` 或 `If-Match` 防止旧页面覆盖新结果。

### 7.2 报名、候补、付款与参与方式

建议状态：

```text
REQUESTED                 需发起人审核
APPROVED_AWAITING_PAYMENT 审核通过，等待付费
CONFIRMED                 免费已通过或付费已完成
WAITLISTED                名额不足进入候补
REJECTED
CANCELLED
EXPIRED                   超时未支付
REFUNDED / PARTIALLY_REFUNDED
```

流程组合：

- 免费免审：提交即 `CONFIRMED`；
- 免费需审：`REQUESTED -> CONFIRMED/REJECTED`；
- 付费免审：`APPROVED_AWAITING_PAYMENT -> CONFIRMED`；
- 付费需审：`REQUESTED -> APPROVED_AWAITING_PAYMENT -> CONFIRMED`；
- 满员：若开启候补则 `WAITLISTED`，否则不可提交。

占位策略必须明确。推荐在“审核通过等待付款”时短暂占位，并设 `payment_expires_at`；过期释放名额，必要时自动提升候补。所有容量修改在事务中完成，严禁仅通过“查询剩余名额后再写入”实现。

报名表至少包含称呼、参加理由以及隐私同意。用户微信号只有在明确勾选同意后才可分享给组织者。保存 `consent_version`、`consented_at` 和用途。

参与方式仅向满足条件的本人和授权管理员返回：

- 免费活动：确认报名后；
- 付费活动：支付成功后；
- 群二维码可以有失效时间和替换记录；
- 未获批、候补、已取消或退款用户不得继续读取；
- 管理员访问敏感参与信息必须写审计日志。

### 7.3 推荐、评论与关注

- 同一用户可以撤回推荐；重复提交应更新已有推荐而不是制造重复动态。
- 评论支持回复，删除采用软删除并保留审核证据。
- 关注关系唯一键为 `(follower_id, followee_id)`，禁止关注自己。
- “不看 TA 的动态”与取消关注是不同关系，分别建模。
- 举报进入独立内容安全流程，不直接通知被举报人。

## 8. 数据模型

以下为逻辑模型，字段可按技术栈调整，但语义和约束应保留。

### 8.1 账号与公开资料

```ts
interface User {
  id: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  wechat_openid: string | null;
  wechat_unionid: string | null;
  phone_e164: string | null;
  locale: "zh-CN" | "en";
  city_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_asset_id: string | null;
  bio: string;
  introduction: string;
  public_links: ProfileLink[];
  social_links: ProfileLink[];
  visibility: "PUBLIC" | "MEMBERS";
  version: number;
}
```

微信号属于敏感联系信息，不放在公开 `Profile` DTO 中。

### 8.2 城市、组织和空间

```ts
interface City {
  id: string;
  name_zh: string;
  name_en: string;
  timezone: string;
  enabled: boolean;
  sort_order: number;
}

interface Entity {
  id: string;
  type: "ORGANIZATION" | "SPACE";
  name: string;
  slug: string;
  city_id: string;
  introduction: string;
  avatar_asset_id: string | null;
  cover_asset_id: string | null;
  status: "ACTIVE" | "HIDDEN" | "ARCHIVED";
  version: number;
}

interface SpaceDetails {
  entity_id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  opening_hours: object | null;
  public_contact: string | null;
  capacity: number | null;
  facilities: string[];
}

interface EntityMembership {
  entity_id: string;
  user_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  permissions: string[];
  status: "INVITED" | "ACTIVE" | "REVOKED";
}
```

### 8.3 活动

```ts
interface Event {
  id: string;
  title: string;
  summary: string;
  description: string;
  city_id: string;
  initiator_user_id: string;
  organization_id: string | null;
  space_id: string | null;
  custom_venue_name: string | null;
  custom_address: string | null;
  campaign_id: string | null;
  lifecycle_status: EventLifecycleStatus;
  visibility: "PUBLIC" | "UNLISTED" | "MEMBERS";
  attendee_approval_required: boolean;
  waitlist_enabled: boolean;
  capacity: number | null;
  pricing_type: "FREE" | "PAID";
  price_minor: number;
  currency: "CNY";
  tags: string[];
  fit_description: string;
  cover_asset_id: string | null;
  version: number;
  submitted_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EventOccurrence {
  id: string;
  event_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
}
```

规则：结束时间必须晚于开始时间；付费活动金额必须大于 0；免费活动金额必须为 0；地点必须是 `space_id` 或完整自定义地点之一；发布身份必须是本人或本人有发布权限的组织。

### 8.4 审核

```ts
interface ReviewRound {
  id: string;
  event_id: string;
  round_number: number;
  event_snapshot: object;
  status: "OPEN" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
  created_at: string;
  completed_at: string | null;
}

interface ReviewRequirement {
  id: string;
  round_id: string;
  reviewer_scope: "PLATFORM" | "ORGANIZATION" | "SPACE" | "RISK";
  reviewer_entity_id: string | null;
  required: boolean;
  status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
  decided_by: string | null;
  reason_code: string | null;
  note: string | null;
  decided_at: string | null;
}
```

### 8.5 报名与支付

```ts
interface Registration {
  id: string;
  occurrence_id: string;
  user_id: string;
  status: RegistrationStatus;
  display_name: string;
  motivation: string;
  contact_share_consent: boolean;
  consent_version: string | null;
  consented_at: string | null;
  payment_expires_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

interface PaymentOrder {
  id: string;
  registration_id: string;
  provider: "WECHAT_PAY";
  provider_order_id: string | null;
  amount_minor: number;
  currency: "CNY";
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CLOSED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  idempotency_key: string;
  paid_at: string | null;
}

interface AccessGrant {
  id: string;
  registration_id: string;
  type: "GROUP_QR" | "ORGANIZER_WECHAT" | "ORGANIZER_WILL_CONTACT";
  encrypted_payload: string | null;
  visible_from: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}
```

### 8.6 社区内容与通知

```ts
interface FeedItem {
  id: string;
  type: "EVENT_RECOMMENDED" | "EVENT_REGISTRATION_ROLLUP" | "EVENT_UPDATED";
  actor_ids: string[];
  event_id: string | null;
  city_id: string | null;
  text: string | null;
  occurred_at: string;
  visibility: "PUBLIC" | "FOLLOWERS" | "CITY";
}

interface Notification {
  id: string;
  recipient_user_id: string;
  category: "ADMIN" | "EVENT" | "SOCIAL";
  type: string;
  title_key: string;
  body_key: string;
  params: Record<string, string | number>;
  target: { type: string; id: string } | null;
  read_at: string | null;
  created_at: string;
}
```

系统通知保存文案 key 与参数，由客户端或 BFF 按语言渲染，不要只保存一段中文字符串。

## 9. API 契约建议

### 9.1 通用约定

- 认证：微信登录换取服务端 session/JWT；客户端不得持有管理密钥。
- 返回体使用稳定错误结构：`code`、`message`、`details`、`request_id`。
- 写接口接受 `Idempotency-Key`；支付、报名、提交审核和审核决定必须强制要求。
- 更新资源携带 `version`，冲突返回 `409 VERSION_CONFLICT`。
- 删除默认软删除；媒体对象先上传后绑定。
- 金额使用最小货币单位整数，如 `3000` 表示 ¥30.00。

错误示例：

```json
{
  "error": {
    "code": "EVENT_CAPACITY_FULL",
    "message": "名额刚刚报满，可以加入候补。",
    "details": { "waitlist_available": true },
    "request_id": "req_01..."
  }
}
```

### 9.2 公开与发现

```text
GET  /cities
GET  /feed
GET  /people/recommendations
PUT  /following/users/{user_id}
DELETE /following/users/{user_id}
GET  /search?q=&city_id=&types=event,user,organization,space
GET  /events
GET  /events/{event_id}
GET  /events/calendar-weeks?city_id=&week_start=
GET  /campaigns
GET  /campaigns/{campaign_id}
GET  /entities/{entity_id}
GET  /entities/{entity_id}/events
GET  /entities/{entity_id}/members
```

`GET /events/{id}` 必须返回 `viewer_context`：是否可见、是否可报名、报名状态、是否能查看参与方式、是否可编辑、是否有审核权限。

### 9.3 发布与管理

```text
POST   /event-drafts
GET    /event-drafts/{draft_id}
PATCH  /event-drafts/{draft_id}
POST   /event-drafts/{draft_id}/media
DELETE /event-drafts/{draft_id}/media/{asset_id}
POST   /event-drafts/{draft_id}/submit
GET    /me/events?status=
POST   /events/{event_id}/clone
POST   /events/{event_id}/cancel
GET    /review-tasks
GET    /review-tasks/{task_id}
POST   /review-tasks/{task_id}/approve
POST   /review-tasks/{task_id}/request-changes
GET    /events/{event_id}/review-progress
```

草稿 PATCH 允许部分更新，但提交接口执行完整校验并返回所有字段错误：

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "details": {
      "fields": {
        "price_minor": "付费活动价格必须大于 0",
        "ends_at": "结束时间必须晚于开始时间"
      }
    }
  }
}
```

### 9.4 报名、支付与参与方式

```text
POST /events/{event_id}/registrations
GET  /me/registrations?status=
GET  /registrations/{registration_id}
POST /registrations/{registration_id}/cancel
POST /registrations/{registration_id}/approve       管理员/发起者
POST /registrations/{registration_id}/reject        管理员/发起者
POST /registrations/{registration_id}/payment-order
POST /payments/wechat/callback                       验签、幂等
GET  /registrations/{registration_id}/access
POST /payments/{payment_id}/refund                   授权角色
```

支付成功以服务端验签 webhook 为准，不信任客户端“支付完成”回调。回调可以重复到达，处理必须幂等。订单金额和报名关系从服务端读取，不接收客户端自由传入。

### 9.5 社区互动与消息

```text
PUT    /events/{event_id}/recommendation
DELETE /events/{event_id}/recommendation
GET    /events/{event_id}/comments
POST   /events/{event_id}/comments
POST   /comments/{comment_id}/replies
DELETE /comments/{comment_id}
GET    /notifications?category=
POST   /notifications/{notification_id}/read
POST   /notifications/read-all
GET    /notifications/unread-count
```

### 9.6 个人、组织和空间

```text
GET   /me
PATCH /me/profile
PATCH /me/preferences
GET   /users/{user_id}
POST  /users/{user_id}/mute
POST  /reports
PATCH /entities/{entity_id}
POST  /entities/{entity_id}/admins/invitations
PATCH /entities/{entity_id}/members/{user_id}
GET   /me/managed-entities
```

## 10. 权限矩阵

| 操作 | 普通成员 | 活动发起者 | 组织管理员 | 空间管理员 | 平台运营 |
|---|---:|---:|---:|---:|---:|
| 查看公开活动 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 创建个人草稿 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 以组织发布 | 仅获授权 | 仅获授权 | ✓ | - | ✓ |
| 编辑活动 | - | 自己的 | 组织活动 | 空间字段有限 | ✓ |
| 审核报名 | - | 自己的活动 | 组织活动 | 按授权 | ✓ |
| 审核组织关联 | - | - | ✓ | - | ✓ |
| 审核空间使用 | - | - | - | ✓ | ✓ |
| 查看参与者微信 | - | 获同意且相关 | 获授权且相关 | 默认不可见 | 合规授权 |
| 编辑组织/空间 | - | - | 对应组织 | 对应空间 | ✓ |
| 管理管理员 | - | - | Owner | Owner | ✓ |

服务端每次请求都重新校验角色和资源关系，不能只依赖前端隐藏按钮。角色撤销立即生效。高风险操作使用细粒度 permission，而不是只判断 `ADMIN`。

## 11. 隐私、安全与合规

- 微信 OpenID、手机号、微信号、群二维码和支付信息均按敏感数据处理。
- 联系信息加密存储，日志不得打印明文。
- 分享微信号需明确、可追溯、限定用途的同意；未同意时组织者不可见。
- 群二维码使用受权接口读取，建议短时签名 URL，禁止写入公开活动 DTO。
- 管理员读取参与者名单、导出名单、查看联系方式都记录审计。
- 上传文件验证 MIME、大小和内容；使用对象存储私有桶与安全转码。
- 所有支付 webhook 验签、防重放，并保存原始事件摘要供审计。
- 举报、屏蔽和账号停用不能泄露举报人身份。
- 账户删除采用法定留存与匿名化策略，支付和审核记录不可直接物理清除。

## 12. 搜索、筛选与推荐语义

### 12.1 日期边界

“本周”和“下周”使用城市时区，周一为一周开始，区间采用左闭右开 `[from, to)`。日历接口返回连续 7 天以及每天公开活动数，不返回完整活动可减少负载。

### 12.2 名额

`remaining = capacity - confirmed - active_holds`。审核中的申请是否占位必须由配置明确；默认不占位，审核通过等待付款才占位。`has_capacity` 由服务端计算。

### 12.3 推荐

推荐系统第一版可采用可解释规则，而非复杂模型：城市匹配、关注关系、共同活动、共同空间、共同推荐、最近活跃度。接口需返回理由类型和本地化参数，不返回敏感图谱细节。

## 13. 通知与异步任务

建议用事务 outbox 保证业务写入与通知事件一致。需要异步处理：

- 活动提交后生成审核任务并通知审核人；
- 审核全部通过后发布活动并通知发起者；
- 报名申请通知发起者；
- 报名结果、支付期限和活动提醒通知成员；
- 支付成功后确认报名和创建参与方式授权；
- 候补提升、活动更新或取消通知受影响成员；
- 动态合并与推荐成员离线计算；
- 过期支付占位释放。

事件必须有唯一 `event_id`、`occurred_at`、`aggregate_id` 和 schema version。消费者保证至少一次投递下的幂等。

实时性可先使用轮询/小程序消息；如使用 WebSocket/SSE，只推送失效提示和未读数，客户端仍通过标准 GET 拉取权威数据。

## 14. 双语实现

服务端维护：

- 城市等平台配置的中英文名称；
- 系统错误码对应的中英文文案；
- 通知 template key 与参数；
- 枚举的中英文展示字典。

不要把业务判断建立在中文文案上。例如使用 `FREE`，而不是判断字符串是否等于“免费”。日期展示由客户端根据 locale 和 timezone 生成；服务端提供准确时间和可选展示辅助字段。

## 15. 可观测性与运维

每个请求携带 `request_id`，关键业务记录 `actor_id`、资源 ID、旧状态、新状态和幂等键。至少监控：

- 活动提交、审核通过率和平均审核时长；
- 报名成功率、候补率、超时释放数量；
- 支付创建/成功/回调失败/退款率；
- 通知积压和发送失败；
- 5xx、鉴权失败、版本冲突和慢查询；
- 敏感数据访问异常。

日志中不得出现 token、OpenID 明文、微信号、群二维码、支付签名和报名理由全文。

## 16. AI Agent 实施纪律

后端 AI Agent 每次改动应遵循：

1. 先列出受影响的实体、状态机、接口和权限；
2. 数据库变更必须提供可回滚 migration，不直接修改生产表；
3. API 变更保持兼容，新增字段优先可选，删除字段走弃用周期；
4. 写入使用事务，跨服务使用 outbox/saga，不伪造分布式事务；
5. 不在控制器中散落状态判断，集中到 domain service/policy；
6. 为每个状态转换写单元测试，为报名容量、审核并发和支付回调写集成测试；
7. 不用测试数据替代权限校验，不把前端传来的角色视为可信；
8. 不擅自新增产品状态或改变文案语义；发现缺口时写入“待确认问题”；
9. 所有失败路径返回稳定错误码；
10. 提交前运行 migration、测试、静态检查和最小 API 冒烟测试。

## 17. 实施优先级

### Phase 1：可用闭环

- 用户登录、公开资料、城市和语言偏好；
- 城市、组织、空间、活动和场次；
- 发现列表、活动详情与统一活动卡片 DTO；
- 草稿、提交、多方审核、发布；
- 免费报名、需审报名、候补；
- 我的活动、我的报名、管理员待办；
- 基础消息与未读数。

### Phase 2：交易与社区

- 微信支付、退款、支付超时和参与方式授权；
- 推荐、评论、回复、关注、动态；
- 推荐成员与动态合并；
- 系列管理、媒体处理和搜索。

### Phase 3：治理与扩展

- 举报、屏蔽、风控和内容审核；
- 多场次、重复活动和更完整的日历；
- 数据导出、精细权限、运营后台；
- 通知偏好、隐私中心、数据删除流程。

## 18. 联调与验收清单

### 18.1 活动展示

- [ ] 所有卡片形态都显示 `发起者：个人 & 组织/品牌` 和 `地点：地点名`。
- [ ] 卡片不返回或展示发起者头像；详情返回并展示。
- [ ] 免费、付费、满员、有名额、已报名状态一致。
- [ ] 同一活动在动态、发现、系列和我的页面的数据一致。

### 18.2 发现筛选

- [ ] 日期、地点、标签可组合筛选。
- [ ] 日历每次只返回/展示 7 天，左右箭头切换周。
- [ ] 周和月跨界、城市时区和夏令时边界测试通过。
- [ ] 无结果可清除筛选，翻页不重复不漏项。

### 18.3 发布与审核

- [ ] 草稿离开页面后不丢失。
- [ ] 无组织权限不能以组织身份提交。
- [ ] 使用受管空间会生成空间审核任务。
- [ ] 多方全部通过才公开；退回后保留原因和历史轮次。
- [ ] 重复提交或重复审核不会产生重复任务或重复通知。

### 18.4 报名与支付

- [ ] 并发抢最后一个名额不会超卖。
- [ ] 免费/付费与免审/需审四种组合均通过。
- [ ] 候补提升和付款超时释放正确。
- [ ] 支付回调重复、乱序和延迟到达均保持正确状态。
- [ ] 未确认或未付款用户不能读取群二维码和联系人。
- [ ] 取消、退款后访问权限及时撤销。

### 18.5 权限与隐私

- [ ] 普通成员无法调用管理员接口。
- [ ] 组织管理员不能审核无关空间，空间管理员默认看不到参与者微信。
- [ ] 联系信息只在有效同意和业务关系下返回。
- [ ] 敏感访问与管理动作都有审计记录。

### 18.6 双语与消息

- [ ] 中文、英文错误和通知都由同一错误码/template key 生成。
- [ ] 用户内容保持原文，系统文案可切换。
- [ ] 未读数跨设备一致，“全部已读”真正落库。

## 19. 原型种子数据

为方便前后端联调，可准备以下非生产 seed：

- 成员：Jiang、阿乔、Shing、毛毛、宁宁；
- 组织：Sola 放映组、706 产品小组、飞盘散人局；
- 空间：706 青年空间、M50 创意园门口、徐汇滨江草坪；
- 活动：秋日放映、苏州河慢走、社区功能许愿工作坊、傍晚飞盘；
- 系列：`我们为什么留在这里？`；
- 覆盖状态：付费需审、有名额免费、满员候补、审核中草稿。

Seed 只用于本地和测试环境，ID 不得被正式业务逻辑依赖。

## 20. 待产品确认但不阻塞基础实现的问题

1. 报名申请在等待发起人审核期间是否占用名额；本手册默认不占。
2. 活动取消和退款的统一规则由平台定义还是由发起者逐场定义。
3. 候补提升后付款期限，以及是否允许发起者手动调整顺序。
4. 一个活动是否允许多个场次、多个地点或多个组织共同发起。
5. 组织管理员与空间管理员查看参与者联系方式的最小权限范围。
6. 推荐、报名动态默认公开到关注者、同城还是所有成员。
7. 英文是否只翻译系统界面，还是未来允许活动内容提供双语版本。

在这些问题确认前，使用配置项和可扩展字段，不要把临时答案写死在数据库约束中。

## 21. 完成定义

后端不以“接口能返回数据”为完成。一个功能只有同时满足以下条件才算完成：

- 状态机、权限、并发和幂等行为明确；
- 正常、空、错误和权限变化路径均可被前端表达；
- 中文与英文系统文案有稳定 key；
- 敏感数据最小化返回并有审计；
- 单元、集成和关键端到端测试通过；
- API 文档、migration、监控指标和回滚方案齐全；
- 与本手册中的页面交互和验收清单完成联调。

