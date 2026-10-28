import { ConfigService } from './config/index.js';
import { DeepSeekProvider, MockProvider } from './ai/index.js';
import { StorageService } from './storage/index.js';
import { MemoryService } from './memory/index.js';
import { PersonaService } from './persona/index.js';
import { CommandRouter } from './commands/index.js';
import { ChatService } from './chat/index.js';
export function createApp(local=false){
 const config=new ConfigService();config.requireKey();
 const storage=new StorageService(config.value.DATA_DIR);
 const memory=new MemoryService(storage);const persona=new PersonaService();
 const commands=new CommandRouter(storage,memory,persona,config.value.DEEPSEEK_MODEL);
 const ai=config.value.MOCK_MODE?new MockProvider():new DeepSeekProvider(config.value);
 const chat=new ChatService(ai,storage,memory,persona,commands,!local);
 return {config,storage,memory,persona,commands,chat};
}
