# WeChatSoul

基于 DeepSeek 的个人微信 AI 好友。微信通道使用 iLink/ClawBot 独立机器人身份，不接管私人微信账号。当前是可本地测试的 MVP；真实微信扫码、账号权限及收发仍需设备持有者验证。

**当前版本不能让别人通过微信号添加一个普通个人微信好友。** 登录二维码用于授权机器人会话。普通好友形态的可行性核查见 [docs/personal-wechat-feasibility.md](docs/personal-wechat-feasibility.md)。

## 功能

- DeepSeek 连续聊天；最近 20 条消息作为上下文，SQLite 持久化。
- `/help` `/new` `/reset` `/status` `/model` `/persona` `/remember` `/memory` `/forget` `/clearall`。
- 人格模板位于 `persona/`；长期记忆仅由 `/remember` 显式保存。
- 终端聊天与 Mock 聊天；微信 SDK 扫码与长轮询适配。
- 所有者白名单、长度/速率/并发限制、重复消息去重。
- 微信回复发送失败时保留待发送内容，有限重试；若微信重新投递同一消息，可复用回复，避免再次调用模型。

## Windows PowerShell：从 DeepSeek 到微信

安装 Node.js 22.13+（Node 22 的内置 SQLite 会显示实验性 API 警告）。从 [DeepSeek 平台](https://platform.deepseek.com/)创建 API Key；在项目目录运行：

```powershell
npm ci
Copy-Item .env.example .env
# 用记事本编辑 .env，填写 DEEPSEEK_API_KEY=你的密钥
notepad .env
npm run doctor
npm run chat
```

`doctor` 只检查本机配置，不会调用付费 API。先在终端发“你好”确认 DeepSeek 正常回复；输入 `/exit` 退出。没有密钥时运行 `npm run chat:mock` 检查本地功能。对话例子：`/remember 我喜欢科幻电影`、`/memory`、`/persona friend`、`你好`、`/new`。

然后运行 `npm run dev`。SDK 会获取登录链接，程序在本机终端将其画成二维码；用微信扫码并在手机上确认。首次绑定时，终端会显示一次性 `/bind 口令`。**用你自己的微信向这个机器人发送该指令**，再核对终端显示的 SDK `userId`，并在本机输入 `BIND <userId>`。收到“所有者绑定成功”后，向机器人发送“你好”测试。凭据由 SDK 保存在用户目录 `.weixin-bot/credentials.json`，重启会尝试恢复。

若账号没有 iLink/ClawBot 权限，扫码或机器人消息收发可能无法完成；这是微信侧权限限制，本地 `npm run chat` 仍可用。它是独立 AI 机器人身份，**不会接管个人微信账号，也不会自动回复普通好友私聊**。`OWNER_WEIXIN_ID` 只在你已可靠核实 SDK 用户 ID 时填写；通常留空并使用上述配对流程。

## 配置与安全

`.env.example` 列出全部选项。密钥只放在 `.env`；`data/` 内有聊天、记忆、所有者 ID，需限制本机访问。二维码和登录链接仅在本机显示，不要转发或上传。`/clearall` 需要 60 秒内二次确认。人格文件属于本地可信配置，聊天消息不能改写安全设置。程序不提供工具执行、群聊或批量发送。

常见问题：`doctor` 提示缺少 Key 时检查 `.env`；401 表示 Key 无效，429 表示请求过多，5xx 或超时请稍后重试。没有扫码入口或微信消息收不到时，先核查网络、账号 iLink 权限和 SDK 凭据；不要把凭据文件发给他人。

## Linux 部署

Node.js 22.13+ 执行 `npm ci && npm run build`，将 `.env`、`DATA_DIR` 放在仅服务用户可读的持久卷。用 systemd `WorkingDirectory` 和 `ExecStart=/usr/bin/node dist/index.js` 管理单实例，`Restart=on-failure` 处理断线退出。`journalctl -u <service>` 查看日志。备份 SQLite 数据库、WAL 文件和 SDK 凭据目录，禁止公开上传。

## 验证、限制与路线

`npm run typecheck && npm run lint && npm run test && npm run build`。真实 DeepSeek 调用需要付费 Key；真机微信端到端验证需要账号授权。发送失败会尝试三次；若之后没有微信重复投递，待发送内容不会自行发出。管理页面属于 P2，尚未实现。下一步：真机扫码验证、受控管理页面、SDK 凭据迁移和重连观测。

依赖致谢：[weixin-bot SDK](https://github.com/epiral/weixin-bot)、[DeepSeek API](https://api-docs.deepseek.com/zh-cn/)、OpenAI SDK、SQLite。调研见 [docs/research.md](docs/research.md)。
