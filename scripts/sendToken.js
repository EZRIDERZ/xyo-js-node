import 'dotenv/config';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction
} from '@solana/spl-token';

// === CONFIGURATION ===
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const MINT_ADDRESS = new PublicKey('FCZKwHd9Qn1EQj8fFuNLB8dupAWCoJJNePbMqyHhS77b'); // wXYO
const RECEIVER_ADDRESS = new PublicKey('BaW9F2ZghEkiWSy7tJBLiVew8i9eaegyWb4cx5mNfyQm'); // Ton wallet Phantom
const AMOUNT = 10; // Nombre de tokens à envoyer

// === RECONSTRUCTION DU WALLET ===
const secretArray = JSON.parse(process.env.PHANTOM_PRIVATE_KEY);
const sender = Keypair.fromSecretKey(Uint8Array.from(secretArray));

// === CONNEXION AU RÉSEAU ===
const connection = new Connection(SOLANA_RPC, 'confirmed');

async function sendToken() {
  console.log('🚀 Envoi de', AMOUNT, 'wXYO vers', RECEIVER_ADDRESS.toBase58());

  // Création ou récupération des comptes token associés
  const senderATA = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    MINT_ADDRESS,
    sender.publicKey
  );

  const receiverATA = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    MINT_ADDRESS,
    RECEIVER_ADDRESS
  );

  // Construction de la transaction
  const tx = new Transaction().add(
    createTransferInstruction(
      senderATA.address,
      receiverATA.address,
      sender.publicKey,
      AMOUNT * 10 ** 6 // wXYO a 6 décimales
    )
  );

  // Signature et envoi
  const signature = await sendAndConfirmTransaction(connection, tx, [sender]);

  console.log(`✅ Transfert confirmé ! Signature : ${signature}`);
}

sendToken().catch((err) => {
  console.error('❌ Erreur lors du transfert :', err.message);
});
