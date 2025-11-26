import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
      };
      apiKey?: {
        key: string;
        tier: string;
        permissions: string[];
      };
    }
  }
}

// JWT Authentication middleware
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    logger.debug(`User ${decoded.email} authenticated successfully`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

// API Key Authentication middleware
export const authenticateAPIKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('No API key provided');
    }

    // In a real application, validate against database
    // For demo purposes, we'll check against configured keys
    if (apiKey === config.apiKeys.masterKey) {
      req.apiKey = {
        key: apiKey,
        tier: 'enterprise',
        permissions: ['*'],
      };
    } else if (apiKey === config.apiKeys.systemKey) {
      req.apiKey = {
        key: apiKey,
        tier: 'premium',
        permissions: ['read', 'write', 'verify'],
      };
    } else {
      throw new UnauthorizedError('Invalid API key');
    }

    logger.debug(`API key authenticated with tier: ${req.apiKey.tier}`);
    next();
  } catch (error) {
    next(error);
  }
};

// Combined authentication (JWT or API Key)
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const hasAuthHeader = !!req.headers.authorization;
  const hasApiKey = !!req.headers['x-api-key'];

  if (!hasAuthHeader && !hasApiKey) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (hasApiKey) {
    return authenticateAPIKey(req, res, next);
  }

  return authenticateJWT(req, res, next);
};

// Authorization middleware - check user roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user && !req.apiKey) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.apiKey) {
      // API keys have full access based on their tier
      return next();
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Permission-based authorization
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user && !req.apiKey) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userPermissions = req.user?.permissions || [];
    const apiKeyPermissions = req.apiKey?.permissions || [];
    const allPermissions = [...userPermissions, ...apiKeyPermissions];

    // Check if user has wildcard permission
    if (allPermissions.includes('*')) {
      return next();
    }

    // Check if user has at least one required permission
    const hasPermission = permissions.some(permission => allPermissions.includes(permission));

    if (!hasPermission) {
      return next(new ForbiddenError(`Required permissions: ${permissions.join(', ')}`));
    }

    next();
  };
};

// Optional authentication - doesn't fail if no auth provided
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const hasAuthHeader = !!req.headers.authorization;
  const hasApiKey = !!req.headers['x-api-key'];

  if (!hasAuthHeader && !hasApiKey) {
    return next();
  }

  if (hasApiKey) {
    try {
      await authenticateAPIKey(req, res, next);
    } catch (error) {
      // Ignore authentication errors for optional auth
      next();
    }
  } else {
    try {
      await authenticateJWT(req, res, next);
    } catch (error) {
      // Ignore authentication errors for optional auth
      next();
    }
  }
};