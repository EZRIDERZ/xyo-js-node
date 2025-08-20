import 'dotenv/config';
import bwPkg from '@xyo-network/bound-witness';
import * as dataPkg from '@xyo-network/data';
import { Account } from '@xyo-network/account';
import { Buffer } from 'buffer';

const BoundWitness = bwPkg.BoundWitness || bwPkg.default;
const { Data } = dataPkg;

const PRIVATE_KEY_HEX = process.env.XYO_PRIVATE_KEY.replace(/'/g, '');
const privBytes = Buffer.from(PRIVATE_KEY_HEX, 'hex');
const account = await Account.fromPrivateKey(privBytes);

// Pour l’instant, coordonnées fixes
const gpsData = {
  latitude: 43.8355,
  longitude: 5.0415,
  timestamp: Date.now()
};

// ⚠️ Si `Data.encodeObject` n’existe pas dans ta version
//   remplace cette ligne par : const payload = Buffer.from(JSON.stringify(gpsData));
const payload = Data.encodeObject
  ? Data.encodeObject(gpsData)
  : Buffer.from(JSON.stringify(gpsData));

const bw = await BoundWitness.create(account, [payload]);

console.log('📡 Données GPS :', gpsData);
console.log('📦 Bound Witness (hex) :', bw.toHex());
console.log('🔗 Adresse publique :', account.address);
