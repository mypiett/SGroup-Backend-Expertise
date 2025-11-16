import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwtUtils';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 [AUTH] Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ [AUTH] Missing or malformed Authorization header');
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyJwt(token);

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      console.warn('⚠️ [AUTH] Invalid token payload:', decoded);
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded as { userId: string; email: string; [key: string]: any };
    next();
  } catch (error: any) {
    console.error('❌ [AUTH] JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateJWT;
