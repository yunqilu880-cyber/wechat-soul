import OpenAI from 'openai';
import type { Config } from '../config/index.js';
export type Message = {role:'system'|'user'|'assistant'; content:string};
export interface AIProvider { complete(messages: Message[]): Promise<string> }
export class DeepSeekProvider implements AIProvider {
  private client: OpenAI;
  constructor(private config: Config) { this.client = new OpenAI({apiKey: config.DEEPSEEK_API_KEY || 'missing', baseURL: config.DEEPSEEK_BASE_URL, timeout:config.TIMEOUT_MS, maxRetries:2}); }
  async complete(messages: Message[]): Promise<string> {
    if (!this.config.DEEPSEEK_API_KEY) throw new Error('缺少 DEEPSEEK_API_KEY');
    try {
      const result = await this.client.chat.completions.create({model:this.config.DEEPSEEK_MODEL, messages, temperature:this.config.TEMPERATURE, max_tokens:this.config.MAX_TOKENS});
      return result.choices[0]?.message.content?.trim() || '模型返回了空内容，请重试。';
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) throw new Error('DeepSeek API Key 无效（401）');
      if (error instanceof OpenAI.RateLimitError) throw new Error('DeepSeek 请求过于频繁（429），请稍后重试');
      if (error instanceof OpenAI.APIConnectionError || error instanceof OpenAI.APIConnectionTimeoutError) throw new Error('DeepSeek 网络连接或请求超时，请稍后重试');
      if (error instanceof OpenAI.InternalServerError) throw new Error('DeepSeek 服务暂时不可用（5xx）');
      throw error;
    }
  }
}
export class MockProvider implements AIProvider {
  async complete(messages: Message[]) { const last=messages.at(-1)?.content ?? ''; if (last === '/mockfail') throw new Error('模拟 API 失败'); return `模拟回复：${last}（上下文 ${messages.filter(m=>m.role==='user').length} 轮）`; }
}
