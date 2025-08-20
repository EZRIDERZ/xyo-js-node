// scripts/updateGPS.js
// Lit un fichier GPS brut (OwnTracks, GPS Logger...) et extrait lat/lon vers gps.json

import fs from 'fs';

// === CONFIG ===
const sourcePath = './raw-gps.json'; // fichier brut exporté par OwnTracks ou GPS Logger
const targetPath = './gps.json';     // fichier utilisé par sendTokenWithGPS.js

function extractGPS() {
  try {
    const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

    // Adaptation selon format OwnTracks ou GPS Logger
    const lat = raw.lat ?? raw.latitude ?? raw._type === 'location' ? raw.lat : null;
    const lon = raw.lon ?? raw.longitude ?? raw._type === 'location' ? raw.lon : null;

    if (!lat || !lon) throw new Error("Coordonnées GPS non trouvées");

    const gps = { lat, lon };
    fs.writeFileSync(targetPath, JSON.stringify(gps, null, 2));
    console.log(`✅ Coordonnées GPS mises à jour : ${lat}, ${lon}`);
  } catch (err) {
    console.error("❌ Erreur lecture GPS brut :", err.message);
  }
}

extractGPS();
