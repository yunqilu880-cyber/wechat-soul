import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Message } from '../ai/index.js';
export class StorageService {
  readonly db: DatabaseSync;
  constructor(dir: string) { mkdirSync(dir,{recursive:true}); this.db=new DatabaseSync(join(dir,'wechat-soul.db')); this.db.exec('PRAGMA journal_mode = WAL'); this.db.exec(`CREATE TABLE IF NOT EXISTS sessions(user_id TEXT PRIMARY KEY, persona TEXT NOT NULL DEFAULT 'default', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id,id); CREATE TABLE IF NOT EXISTS memories(id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS deliveries(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS owner(user_id TEXT PRIMARY KEY);`); }
  history(user:string, limit=20): Message[] { return (this.db.prepare('SELECT role,content FROM (SELECT id,role,content FROM messages WHERE user_id=? ORDER BY id DESC LIMIT ?) ORDER BY id').all(user,limit) as Message[]); }
  addMessage(user:string, role:'user'|'assistant', content:string) { this.db.prepare('INSERT INTO messages(user_id,role,content) VALUES(?,?,?)').run(user,role,content); this.db.prepare('INSERT INTO sessions(user_id) VALUES(?) ON CONFLICT(user_id) DO UPDATE SET updated_at=CURRENT_TIMESTAMP').run(user); }
  clear(user:string) { this.db.prepare('DELETE FROM messages WHERE user_id=?').run(user); }
  clearAll(user:string) { this.db.exec('BEGIN');try{this.clear(user);this.db.prepare('DELETE FROM memories WHERE user_id=?').run(user);this.db.prepare('DELETE FROM sessions WHERE user_id=?').run(user);this.db.exec('COMMIT');}catch(e){this.db.exec('ROLLBACK');throw e;} }
  claimDelivery(id:string,user:string): boolean { return this.db.prepare('INSERT OR IGNORE INTO deliveries(id,user_id) VALUES(?,?)').run(id,user).changes===1; }
  owner():string|undefined { return (this.db.prepare('SELECT user_id FROM owner LIMIT 1').get() as {user_id:string}|undefined)?.user_id; }
  bindOwner(id:string) { this.db.prepare('INSERT INTO owner(user_id) VALUES(?)').run(id); }
  persona(user:string) { return (this.db.prepare('SELECT persona FROM sessions WHERE user_id=?').get(user) as {persona:string}|undefined)?.persona ?? 'default'; }
  setPersona(user:string,name:string) { this.db.prepare('INSERT INTO sessions(user_id,persona) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET persona=excluded.persona,updated_at=CURRENT_TIMESTAMP').run(user,name); }
}
