import type { StorageService } from '../storage/index.js';
export type Memory = {id:number;content:string;created_at:string;updated_at:string};
export class MemoryService {
 constructor(private storage:StorageService) {}
 add(user:string,content:string) { return Number(this.storage.db.prepare('INSERT INTO memories(user_id,content) VALUES(?,?)').run(user,content).lastInsertRowid); }
 list(user:string,limit=20):Memory[] { return this.storage.db.prepare('SELECT id,content,created_at,updated_at FROM memories WHERE user_id=? ORDER BY id DESC LIMIT ?').all(user,limit) as Memory[]; }
 forget(user:string,id:number) { return this.storage.db.prepare('DELETE FROM memories WHERE user_id=? AND id=?').run(user,id).changes>0; }
}
