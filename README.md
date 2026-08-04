# 🛍️ RetailPilot — AI Copilot for Retail

> An AI copilot that **understands retail workflows** and gives owners/managers **actionable** answers, not generic chat.

Built with **React + Vite + Tailwind CSS** (light theme, purple + white) and an **Express** backend that calls **Groq** (`llama-3.3-70b-versatile`) — fast inference, generous free tier.

---

## ⚡ Quick start — just 2 commands

```bash
# 1) Install EVERYTHING (root + server + client)
npm install

# 2) Paste your Groq API key into .env, then run
npm start
```

Open **http://localhost:5173** — that's it.

> The single `npm install` at the root installs the root tool (concurrently) plus the `server/` and `client/` workspaces. `npm start` uses `concurrently` to boot the API and the Vite dev server together.

---

## 🔐 Configure Groq

1. Grab a free API key at **https://console.groq.com/keys**.
2. Open `.env` and replace the placeholder:

```env
GROQ_API_KEY=gsk_YOUR_KEY_HERE
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
PORT=8787
```

The server will refuse to call the model until the key is set, so you can't silently fail.

### Swap models

Change `GROQ_MODEL` in `.env` to any model your Groq account can access, e.g.:
- `llama-3.3-70b-versatile` *(default — great quality/speed balance)*
- `llama-3.1-8b-instant` *(fastest, cheapest)*
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

Restart the server. No code changes needed.

---

## ✨ Features

| # | Feature | Real-life problem it solves |
|---|---------|-----------------------------|
| 1 | **Copilot Chat** | Owner asks free-form questions about operations; gets specific tactics grounded in whatever inventory/reviews/sales data has been uploaded elsewhere in the app — not generic advice. |
| 2 | **Inventory AI** | Detects stockout risks, flags overstock, generates a reorder list with quantities and reasons. |
| 3 | **Review Pulse (Sentiment)** | Turns hundreds of reviews into a score, themes, top complaints/praises, and a 7-day action list. |
| 4 | **Sales Strategy** | 30-day revenue forecast, pricing advice per product, and campaign ideas with channel + expected lift. |
| 5 | **Merchandising** | For any product: bundles, cross-sell, up-sell, display tip, and a ready-to-use tagline. |
| 6 | **Snowflake Demo** | Shows how a retail org can analyze demand, anomalies, and customer segments using Snowflake-powered warehouse queries and a Coco CLI workflow. |

---

## ❄️ Snowflake + Coco CLI

Snowflake is a cloud data platform built for large-scale analytical workloads. In retail, it is ideal for bringing together orders, inventory, customer, marketing, and fulfillment data in one place so teams can run fast SQL queries and dashboards without moving data across disconnected tools.

This project includes a dedicated Snowflake demo page that shows:

- demand forecasting for high-velocity SKUs
- anomaly detection for unusual sales or return patterns
- loyalty segmentation for personalized campaign planning

Coco CLI is a lightweight command-line workflow for interacting with the Snowflake environment, running validation checks, and exporting the results into dashboards or downstream operational tools. In practice, it reduces manual data-jumping and creates a repeatable analytics flow for business teams.

The demo is intentionally lightweight and front-end driven so you can understand the pattern quickly without needing live Snowflake credentials.

---

## 🧪 Snowflake demo experience

Open the new Snowflake tab in the app to see a dynamic retail case study switch between three scenarios:

- Demand Forecasting
- Anomaly Detection
- Loyalty Segmentation

Each scenario includes:

- a summary of the business use case
- key metrics and trend bars
- Snowflake SQL examples
- a Coco CLI command example
- recommended next actions for the business team

---

## 🧱 Project structure

```
retail-copilot/
├── package.json          # root — concurrently, 2 commands
├── vercel.json           # Vercel deployment config (static client + serverless API)
├── VERCEL_DEPLOY.txt     # step-by-step Vercel deploy instructions
├── .env / .env.example   # Groq API key + model config
├── api/
│   └── index.js          # Vercel serverless entry — wraps the Express app
├── server/               # Express + Groq proxy
│   ├── app.js            # Express app factory (exported, no .listen)
│   ├── index.js          # local dev entrypoint (imports app.js, calls .listen)
│   ├── routes/           # chat, inventory, sentiment, sales, recommend, snowflake
│   ├── utils/groqModel.js
│   └── data/sample.js    # sample data for the "Try sample" buttons
└── client/               # React + Vite + Tailwind
    ├── public/demo/      # demo files for the upload flow
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── components/    # Sidebar, Header, Chatbot, Inventory, Sentiment,
                           # Sales, Recommend, Snowflake
        ├── utils/fileExtract.js
        └── index.css
```

---

## 🩺 Sanity check

```bash
curl http://localhost:8787/api/health
# → { "ok": true, "provider": "groq", "model": "llama-3.3-70b-versatile", "tokenConfigured": true }
```

You can also validate the Snowflake demo endpoint directly:

```bash
curl -X POST http://localhost:8787/api/snowflake/demo \
  -H "Content-Type: application/json" \
  -d '{"scenario":"demand"}'
```

---

## 📎 Upload CSV, PDF, or Image — with real data extraction

Inventory, Review Pulse, and Sales Strategy all have a drag-and-drop **upload box** in addition to the paste box. Drop in:

- **.csv / .txt** — read directly as text.
- **.pdf** — text is extracted with [pdf.js](https://mozilla.github.io/pdf.js/) (works fully in the browser, no server upload needed).
- **Images** (`.png`, `.jpg`, `.jpeg`, `.webp`) — run through [Tesseract.js](https://tesseract.projectnaptha.com/) OCR in the browser to pull out the text (e.g. a photo of a handwritten stockroom sheet, or a screenshot of reviews).

Whatever text comes out is dropped into the same textarea the paste-flow uses, then **automatically analyzed** — so a photo of your stock sheet turns into a stockout/reorder report in seconds.

### 🧪 Try it — 3 demo files included

Click the demo buttons inside each tab to try the whole upload → extract → analyze pipeline without any files of your own:

| Demo | Format | Where | What it proves |
|------|--------|-------|-----------------|
| `demo-inventory.csv` | CSV | Inventory AI tab | Structured CSV upload → parsed straight into the analyzer |
| `demo-inventory-photo.png` | Image | Inventory AI tab | A photo of a stockroom sheet → OCR'd text → analyzed |
| `demo-reviews.pdf` | PDF | Review Pulse tab | A PDF of customer reviews → text extracted → sentiment analyzed |

These files live in `client/public/demo/` — feel free to replace them with your own samples.

### 🧠 Chat uses your uploaded data

Whatever you paste or upload into **Inventory AI**, **Review Pulse**, or **Sales Strategy** is shared with **Copilot Chat** in the same session. Ask it something like *"how do I reduce stockouts for fast-moving items?"* and it will reference your actual SKUs and numbers instead of speaking in generalities. A small green badge appears in the chat when it's grounded in your data.

---

## 🧱 Project structure

```
retail-copilot/
├── package.json          # root — concurrently, 2 commands
├── vercel.json           # Vercel deployment config (static client + serverless API)
├── VERCEL_DEPLOY.txt     # step-by-step Vercel deploy instructions
├── .env / .env.example   # Groq API key + model config
├── api/
│   └── index.js          # Vercel serverless entry — wraps the Express app
├── server/               # Express + Groq proxy
│   ├── app.js            # Express app factory (exported, no .listen)
│   ├── index.js          # local dev entrypoint (imports app.js, calls .listen)
│   ├── routes/           # chat, inventory, sentiment, sales, recommend
│   ├── utils/groqModel.js
│   └── data/sample.js    # sample data for the "Try sample" buttons
└── client/               # React + Vite + Tailwind
    ├── public/demo/      # 3 demo files (csv / pdf / image) for the upload flow
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── utils/fileExtract.js   # CSV/PDF/image → text extraction
        └── components/           # Sidebar, Header, Chatbot, Inventory, Sentiment,
                                   # Sales, Recommend, FileUpload
```

---

## 🛠️ Manual control (if you want it)

```bash
# Install only the server
npm install --prefix server

# Install only the client
npm install --prefix client

# Run server only
npm run dev --prefix server     # → http://localhost:8787

# Run client only
npm run dev --prefix client     # → http://localhost:5173

# Production build of the client
npm run build --prefix client
```

Vite proxies `/api/*` to the Express server, so the frontend only ever talks to one origin during dev.

---

## 🚀 Deploy to Vercel

Full step-by-step instructions are in **[`VERCEL_DEPLOY.txt`](./VERCEL_DEPLOY.txt)**. Short version:

```bash
npm i -g vercel
vercel
# then in the Vercel dashboard → Project → Settings → Environment Variables, add:
#   GROQ_API_KEY, GROQ_MODEL, GROQ_ENDPOINT
vercel --prod
```

`vercel.json` builds the React client as a static site and deploys the Express API (`api/index.js`) as a single serverless function, routed at `/api/*`.

---

## 🎨 Design

- Light theme, **white + purple** (`brand-50` → `brand-900`).
- Inter font, soft shadows, rounded 2xl cards.
- All inputs, buttons, chips share a consistent component layer (`btn-primary`, `card`, `input`, `chip`).
- Fully responsive — sidebar collapses on small screens.

---

## 🩺 Sanity check

```bash
curl http://localhost:8787/api/health
# → { "ok": true, "provider": "groq", "model": "llama-3.3-70b-versatile", "tokenConfigured": true }
```
