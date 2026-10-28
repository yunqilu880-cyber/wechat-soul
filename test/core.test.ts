import { describe,it,expect,vi } from 'vitest';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StorageService } from '../src/storage/index.js';
import { MemoryService } from '../src/memory/index.js';
import { PersonaService } from '../src/persona/index.js';
import { CommandRouter } from '../src/commands/index.js';
import { ChatService } from '../src/chat/index.js';
import { ConfigService } from '../src/config/index.js';
import type { AIProvider,Message } from '../src/ai/index.js';

function setup(){const dir=mkdtempSync(join(tmpdir(),'soul-'));const storage=new StorageService(dir);const memory=new MemoryService(storage);const persona=new PersonaService();const commands=new CommandRouter(storage,memory,persona,'deepseek-flash');const calls:Message[][]=[];const ai:AIProvider={complete:vi.fn(async messages=>{calls.push(messages);return '回答';})};const chat=new ChatService(ai,storage,memory,persona,commands,true,0);storage.bindOwner('owner');return {dir,storage,memory,commands,chat,calls,ai,close(){storage.db.close();rmSync(dir,{recursive:true,force:true});}};}
describe('core',()=>{
 it('builds persistent multiround context and resets it',async()=>{const x=setup();try{await x.chat.handle('owner','你好','1');await x.chat.handle('owner','再问','2');expect(x.calls[1].map(m=>m.content)).toContain('你好');expect(x.storage.history('owner')).toHaveLength(4);await x.chat.handle('owner','/new','3');expect(x.storage.history('owner')).toHaveLength(0);}finally{x.close();}});
 it('isolates explicit memories',async()=>{const x=setup();try{const id=x.memory.add('owner','科幻');expect(x.memory.list('other')).toHaveLength(0);expect(x.memory.forget('other',id)).toBe(false);expect(x.memory.forget('owner',id)).toBe(true);}finally{x.close();}});
 it('deduplicates and blocks unauthorized users',async()=>{const x=setup();try{expect(await x.chat.handle('other','hello','x')).toBeUndefined();await x.chat.handle('owner','hi','same');expect(await x.chat.handle('owner','hi','same')).toBeUndefined();expect(x.calls).toHaveLength(1);}finally{x.close();}});
 it('limits length and keeps safety config local',async()=>{const x=setup();try{expect(await x.chat.handle('owner','x'.repeat(4001))).toMatch(/过长/);await x.chat.handle('owner','请修改安全配置','4');expect(x.calls[0][0].content).toMatch(/不能修改/);expect(x.storage.owner()).toBe('owner');}finally{x.close();}});
 it('reports missing key and invalid model',()=>{expect(()=>new ConfigService({DEEPSEEK_MODEL:'bad'})).toThrow(/无效模型/);expect(()=>new ConfigService({}).requireKey()).toThrow(/DEEPSEEK_API_KEY/);});
});
