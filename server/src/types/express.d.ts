import { Request } from 'express';

export interface JwtUserPayload {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

