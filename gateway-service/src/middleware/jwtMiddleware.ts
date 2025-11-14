import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../env';
import { User } from '../interface/user.interface';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided',
    });
  }

  const jwtSecret = env.JWT_SECRET || 'your-secret-key';

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is not valid',
      });
    }
    const user = decoded as User;
    req.headers['userid'] = user?.userId;
    req.headers['role'] = user?.role;
    next();
  });
};
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (!err) {
      const user = decoded as User;
      req.headers['userid'] = user?.userId;
      req.headers['role'] = user?.role;
    }
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['role']) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.headers['role'] as string)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
