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
  const [prefix, iterationsRaw, salt, hash] = storedHash.split('$');

  if (!prefix || !iterationsRaw || !salt || !hash) {
    return false;
  }

  if (prefix !== HASH_PREFIX) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) {
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
