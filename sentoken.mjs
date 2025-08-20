import { Connection, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { SOLANA_RPC, MINT_ADDRESS, SENDER_SECRET, RECEIVER_ADDRESS, AMOUNT } from "./config.mjs";

const connection = new Connection(SOLANA_RPC);
const sender = Keypair.fromSecretKey(SENDER_SECRET);

export async function sendToken() {
  // Comptes token associés
  const senderAccount = await getOrCreateAssociatedTokenAccount(connection, sender, MINT_ADDRESS, sender.publicKey);
  const receiverAccount = await getOrCreateAssociatedTokenAccount(connection, sender, MINT_ADDRESS, RECEIVER_ADDRESS);

  // Transfert
  const tx = new Transaction().add(
    createTransferInstruction(
      senderAccount.address,
      receiverAccount.address,
      sender.publicKey,
      AMOUNT * 10 ** 6 // 6 décimales
    )
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [sender]);
  console.log(`✅ Token envoyé. Signature: ${sig}`);
}
