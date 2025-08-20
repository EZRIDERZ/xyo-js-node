import { sendToken } from "./sendToken.mjs";

// Exemple: tu remplaces cette condition par ta validation GPS
const gpsValide = true;

if (gpsValide) {
  await sendToken();
} else {
  console.log("📍 Position GPS invalide, envoi annulé.");
}
