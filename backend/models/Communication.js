import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  channel: { type: String, required: true },
  currentStatus: { type: String, enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'converted', 'failed'], default: 'queued' },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Add indexes for quick lookup when webhook fires
communicationSchema.index({ campaignId: 1 });
communicationSchema.index({ customerId: 1 });

export default mongoose.model('Communication', communicationSchema);
