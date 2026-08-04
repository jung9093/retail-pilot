import { Router } from 'express';
import { callGroqModel } from '../utils/groqModel.js';

export const inventoryRouter = Router();

const SYSTEM = `You are an expert retail inventory analyst. The user will paste an inventory snapshot
(CSV-like rows or a table) with at least these columns when available: sku, name, on_hand, weekly_velocity, lead_time_days, unit_cost, supplier.

Produce a JSON response with this exact shape:
{
  "summary": "<2-3 sentence executive summary of inventory health>",
  "stockoutRisks": [
    { "name": "...", "sku": "...", "daysUntilStockout": 14, "severity": "high|medium|low", "action": "..." }
  ],
  "overstock": [
    { "name": "...", "sku": "...", "weeksOfCover": 12, "action": "..." }
  ],
  "reorderList": [
    { "name": "...", "sku": "...", "orderQty": 50, "reason": "..." }
  ],
  "quickWins": ["...", "..."]
}
Be quantitative. Compute daysUntilStockout = on_hand / (weekly_velocity/7). Flag severity by days:
<7 = high, 7-14 = medium, >14 = low. Flag overstock when weeksOfCover > 8.
Respond ONLY with valid JSON. No prose outside the JSON.`;

inventoryRouter.post('/analyze', async (req, res) => {
  try {
    const { inventory } = req.body || {};
    if (!inventory || !inventory.trim()) {
      return res.status(400).json({ error: 'inventory text is required' });
    }
    const messages = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Here is my inventory snapshot:\n\n${inventory}\n\nAnalyze it.` },
    ];
    const raw = await callGroqModel(messages, { temperature: 0.2, json: true, maxTokens: 1400 });

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { parsed = { summary: raw, stockoutRisks: [], overstock: [], reorderList: [], quickWins: [] }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
