import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({
    ok: true,
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    tokenConfigured: !!(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('PASTE_')),
  });
});
