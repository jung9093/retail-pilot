import { Router } from 'express';
import { callGroqModel } from '../utils/groqModel.js';

export const sentimentRouter = Router();

const SYSTEM = `You are a customer-experience analyst for a retail brand. The user will paste customer
reviews (one per line, or a block). Analyze them and respond ONLY with this JSON shape:
{
  "overall": { "score": 0-100, "label": "positive|mixed|negative", "summary": "..." },
  "themes": [
    { "theme": "...", "sentiment": "positive|negative|neutral", "mentions": 3, "example": "quote from a review" }
  ],
  "topComplaints": ["...", "..."],
  "topPraises": ["...", "..."],
  "actionsThisWeek": ["...", "..."]
}
Be honest. If reviews are short, say so. Action items must be specific to a retail owner (e.g.
"Train staff on fitting-room restocking", not "Improve service").`;

sentimentRouter.post('/analyze', async (req, res) => {
  try {
    const { reviews } = req.body || {};
    if (!reviews || !reviews.trim()) {
      return res.status(400).json({ error: 'reviews text is required' });
    }
    const messages = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Here are the customer reviews:\n\n${reviews}\n\nAnalyze them.` },
    ];
    const raw = await callGroqModel(messages, { temperature: 0.3, json: true, maxTokens: 1300 });

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { parsed = { overall: { label: 'unknown', summary: raw }, themes: [], topComplaints: [], topPraises: [], actionsThisWeek: [] }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
