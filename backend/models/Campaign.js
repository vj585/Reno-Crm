import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
  audienceCount: { type: Number, default: 0 },
  channel: { type: String, enum: ['WhatsApp', 'SMS', 'Email', 'RCS'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Failed'], default: 'Draft' },
  revenueGenerated: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);
