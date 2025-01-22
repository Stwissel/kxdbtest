import * as kdbxweb from 'kdbxweb';
import { argon2d, argon2id } from '@noble/hashes/argon2';

const VAULT_DB_NAME = 'Sample Vault';
const VAULT_DB_GROUP_NAME = 'Sample Group';
const subtle = window.crypto.subtle;
let vault = null;

const vaultArgon2 = ((password, salt,
  memory, iterations, length, parallelism, type, version) => new Promise((resolve, reject) => {
    const argon2 = type === 0 ? argon2d : argon2id;
    try {
      const bytes = argon2(
        new Uint8Array(password),
        new Uint8Array(salt),
        {
          t: iterations,
          m: memory,
          p: parallelism,
          dkLen: length,
          version,
        },
      );
      resolve(bytes.buffer);
    } catch (error) {
      reject(error);
    }

  }));

/**
 * Creates a new database if non exists, minimal check for passphrase
 * 
 * @param {string} passPhrase - The passphrase to use for the database
 * @returns {Promise<Kdbx>}
 */
const createDatabase = (passPhrase) => new Promise(async (resolve, reject) => {

  if (!passPhrase) {
    return reject(new Error('No passphrase provided'));
  }

  if (vault) {
    return reject('Vault already exists');
  }

  try {
    const protectedValue = kdbxweb.ProtectedValue.fromString(passPhrase);
    const credentials = new kdbxweb.Credentials(protectedValue);
    const db = kdbxweb.Kdbx.create(credentials, VAULT_DB_NAME);
    db.createGroup(db.getDefaultGroup(), VAULT_DB_GROUP_NAME);
    vault = db;
    resolve(db);
  } catch (error) {
    reject(error);
  }
});

/**
 * Saves the database to a file (ArrayBuffer)
 * 
 * @returns {Promise<ArrayBuffer>} The database as an ArrayBuffer
 */
const saveDatabase = () => new Promise((resolve, reject) => {
  if (!vault) {
    return reject('Vault not present');
  }
  vault.save().then(arrayBuffer => {
    resolve(arrayBuffer);
  }).catch(reject);
});

/**
 * Loads a database from an ArrayBuffer
 * 
 * @param {ArrayBuffer} source - The database as an ArrayBuffer
 * @param {string} passphrase - The passphrase to use for the database
 * @returns {Promise<kdbxweb.Kdbx>} The database
 */
const loadDatabase = (source, passphrase) => new Promise((resolve, reject) => {
  const protectedValue = kdbxweb.ProtectedValue.fromString(passphrase);
  const credentials = new kdbxweb.Credentials(protectedValue);
  kdbxweb.Kdbx.load(source, credentials)
    .then(db => {
      vault = db;
      resolve(db);
    }).catch(reject);
});

const clearDatabase = () => {
  vault = null;
  return Promise.resolve();
};

const init = async () => {
  /** Code to run on startup */
  kdbxweb.CryptoEngine.setArgon2Impl(vaultArgon2);
  console.log('Vault initialized');
  return Promise.resolve();
};

export { init, createDatabase, saveDatabase, loadDatabase, clearDatabase };
