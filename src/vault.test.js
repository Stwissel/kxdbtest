import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { init, createDatabase, saveDatabase, loadDatabase, clearDatabase } from '../src/vault';
import * as kdbxweb from 'kdbxweb';

describe('Vault Kxdb Tests', () => {
  beforeEach(() => {
    init();
  });

  afterEach(() => {
    clearDatabase();
  });

  it('should create a new database', async () => {
    const db = await createDatabase('test');
    expect(db).toBeDefined();
  });

  it('should save the database', async () => {
    const db = await createDatabase('test');
    const arrayBuffer = await saveDatabase(db);
    expect(arrayBuffer).toBeDefined();
  });

  it('should load the database', async () => {
    const db = await createDatabase('test');
    const arrayBuffer = await saveDatabase(db);
    const loadedDb = await loadDatabase(arrayBuffer, 'test');
    expect(loadedDb).toBeDefined();
  });
});
