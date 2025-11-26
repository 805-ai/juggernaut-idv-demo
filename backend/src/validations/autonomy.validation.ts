import Joi from 'joi';

export const autonomyValidation = {
  recompute: Joi.object({
    datasetId: Joi.string().required(),
    parameters: Joi.object({
      algorithm: Joi.string().optional(),
      iterations: Joi.number().integer().min(1).optional(),
      threshold: Joi.number().min(0).max(1).optional(),
      optimizationLevel: Joi.string().valid('low', 'medium', 'high').optional(),
      parallelism: Joi.number().integer().min(1).max(32).optional(),
    }).optional(),
    options: Joi.object({
      priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
      timeout: Joi.number().integer().min(1000).max(3600000).optional(), // ms
      retryOnFailure: Joi.boolean().default(true),
      maxRetries: Joi.number().integer().min(0).max(5).default(3),
      notifyOnComplete: Joi.boolean().default(false),
      webhookUrl: Joi.string().uri().optional(),
    }).optional(),
  }),

  schedule: Joi.object({
    datasetId: Joi.string().required(),
    schedule: Joi.string().required(), // Cron expression
    parameters: Joi.object({
      algorithm: Joi.string().optional(),
      iterations: Joi.number().integer().min(1).optional(),
      threshold: Joi.number().min(0).max(1).optional(),
    }).optional(),
    options: Joi.object({
      timezone: Joi.string().default('UTC'),
      enabled: Joi.boolean().default(true),
      maxConcurrent: Joi.number().integer().min(1).max(10).default(1),
      retainResults: Joi.number().integer().min(1).max(365).default(30), // days
    }).optional(),
  }),

  cancel: Joi.object({
    reason: Joi.string().optional(),
    force: Joi.boolean().default(false),
  }),

  getHistory: Joi.object({
    datasetId: Joi.string().optional(),
    status: Joi.string()
      .valid('pending', 'running', 'completed', 'failed', 'cancelled')
      .optional(),
    fromDate: Joi.date().optional(),
    toDate: Joi.date().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid('startTime', 'endTime', 'duration', 'status')
      .default('startTime'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  updateSchedule: Joi.object({
    schedule: Joi.string().optional(),
    parameters: Joi.object().optional(),
    options: Joi.object({
      enabled: Joi.boolean().optional(),
      timezone: Joi.string().optional(),
    }).optional(),
  }),
};