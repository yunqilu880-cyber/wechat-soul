import { afterEach,expect,it,vi } from 'vitest';
import qrcode from 'qrcode-terminal';
import { loginWithQr } from '../src/weixin/login-qr.js';

afterEach(()=>vi.restoreAllMocks());
it('renders the SDK login URL as a local QR and restores stderr',async()=>{
 const generate=vi.spyOn(qrcode,'generate').mockImplementation((_url,_options,callback)=>{callback?.('QR');});
 const output=vi.spyOn(process.stderr,'write').mockImplementation(()=>true);
 const original=process.stderr.write;
 await loginWithQr(async()=>{
  process.stderr.write('[weixin-bot] 在微信中打开以下链接完成登录:\n');
  process.stderr.write('https://example.com/login\n');
 });
 expect(generate).toHaveBeenCalledWith('https://example.com/login',{small:true},expect.any(Function));
 expect(process.stderr.write).toBe(original);
 expect(output).toHaveBeenCalled();
});
