import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  communicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['sent', 'delivered', 'opened', 'clicked', 'converted', 'failed'], required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Add compound and single indexes to support fast analytics funnel aggregation
// Aggregations frequently match on campaignId and group by type
eventSchema.index({ campaignId: 1, type: 1 });
eventSchema.index({ customerId: 1 });
eventSchema.index({ timestamp: 1 });

export default mongoose.model('Event', eventSchema);
