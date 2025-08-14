// src/api/server.js
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur XYO lancé sur http://localhost:${PORT}`);
});
