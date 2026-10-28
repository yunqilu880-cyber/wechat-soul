import { afterEach,expect,it,vi } from 'vitest';
import { ConfigService } from '../src/config/index.js';
import { DeepSeekProvider,MockProvider } from '../src/ai/index.js';
afterEach(()=>vi.unstubAllGlobals());
it('returns DeepSeek completion',async()=>{
 const fetch=vi.fn(async()=>new Response(JSON.stringify({id:'x',object:'chat.completion',created:1,model:'deepseek-flash',choices:[{index:0,message:{role:'assistant',content:'你好'},finish_reason:'stop'}]}),{status:200,headers:{'content-type':'application/json'}}));
 vi.stubGlobal('fetch',fetch);
 const config=new ConfigService({DEEPSEEK_API_KEY:'test',DEEPSEEK_MODEL:'deepseek-flash'}).value;
 expect(await new DeepSeekProvider(config).complete([{role:'user',content:'hi'}])).toBe('你好');
 expect(fetch).toHaveBeenCalledTimes(1);
});
it('maps authorization errors and recovers in mock mode',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({error:{message:'bad key',type:'authentication_error'}}),{status:401,headers:{'content-type':'application/json'}})));
 const config=new ConfigService({DEEPSEEK_API_KEY:'test'}).value;
 await expect(new DeepSeekProvider(config).complete([{role:'user',content:'hi'}])).rejects.toThrow(/401/);
 const mock=new MockProvider();await expect(mock.complete([{role:'user',content:'/mockfail'}])).rejects.toThrow(/模拟/);
 expect(await mock.complete([{role:'user',content:'恢复'}])).toMatch(/恢复/);
});
