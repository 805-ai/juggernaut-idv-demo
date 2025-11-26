import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

  const error = err as AppError;
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const isOperational = error.isOperational !== undefined ? error.isOperational : true;

  // Log error
  logger.error({
    error: {
      message,
      statusCode,
      stack: err.stack,
      details: error.details,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: isOperational ? message : 'Something went wrong',
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: error.details,
      }),
    },
    timestamp: new Date().toISOString(),
  });

  // If the error is not operational, shut down the application
  if (!isOperational) {
    logger.error('Unhandled error occurred, shutting down application...');
    process.exit(1);
  }
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Common error responses
export const BadRequestError = (message: string = 'Bad Request', details?: any) =>
  new AppError(message, 400, true, details);

export const UnauthorizedError = (message: string = 'Unauthorized') =>
  new AppError(message, 401, true);

export const ForbiddenError = (message: string = 'Forbidden') =>
  new AppError(message, 403, true);

export const NotFoundError = (message: string = 'Resource not found') =>
  new AppError(message, 404, true);

export const ConflictError = (message: string = 'Conflict') =>
  new AppError(message, 409, true);

export const ValidationError = (message: string = 'Validation failed', details?: any) =>
  new AppError(message, 422, true, details);

export const InternalServerError = (message: string = 'Internal Server Error', details?: any) =>
  new AppError(message, 500, false, details);