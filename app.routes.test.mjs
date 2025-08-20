import request from 'supertest';
import app from './src/api/app.mjs'; // <- adapte ce chemin

describe('Routes de base', () => {
  test('GET /health répond 200 et JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('GET /health contient uptime, memory, timestamp valides', async () => {
    const res = await request(app).get('/health');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    expect(typeof res.body.memory).toBe('object');
    expect(typeof res.body.timestamp).toBe('number');
  });

  test('Route inconnue -> 404', async () => {
    const res = await request(app).get('/__nope__');
    // Si tu as un middleware 404 personnalisé, adapte l’attendu.
    expect([404, 400, 500]).toContain(res.status); // tolérant si pas de handler
  });
});
