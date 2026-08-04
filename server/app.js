import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import express from 'express';
import cors from 'cors';

// Load .env from the PROJECT ROOT (one level up from /server).
// On Vercel this file is a no-op (env vars come from the dashboard instead),
// dotenv silently does nothing if the file isn't found.
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

import { chatRouter } from './routes/chat.js';
import { inventoryRouter } from './routes/inventory.js';
import { sentimentRouter } from './routes/sentiment.js';
import { salesRouter } from './routes/sales.js';
import { recommendRouter } from './routes/recommend.js';
import { snowflakeRouter } from './routes/snowflake.js';
import { healthRouter } from './routes/health.js';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/sentiment', sentimentRouter);
app.use('/api/sales', salesRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/snowflake', snowflakeRouter);

export default app;
