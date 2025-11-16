import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  topic: { type: String, required: true },
  zoomLink: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  reviewedByMentee: { type: Boolean, default: false },
  reviewedByMentor: { type: Boolean, default: false },
}, { timestamps: true });
const Session = mongoose.model('Session', sessionSchema);
export default Session;