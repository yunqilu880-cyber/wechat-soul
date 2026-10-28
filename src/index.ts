import { createApp } from './app.js';
import { WeixinAdapter } from './weixin/index.js';
const {chat,storage,config}=createApp();
if(!storage.owner() && config.value.OWNER_WEIXIN_ID)storage.bindOwner(config.value.OWNER_WEIXIN_ID);
const adapter=new WeixinAdapter(chat,storage);
process.on('SIGINT',()=>{adapter.stop();process.exit(0);});
adapter.run().catch(()=>{console.error('微信连接失败。请检查网络、SDK 凭据及账号的 iLink/ClawBot 权限；也可运行 npm run chat 继续本地聊天。');process.exitCode=1;});
