import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BACKEND_RECEIPT_URL = process.env.BACKEND_RECEIPT_URL || 'http://localhost:5000/api/receipt'; // Actually webhook is mounted on /receipt not /api/receipt based on server.js
const ACTUAL_RECEIPT_URL = process.env.BACKEND_RECEIPT_URL || 'http://localhost:5000/receipt';

function sendWebhook(payload) {
  axios.post(ACTUAL_RECEIPT_URL, payload).catch(err => console.error("Webhook error:", err.message));
}

app.post('/send', (req, res) => {
  const { communicationId, campaignId, customerId, channel, message } = req.body;
  
  if (!communicationId || !campaignId || !customerId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Acknowledge immediately
  res.json({ status: "queued" });

  // Helper for random delay between 3 and 15 seconds (3000 to 15000 ms)
  const delay = () => Math.floor(Math.random() * 12000) + 3000;

  // Simulate delivery process in background
  setTimeout(() => {
    // 95% delivered, 5% failed
    if (Math.random() <= 0.95) {
      sendWebhook({ eventId: Date.now().toString(), type: 'delivered', timestamp: new Date(), communicationId, campaignId, customerId });
      
      // Open simulation after another delay
      setTimeout(() => {
        // 75% opened
        if (Math.random() <= 0.75) {
          sendWebhook({ eventId: Date.now().toString(), type: 'opened', timestamp: new Date(), communicationId, campaignId, customerId });
          
          // Click simulation
          setTimeout(() => {
            // 30% clicked
            if (Math.random() <= 0.30) {
              sendWebhook({ eventId: Date.now().toString(), type: 'clicked', timestamp: new Date(), communicationId, campaignId, customerId });
              
              // Convert simulation
              setTimeout(() => {
                // 8% converted
                if (Math.random() <= 0.08) {
                  sendWebhook({ eventId: Date.now().toString(), type: 'converted', timestamp: new Date(), communicationId, campaignId, customerId });
                }
              }, delay());
            }
          }, delay());
        }
      }, delay());
    } else {
      sendWebhook({ eventId: Date.now().toString(), type: 'failed', timestamp: new Date(), communicationId, campaignId, customerId });
    }
  }, delay());
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Channel Service running on port ${PORT}`);
});
