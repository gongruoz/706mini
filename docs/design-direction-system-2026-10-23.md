# 706 全局设计系统：审查与组件化方向

日期：2026-10-23。范围：以「关注／发现」的现有信息组织和视觉风格为母体，检查整个原生小程序。本文是本轮方向与迁移规格，不代表全站组件迁移已经完成。

**本轮已确认的取舍：块面为主，取消装饰描边。** 用户已确认。导航选中项、搜索按钮、普通操作按钮不以黑色轮廓建立层级；输入、焦点、错误、必要分隔和拖动落点可以使用有语义的线。

**实现现状必须区分：**返回按钮已落为独立原生 `ui-icon-button`；导航和搜索的装饰轮廓已移除。其余下文组件、状态和迁移规范是待实施规格，不能把共享 class 或共享模板称为已完成的组件库。

## 1. 审查范围与证据

本轮阅读了 `app.json` 的全部 42 路由、共享 screen/sheets 模板、theme、四份主要样式、导航几何、演示目录、表单和页面控制器的交互分支。源码逐项清单在 `design-system-inventory-2026-10-23.json`，保留了位置、条件、操作目标、反馈和无障碍字段。

局部修正前的静态快照：

| 项目 | 观察 | 含义与限制 |
| --- | --- | --- |
| 页面 | 42 路由 | 这是路由数，不是视觉状态数 |
| 交互声明 | 230 处 | 包括表单原生控件；循环和条件按源码声明计数，不是运行时按钮数 |
| 原生 button | 169 处 | 大多数仍直接在共享大模板中编排，缺少封装的语义 API |
| 非 button 的 tap 声明 | 19 处 | 仅 3 处显式设 role；不能据此推断所有其余节点都无法被辅助技术操作，但需要逐项语义核查 |
| button 显式 hover-class | 2 处 | 其余可能有原生默认反馈；问题是反馈未统一，并非完全没有反馈 |
| 原始圆角／字号值 | 34／37 种 | 包含 token、旧规则、组合值与被覆盖声明；不是计算后的有效视觉数量 |
| 样式来源 | app → editorial → community，另有导航样式导入 | 同一角色靠顺序和高优先级覆盖，多次修改无法稳定收敛 |
| 演示目录 | 118 入口、39 种路由、12 种 sheet 入口 | 缺少 manage/create-space/review-lab 的目录入口；20 种 sheet 中另有 8 种不在现有 sheet 入口清单 |

证据入口：

- `miniprogram/styles/editorial.wxss`：`.primary/.small/.secondary`、`.chip`、`.member-row`、`.sheet`、`.form-actions`、禁用/焦点规则与多轮页面覆盖。
- `miniprogram/styles/community.wxss`：关注／发现的生效编排、关注按钮、活动邀请卡、筛选与搜索。
- `miniprogram/custom-tab-bar/index.wxss`：当前共享导航／活动底栏的胶囊外壳。
- `miniprogram/templates/screen.wxml`：按钮、可点击卡片、列表、原生控件和状态页。
- `miniprogram/templates/sheets.wxml`：20 种自绘弹层分支。
- `miniprogram/lib/page.js`：提交、关闭、取消、权限、原生支付/图片/确认框与键盘逻辑。
- `scripts/verify-community-navigation.cjs`：此前直接锁定搜索和导航的旧描边字面值；测试也必须迁移到新规则，避免替过期外观背书。

## 2. 从关注／发现提炼出的共同语法

保留的是一套阅读和交互秩序，而非复制某一张截图里的每个边框。

1. **画布提供节奏，白色面承载内容。** 正文页不靠层层嵌套的卡片和描边建立结构；一组内容有一个外壳，内部用对齐、间距和少量分隔。
2. **黄色表示当前值得注意的行动或所在位置。** 它不承担所有“可点击”的提示，更不表示所有业务状态都成功。
3. **文字层级来自信息角色。** 同样的人名、标题、注记、操作，在不同路由不改变字号来补救布局。
4. **线稿图标是一套语言。** 不混用文字箭头、emoji、系统符号和本地图标。
5. **媒体保留原始色彩。** 媒体和品牌素材不受 UI 色板限制，但周围壳体受系统约束。
6. **可点击不等于按钮化。** 打开内容的卡片、修改条件的筛选、只读状态标签和提交操作必须可以辨认。
7. **同一角色共用组件和状态机。** 页面只决定内容、权限、目标和组合，不决定圆角、描边、字号、按下效果。
8. **平台几何与设计令牌并存。** 微信菜单、状态栏、键盘、安全区尺寸来自运行时；不能用固定 rpx 伪装成所有设备都一致的几何。

## 3. 已确认的描边、色彩与材质规则

### 3.1 每种线都必须有解释

| 场景 | 决定 | 不再出现的做法 |
| --- | --- | --- |
| 主操作 | 黄色填充、深色字、无装饰描边 | 黄色按钮一圈黑线而同类按钮无边 |
| 次操作 | 画布上白色填充；白色容器内浅灰填充，无装饰描边 | 在白色卡内放白色按钮，再临时加一圈线补可见性 |
| 导航胶囊外壳 | 半透明白面、共享模糊和轻阴影，无可见轮廓 | 另一套灰线、黑线和页面专属阴影 |
| 导航选中项 | 黄色块面、深色图标和字，边界不跳动 | 黑描边强调当前 tab |
| 搜索框／搜索执行键 | 白色搜索面；内部图标动作无独立描边和小阴影 | 输入面里面再嵌一个带轮廓的小按钮 |
| 输入框 | 白底、细灰线；聚焦深线；错误红线并有文字 | 用胶囊按钮样式作为输入框 |
| 筛选与分段选择 | 白／浅灰未选，深色实底白字已选，无边 | 每个页面自定黄选中、黑选中、描边选中 |
| 表单 checkbox/radio | 保留原生选中标记；用统一深色 | 为追求全无边而破坏原生未选状态的辨认 |
| 卡片与列表容器 | 白面、无描边、无普通阴影 | 白卡套白卡，每层再加线 |
| 列表内部 | 只有连续记录或分组确实需要时使用灰分隔 | 每一个小块都描一圈 |
| 聚焦、错误、拖动落点 | 深色焦点线／红色错误线／深色虚线落点 | 将这些状态线作为常态装饰 |
| 图片白边 | 活动邀请卡保留现有 6rpx 白色留边 | 把媒体留边误认为按钮描边而取消 |

### 3.2 色彩职责

| 令牌 | 现值 | 只用于 |
| --- | --- | --- |
| canvas | #F5F5F2 | 页面画布 |
| surface | #FFFFFF | 内容面、画布上的次操作 |
| ink | #232323 | 正文、图标、深色选择态 |
| muted | #6B6B66 | 次要说明、只读弱状态；不能把可执行主操作也做成辅助字 |
| accent | #FFE568 | 主操作、关注的执行态、当前导航位置 |
| accentSoft | #FFF7CC | 低强调的只读提示／图标底；不作为另一种可随意使用的主按钮 |
| control | #EFEFEB | 禁用底、白容器内次操作、只读标签底 |
| line | #DDDDD7 | 输入、分隔、手柄；不是所有组件的默认边 |
| danger | #A34035 | 错误、破坏性确认及其文字 |
| navigationSurface | rgba(255,253,248,.84) | 仅叠在内容上的导航／操作外壳 |

`infoSoft/sage/lavender` 等旧命名现已指向中性色；迁移时逐一映射到 statusSurface/statusInk 等语义别名，再移除无调用的历史命名，不再因页面需要临时新增“某某灰／某某黄”。新状态优先采用图标和文案，不增加一套绿、紫、蓝的状态色。

### 3.3 材质和层级

- 内容层：无模糊，无阴影；用画布与白面分组。
- 悬浮层：导航胶囊与活动操作胶囊复用同一个 `FloatingBar` 背景，模糊 18px、同一透明度与轻阴影；不复制成两个实现。
- 顶部返回浮钮：复用 `IconButton` 的 glass 变体，独立正圆；正文区普通图标按钮用实白或无底变体。
- 弹层：白色实面，上角 48rpx，独立遮罩；不能把正文玻璃化。
- 系统层：微信支付、授权、相册、原生日期/时间选择、图片预览、系统确认框保持原生。设计系统管调用入口和返回后的反馈，不仿制系统窗口。

## 4. 几何、文字与图标

### 4.1 几何不能按页面调

| 角色 | 规则 | 原因 |
| --- | --- | --- |
| 普通内容面 | 32rpx | 延续关注／发现白卡 |
| 活动邀请卡 | 外角44、海报角38、白边6rpx | 外角由内角+白边推导，保留已建立的邀请卡身份 |
| 输入／内嵌回复面 | 24rpx | 小一级的信息面，不另设20/26/28等近似值 |
| 按钮／筛选／导航选择项 | 最大胶囊 | 仅此类可自由拉长；不用于长篇内容卡 |
| 头像／图标按钮 | 正圆 | 同一可见宽高，不能由 glyph 和 padding 决定形状 |
| 弹层 | 上角48rpx，下角随视口 | 属于覆盖层，区别于内容卡 |
| 全屏图集 | 直角贴边 | 图片从 y=0 开始，不能再套内容卡圆角 |
| 缩略图 | 24rpx | 与输入/次级面同级；若保留特殊媒体角，应成为 MediaTile 的明确变体 |

点击区域统一以 44 CSS px 为最低目标；可见面可以更小。例如返回钮的可见直径跟随 `menuHeight`（常见32px），外部点击区独立为44px。缩小文字或圆面不缩小点击区；扩展的点击区不得覆盖相邻控件。

常规页边32rpx；导航外沿20rpx由已有 token 管理。内部文本/图标间8或12、同组操作间16、行内信息间24、卡片间32、栏目间56、动态帖间88rpx。每个间距由组件的语义 token 选择；不能页面随手取一个倍数。4rpx是排印/细节子单位，不代表可以给每个页面任意配 spacing。

### 4.2 字体角色

| 角色 | rpx / 字重 | 用途 |
| --- | --- | --- |
| pageTitle | 40 / 600 | 页面内容主标题；活动内容标题可用700变体，不再出现48/44临时修正 |
| eventTitle | 34 / 700 | 关注、发现及其他列表中的活动邀请卡标题 |
| sectionTitle | 32 / 600 | 活动介绍、适合谁参加、时间与地点等同级栏目 |
| body / identity | 28 / 400或600 | 正文400，人名600 |
| actionLabel | 28 / 500 | 标准主次操作，同尺寸不因主次改变字号 |
| compactAction / fact | 24 / 500或400 | 紧凑操作500，活动事实400 |
| meta / tabLabel | 22 / 400或500 | 时间说明、辅助信息、导航文字；当前导航可600 |
| statusLabel | 20 / 400 | 只读状态和短标签，不用于长篇说明或主要操作 |

正文行高1.7；栏目和标题1.3–1.4；控件文案1.5，允许英语自然换行并增高。中英使用同一个组件与字号，不允许“英文页专属小一号”作为布局补丁。

### 4.3 图标

沿用32单位画板、2单位圆头描线的本地图标，图像导出96px。`back/close/search/check/share/upload/link` 直接使用映射，不再把 `‹ › ⌄`、emoji 作为 UI 控件图标。装饰性几何和媒体不属于这一限制。

图标大小跟随角色：独立控件32rpx、行内28rpx、事实行使用事实图标变体、导航46rpx。已有邀请卡事实图标23rpx属于卡片紧凑事实角色，应被命名为 `eventFactIcon` 而非留在页面内写值。禁止为了某条文案单独变动图标大小或 y 偏移；光学校准集中在图标组件。

## 5. 按钮与可点击组件分类

“主次”表示当前决策区里的优先级，不表示业务对象的重要程度。

| 类型 / 组件 | 执行的事 | 外观与放置 | 状态及约束 |
| --- | --- | --- | --- |
| Button / primary | 报名、付款、下一步、发送、保存 | 黄色胶囊；标准28字；同区最多一个 | loading保留主操作身份，阻止重复提交；普通disabled才转中性 |
| Button / secondary | 推荐、分享、再次发起、导出 | 画布上白，白面内浅灰；无边 | 不因“能点击”也涂黄色；与primary同高同字号 |
| Button / text | 取消、存草稿、重置、收起、低优先级返回 | 无底深色字，非说明灰；44px点击区 | 不加任意下划线；真正正文外链由 TextLink 承担 |
| Button / danger | 删除、取消活动、撤销管理权 | 普通入口红字无底，危险确认页才红底白字 | 说明影响范围并确认；不得与primary一起涂黄 |
| IconButton | 返回、关闭、搜索执行、删除图片、翻页 | 可见面正圆，独立44px点击区；surface/plain/glass | 只有有标签的无文字按钮；通过组件命名和图标确定动作 |
| FollowControl | 关注成员／空间、已关注 | 未关注黄；已关注浅灰深字；统一紧凑可见面和44px点击区 | pending锁定，失败还原；取消关注沿用原生确认入口 |
| FilterChip / SegmentedControl | 时间、空间、免费/有名额、消息分类、列表阶段 | 未选白/浅灰，已选深底白字；无装饰边 | 单选/多选语义显式；不是执行提交的primary |
| NavigationItem | 切换四个主入口 | 当前黄，其他透明；共享外壳；同一位置和尺寸 | 当前态、按下态分开；切换中不抖动、不缩放 |
| ActionRow | 打开一个对象或一个设置 | 标题/说明/右箭头；整个行可点；可选前导图标／头像 | plain/grouped两种容器语境；没有导航不画箭头 |
| ToggleRow / ChoiceRow | 修改一个偏好、选择城市或语言 | 文本+当前值/原生开关/勾选；同一布局 | 有状态才显示状态；不是伪装的 ActionRow |
| EventCard | 打开活动；媒体可以独立预览 | 保留邀请卡样式；不加整卡黑边 | 主点击区和图片预览分离，事件不冒泡导致两个动作 |
| PersonCard / EntityCard / SeriesCard | 打开对象，内含可选关注按钮 | 各有内容模板，共用Surface/Identity/ActionRow原语 | 内部关注与外层打开分离；按压反馈属于被点击的目标 |
| StatLink / ParticipantSummary | 打开参与者、关注/粉丝等集合 | 数字/头像/说明与可选箭头；共享点击面 | 无公开数据有清晰空态；不能借用管理名单接口 |
| TextLink | 正文里打开公开资源或复制链接 | 深色字、上下文明确；实际外链按文本链接规则 | 不用button的胶囊或只读meta模拟可操作性 |
| CalendarDay / CalendarEvent | 选择日期、打开日程 | 选择态属于日历，底层复用Selection语义 | 日期/事件各自点击；跨午夜/重叠不改变字体体系 |
| MediaTile / MediaPicker | 选择、预览、删除、长按排序图片 | 共用缩略图、封面标签、独立删除圆钮 | 上传中锁定冲突操作，失败可重试，取消拖动不重排 |
| StatusBadge / Tag | 只读状态／主题词 | 中性小字，低强调底；不做按钮式边框 | 无hover、无点击语义；真的能筛选时必须换成FilterChip |
| StepIndicator | 表单当前步骤、完成步骤 | 小圆数字/勾选+说明 | 只读时不长成按钮；可回到已完成步骤时显式支持点击 |

### 5.1 Button API 的约束

建议公共 API：`variant=primary|secondary|text|danger`，`size=standard|compact`，`context=canvas|surface|floating`，`loading`、`disabled`、`block`、`icon`、`label`、原生 `open-type` 与标准操作事件。页面不能传任意 `radius/color/fontSize/border/shadow`。

原生 `open-type=share` 必须保留真实 button。封装需转发平台事件；不能把分享改成普通 tap 后假装支持原生分享。`loading` 也不是按钮外面临时画一个转圈。

`IconButton` 独立于文字按钮：圆形、图标、点击区和 label 都由组件管理，避免把文字按钮缩成“小圆”产生椭圆。本轮已实现 `ui-icon-button` 的返回用途；关闭、搜索、翻页、图片删除仍需逐一迁移。

### 5.2 状态优先级

| 状态 | 视觉与行为 |
| --- | --- |
| 默认 | 由variant/context决定，不由路由决定 |
| pressed | 单一140ms反馈；浅底变化或内容透明度，不缩放卡片，不改变描边粗细 |
| selected / following | 使用所属组件的选择/关注态，和pressed分开 |
| loading | 保留文案和宽度、显示进度，拦截再次提交；辅助关闭按钮也按流程锁定 |
| disabled | 中性底/中性字；有必要时在附近解释原因；无按压反馈 |
| focus | 字段深色细边；可键盘操作的独立控件使用共享焦点反馈，不能依赖hover |
| error | 错误靠近字段/操作，保留输入和上次成功内容；错误色不扩散到整页 |
| success | 文案和图标说明已完成哪一步；不把“已送审”显示成“活动已公开” |
| unauthorized | 不呈现没有权限的管理动作；登录承接有返回目标；禁止闪现敏感内容 |

## 6. 容器、导航与页面组合

建议组件目录分三层，外加一层状态模型：

- **原语**：`ui-button`、`ui-icon-button`、`ui-text`、`ui-icon`、`ui-surface`、`ui-badge`、`ui-field`、`ui-selection`。
- **组合组件**：`action-row`、`identity-row`、`follow-control`、`event-card`、`comment-thread`、`media-picker`、`status-panel`、`step-indicator`。
- **页面壳体**：`page-chrome`、`floating-bar`、`bottom-sheet`、`form-layout`、`result-layout`。
- **状态模型**：`event/registration/review` 只提供文案、权限、下一步和所用状态语义，不能输出页面专属颜色或CSS。

组件可用原生 Component 或明确的只读模板；有交互、嵌套操作、状态和点击拦截的组件优先使用原生 Component。只读的小片段可以是模板，不能只有一个 class 却叫做组件。

### 6.1 PageChrome

- 主入口延续现有布局；子页面顶部透明，无整块不透明安全区。
- 有顶图的活动页从 y=0 开始；返回按钮浮在媒体上；去掉「活动」导航标题。
- 无顶图的页面为文字与返回留出实际控件避让，透明不等于把输入框塞在微信胶囊下面。
- 返回可见圆面跟随原生菜单高度，外部点击区44px；图标来自同一家族。
- 首屏/滚动后均使用同一组件，不根据截图临时改变位置。
- `app.json` 当前未开启 native tabBar；`custom-tab-bar` 目录保留另一份 WXML/控制器，而 screen 内有实际共享导航。迁移时收敛成唯一使用中的导航组件，不能只让两份代码恰好共用CSS。

### 6.2 FloatingBar

- `NavigationBar` 与 `EventActionBar` 组合相同 `FloatingBar`，后者内部是次操作+主操作。
- backdrop、渐隐、安全区、胶囊、阴影、外沿和层级只定义一次。
- 活动底栏默认推荐1份宽、参与流程2份宽；长英文可增高，不能缩小文案或裁切。
- 表单操作栏复用 ActionGroup/安全区策略，白色表单页不用机械套一个“媒体玻璃胶囊”；是否玻璃取决于悬浮上下文，由壳体变体决定。
- 键盘打开时退出浮动或使用共享键盘避让；不同时出现全局导航、表单提交栏、弹层提交栏三层操作。

### 6.3 内容组件

- `Section` 只定义标题、说明、内容间距；“活动介绍／适合谁／时间地点”同级同格式。
- `Surface` 定义白面和32rpx圆角；页面不套白面来修补某个文字的行高。
- `ActionRow` 在独立卡片、分组菜单和弹层里仍是同一布局，仅由container语境改变外边距/分隔。
- `CommentThread` 同时用于详情和评论弹层：身份行→正文→内嵌回复→右侧低优先级操作；不保留两套不同的回复缩进。
- `StatusPanel` 承载报名、付款、审核和提交结果：标题→准确状态→下一步→可选次操作，状态文本由业务模型提供。

## 7. 全部42路由的迁移映射

以下“待迁移”是源码审查结论，不是说其所有状态已经目视验证。

| 路由 | 页面/状态重点 | 必须收敛到的组件 |
| --- | --- | --- |
| feed | 动态、推荐成员、换几个、关注/已关注、作者入口、发布 | PersonCard / FollowControl / EventCard / IdentityRow / IconButton / NavigationBar |
| discover | 城市、搜索、专题轮播、日历入口、筛选、结果空态 | SearchField / FilterChip / FeatureCarousel / ActionRow / EventCard / EmptyState |
| messages | 分类、时间分组、未读/已读、待处理/普通通知 | SegmentedControl / NotificationRow / Badge；不能靠描边决定是否待处理 |
| me | 身份、统计、菜单组、开发者、退出 | IdentityRow / StatLink / MenuGroup / ActionRow / Button-danger |
| manage | 无权限/有权限、创建空间、管理对象 | PermissionState / ActionRow / EntityRow |
| create-space | 最小表单、校验、保存、失败回显 | FormLayout / Field / Button / ResultLayout |
| event | 顶图、无图、报名状态、推荐、评论、权限管理 | PageChrome / MediaCarousel / Section / ParticipantSummary / EventActionBar / CommentThread / MenuGroup |
| member | 本人/他人、关注、分享、更多、统计、活动历史 | IdentityHeader / FollowControl / ActionGroup / StatLink / EventCard |
| space | 关注、分享、管理、负责人、公众号、回顾、活动、成员 | EntityHeader / FollowControl / ActionRow / EventCard / IdentityRow |
| org | 与space相同角色，内容不同 | 同一EntityHeader和组合，不另立圆角/按钮规则 |
| entity-events | 全部活动、分页、空态 | EventCard / LoadMore / EmptyState |
| entity-members | 成员行、关注、空态 | IdentityRow / FollowControl / EmptyState |
| edit-entity | 编辑资料、表单与保存 | FormLayout / Field / MediaPicker / Button |
| admins | Owner/管理员、邀请、撤权 | IdentityRow / RoleBadge / Button / DangerConfirm |
| edit-profile | 头像、文本、兴趣、链接、保存 | FormLayout / AvatarPicker / Field / SelectionGroup / LinkList |
| relations | 关注/粉丝切换、列表关注、自己 | SegmentedControl / IdentityRow / FollowControl |
| onboarding | 3步骤、兴趣、可选空间、同意、欢迎结果 | StepIndicator / FormLayout / SelectionGroup / ConsentRow / ResultLayout |
| calendar | 周/月、左右切换、日期选择、日程、海报生成 | CalendarControls / CalendarDay / CalendarEvent / IconButton / ExportState |
| spaces | 同城/已关注、目录封面卡、空态 | SegmentedControl / EntityCard / EmptyState |
| campaign | 封面、介绍、资料包、活动、分享与管理 | SeriesHeader / ActionRow / EventCard / ActionGroup |
| campaign-edit | 已公开编辑/草稿、封面、选活动、提交审核 | FormLayout / MediaPicker / ChoiceRow / ActionGroup / StatusPanel |
| campaign-create | 三步创建、选活动、预览、结果 | StepIndicator / FormLayout / ChoiceRow / ResultLayout |
| campaign-approval-detail | 平台/关联发起人身份、退回、通过 | ReviewPanel / ActionRow / ActionGroup / BottomSheet |
| campaign-review-progress | 各方进度、退回说明、重新提交 | StatusPanel / TimelineRow / Button |
| event-access | 待审、候补、待付款、已确认、拒绝、取消、过期、退款返回 | RegistrationStatusPanel / NextStep / AccessRow / ActionGroup |
| activity-preview | 草稿、受限可读、顶图、事实、公开预览 | EventDetail同一组件树；不新增动作或泄露参与方式 |
| publish | 3步、自动草稿、多选/上传/拖动、预览、送审结果 | FormLayout / MediaPicker / StepIndicator / EventCard / ResultLayout |
| approvals | 待办/已处理、空态 | ReviewRow / SegmentedControl / EmptyState |
| approval-detail | 身份/内容/各方审核、退回/通过、无权 | ReviewPanel / ActionGroup / PermissionState |
| approval-progress | 未提交、审核中、退回、通过 | StatusPanel / TimelineRow / Button |
| registrations | 阶段筛选、状态、活动、查看报名 | FilterChip / RegistrationCard(EventCard+StatusPanel) |
| my-events | 阶段筛选、管理、继续编辑、再次发起 | FilterChip / EventCard / ActionGroup；个人状态不混成活动状态 |
| drafts | 编辑步数、继续编辑、预览、无草稿 | DraftRow / EventCard / Button / EmptyState |
| following | 与relations同一关注切换和列表 | SegmentedControl / IdentityRow / FollowControl |
| more | 城市/语言/通知/关于/反馈/退出 | MenuGroup / ActionRow / ToggleRow |
| login | 手机/邮箱、发码、已发送、校验、微信登录、失败 | AuthForm / Field / Button / InlineNotice |
| attendees | 公开与管理权限、待审核/已确认、签到、联系 | RegistrationRow / StatusBadge / ActionGroup / ContactPanel |
| invitations | 待接受、已处理、空态 | InvitationRow / Button-primary / StatusBadge |
| my-campaigns | 草稿/审核/公开、编辑/进度 | SeriesCard / StatusPanel / ActionGroup |
| privacy | 公开记录/可见性设置、长文 | ToggleRow / MenuGroup / Prose |
| feedback | 编辑、确认、发送、成功、失败 | Field / BottomSheet / Button / InlineNotice |
| review-lab | 演示/真实模式、身份、目录、重置 | MenuGroup / ChoiceRow / NativeConfirm；开发工具也使用同一组件语法 |

## 8. 20种弹层与原生承接，不只查主页面

| sheet | 类型 | 统一规则及待修点 |
| --- | --- | --- |
| register | 决策表单 | 事件摘要→字段→隐私/联系同意→唯一报名CTA；候补/需审文案准确；失败保留输入 |
| recommend | 编辑提交 | 编辑推荐内容、唯一发布CTA、取消为文字；未发内容关闭确认 |
| comment | 阅读+回复编辑 | 共用CommentThread；明确回复对象；输入与提交不被键盘遮住 |
| participants | 只读列表 | 共用IdentityRow；总数与可展示人数分开；不把“取消”当成阅读完成动作 |
| payment | 决策确认 | 金额、活动、说明、唯一付款CTA→原生支付；失败/取消回到准确待付款状态 |
| group | 只读参与方式 | 统一AccessRow/二维码/复制按钮；完成/关闭，不用取消式文案 |
| return | 编辑提交 | 审核意见字段、必填错误、唯一发送修改意见CTA；不把退回等同删除 |
| city | 单选列表 | ChoiceRow+勾选；切换时保留现有内容，失败可解释；不画另一套选择卡 |
| language | 单选列表 | 与city同一ChoiceRow；语言立即更新，不增加一套按钮圆角 |
| notifications | 偏好修改 | ToggleRow+原生switch，说明与状态一致；保存失败复原 |
| mini | 导航菜单 | MenuGroup / ActionRow；箭头统一图标 |
| about | 只读说明 | Prose / Close；无多余底部取消 |
| manage | 权限内导航菜单 | ActionRow与正文管理入口一致；无权限不渲染 |
| member | 导航+风险动作菜单 | 复制链接、屏蔽、举报按语义分组；风险项红字与确认，不全涂黄色 |
| why | 只读说明 | 图标/标题/正文；完成/关闭，无提交CTA |
| poster | 媒体预览+保存 | 海报加载、失败、重试、保存到相册与权限返回；同一主次操作组 |
| official | 外部能力承接 | 失败说明/演示说明、可复制账号；没有可执行动作时不做假按钮 |
| recap | 外部内容承接 | 共用外部预览面，与official相同失败/返回语法 |
| invite | 编辑提交 | 成员ID字段、唯一邀请CTA、错误和已发送反馈 |
| report | 编辑提交 | 举报原因、确认发送、成功/失败反馈；与feedback入口共用FormSheet，不额外造一套确认页 |

现有118演示入口显式覆盖的sheet为 register/comment/recommend/mini/city/language/manage/member/why/payment/group/return；新增清单需补 participants/poster/official/recap/notifications/about/invite/report。

**原生承接清单**：取消关注ActionSheet、放弃未发送内容Modal、取消活动/报名/撤权Modal、原生付款、选择相册/相机、图片预览、日期/时间picker、保存海报权限、复制成功Toast、发送验证码后的反馈。统一它们的发起入口、动词、后续状态与回到原上下文的逻辑；不要求原生窗口改成自绘样式。

## 9. 过渡状态验收矩阵

所有有数据/有动作的组件必须明确适用状态；不适用项写清楚，不为了凑状态机械增加UI。

| 流程 | 必须检查的细分状态 | 组件要求 |
| --- | --- | --- |
| 页面加载 | 首次加载、内容刷新、刷新失败、无数据、分页中/失败/结束 | 初载骨架匹配结构；刷新保留内容；重试属于同一组件，不跳出一套黄色大卡 |
| 搜索 | 未输入、输入中、提交中、有结果、无结果、失败、清空 | SearchField统一；“清空”不与“执行搜索”混用同图标；结果角色保留 |
| 关注 | 未关注、已关注、取消确认、提交中、失败 | 所有出现点共用FollowControl；不出现页面刷新闪回未关注 |
| 筛选 | 默认、单选/多选、无结果、清空、横向滚动 | 同一Selection语法；文字标签和筛选项可区分 |
| 图片 | 未选、多选、上传中、部分成功、失败、超限、删除、拖动、取消拖动、封面变化 | 进度/失败是MediaTile状态；轮播/预览顺序与草稿一致 |
| 发布 | 每一步、校验错误、保存草稿中/成功/失败、预览、提交中、已送审 | 固定栏与键盘统一；最后一步不新增按钮语法；已送审不冒充已发布 |
| 报名 | 可报名、需审核、满员可候补/不可候补、结束、取消、未登录 | EventActionBar输出准确可用动作；推荐始终是另一种社交动作 |
| 报名结果 | 待审、候补、待付款、付款中/取消/失败、确认、拒绝、过期、取消/退款 | StatusPanel图标和下一步准确；隐私内容只在授权后可见 |
| 审核 | 待处理、通过中、退回编辑、错误、全部通过、部分退回、无权 | ReviewPanel与ActionGroup复用；不同审核身份不另设配色 |
| 弹层 | 打开、阅读、编辑、键盘、提交、失败、关闭、放弃确认 | 不双重展示底层错误；提交中关闭锁定；成功内部关闭不再次确认 |
| 邀请/管理 | 待邀请、发送中、接受、重复/失效、撤权、角色变更、无权 | 和其他任务采用相同状态骨架，不用原始list-card临时拼操作 |
| 外部承接 | 可打开、不可打开、演示、可复制、复制成功、系统返回 | NativeHandoff/ExternalPreview一致；没有真实数据不画假成功 |

所有适用状态检查中英、短/长文、最窄支持视口、常用视口、不同安全区、正常/放大文字；模糊不支持时半透明底仍保证可读。开发工具目视、离线逻辑和真机验证分别记录，互不替代。

## 10. 发现的问题与迁移优先级

| 编号 | 证据/现象 | 处理 |
| --- | --- | --- |
| DS-01 | 返回钮宽56rpx、高menuHeight，字形‹和padding决定视觉 | 本轮已替换为ui-icon-button：同一size决定圆面宽高，图标资源，独立点击区 |
| DS-02 | 导航壳、选中tab、搜索键分别有不同描边/小阴影 | 用户已选块面方向；本轮已去掉导航/搜索装饰轮廓 |
| DS-03 | `.primary/.small`底色、边框在多层规则中反复改写 | P1：Button语义API和context变体；停止页面覆盖 |
| DS-04 | 关注控件在推荐卡、成员列表、成员主页、空间各自实现 | P1：单一FollowControl；取消确认、pending、失败回滚也一起收敛 |
| DS-05 | 只读tags复用chip，而chip又用于筛选 | P1：分成Badge/Tag与FilterChip；不让只读标签像可操作按钮 |
| DS-06 | 大量可点击view/image/text没有一致role、反馈与点击区 | P1：ActionRow/Card/MediaPreview拥有整块交互语义，保留内部操作拦截 |
| DS-07 | `.section>.member-row`用pill，其他member-row用32rpx | P1：同一ActionRow语境归属；内容圆角不能随祖先选择器变化 |
| DS-08 | 主次按钮、评论操作、菜单项、底栏按钮按页面设字号/边距 | P1：Button/ActionGroup负责几何和文字角色 |
| DS-09 | `.screen button[disabled]`强制背景，loading常与disabled绑定 | P1：区分loading与不可用；载入中的动作不灰成不可执行状态 |
| DS-10 | 详情与弹层的评论身份、正文、嵌套回复有不同布局 | P2：单一CommentThread，布局变体只反映是否可编辑 |
| DS-11 | 返回/箭头/日期切换仍有文字符号，图标边界不统一 | P1：统一Icon及IconButton；UI glyph不直接由字体显示 |
| DS-12 | 一套导航样式对应screen实际导航和custom-tab-bar备用WXML | P1：唯一运行中的NavigationBar组件；壳体与按钮逻辑解耦 |
| DS-13 | 表单步骤/成功页/审核进度/参与方式存在各自的圆点、卡片、CTA编排 | P2：StepIndicator/StatusPanel/ResultLayout/NextStep明确分工 |
| DS-14 | 只读弹层常共用底部“取消”，部分读面又有顶部关闭 | P2：BottomSheet按read/form/choice/menu定义动作，不让取消充当完成 |
| DS-15 | 文字、圆角、padding等原始值仍大量散落且被重复覆盖 | P1：建立组件token出口；P2迁移完删除旧规则，禁止尾部追加覆盖 |
| DS-16 | 一些通用list-card绑定openItem，但对应管理路由处理器直接return | P2：只读记录不伪装可点击卡片；真正可操作行才有hover/箭头/role |
| DS-17 | 118入口不等于42路由所有状态，部分sheet缺目录 | P1：补齐状态展示目录；视觉按组件×状态×语境检查 |
| DS-18 | 审核/报名状态有真实业务区分，不可仅为统一图标而混淆 | 必须保留业务判定；待付款的“申请通过”与“报名确认”分开说明 |
| DS-19 | 返回圆面和搜索/关注紧凑控件依赖rpx/px混合 | P1：区分可见尺寸与物理点击区；原生菜单尺寸是运行时输入，不是页面魔数 |

## 11. 工程实施顺序与完成定义

### 第一步：基础决策和组件样本

固定颜色/描边/圆角/文字/交互状态；生成组件样本页，覆盖canvas、white、floating三种语境。先把Button/IconButton/Selection/Badge/ActionRow做好，再迁移业务页面。本轮完成方向与少量明确基础修正；组件样本页及完整组件库尚未建立。

### 第二步：先回收母体，再推广

关注/发现自身的搜索、关注、筛选、导航也迁入同一组件，保留信息架构和已认可的卡片编排。它们不是永远保留旧写法的“特殊首页”。随后迁移成员/空间/专题/菜单等共享列表和卡片，再迁移活动详情及评论。

### 第三步：完整覆盖中间流程

表单每步、发布结果、报名与付款、审核和进度、全部sheet及原生返回状态使用相同组件。保留业务权限/支付/隐私契约，不以视觉重构重写后端状态机。

### 第四步：删除重复和阻止回流

- 页面文件只组合组件、数据与行为；不允许页面设置任意按钮边、色、圆角、字号。
- 图集长宽比、邀请卡白边、原生菜单避让等有意义的布局差异进入命名变体，不伪装成“所有值必须相同”。
- Component隔离样式，组件根节点注入唯一theme；禁止依赖外层`.screen button`穿透修改内部。
- 原生组件只用受支持选择器，不在组件WXSS里使用tag/attribute/ID规则。
- 基础颜色、几何和动效只在theme定义；组件持有它们到属性的映射；页面只使用变体名。
- 除运行时几何和受约束布局，页面无颜色/圆角/字体内联样式；新值必须有token角色和使用依据。
- CSS文件变短而非变长：迁移一个组件，就删掉对应旧样式及路由覆盖。
- 审查规则应检测组件使用和语义，不再用一串旧CSS字面值固定过期描边。

**一项迁移只有同时满足以下条件才算完成：**所有出现位置使用同一组件；default/pressed/loading/disabled等适用状态统一；点击/事件冒泡/原生open-type有效；中英长文和安全区无错；失败不丢数据；权限正确；旧实现被删除；真实开发工具目视记录与真机待验边界已标注。

## 12. 本轮落地与剩余边界

已落地：正圆返回控件（独立Component）、统一线稿back图标、44px独立点击区、导航外壳/选中tab与搜索键取消装饰描边。颜色和点击区/模糊等新增基础token集中到theme，未提交或推送。

尚未落地：Button/FollowControl/ActionRow等全站组件迁移、所有旧样式清理、20种sheet完整视觉验收、全尺寸与真机交互验收。本文将这些列成明确工作，不能把“全局审查完成”写成“全局统一完成”。

需讨论的全局取舍本轮只有描边方向，已由用户选择块面方案。其他规则从现有风格、前文已确认的顶图/透明标题区/共享导航背景及业务契约推导；后续若必须新增组件语义、改变信息架构或原生能力承接，应先说明具体冲突与选项再询问，不把新审美决定偷偷藏进局部CSS。

### 本轮验证记录

- 图标组件事件测试通过：可用时发送一次press，disabled时不发送；使用原生button保留点击与辅助标签。
- community-navigation、global-design、event-gallery与118入口native-review检查通过；均为离线/mocked检查，无生产写入。
- 微信开发者工具已查看关注、发现和活动详情，目视核对返回圆面、导航/搜索去装饰描边；点击返回可正常回到列表，当前Errors 0。没有逐屏验收全部42路由/20种sheet。
- 原生style-v2的默认button几何会影响自定义控件；本轮把必要的布局约束收在组件内，页面只传运行时size，不允许页级补丁。
- 注册全局组件触发开发工具的按需注入性能提示；大规模迁移时应由页面组件清单生成注册依赖。预加载、worker和既有选择器/页面性能警告另记，不以Errors 0代替完整性能验收。
