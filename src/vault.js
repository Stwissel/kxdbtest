import * as kdbxweb from 'kdbxweb';

const VAULT_DB_NAME = 'Sample Vault';
const VAULT_DB_GROUP_NAME = 'Sample Group';
const subtle = window.crypto.subtle;
let vault = null;

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

const vaultArgon2 = ((password, salt,
  memory, iterations, length, parallelism, type, version) => new Promise((resolve, reject) => {
    console.log('Vault Argon2');

    // Encode password and salt to ArrayBuffers
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);
    const algorithm = {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    };
    const derivedKeyAlgorithm = {
      name: 'AES-CBC',
      length: 256,
    };


    subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey'])
      .then(baseKey => subtle.deriveKey(
        algorithm,
        baseKey,
        derivedKeyAlgorithm,
        true,
        ['encrypt']
      ))
      .then(derivedKey => subtle.exportKey('raw', derivedKey))
      .then(derivedKey => {
        const expandedKey = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
          expandedKey[i] = derivedKey[i % derivedKey.byteLength] ^ (i % 256);
        }
        const result = Array.from(expandedKey)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
        resolve(expandedKey);
      })
      .catch(reject);
  }));

const init = async () => {
  /** Code to run on startup */
  kdbxweb.CryptoEngine.setArgon2Impl(vaultArgon2);
  console.log('Vault initialized');
  return Promise.resolve();
};

export { init, createDatabase, saveDatabase, loadDatabase, clearDatabase };