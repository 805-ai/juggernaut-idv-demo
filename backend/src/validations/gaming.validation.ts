import Joi from 'joi';

export const gamingValidation = {
  detect: Joi.object({
    data: Joi.alternatives().try(
      Joi.object(),
      Joi.array().items(Joi.object())
    ).required(),
    analysisType: Joi.string()
      .valid('pattern', 'anomaly', 'statistical', 'ml-based', 'hybrid')
      .default('hybrid'),
    threshold: Joi.number().min(0).max(1).default(0.7),
    options: Joi.object({
      sensitivity: Joi.string().valid('low', 'medium', 'high').default('medium'),
      includeMetrics: Joi.boolean().default(true),
      includeExplanation: Joi.boolean().default(true),
      compareBaseline: Joi.boolean().default(false),
      baselineId: Joi.string().when('compareBaseline', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    }).optional(),
  }),

  evaluate: Joi.object({
    entityId: Joi.string().required(),
    timeRange: Joi.object({
      start: Joi.date().required(),
      end: Joi.date().required(),
    }).required(),
    metrics: Joi.array()
      .items(Joi.string())
      .default(['risk_score', 'anomaly_count', 'pattern_matches']),
    options: Joi.object({
      aggregation: Joi.string().valid('hourly', 'daily', 'weekly').default('daily'),
      includeRawData: Joi.boolean().default(false),
      confidenceLevel: Joi.number().min(0.5).max(0.99).default(0.95),
    }).optional(),
  }),

  train: Joi.object({
    trainingData: Joi.array()
      .items(
        Joi.object({
          input: Joi.object().required(),
          label: Joi.string().valid('normal', 'gaming', 'suspicious').required(),
          confidence: Joi.number().min(0).max(1).optional(),
        })
      )
      .min(10)
      .required(),
    modelType: Joi.string()
      .valid('neural_network', 'random_forest', 'svm', 'ensemble')
      .default('ensemble'),
    validationSplit: Joi.number().min(0.1).max(0.4).default(0.2),
    options: Joi.object({
      epochs: Joi.number().integer().min(1).max(1000).default(100),
      batchSize: Joi.number().integer().min(1).max(512).default(32),
      learningRate: Joi.number().min(0.0001).max(1).default(0.001),
      earlyStoppingPatience: Joi.number().integer().min(1).max(50).default(10),
    }).optional(),
  }),

  resolveAlert: Joi.object({
    resolution: Joi.string()
      .valid('confirmed_gaming', 'false_positive', 'needs_review', 'escalated')
      .required(),
    notes: Joi.string().max(1000).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    actionTaken: Joi.string().optional(),
  }),

  getPatterns: Joi.object({
    category: Joi.string().optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    active: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  createPattern: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    pattern: Joi.object().required(),
    category: Joi.string().required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    active: Joi.boolean().default(true),
  }),
};