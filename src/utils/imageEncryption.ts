import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Encryption Configuration
const algorithm = 'aes-256-cbc'; // AES algorithm
const secretKey = process.env.ENCRYPTION_KEY || 'your-32-byte-long-secret-key';
const iv = crypto.randomBytes(16); // Initialization vector

// Function to encrypt the image
export const encryptImage = (filePath: string): Buffer => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  const input = fs.readFileSync(filePath); // Read the image as buffer
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  return Buffer.concat([iv, encrypted]); // Prepend IV to the encrypted data
};

// Function to decrypt the image
export const decryptImage = (encryptedData: Buffer): Buffer => {
  const iv = encryptedData.slice(0, 16); // Extract IV from the beginning
  const encryptedText = encryptedData.slice(16); // The rest is the encrypted image data
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted;
};
