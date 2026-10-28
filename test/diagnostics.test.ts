import { expect,it } from 'vitest';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectSetup } from '../src/config/diagnostics.js';
it('reports missing setup without leaking a configured key',()=>{
 const dir=mkdtempSync(join(tmpdir(),'soul-doctor-'));
 try {const missing=inspectSetup({},dir,dir,'22.0.0');expect(missing.some(x=>x.level==='error'&&x.message.includes('DEEPSEEK_API_KEY'))).toBe(true);expect(missing.some(x=>x.level==='error'&&x.message.includes('22.13'))).toBe(true);
  const configured=inspectSetup({DEEPSEEK_API_KEY:'top-secret'},dir,dir,'22.0.0');expect(JSON.stringify(configured)).not.toContain('top-secret');}
 finally{rmSync(dir,{recursive:true,force:true});}
});
