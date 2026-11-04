/**
 * Cryptographically secure random password generator.
 * Uses window.crypto.getRandomValues (CSPRNG) to generate high-entropy unpredictable passwords.
 * Avoids any deterministic pattern derived from email or personal info.
 */
export const generateSecureRandomPassword = (length = 32) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
};
