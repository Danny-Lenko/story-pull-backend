// user-management-service/src/config/database.ts
import { createConnection } from 'typeorm';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';

export const connectDatabase = async () => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'user_management',
      entities: [User, Role, Permission],
      synchronize: false, // Set to true for development, false for production
    });
    console.log('Connected to User Management database');
    return connection;
  } catch (error) {
    console.error('Could not connect to User Management database', error);
    process.exit(1);
  }
};
