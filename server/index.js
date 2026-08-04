import { app } from './app.js';

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`\n🛍  Retail Copilot API live on http://localhost:${PORT}`);
  console.log(`🤖 Provider: Groq · Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('PASTE_')) {
    console.log(`⚠️  GROQ_API_KEY not set — edit .env and restart.`);
  }
});
