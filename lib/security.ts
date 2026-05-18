import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const HASH_PREFIX = 'pbkdf2_sha512';
const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

// Gera hash de senha com salt e iterações.
// Formato salvo no banco: prefix$iterations$salt$hash
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${HASH_PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

// Valida a senha informada comparando com o hash armazenado.
export function verifyPassword(password: string, storedHash: string) {
  console.log('=== DEBUG verifyPassword ===');
  console.log('password recebido:', password);
  console.log('storedHash recebido:', storedHash);
  console.log('storedHash contém "$"?', storedHash.includes('$'));
  console.log('=================');
  const [prefix, iterationsRaw, salt, hash] = storedHash.split('$');

  if (!prefix || !iterationsRaw || !salt || !hash) {
    console.log('❌ Hash INVÁLIDO - faltam componentes');
    console.log('prefix:', prefix, '| iterationsRaw:', iterationsRaw, '| salt:', salt, '| hash:', hash);
    return false;
  }

  if (prefix !== HASH_PREFIX) {
    console.log('❌ Prefix errado:', prefix);
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    console.log('❌ Iterações inválidas:', iterations);
    return false;
  }

  const candidate = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');

  const expectedBuffer = Buffer.from(hash, 'hex');
  const candidateBuffer = Buffer.from(candidate, 'hex');

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}
