import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed, required: true }, // Store the JSON filter criteria
  customerCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Segment', segmentSchema);
