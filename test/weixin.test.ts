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
it('requires a local code and confirmation before binding the owner',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'soul-pair-'));const storage=new StorageService(dir);
 let handler:((msg:unknown)=>Promise<void>)|undefined;
 const fake={login:vi.fn(async()=>({})),onMessage:vi.fn((fn:(msg:unknown)=>Promise<void>)=>{handler=fn;}),run:vi.fn(async()=>{}),reply:vi.fn(async()=>{}),stop:vi.fn()};
 const confirmOwner=vi.fn(async()=>true);
 try{await new WeixinAdapter({} as ChatService,storage,fake as unknown as WeixinBot,{pairingCode:'123456',confirmOwner}).run();await handler!({userId:'stranger',text:'你好',raw:{message_id:1}});expect(storage.owner()).toBeUndefined();await handler!({userId:'me',text:'/bind 123456',raw:{message_id:2}});expect(confirmOwner).toHaveBeenCalledWith('me');expect(storage.owner()).toBe('me');expect(fake.reply).toHaveBeenCalledOnce();}finally{storage.db.close();rmSync(dir,{recursive:true,force:true});}
});
it('retries an initial login failure with bounded delay',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'soul-retry-'));const storage=new StorageService(dir);storage.bindOwner('owner');
 const fake={login:vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({}),onMessage:vi.fn(),run:vi.fn(async()=>{}),stop:vi.fn()};
 const retryDelay=vi.fn(async()=>{});
 try{await new WeixinAdapter({} as ChatService,storage,fake as unknown as WeixinBot,{retryDelay}).run();expect(fake.login).toHaveBeenCalledTimes(2);expect(retryDelay).toHaveBeenCalledWith(2000);}finally{storage.db.close();rmSync(dir,{recursive:true,force:true});}
});
