# WeChatSoul

A personal DeepSeek AI friend using WeChat's separate iLink/ClawBot bot identity. Requires Node.js 22.13+.

Run `npm ci`, copy `.env.example` to `.env`, set `DEEPSEEK_API_KEY`, then run `npm run doctor` and `npm run chat`. Use `npm run chat:mock` without a key. For WeChat, run `npm run dev`, scan the locally rendered QR code, send the displayed `/bind` code to the bot, and confirm your SDK user ID in the local terminal. Actual device authorization and end-to-end delivery require user testing. See [Chinese README](README.md) for commands, deployment, security, and limitations.
