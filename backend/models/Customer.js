import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  city: { type: String },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  preferredChannel: { type: String, enum: ['WhatsApp', 'SMS', 'Email', 'RCS'], default: 'Email' }
}, { timestamps: true });

// Indexes to speed up AI segment queries and opportunity scanning (e.g., win-back, high value)
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ lastOrderDate: -1 });
// Email is already uniquely indexed by `{ unique: true }` in the schema definition

export default mongoose.model('Customer', customerSchema);
