import { Router } from 'express';

export const snowflakeRouter = Router();

const SCENARIOS = {
  demand: {
    id: 'demand',
    name: 'Demand Forecasting',
    headline: 'Snowflake surfaces demand spikes before they hit the floor.',
    summary: 'A retail team uses Snowflake to merge POS, inventory, and promotion data and isolate the SKUs that need replenishment before a holiday spike hits.',
    metrics: [
      { label: 'Forecast accuracy', value: '96.4%', delta: '+4.1% vs. last cycle' },
      { label: 'Inventory coverage', value: '18.2 days', delta: '+2.6 days' },
      { label: 'At-risk SKUs', value: '24', delta: '-11 from last week' },
      { label: 'Projected uplift', value: '$128K', delta: '+13.8%' },
    ],
    chart: [
      { label: 'Week 1', value: 56 },
      { label: 'Week 2', value: 62 },
      { label: 'Week 3', value: 81 },
      { label: 'Week 4', value: 94 },
      { label: 'Week 5', value: 88 },
      { label: 'Week 6', value: 103 },
    ],
    queries: [
      "SELECT sku, SUM(units_sold) AS sold, AVG(unit_price) AS avg_price FROM RETAIL.POS WHERE order_date >= DATEADD(day, -30, CURRENT_DATE()) GROUP BY sku ORDER BY sold DESC;",
      "SELECT sku, inventory_on_hand, lead_time_days, reorder_point FROM RETAIL.INVENTORY WHERE inventory_on_hand < reorder_point;",
      "WITH promo_events AS (...) SELECT region, sku, predicted_demand FROM RETAIL.MODEL_FORECAST WHERE predicted_demand > 1.2 * baseline_demand;"
    ],
    cli: {
      steps: [
        'Authenticate into the Snowflake account and confirm the target warehouse.',
        'Run a warehouse query that joins POS, inventory, and campaign data.',
        'Use Coco CLI to validate the SQL, export the dataset, and pass it into the retail dashboard.'
      ],
      command: 'coco-cli snowflake run --warehouse ANALYTICS_WH --sql "SELECT * FROM RETAIL.DEMAND_FORECAST LIMIT 25;" --format json'
    },
    recommendations: [
      'Increase replenishment for top-velocity summer essentials.',
      'Delay discounting on high-margin items until the weekend demand peak is confirmed.',
      'Alert stores with promotions that are driving conversion lift above forecast.'
    ]
  },
  anomalies: {
    id: 'anomalies',
    name: 'Anomaly Detection',
    headline: 'Snowflake quickly exposes outliers before they become margin leaks.',
    summary: 'A pricing and fulfillment team scans regional sales, returns, and shipping behavior to isolate unexpected changes in conversion and fulfillment latency.',
    metrics: [
      { label: 'Anomalies found', value: '9', delta: '+3 event spikes' },
      { label: 'Return variance', value: '12.8%', delta: '+1.9% above baseline' },
      { label: 'Fulfillment SLA', value: '91.6%', delta: '+2.4%' },
      { label: 'Saved margin', value: '$42K', delta: 'from corrected pricing' },
    ],
    chart: [
      { label: 'Mon', value: 45 },
      { label: 'Tue', value: 48 },
      { label: 'Wed', value: 53 },
      { label: 'Thu', value: 72 },
      { label: 'Fri', value: 62 },
      { label: 'Sat', value: 89 },
    ],
    queries: [
      "SELECT REGION, DATE_TRUNC('day', ORDER_DATE) AS day, AVG(ORDER_VALUE) AS avg_order, STDDEV(ORDER_VALUE) AS sigma FROM RETAIL.ORDERS GROUP BY 1,2 HAVING ABS(avg_order - LAG(avg_order) OVER (ORDER BY day)) > 0.35 * avg_order;",
      "SELECT sku, channel, COUNT(*) AS order_count FROM RETAIL.ORDERS WHERE order_date >= DATEADD(day, -7, CURRENT_DATE()) GROUP BY 1,2 HAVING order_count > 1.5 * AVG(order_count) OVER ();",
      "SELECT * FROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_METERING_HISTORY(START_TIME_RANGE_START => DATEADD('HOUR', -12, CURRENT_TIMESTAMP()))) WHERE CREDITS_USED > 10;"
    ],
    cli: {
      steps: [
        'Pull the variance report from the warehouse to find outlier days and locations.',
        'Use a scheduled validation query to confirm whether the anomaly is operational or merchandising-related.',
        'Send a final alert with a short summary into the team chat or ticketing workflow.'
      ],
      command: 'coco-cli snowflake monitor --alert anomaly --since 24h --output markdown'
    },
    recommendations: [
      'Rebalance pricing between the top two cities with sudden margin compression.',
      'Review fulfillment agents and route a surge in the west region away from a bottleneck.',
      'Create a daily check for return-rate anomalies to prevent hidden margin leakage.'
    ]
  },
  loyalty: {
    id: 'loyalty',
    name: 'Loyalty & Segmentation',
    headline: 'Snowflake turns customer behavior into targeted retail actions.',
    summary: 'A loyalty team segments shoppers by value, frequency, and product affinity so marketing can send the right offer to the right audience in the right channel.',
    metrics: [
      { label: 'High-value members', value: '18.4K', delta: '+1.7K month-over-month' },
      { label: 'Repeat purchase rate', value: '63.2%', delta: '+6.9%' },
      { label: 'Offer CTR', value: '9.8%', delta: '+2.1%' },
      { label: 'Incremental revenue', value: '$214K', delta: '+19.4%' },
    ],
    chart: [
      { label: 'Dormant', value: 20 },
      { label: 'Occasional', value: 33 },
      { label: 'Loyal', value: 48 },
      { label: 'VIP', value: 72 },
      { label: 'Top VIP', value: 88 },
      { label: 'Champions', value: 94 },
    ],
    queries: [
      "SELECT customer_segment, COUNT(*) AS members, SUM(lifetime_value) AS lifetime_value FROM RETAIL.CUSTOMER_SEGMENTS GROUP BY customer_segment ORDER BY lifetime_value DESC;",
      "SELECT customer_id, last_purchase_at, predicted_next_purchase FROM RETAIL.CUSTOMER_LTV WHERE predicted_next_purchase BETWEEN DATEADD(day, 7, CURRENT_DATE()) AND DATEADD(day, 21, CURRENT_DATE());",
      "WITH funnel AS (...) SELECT campaign_name, channel, conversion_rate FROM RETAIL.CAMPAIGN_PERFORMANCE ORDER BY conversion_rate DESC;"
    ],
    cli: {
      steps: [
        'Pull the segmented customer list, then enrich it with last-purchase and order-value filters.',
        'Run a final validation step to verify message eligibility and exclude inactive customers.',
        'Export the audience and hand it to the campaign workflow without leaving the CLI.'
      ],
      command: 'coco-cli snowflake audience export --segment vip --limit 500 --format csv'
    },
    recommendations: [
      'Focus new acquisition budget on the top 20% of high-frequency VIP segments.',
      'Re-engage dormant members with category-based personalized bundles.',
      'Increase loyalty rewards in segments with the strongest repeat-purchase share.'
    ]
  }
};

snowflakeRouter.post('/demo', (req, res) => {
  const scenarioKey = req.body?.scenario || 'demand';
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.demand;

  res.json({
    title: 'Snowflake Retail Intelligence Demo',
    scenario: scenario.name,
    headline: scenario.headline,
    summary: scenario.summary,
    metrics: scenario.metrics,
    chart: scenario.chart,
    queries: scenario.queries,
    cli: scenario.cli,
    recommendations: scenario.recommendations,
    note: 'This demo shows a Snowflake-ready retail workflow using a command-line orchestration pattern similar to Coco CLI. No live warehouse credentials are required to explore the pattern.'
  });
});
