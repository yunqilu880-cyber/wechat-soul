# WeChatSoul

A personal DeepSeek AI friend using WeChat's separate iLink/ClawBot bot identity. Requires Node.js 22+.

Run `npm install`, copy `.env.example` to `.env`, set `DEEPSEEK_API_KEY`, then `npm run chat`. Use `npm run chat:mock` without a key. For WeChat, verify your SDK user ID locally, run `npm run bind-owner -- <userId>`, then `npm run dev` and scan the QR code. Actual device authorization and end-to-end delivery require user testing. See [Chinese README](README.md) for commands, deployment, security, and limitations.
