import { Router } from 'express';
import { callGroqModel } from '../utils/groqModel.js';

export const recommendRouter = Router();

const SYSTEM = `You are a retail merchandising assistant. The user will describe a product
and optionally their store's category. Generate merchandising and recommendation advice.
Respond ONLY with this JSON:
{
  "bundles": [
    { "name": "...", "items": ["primary", "add-on 1", "add-on 2"], "pitch": "..." }
  ],
  "crossSell": [{ "product": "...", "why": "..." }],
  "upSell": [{ "product": "...", "priceDelta": 0, "why": "..." }],
  "displayTip": "...",
  "tagline": "..."
}
Think like a category manager. Be specific.`;

recommendRouter.post('/suggest', async (req, res) => {
  try {
    const { product, category = '' } = req.body || {};
    if (!product || !product.trim()) {
      return res.status(400).json({ error: 'product is required' });
    }
    const userMsg = category
      ? `Product: ${product}\nCategory/store: ${category}`
      : `Product: ${product}`;
    const messages = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userMsg },
    ];
    const raw = await callGroqModel(messages, { temperature: 0.5, json: true, maxTokens: 1100 });

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { parsed = { tagline: raw }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
