import { WeixinBot } from '@pinixai/weixin-bot';
import type { ChatService } from '../chat/index.js';
import type { StorageService } from '../storage/index.js';
import { createInterface } from 'node:readline/promises';
import { stdin,stdout } from 'node:process';
export class WeixinAdapter {
 constructor(private chat:ChatService,private storage:StorageService,private bot:WeixinBot=new WeixinBot()) {}
 async run(){
  await this.bot.login();
  this.bot.onMessage(async msg=>{
   if(!msg.text?.trim())return;
   if(!this.storage.owner()) {
    const rl=createInterface({input:stdin,output:stdout});
    try {const answer=await rl.question(`收到用户 ID ${msg.userId} 的绑定请求。仅当这是你本人时，在本机输入 BIND ${msg.userId}：`);if(answer===`BIND ${msg.userId}`){this.storage.bindOwner(msg.userId);await this.bot.reply(msg,'所有者绑定成功。');}}finally{rl.close();}
    return;
   }
   const id=String(msg.raw.message_id);
   const answer=await this.chat.handle(msg.userId,msg.text,id);
   if(answer){try{await this.bot.sendTyping(msg.userId);}catch{/* typing is optional */}await this.bot.reply(msg,answer);}
  });
  await this.bot.run();
 }
 stop(){this.bot.stop();}
}
