import qrcode from 'qrcode-terminal';

/** The SDK prints the iLink login URL; display a local QR without sending it elsewhere. */
export async function loginWithQr(login: () => Promise<unknown>): Promise<void> {
  const original = process.stderr.write;
  const writeOriginal = original.bind(process.stderr);
  let expectUrl = false;
  const intercepted: typeof process.stderr.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
    const line = String(chunk).trim();
    if (line.includes('在微信中打开以下链接完成登录:')) expectUrl = true;
    else if (expectUrl && /^https?:\/\/\S+$/.test(line)) {
      expectUrl = false;
      qrcode.generate(line, { small: true }, qr => writeOriginal(`\n请用微信扫描下方二维码并在手机上确认：\n${qr}\n`));
    }
    return (writeOriginal as (...values: unknown[]) => boolean)(chunk, ...args);
  }) as typeof process.stderr.write;
  process.stderr.write = intercepted;
  try { await login(); } finally { process.stderr.write = original; }
}
