# WeChatSoul

基于 DeepSeek 的个人微信 AI 好友。微信通道使用 iLink/ClawBot 独立机器人身份，不接管私人微信账号。当前是可本地测试的 MVP；真实微信扫码、账号权限及收发仍需设备持有者验证。

## 功能

- DeepSeek 连续聊天；最近 20 条消息作为上下文，SQLite 持久化。
- `/help` `/new` `/reset` `/status` `/model` `/persona` `/remember` `/memory` `/forget` `/clearall`。
- 人格模板位于 `persona/`；长期记忆仅由 `/remember` 显式保存。
- 终端聊天与 Mock 聊天；微信 SDK 扫码与长轮询适配。
- 所有者白名单、长度/速率/并发限制、重复消息去重。

## Windows PowerShell 快速开始

安装 Node.js 22+（Node 22 的内置 SQLite 会显示实验性 API 警告），在项目目录运行：

```powershell
npm install
Copy-Item .env.example .env
# 编辑 .env，填写 DEEPSEEK_API_KEY
npm run chat
npm run chat:mock
```

对话例子：`/remember 我喜欢科幻电影`、`/memory`、`/persona friend`、`你好`、`/new`。

运行 `npm run dev`，按终端二维码在微信中扫码确认。首次向机器人发送消息后，终端会显示发送者的 SDK `userId`；确认是自己后，**在本机终端**输入指定的 `BIND <userId>` 才会绑定所有者。`OWNER_WEIXIN_ID` 可用于首次启动绑定，但仅在已经可靠核实该 ID 时填写。若没有 iLink/ClawBot 权限，使用 `npm run chat` 或 `npm run chat:mock`。

## 配置与安全

`.env.example` 列出全部选项。密钥只放在 `.env`；`data/` 内有聊天、记忆、所有者 ID，需限制本机访问。`/clearall` 需要 60 秒内二次确认。人格文件属于本地可信配置，聊天消息不能改写安全设置。程序不提供工具执行、群聊或批量发送。

## Linux 部署

Node.js 22+ 执行 `npm ci && npm run build`，将 `.env`、`DATA_DIR` 放在仅服务用户可读的持久卷。用 systemd `WorkingDirectory` 和 `ExecStart=/usr/bin/node dist/index.js` 管理单实例，`Restart=on-failure` 处理断线退出。`journalctl -u <service>` 查看日志。备份 SQLite 数据库、WAL 文件和 SDK 凭据目录，禁止公开上传。

## 验证、限制与路线

`npm run typecheck && npm run lint && npm run test && npm run build`。真实 DeepSeek 调用需要付费 Key；真机微信端到端验证需要账号授权。管理页面属于 P2，尚未实现。下一步：真机扫码验证、受控管理页面、SDK 凭据迁移和重连观测。

依赖致谢：[weixin-bot SDK](https://github.com/epiral/weixin-bot)、[DeepSeek API](https://api-docs.deepseek.com/zh-cn/)、OpenAI SDK、SQLite。调研见 [docs/research.md](docs/research.md)。
