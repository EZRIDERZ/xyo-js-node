// scripts/createMintDevnet.js
// Création d’un mint SPL sur Devnet, ATA et mint de tokens dans ton wallet Phantom

import 'dotenv/config';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} = require('@solana/spl-token');

// Connexion Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Lecture clé privée Phantom (Base58) depuis .env
const secretKeyBase58 = process.env.PHANTOM_PRIVATE_KEY?.trim();
if (!secretKeyBase58) {
  console.error("❌ PHANTOM_PRIVATE_KEY manquante dans .env");
  process.exit(1);
}

let fromWallet;
try {
  fromWallet = Keypair.fromSecretKey(bs58.decode(secretKeyBase58));
} catch {
  console.error("❌ Clé privée invalide. Vérifie ton .env");
  process.exit(1);
}

console.log("✅ Wallet:", fromWallet.publicKey.toBase58());

// Airdrop si solde insuffisant
async function airdropIfNeeded(minLamports = 0.5 * 1e9) {
  const balance = await connection.getBalance(fromWallet.publicKey);
  if (balance >= minLamports) {
    console.log(`💰 Solde suffisant: ${(balance / 1e9).toFixed(3)} SOL`);
    return;
  }
  console.log("🚰 Airdrop 1 SOL Devnet...");
  const sig = await connection.requestAirdrop(fromWallet.publicKey, 1e9);
  const bh = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...bh }, 'confirmed');
  console.log(`💵 Nouveau solde: ${(await connection.getBalance(fromWallet.publicKey) / 1e9).toFixed(3)} SOL`);
}

(async () => {
  await airdropIfNeeded();

  // 1) Création mint SPL
  console.log("🪙 Création du mint SPL...");
  const mint = await createMint(
    connection,
    fromWallet,
    fromWallet.publicKey, // mint authority
    fromWallet.publicKey, // freeze authority
    9                     // décimales
  );
  console.log("✅ Mint address:", mint.toBase58());

  // 2) Création/récup ATA
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey
  );
  console.log("✅ ATA address:", ata.address.toBase58());

  // 3) Mint de 100 tokens vers ATA
  const amount = 100 * 10 ** 9; // 100 tokens avec 9 décimales
  const sigMint = await mintTo(
    connection,
    fromWallet,
    mint,
    ata.address,
    fromWallet.publicKey,
    amount
  );
  console.log("✅ Tokens mintés. TX:", sigMint);

  console.log("\n🎯 Résumé:");
  console.log("Mint SPL:", mint.toBase58());
  console.log("ATA Owner:", ata.address.toBase58());
  console.log("Owner Wallet:", fromWallet.publicKey.toBase58());
})();
