import { createApp } from './app.js';
import { WeixinAdapter } from './weixin/index.js';
const {chat,storage,config}=createApp();
if(!storage.owner() && config.value.OWNER_WEIXIN_ID)storage.bindOwner(config.value.OWNER_WEIXIN_ID);
const adapter=new WeixinAdapter(chat,storage);
process.on('SIGINT',()=>{adapter.stop();process.exit(0);});
adapter.run().catch(e=>{console.error(`微信连接失败：${e instanceof Error?e.message:'未知错误'}。请检查账号的 iLink/ClawBot 权限和网络。`);process.exitCode=1;});
