import type { StorageService } from '../storage/index.js';
import type { MemoryService } from '../memory/index.js';
import { PERSONAS, PersonaService } from '../persona/index.js';
export class CommandRouter {
 private confirmations=new Map<string,number>();
 constructor(private storage:StorageService,private memory:MemoryService,private personas:PersonaService,private model:string) {}
 async route(user:string,text:string):Promise<string|undefined> {
  const [command,...args]=text.trim().split(/\s+/); const arg=args.join(' ').trim();
  switch(command){
   case '/help': return '/new /reset /status /model /persona [default|friend|study|rational] /remember 内容 /memory /forget ID /clearall';
   case '/new': case '/reset': this.storage.clear(user); return '新对话已开始。';
   case '/status': return `运行中；模型：${this.model}；人格：${this.storage.persona(user)}`;
   case '/model': return this.model;
   case '/persona': if(!arg) return `当前人格：${this.storage.persona(user)}；可选：${PERSONAS.join('、')}`; this.personas.load(arg); this.storage.setPersona(user,arg); return `已切换人格：${arg}`;
   case '/remember': if(!arg || arg.length>500) return '用法：/remember 内容（最多 500 字）'; return `已保存记忆 #${this.memory.add(user,arg)}`;
   case '/memory': {const rows=this.memory.list(user);return rows.length?rows.map(m=>`#${m.id} ${m.content}`).join('\n'):'暂无长期记忆。';}
   case '/forget': {const id=Number(arg);return Number.isInteger(id)&&this.memory.forget(user,id)?'已删除。':'未找到该记忆 ID。';}
   case '/clearall': {const now=Date.now();if(arg==='确认' && (this.confirmations.get(user)??0)>now){this.confirmations.delete(user);this.storage.clearAll(user);return '对话和记忆已清空。';}this.confirmations.set(user,now+60000);return '60 秒内发送 /clearall 确认 以清除全部对话和记忆。';}
   default: return command.startsWith('/')?'未知指令。发送 /help 查看帮助。':undefined;
  }
 }
}
