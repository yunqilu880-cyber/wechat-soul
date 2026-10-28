import { createInterface } from 'node:readline/promises';
import { stdin,stdout } from 'node:process';
import { ConfigService } from '../config/index.js';
import { StorageService } from '../storage/index.js';
const id=process.argv[2]?.trim();if(!id)throw new Error('用法：npm run bind-owner -- <微信 SDK userId>');
const storage=new StorageService(new ConfigService().value.DATA_DIR);
if(storage.owner())throw new Error('所有者已绑定；不能覆盖。');
const rl=createInterface({input:stdin,output:stdout});
try{const answer=await rl.question(`确认将 ${id} 绑定为唯一所有者？输入 BIND：`);if(answer!=='BIND')throw new Error('已取消');storage.bindOwner(id);console.log('绑定完成。');}finally{rl.close();}
