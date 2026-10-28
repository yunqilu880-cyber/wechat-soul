# 技术调研（2026-10-28）

- [luckfunc/weixin-agent-bot](https://github.com/luckfunc/weixin-agent-bot)：可访问，MIT。提供直接 iLink + DeepSeek 的 TypeScript 参考；本项目未复制其代码。
- [epiral/weixin-bot](https://github.com/epiral/weixin-bot)：可访问；仓库 README 声明 MIT，npm `@pinixai/weixin-bot` 1.2.0 声明 MIT、Node >=22。SDK 公开 `login/onMessage/reply/sendTyping/run/stop`，凭据与 context token 由 SDK 管理，选为微信通道。上游维护频率需持续关注。
- [tudprc/wechat_chatbot](https://github.com/tudprc/wechat_chatbot)：可访问；用于人格、SQLite 与本地聊天思路，不复制代码。其个人微信接入方式不适合本项目独立机器人身份。
- [Tencent/openclaw-weixin](https://github.com/Tencent/openclaw-weixin)：可访问；协议/账号能力参考，不引入 OpenClaw，也不复制实现。仓库 API 显示许可证 `NOASSERTION`，因此避免代码复用。
- [DeepSeek 官方文档](https://api-docs.deepseek.com/zh-cn/)：当前 OpenAI 兼容地址 `https://api.deepseek.com`，模型 `deepseek-flash`。采用官方 OpenAI SDK，有限重试，处理认证、限速、网络及服务错误。

依赖锁定在 `package-lock.json`。微信账号权限及真实扫码/收发必须由设备持有者验证。SDK 内部凭据存储位置和保护方式应在生产部署前按其版本文档复核。
