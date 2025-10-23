import * as dotenv from "dotenv";
import CryptoJS from 'crypto-js';
dotenv.config();

const secretKey = process.env.SECRET_KEY || 'bWljZXJvb3RjcmV3Y29hbHdvcmtkcmVhbWZpZnRlZW50aHJld21hdGhlbWF0aWNzcGw=';

export function encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
}

export function decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}