import { Document, Schema } from 'mongoose';
import { mongoose } from '@db';
import { setDates, incrementVersion } from '@models/middleware';

interface IToken extends Document {
  token?: string;
  user?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const TokenSchema = new Schema(
  {
    token: String,
    user: mongoose.Types.ObjectId,
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
