import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export const PERSONAS=['default','friend','study','rational'] as const;
export class PersonaService {
 constructor(private dir=join(process.cwd(),'persona')) {}
 load(name:string) { if (!PERSONAS.includes(name as typeof PERSONAS[number])) throw new Error('未知人格'); return readFileSync(join(this.dir,`${name}.md`),'utf8').trim(); }
}
