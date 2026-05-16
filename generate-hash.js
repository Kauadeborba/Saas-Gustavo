const { pbkdf2Sync, randomBytes } = require('crypto');

const HASH_PREFIX = 'pbkdf2_sha512';
const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${HASH_PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

const password = 'Kaua2006@';
const hash = hashPassword(password);

console.log('Senha: ' + password);
console.log('Hash: ' + hash);
console.log('\nCopie o hash acima para usar no SQL!');
