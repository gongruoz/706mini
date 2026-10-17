# 微信原生工程交付与联调入口

> 2026-10-09 更新：新增默认离线演示及第 40 页评审目录。当前导入、模式切换、覆盖与验证以 [同事评审指南](colleague-review.md) 为准；下文保留此前真实模式实现和工具验证历史。

> 2026-10-16 当前界面：以 [706 Paper 当前规范](design-system-paper.md) 为准。发现筛选为时间/地点/参与，免费与有名额可组合；移除批量已读和专题数字/箭头。菜单、详情下一步、表单和审核信息层级已同步修订；不新增后端接口或权限。文末 2026-10-08 的 AppID、域名与工具配置描述是当时记录，不代表当前本机配置状态。

> 2026-10-17 轻编辑式：改版前本地检查点 `5d875ed`。关注投稿外框取消、节点低矮轮播及城市/已关注目录已加入；发现筛选列名删除，消息分类与系统胶囊齐平。空间使用显式 public_links 展示公开负责人/公众号/回顾，活动先于成员；既有 spaces 路由承接两个目录视角，未新增路由。演示内容与真实原生打开分开，真实公共链接数据及写入契约需要后端/运营确认；本轮不部署服务端或改变权限。

> 同日复核：节点轮播已直接复用发现专题的 `featureCarousel`，统一图片内白色圆点、完整圆角裁切、零前后边距和多卡循环衔接。所有空间固定显示公开资料/回顾分区；缺资料时如实显示未提供，不隐藏整块。706、Sola、杭州演示空间补明确虚构的例子，旧演示仅升级缺失的 public_links，不重置其他资料或草稿。模拟器完整普通编译后已看见负责人、公众号、回顾和活动后方的成员。当天观察到的真机调试上传因 `getaddrinfo ENOTFOUND servicewechat.com` 失败，不能据模拟器结果声称手机包已更新；本轮未再次上传或发布。


2026-10-08 · SID-95。工程已实现并部署服务端，尚未完成真实微信账号端到端验收。`dist/` 是保留的网页原型，HTTP 200 不代表原生小程序验收。

## 导入与运行

1. 微信开发者工具 → 导入项目，选择仓库根目录（本机 `/Users/shing/Projects/706mini`）。`project.config.json` 的 `miniprogramRoot` 指向 `miniprogram/`。
2. 填入运营方实际微信小程序 AppID。目前工程为 `touristappid`，这不是生产 AppID；微信登录、支付、真实小程序码不能用游客配置验证。本机修改 `project.config.json` 的 AppID；不要将测试号作为生产配置提交，也不要写入 AppSecret。当前版本工具可点击其“测试号”入口完成模拟器和二维码预览，游客 AppID 在本次导入中报系统错误。
3. 微信后台配置 `montana.wamo.city` 为 HTTPS request/download/upload 合法域名，WebSocket 使用 `wss://montana.wamo.city/runtime/session`。存储签名上传/公开下载如返回其他域名，须将实际域名一并登记。
4. 使用实际账号登录，完成个人资料与隐私同意。验证码登录取决于 Montana 已配置的邮件/短信提供商；微信登录取决于服务端微信凭据。工程不会创建演示账号或让第一个登录者成为管理员。
5. 后端按真实账号 ID 完成平台负责人、组织/空间及 Owner 配置后，再走发布、审核、报名。当前业务数据为空是正常初始状态。

`miniprogram/config.js` 仅含公开服务地址及 Montana 应用 ID。网络适配位于 `lib/montana.js`，使用 `wx.request` / `wx.connectSocket`，未引入浏览器 DOM、localStorage 或浏览器 SDK。登录后通过鉴权 WebSocket 调用 `community:read` / `community:write` 与 action；直接数据表读写被服务端拒绝。

## 页面与动作映射

现有 `dist/app.js` 的 33 个业务路由均保留为原生路由，另补 6 个独立业务页面，共 39 个。每条路由都有 `pages/<route>/index.js/.json/.wxml`；共享 `lib/page.js` 和 `templates/screen.wxml`。下表表示实现入口，不表示每项已经真机验收。

| 路由 | 界面与动作 | 服务接口/状态 |
|---|---|---|
| feed | 同城成员、推荐、获同意的报名动态、关注、搜索、发布 | feed / people / follow；share_activity 默认不公开 |
| discover | 搜索、专题、时间/地点/参与筛选，独立日历入口 | calendar / campaigns / search；筛选 AND，免费与名额可同时生效 |
| messages | 管理/活动/互动分类、仅待处理分组提示、普通消息直接起列、打开单条后已读 | notifications / read；UNREAD → READ，无批量入口 |
| me | 参与/发起/管理/偏好分组，直接切城市/语言，开发入口按环境可见 | me / managed / reviews；服务端权限不变 |
| event | 详情、推荐、评论、报名、分享、复用、取消、审核与名单入口 | event / recommend / comment / register / clone / cancelEvent |
| member | 公开资料、活动、关注、屏蔽、举报 | member / follow / mute / report |
| space | 空间介绍、活动、成员、管理 | entity / follow |
| org | 组织介绍、活动、成员、管理 | entity / follow |
| entity-events | 组织或空间活动 | entity.items |
| entity-members | 公开成员列表 | entity.members，仅公开资料 |
| edit-entity | 名称/介绍/图片/地址/开放时间/公开联系信息 | entity 写入，实时角色授权及 version |
| admins | 管理员列表、邀请、撤权 | admins / invite / revokeRole；撤销同时清理待接受邀请 |
| edit-profile | 资料与头像、私密微信号、报名动态开关 | profile；联系方式加密保存 |
| relations | 关注/粉丝列表及跳转 | relations，mode=followers/following |
| onboarding | 三步资料、兴趣、关注空间、隐私确认 | profile；本机草稿和步骤恢复 |
| calendar | 本周/本月与列表、点日筛选不切视图、组合条件、海报预览保存 | calendar / calendarCode / calendarShare |
| spaces | 同城空间列表 | entities，kind=SPACE |
| campaign | 专题资料、关联活动、审核进度 | campaign |
| campaign-edit | 编辑专题草稿并提交 | draft / saveCampaign / submitCampaign |
| campaign-create | 三步专题、关联活动、资源链接 | saveCampaign / submitCampaign |
| campaign-approval-detail | 专题审核与退回理由 | review / review mutation |
| campaign-review-progress | 专题审核轮次、节点、意见 | progress |
| event-access | 报名状态、支付、参与方式、取消 | registration / payment / access / cancelRegistration |
| activity-preview | 作者/授权管理员草稿预览 | draft；私有图片鉴权预览 |
| publish | 三步活动、费用/审核/候补、私密参与方式 | saveEvent / submitEvent |
| approvals | 当前角色有权处理的审核项 | reviews |
| approval-detail | 活动审核详情、通过/退回 | review / review mutation |
| approval-progress | 历次审核及当前进度 | progress |
| registrations | 我的报名及状态 | mine，kind=registration |
| my-events | 我的活动、编辑、预览及进度 | mine，kind=event |
| drafts | 草稿、继续编辑、预览 | mine，status=DRAFT |
| following | 关注列表 | relations |
| more | 城市、语言、通知偏好、资料可见性、动态公开开关、隐私/反馈/退出 | profile / signout |
| login（新增） | 手机/邮箱验证码、微信登录 | runtime auth / wechatLogin |
| attendees（新增） | 授权发起者查看报名和审核 | attendees / registrationDecision |
| invitations（新增） | 管理员邀请接受 | invitations / acceptInvite |
| my-campaigns（新增） | 我的专题、编辑及进度 | mine，kind=campaign |
| privacy（新增） | 数据用途与隐私说明 | 本地双语说明；运营方身份/联系信息待补 |
| feedback（新增） | 填写举报/反馈 | report |

所有页面共享加载、错误、重试和登录提示；列表支持接口游标，写入有防重复点击和服务端幂等键。表单按账号和路由分开保存本机草稿，提交成功清理。城市/组织/空间/参与方式显示名称，内部 ID 仅用于传参。

## 业务与权限边界

- 活动 `DRAFT → IN_REVIEW → PUBLISHED`；退回进入 `CHANGES_REQUESTED`，再次提交另建审核轮次；平台、组织和空间审核齐备后发布。
- 专题关联活动逐项征得发起者批准；被拒活动从该轮移除，空专题不可发布。
- 报名区分 `REQUESTED / WAITLISTED / APPROVED_AWAITING_PAYMENT / CONFIRMED / REJECTED / CANCELLED / EXPIRED`。候补提升保留原审核要求。人数由服务端确认报名与付款占位计算。
- 付款以微信服务器验签回调或验签查询为准；客户端支付成功回调不会直接确认报名。已创建的外部支付订单关闭前保留占位，取消需等订单关闭。付费报名退款和付费活动取消的产品规则尚未决定，因此显式返回待处理状态，不自动退款。
- 群二维码以加密私密引用保存，不能使用公开图片端点。参与方式每次读取重新检查当前报名/角色；私有预览 URL 有效期 5 分钟，取图时再检查权限，并禁止缓存。已下载或截图的内容无法收回。
- 公开图片仅在被公开活动/专题、有效实体或公开资料引用时可访问。草稿作者与当前有权管理者使用独立鉴权预览；客户端持久保存稳定引用，不保存短时签名地址。
- 全局搜索按开发手册 5.1 保留其他城市明确命中，同城优先；普通发现/日历的城市、日期、地点、标签、免费和名额条件保持 AND。

## 视觉依据与主题

当前视觉系统为 2026-10-16 用户确认的 706 Paper。外层动态浅轮廓、内层活动深轮廓；头像与海报有细线，人数状态只读，人物贴纸固定文字区左右对齐并排除本人。黄色用于操作/选择，紫色用于关系/便笺，绿色用于可用状态。详情首屏收敛，事实优先，主操作对应报名下一步；表单有命名步骤和字段校验；审核说明身份、范围、关联活动与下一步。主 tab 无重复页眉和调试横幅，顶部实际控制区域稳定遮挡、边缘柔和渐变，底部不跳动。开发者入口仅演示/develop/trial 可见。颜色与几何参数集中在 `miniprogram/lib/theme.js`，当前样式在 `styles/editorial.wxss`，导航在 `custom-tab-bar/`。尺寸、交互和验证边界见 [706 Paper 当前规范](design-system-paper.md)。

此前读取 Sola Figma 的主页面与 Component 页面，参考其参与者胶囊、右侧海报及信息组织。原灰底/薄荷主题已由新系统替代；新颜色为本次设计选择，不声称来自 Figma 命名变量或逐像素复制。私有设计截图留在私有后端证据目录，不放公开仓库。

## 验证与外部配置

2026-10-08 完成原生 WXML 40 文件、WXSS、48 JS 语法、JSON 与 39 路由文件检查；微信开发者工具内置 `wcc/wcsc` 编译通过。服务端 TypeScript 无输出检查与 esbuild 构建通过。未新增自动化测试套件；未创建 Montana 测试用户、活动或订单；实际工具验证见下文。

Montana 部署 v4（21 个 community 函数），匿名 WebSocket 初始化及公开读取已验证。鉴权业务写入、真实媒体上传、微信支付、扫码、真机性能和完整双语视觉检查仍需真实账号联调；不能用编译通过替代这些结果。

待提供/配置：真实微信 AppID/AppSecret、合法域名、微信支付商户及签名/验签/APIv3配置、真实平台负责人和组织空间 Owner 账号 ID、真实组织/空间资料、正式隐私政策运营主体与联系信息、退款产品规则。账号与凭据通过私有受限配置交接，不发到公开 issue 或客户端源码。

当前实现使用通用服务表及串行写锁保证状态一致性，列表先在服务端过滤后分页；上线流量增大前需观察查询量与锁等待，再优化索引/查询。通知偏好已保存，未接入微信订阅消息推送；展示的是站内通知。

## 实际开发者工具运行补充（2026-10-08）

已在微信开发者工具 **Stable 2.02.2608080** 导入并运行，工具选择的实际基础库为 **3.17.4**。使用工具提供的测试号；它不是已配置 Montana 域名的生产小程序身份。CLI 服务端口保持关闭，整个导入、模拟器和 Preview 通过工具界面完成。

实际 Preview 已上传预览编译包并生成二维码，界面显示包体约 **100 KB**；这不是发布/提审。首次本轮二维码显示到 23:50 失效；最后一次修复后在 23:32 再次生成 Preview，约 100 KB，二维码显示到 23:57 失效。未扫描二维码、未真机运行、未真实登录/支付或发验证码。二维码与测试身份不进入公开仓库。

实跑修复：

- 连接被拒后关闭已失效 Socket 引发 `closeSocket:fail task not found`；现在失败回调只清理本机状态，主动关闭也处理原生失败回调。重新编译后该二次异常消失。
- 失败连接 Promise 清理后可重试；合法域名错误显示明确配置提示。
- 原生 style-v2 的默认按钮宽度挤压搜索栏、拉宽悬浮发布按钮；提高组件样式优先级，模拟器中尺寸恢复。
- 更多、隐私、反馈、登录页不再以远端配置请求为首次渲染条件；城市选项仅在用户打开时请求。已实际检查“我的 → 更多 → 切换英语 → Privacy → 返回 → 恢复中文 → 反馈”的导航与本地化。仅日历挂载海报 canvas。反馈确认层补上输入值绑定；该项编译通过，原生自动输入事件的复核未取得确定结果，保留后续交互验证。

**当前具体阻塞**：模拟器日志为 `wss://montana.wamo.city 不在以下 socket 合法域名列表中`。合法域名校验仍开启。临时放宽本机调试校验正在等待本人确认；也可由运营方在实际 AppID 后台登记域名。未以关闭校验的结果冒充生产域名验收。

本轮修复再次通过 wcc/wcsc、JS/JSON 检查；后端函数未修改，仍为 v4。后续需要在允许联网的开发配置下继续检查业务页面/鉴权/媒体，并由用户完成真机扫码。工具测试号及自动生成的本机配置保留在本地，未纳入公开提交。
