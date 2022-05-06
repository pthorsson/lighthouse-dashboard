import mongoose from 'mongoose';

mongoose.connection.on('connecting', () => {
  console.log('connecting to MongoDB...');
});

mongoose.connection.on('error', (error) => {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected!');
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connection opened!');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected!');
});

export { mongoose };
