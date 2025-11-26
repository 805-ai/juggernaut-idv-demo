import winston from 'winston';
import path from 'path';
import { config } from '../config/config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'juggernaut-idv' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: config.nodeEnv === 'development' ? consoleFormat : logFormat,
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(config.logging.directory, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(config.logging.directory, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream for Morgan
export const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

// Add performance logging
export const logPerformance = (operation: string, startTime: number): void => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation} completed in ${duration}ms`);
};

// Add structured logging helpers
export const logError = (error: Error, context?: Record<string, any>): void => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logWarning = (message: string, context?: Record<string, any>): void => {
  logger.warn({
    message,
    ...context,
  });
};

export const logInfo = (message: string, context?: Record<string, any>): void => {
  logger.info({
    message,
    ...context,
  });
};

export const logDebug = (message: string, context?: Record<string, any>): void => {
  logger.debug({
    message,
    ...context,
  });
};

// Audit logging for sensitive operations
export const logAudit = (action: string, userId: string, details: Record<string, any>): void => {
  logger.info({
    type: 'AUDIT',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export default logger;