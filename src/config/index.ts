import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  DEEPSEEK_API_KEY: z.string().default(''),
  DEEPSEEK_BASE_URL: z.url().default('https://api.deepseek.com'),
  DEEPSEEK_MODEL: z.string().regex(/^deepseek-[a-z0-9-]+$/, '无效模型名称').default('deepseek-flash'),
  DATA_DIR: z.string().default('./data'),
  LOG_LEVEL: z.enum(['debug','info','warn','error']).default('info'),
  OWNER_WEIXIN_ID: z.string().default(''),
  MOCK_MODE: z.string().default('false').transform(v => v === 'true'),
  TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  MAX_TOKENS: z.coerce.number().int().min(1).max(8192).default(1024),
  TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000)
});
export type Config = z.infer<typeof schema>;
export class ConfigService {
  readonly value: Config;
  constructor(env: NodeJS.ProcessEnv = process.env) {
    const result = schema.safeParse(env);
    if (!result.success) throw new Error(`配置错误：${result.error.issues.map(i => i.message).join('；')}`);
    this.value = result.data;
  }
  requireKey() { if (!this.value.MOCK_MODE && !this.value.DEEPSEEK_API_KEY) throw new Error('缺少 DEEPSEEK_API_KEY，请编辑 .env 或运行 npm run chat:mock'); }
}
