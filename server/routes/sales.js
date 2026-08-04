import { Router } from 'express';
import { callGroqModel } from '../utils/groqModel.js';

export const salesRouter = Router();

const SYSTEM = `You are a retail sales strategist. The user will paste recent sales data
(weekly or daily) and optionally a product. Analyze it and respond ONLY with this JSON:
{
  "trend": "up|down|flat",
  "trendPct": 12,
  "forecastNext30d": 45000,
  "drivers": ["...", "..."],
  "pricingAdvice": [
    { "product": "...", "currentPrice": 0, "suggestedPrice": 0, "rationale": "..." }
  ],
  "campaignIdeas": [
    { "name": "...", "channel": "in-store|instagram|email|...", "mechanic": "...", "expectedLift": "..." }
  ],
  "watchouts": ["...", "..."]
}
If exact numbers are not given, estimate conservatively and say so. Pricing advice must respect
typical retail margins. Be concrete, not generic.`;

salesRouter.post('/forecast', async (req, res) => {
  try {
    const { data, focus = '' } = req.body || {};
    if (!data || !data.trim()) {
      return res.status(400).json({ error: 'sales data is required' });
    }
    const userMsg = focus
      ? `Sales data:\n${data}\n\nFocus area: ${focus}`
      : `Sales data:\n${data}`;
    const messages = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userMsg },
    ];
    const raw = await callGroqModel(messages, { temperature: 0.4, json: true, maxTokens: 1300 });

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { parsed = { trend: 'flat', summary: raw }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
