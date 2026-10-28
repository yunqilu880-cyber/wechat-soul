import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sdk = join(root, 'node_modules', '@pinixai', 'weixin-bot');
const entry = join(sdk, 'dist', 'index.js');
if (existsSync(entry)) process.exit(0);
const compiler = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
if (!existsSync(sdk) || !existsSync(compiler)) {
  console.error('微信 SDK 缺少编译产物。请在项目目录执行 npm ci 后重试。');
  process.exit(1);
}
console.log('正在编译微信 SDK 1.2.0 的 TypeScript 源码…');
const result = spawnSync(process.execPath, [compiler, '-p', join(sdk, 'tsconfig.json')], { stdio: 'inherit' });
if (result.status !== 0 || !existsSync(entry)) process.exit(1);
