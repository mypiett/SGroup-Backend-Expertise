import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwtUtils';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  // Support token via query param for SSE (EventSource doesn't support headers)
  const queryToken = req.query.token as string;
  console.log('🚀 ~ authenticateJWT ~ authHeader:', authHeader);

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyJwt(token);

    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded as { userId: string; email: string; [key: string]: any };
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateJWT;
