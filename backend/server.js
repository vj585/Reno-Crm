import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';
import { validateEnv } from './utils/envValidation.js';

dotenv.config();

// Validate critical environment variables before starting
validateEnv();

const app = express();

// Environment-based CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', apiRoutes);

// Webhook for Channel Service
app.post('/receipt', async (req, res) => {
  const { eventId, type, timestamp, communicationId, campaignId, customerId } = req.body;
  try {
    const Event = mongoose.model('Event');
    await Event.create({
      communicationId,
      campaignId,
      customerId,
      type,
      timestamp: new Date(timestamp)
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
      });
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn("MONGODB_URI missing. Server starting without DB.");
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}
