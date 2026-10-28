import {expect,it,vi} from 'vitest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {WeixinBot} from '@pinixai/weixin-bot';
import {StorageService} from '../src/storage/index.js';
import {WeixinAdapter} from '../src/weixin/index.js';
import type {ChatService} from '../src/chat/index.js';
it('logs in and replies only once for a duplicate SDK delivery',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'soul-wx-'));const storage=new StorageService(dir);storage.bindOwner('owner');
 let handler:((msg:unknown)=>Promise<void>)|undefined;
 const fake={login:vi.fn(async()=>({})),onMessage:vi.fn((fn:(msg:unknown)=>Promise<void>)=>{handler=fn;}),run:vi.fn(async()=>{}),sendTyping:vi.fn(async()=>{}),reply:vi.fn(async()=>{}),stop:vi.fn()};
 const chat={handle:vi.fn(async(_user:string,_text:string,id:string)=>storage.claimDelivery(id,'owner')?'回答':undefined)};
 try{await new WeixinAdapter(chat as unknown as ChatService,storage,fake as unknown as WeixinBot).run();const msg={userId:'owner',text:'你好',raw:{message_id:42}};await handler!(msg);await handler!(msg);expect(fake.login).toHaveBeenCalledOnce();expect(fake.reply).toHaveBeenCalledOnce();expect(chat.handle).toHaveBeenCalledWith('owner','你好','42');}finally{storage.db.close();rmSync(dir,{recursive:true,force:true});}
});
