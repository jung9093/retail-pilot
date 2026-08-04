// Vercel Serverless Function entry point.
// Vercel's Node.js runtime accepts any module whose default export is a
// (req, res) => void handler — an Express app instance satisfies that,
// so we just re-export the shared app (no app.listen here).
import { app } from '../server/app.js';

export default app;
