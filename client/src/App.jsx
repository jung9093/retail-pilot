import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Chatbot from './components/Chatbot.jsx';
import Inventory from './components/Inventory.jsx';
import Sentiment from './components/Sentiment.jsx';
import Sales from './components/Sales.jsx';
import Recommend from './components/Recommend.jsx';
import Snowflake from './components/Snowflake.jsx';

const FEATURES = [
  { id: 'chat',      name: 'Copilot Chat',  icon: '💬', desc: 'Ask anything about your store' },
  { id: 'inventory', name: 'Inventory AI',  icon: '📦', desc: 'Stockout + reorder insights' },
  { id: 'sentiment', name: 'Review Pulse',  icon: '💜', desc: 'Sentiment & themes' },
  { id: 'sales',     name: 'Sales Strategy',icon: '📈', desc: 'Forecast & pricing' },
  { id: 'recommend', name: 'Merchandising', icon: '🛍️', desc: 'Bundles & cross-sell' },
  { id: 'snowflake', name: 'Snowflake Demo', icon: '❄️', desc: 'Warehouse analytics & Coco CLI' },
];

export default function App() {
  const [active, setActive] = useState('chat');
  const feature = FEATURES.find((f) => f.id === active);

  // Shared store of whatever the user has pasted/uploaded across tabs, so
  // Copilot Chat can reason over the store's actual data instead of giving
  // generic advice. Any tab that captures data (via paste or file upload)
  // reports it here.
  const [uploadedData, setUploadedData] = useState({ inventory: '', reviews: '', sales: '' });

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar features={FEATURES} active={active} setActive={setActive} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header feature={feature} />
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
          {active === 'chat'      && <Chatbot context={uploadedData} />}
          {active === 'inventory' && <Inventory onDataChange={(v) => setUploadedData((d) => ({ ...d, inventory: v }))} />}
          {active === 'sentiment' && <Sentiment onDataChange={(v) => setUploadedData((d) => ({ ...d, reviews: v }))} />}
          {active === 'sales'     && <Sales onDataChange={(v) => setUploadedData((d) => ({ ...d, sales: v }))} />}
          {active === 'recommend' && <Recommend />}
          {active === 'snowflake' && <Snowflake />}
        </div>
      </main>
    </div>
  );
}
