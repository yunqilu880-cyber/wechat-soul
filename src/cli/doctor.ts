import { inspectSetup } from '../config/diagnostics.js';

const results=inspectSetup();
console.log('WeChatSoul 启动检查（不会调用 DeepSeek 或微信 API）：');
for(const item of results)console.log(`[${item.level.toUpperCase()}] ${item.message}`);
if(results.some(item=>item.level==='error'))process.exitCode=1;
