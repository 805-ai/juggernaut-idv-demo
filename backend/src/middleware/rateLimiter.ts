import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/config';

// Create different rate limiters for different endpoints
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: config.rateLimit.message,
        statusCode: 429,
        retryAfter: req.rateLimit?.resetTime,
      },
    });
  },
});

// Stricter rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 upload requests per windowMs
  message: 'Too many upload requests, please try again later.',
});

// Rate limiter for verification endpoints
export const verificationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 verification requests per windowMs
  message: 'Too many verification requests, please try again later.',
});

// Rate limiter for public endpoints
export const publicRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: 'Too many requests, please slow down.',
});

// Dynamic rate limiter based on API key tier
export const tieredRateLimiter = (tier: 'free' | 'basic' | 'premium' | 'enterprise') => {
  const limits = {
    free: { windowMs: 60 * 60 * 1000, max: 100 },
    basic: { windowMs: 60 * 60 * 1000, max: 1000 },
    premium: { windowMs: 60 * 60 * 1000, max: 10000 },
    enterprise: { windowMs: 60 * 60 * 1000, max: 100000 },
  };

  const limit = limits[tier];

  return rateLimit({
    windowMs: limit.windowMs,
    max: limit.max,
    message: `Rate limit exceeded for ${tier} tier. Please upgrade your plan for more requests.`,
    keyGenerator: (req: Request) => {
      // Use API key as the identifier instead of IP
      return req.headers['x-api-key'] as string || req.ip;
    },
  });
};