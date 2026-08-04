import { Router } from 'express';
import { callGroqModel } from '../utils/groqModel.js';

export const chatRouter = Router();

const SYSTEM = `You are RetailPilot, an expert AI copilot for retail store owners and managers.
You understand the daily reality of running a shop: thin margins, foot traffic, seasonal swings,
stockouts, supplier delays, staffing, returns, loyalty programs, and customer churn.

When responding:
- Be specific and actionable, not generic. Reference concrete retail tactics.
- Use short sections, bullet points, and bolded action items.
- If the user gives numbers (sales, stock, returns), reason about them.
- Suggest a measurable next step the store owner can act on today.
- Never invent exact statistics you don't know; reason from the user's data instead.
- Keep answers tight (under 250 words) unless asked for depth.

The user may have uploaded real store data (inventory snapshot, customer reviews, and/or sales
figures) via the other tabs in this app. When a "STORE DATA CONTEXT" block is included below,
you MUST ground your answer in it — cite specific SKUs, products, numbers, or review themes from
it rather than speaking generically. If no context is provided, or the question is unrelated to
the data provided, answer from general retail expertise instead.`;

// Keep the context block bounded so we don't blow past the model's context window
// or the request size limit if someone pastes a huge CSV/PDF dump.
const MAX_CONTEXT_CHARS = 6000;

function truncate(str = '', max = MAX_CONTEXT_CHARS) {
  const s = String(str || '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n…(truncated, ${s.length - max} more characters)`;
}

function buildContextBlock(context) {
  if (!context) return '';
  const { inventory, reviews, sales } = context;
  const sections = [];
  if (inventory?.trim()) sections.push(`## Inventory snapshot\n${truncate(inventory)}`);
  if (reviews?.trim()) sections.push(`## Customer reviews\n${truncate(reviews)}`);
  if (sales?.trim()) sections.push(`## Sales data\n${truncate(sales)}`);
  if (sections.length === 0) return '';
  return `STORE DATA CONTEXT (uploaded by the user in other tabs):\n\n${sections.join('\n\n')}`;
}

chatRouter.post('/', async (req, res) => {
  try {
    const { message, history = [], context } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    const contextBlock = buildContextBlock(context);
    const systemMessages = [{ role: 'system', content: SYSTEM }];
    if (contextBlock) {
      systemMessages.push({ role: 'system', content: contextBlock });
    }

    const messages = [
      ...systemMessages,
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];
    const reply = await callGroqModel(messages, { temperature: 0.5, maxTokens: 700 });
    res.json({
      reply,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      usedContext: !!contextBlock,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
