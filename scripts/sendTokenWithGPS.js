// sendTokenWithGPS.js
import 'dotenv/config';
import bs58 from 'bs58';
import {
  Connection, Keypair, PublicKey, clusterApiUrl
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
} from '@solana/spl-token';
import fs from 'fs';

// --- Lecture clé privée expéditeur depuis .env ---
const secretKeyBase58 = process.env.PHANTOM_PRIVATE_KEY?.trim();
if (!secretKeyBase58) throw new Error("PHANTOM_PRIVATE_KEY manquante dans .env");
const fromWallet = Keypair.fromSecretKey(bs58.decode(secretKeyBase58));

// --- Constantes depuis .env ou codées en dur ---
const TOKEN_MINT = new PublicKey(process.env.GPS_TOKEN_MINT?.trim() || 'FCZKwHd9Qn1EQj8fFuNLB8dupAWCoJJNePbMqyHhS77b');
const TO_PUBLIC_KEY = new PublicKey(process.env.GPS_DEST_PUBLIC_KEY?.trim() || 'BaW9F2ZghEkiWSy7tJBLiVew8i9eaegyWb4cx5mNfyQm');
const AMOUNT = Number(process.env.GPS_AMOUNT || 1); // 1 token
const DECIMALS = Number(process.env.GPS_DECIMALS || 6);

// --- Connexion Devnet ---
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// --- Lecture GPS ---
function getGPS() {
  const gpsFile = './gps.json';
  if (!fs.existsSync(gpsFile)) throw new Error("gps.json introuvable");
  const { lat, lon } = JSON.parse(fs.readFileSync(gpsFile, 'utf8'));
  return { lat, lon };
}

async function main() {
  const { lat, lon } = getGPS();
  console.log(`📍 Position: ${lat}, ${lon}`);

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, fromWallet, TOKEN_MINT, fromWallet.publicKey
  );

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, fromWallet, TOKEN_MINT, TO_PUBLIC_KEY
  );

  const sig = await transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    AMOUNT * (10 ** DECIMALS)
  );

  console.log(`✅ Transfert de ${AMOUNT} tokens effectué`);
  console.log(`🔗 https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch(console.error);
