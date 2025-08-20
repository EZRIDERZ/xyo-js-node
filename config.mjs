import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

// 🔧 Config globale
export const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
export const MINT_ADDRESS = new PublicKey("FCZKwHd9Qn1EQj8fFuNLB8dupAWCoJJNePbMqyHhS77b"); // wXYO
export const SENDER_SECRET = Uint8Array.from(JSON.parse(process.env.SENDER_SECRET));
export const RECEIVER_ADDRESS = new PublicKey("BaW9F2ZghEkiWSy7tJBLiVew8i9eaegyWb4cx5mNfyQm"); // Destinataire
export const AMOUNT = 0.1; // en token
