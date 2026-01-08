const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Store sent events in memory
let sentEvents = [];

app.use(cors());
app.use(express.json());

// SendGrid API endpoint
app.post('/events/v1/track', (req, res) => {
  if (req.headers['x-api-key'] !== process.env.MARLIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = req.body;

  if (!payload || !payload.records) {
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  const timestamp = Date.now();
  payload.records.forEach(event => {
    sentEvents.unshift({ 
      timestamp,
      payload: event 
    }); // Add to beginning of array

    // Keep only last 100 events
    if (sentEvents.length > 100) {
      sentEvents = sentEvents.slice(0, 100);
    }
  });

  console.log(
    `📧 Received ${payload.records.length} events. Events: ${payload.records.map(e => e.event).join(", ")}`
  );

  res.status(202).json({ message: `Received ${payload.records.length} events` });
});

// Web interface to view events
app.get('/', (req, res) => {
  const eventsHtml = sentEvents
    .map(event => {
      const timestamp = event.timestamp;
      const eventPayload = event.payload;

      return `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>Event: <code>${eventPayload.event}</code> | Action: <code>${eventPayload.properties.action || 'N/A'}</code></strong>
          <small style="color: #666;">${new Date(timestamp).toLocaleString()}</small>
        </div>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 3px; max-height: 200px; overflow-y: auto;">
          <pre>${JSON.stringify(eventPayload, null, 2)}</pre>
        </div>
      </div>
    `;
    })
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marlin Mock - Received Events</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #1a73e8; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
        .stats { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .no-events { text-align: center; color: #666; padding: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📧 Marlin Mock Service</h1>
        <p>Local events tracking interface</p>
      </div>
      
      <div class="stats">
        <strong>Total Events:</strong> ${sentEvents.length}
        <button onclick="location.reload()" style="float: right; padding: 5px 10px;">Refresh</button>
      </div>
      
      ${sentEvents.length === 0 ? '<div class="no-events">No events received yet</div>' : eventsHtml}
    </body>
    </html>
  `);
});

app.get("/events", (req, res) => {
  res.json(sentEvents);
});

app.delete("/events", (req, res) => {
  sentEvents = [];
  res.json({ message: "All events cleared" });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'marlin-mock',
    eventsStored: sentEvents.length,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Marlin Mock Service running on port ${PORT}`);
  console.log(`📧 View events at: http://0.0.0.0:${PORT}`);
  console.log(`🔗 API endpoint: http://0.0.0.0:${PORT}/events/v1/track`);
});