import { Account } from '@xyo-network/account';

// Création asynchrone d'un compte XYO
const account = await Account.create();

console.log("🔑 Adresse publique :", account.address);
console.log("🔐 Clé privée      :", account.privateKey);
