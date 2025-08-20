import 'dotenv/config';
import pkg from '@xyo-network/bound-witness';
import { Account } from '@xyo-network/account';
import { Buffer } from 'buffer';

const { BoundWitness } = pkg;

// Lecture de la clé privée
const PRIVATE_KEY_HEX = process.env.XYO_PRIVATE_KEY.replace(/'/g, '');
const privBytes = Buffer.from(PRIVATE_KEY_HEX, 'hex');
const account = await Account.fromPrivateKey(privBytes);

// Données GPS (à remplacer par termux-location plus tard)
const gpsData = {
  latitude: 43.8355,
  longitude: 5.0415,
  timestamp: Date.now()
};

// Encodage simple en JSON → Buffer
const payload = Buffer.from(JSON.stringify(gpsData));

// Création du Bound Witness
const bw = await BoundWitness.create(account, [payload]);

console.log('📡 Données GPS :', gpsData);
console.log('📦 Bound Witness (hex) :', bw.toHex());
console.log('🔗 Adresse publique :', account.address);
