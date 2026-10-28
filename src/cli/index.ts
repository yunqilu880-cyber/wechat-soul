import { createInterface } from 'node:readline/promises';
import { stdin,stdout } from 'node:process';
import { createApp } from '../app.js';
const {chat,config}=createApp(true);
const rl=createInterface({input:stdin,output:stdout});
console.log(`WeChatSoul 本地聊天（${config.value.MOCK_MODE?'Mock':config.value.DEEPSEEK_MODEL}）。输入 /help，/exit 退出。`);
if(stdin.isTTY)stdout.write('你> ');
try{for await(const line of rl){if(line.trim()==='/exit')break;if(!line.trim())continue;console.log(`AI> ${await chat.handle('local',line)}`);if(stdin.isTTY)stdout.write('你> ');}}finally{rl.close();}
