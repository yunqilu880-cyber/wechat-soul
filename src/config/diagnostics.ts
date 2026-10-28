import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from './index.js';

export type Diagnostic = { level:'ok'|'warn'|'error'; message:string };
export function inspectSetup(env:NodeJS.ProcessEnv=process.env,root=process.cwd(),home=homedir(),nodeVersion=process.versions.node):Diagnostic[] {
 const results:Diagnostic[]=[];
 const [major,minor]=nodeVersion.split('.').map(Number);
 results.push(major>22||(major===22&&minor>=13)?{level:'ok',message:`Node.js ${nodeVersion}`}:{level:'error',message:'需要 Node.js 22.13 或更高版本（内置 SQLite 从 22.13 起无需额外开关）'});
 results.push(existsSync(join(root,'.env'))?{level:'ok',message:'.env 已存在'}:{level:'warn',message:'缺少 .env；运行 Copy-Item .env.example .env'});
 try {
  const config=new ConfigService(env).value;
  results.push(config.MOCK_MODE?{level:'warn',message:'MOCK_MODE=true；微信聊天将使用模拟回复'}:config.DEEPSEEK_API_KEY?{level:'ok',message:'DeepSeek API Key 已配置（内容不显示）'}:{level:'error',message:'缺少 DEEPSEEK_API_KEY；先在 .env 中填写'});
  results.push({level:'ok',message:`模型：${config.DEEPSEEK_MODEL}`});
 } catch(error){results.push({level:'error',message:error instanceof Error?error.message:'配置无效'});}
 results.push(existsSync(join(root,'node_modules','@pinixai','weixin-bot','dist','index.js'))?{level:'ok',message:'微信 SDK 已就绪'}:{level:'error',message:'微信 SDK 未就绪；运行 npm ci'});
 results.push(existsSync(join(home,'.weixin-bot','credentials.json'))?{level:'ok',message:'发现微信登录凭据；启动时将尝试恢复'}:{level:'warn',message:'尚无微信登录凭据；首次启动需扫码'});
 return results;
}
