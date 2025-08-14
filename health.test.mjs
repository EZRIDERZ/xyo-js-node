// health.test.js
import request from 'supertest';
import app from './src/api/app.js'; // chemin adapté

describe('GET /health', () => {
  it('doit répondre 200 avec { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('doit contenir uptime, memory et timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');

    expect(res.body).toHaveProperty('memory');
    expect(typeof res.body.memory).toBe('number');

    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
