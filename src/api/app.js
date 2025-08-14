// src/api/app.js
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
    timestamp: new Date().toISOString()
  });
});

export default app;
