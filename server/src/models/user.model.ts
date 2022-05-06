import { setDates, incrementVersion } from '../models/middleware/index.js';
import { mongoose } from '../db.js';

interface IUser extends mongoose.Document {
  email?: string;
  role?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const UserSchema: mongoose.Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      validate: [
        {
          validator: (value: string) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Invalid email',
        },
      ],
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
