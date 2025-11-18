import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwtUtils';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyJwt(token);

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateJWT;
