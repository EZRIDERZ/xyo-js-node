// create-key.mjs
import { Account } from '@xyo-network/account';

// Génère un nouvel account
const account = await Account.create();

// Conversion ArrayBuffer -> hex pour la clé privée
const privBytes = new Uint8Array(account._privateKey._bytes);
const privHex = Buffer.from(privBytes).toString('hex');

// Même principe si tu veux la clé publique
const pubAddr = account.address; // déjà en format lisible dans la lib

console.log("🔑 Adresse publique :", pubAddr);
console.log("🔐 Clé privée (hex) :", privHex);
