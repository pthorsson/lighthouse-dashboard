import { Document, Schema } from 'mongoose';
import { mongoose } from '@db';
import { setDates, incrementVersion } from '@models/middleware';

interface IUser extends Document {
  email?: string;
  role?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    role: Number,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'users',
  }
);

// Universal hooks
UserSchema.pre('save', setDates);
UserSchema.pre('save', incrementVersion);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
