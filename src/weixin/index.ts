import { WeixinBot } from '@pinixai/weixin-bot';
import type { ChatService } from '../chat/index.js';
import type { StorageService } from '../storage/index.js';
import { createInterface } from 'node:readline/promises';
import { stdin,stdout } from 'node:process';
import { randomInt } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { loginWithQr } from './login-qr.js';

type AdapterOptions = {
 pairingCode?: string;
 confirmOwner?: (userId:string)=>Promise<boolean>;
 retryDelay?: (ms:number)=>Promise<unknown>;
};
export class WeixinAdapter {
 private binding=false;
 readonly pairingCode:string;
 constructor(private chat:ChatService,private storage:StorageService,private bot:WeixinBot=new WeixinBot(),private options:AdapterOptions={}) {
  this.pairingCode=options.pairingCode??String(randomInt(100000,1000000));
 }
 async run(){
  if(!this.storage.owner())console.log(`首次绑定：扫码成功后，用你的微信向机器人发送 /bind ${this.pairingCode}。随后按本机终端提示确认。`);
  for(let attempt=1;attempt<=3;attempt++){
   try {await loginWithQr(()=>this.bot.login());break;}
   catch(error){if(attempt===3)throw error;console.error(`微信登录暂时失败，${attempt*2} 秒后重试（${attempt}/3）。`);await (this.options.retryDelay??delay)(attempt*2000);}
  }
  this.bot.onMessage(async msg=>{
   if(!msg.text?.trim())return;
   if(!this.storage.owner()) {
    if(this.binding || msg.text.trim()!==`/bind ${this.pairingCode}`)return;
    this.binding=true;
    try {
     const confirmed=await (this.options.confirmOwner??this.confirmLocally)(msg.userId);
     if(confirmed){this.storage.bindOwner(msg.userId);await this.bot.reply(msg,'所有者绑定成功。发送 /help 查看可用命令。');}
    } finally {this.binding=false;}
    return;
   }
   const id=String(msg.raw.message_id);
   const answer=await this.chat.handle(msg.userId,msg.text,id);
   if(answer){try{await this.bot.sendTyping(msg.userId);}catch{/* typing is optional */}await this.bot.reply(msg,answer);}
  });
  await this.bot.run();
 }
 private confirmLocally=async(userId:string):Promise<boolean>=>{
  const rl=createInterface({input:stdin,output:stdout});
  try {const answer=await rl.question(`收到配对请求，SDK 用户 ID：${userId}。确认是你本人后，在本机输入 BIND ${userId}：`);return answer.trim()===`BIND ${userId}`;}finally{rl.close();}
 };
 stop(){this.bot.stop();}
}
