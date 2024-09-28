// auth-service/src/config/database.ts
/* eslint-disable */
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to Auth database');
  } catch (error) {
    console.error('Could not connect to Auth database', error);
    process.exit(1);
  }
};

// auth-service/src/index.ts
import { connectDatabase } from './config/database';
import User from './models/User';
import Session from './models/Session';

connectDatabase();

// Now you can use User and Session models, and they'll automatically
// use the 'auth' database and the 'users' and 'sessions' collections respectively
