import { setDates, incrementVersion } from '../models/middleware/index.js';
import { mongoose } from '../db.js';

interface IToken extends mongoose.Document {
  token?: string;
  user?: string;
  role?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const TokenSchema: mongoose.Schema = new mongoose.Schema(
  {
    token: String,
    user: mongoose.Types.ObjectId,
    role: Number,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'tokens',
  }
);

// Universal hooks
TokenSchema.pre('save', setDates);
TokenSchema.pre('save', incrementVersion);

const Token = mongoose.model<IToken>('Token', TokenSchema);

export default Token;
