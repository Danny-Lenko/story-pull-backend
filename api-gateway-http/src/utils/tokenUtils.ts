import jwt from 'jsonwebtoken';
import { environmentSettings } from '../config';

export const generateToken = (payload: { id: string; role: string }): string => {
  return jwt.sign(payload, environmentSettings.jwtSecret, {
    expiresIn: environmentSettings.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): { id: string; role: string } | null => {
  try {
    return jwt.verify(token, environmentSettings.jwtSecret) as { id: string; role: string };
  } catch {
    return null;
  }
};
