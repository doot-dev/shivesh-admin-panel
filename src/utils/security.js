import cryptoJs from "crypto-js";
import crypto from "crypto-js";

const { AES, enc, HmacSHA256 } = crypto;
// encryption function
export function encrypt(data) {
  const key = import.meta.env.VITE_AES_TOKEN;
  return cryptoJs.AES.encrypt(data, key).toString();
}

// decryption function
export function decrypt(ciphertext) {
  const key = import.meta.env.VITE_AES_TOKEN;
  const bytes = cryptoJs.AES.decrypt(ciphertext, key);
  return bytes.toString(cryptoJs.enc.Utf8);
}

// generate hash function
export function generateHash(data) {
  const hmacKey = import.meta.env.VITE_HMAC_TOKEN;
  return cryptoJs.HmacSHA256(data, hmacKey).toString();
}
