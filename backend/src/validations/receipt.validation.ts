import Joi from 'joi';

export const receiptValidation = {
  verify: Joi.object({
    receiptData: Joi.object({
      id: Joi.string().optional(),
      transactionId: Joi.string().optional(),
      timestamp: Joi.date().optional(),
      amount: Joi.number().optional(),
      currency: Joi.string().optional(),
      merchant: Joi.string().optional(),
      items: Joi.array().items(Joi.object()).optional(),
      signature: Joi.string().optional(),
      hash: Joi.string().optional(),
    }).required(),
    metadata: Joi.object({
      source: Joi.string().optional(),
      userId: Joi.string().optional(),
      sessionId: Joi.string().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
    }).optional(),
    options: Joi.object({
      deepVerification: Joi.boolean().optional(),
      checkDuplicates: Joi.boolean().optional(),
      validateSignature: Joi.boolean().optional(),
    }).optional(),
  }),

  batchVerify: Joi.object({
    receipts: Joi.array()
      .items(
        Joi.object({
          receiptData: Joi.object().required(),
          metadata: Joi.object().optional(),
        })
      )
      .min(1)
      .max(100)
      .required(),
    options: Joi.object({
      parallel: Joi.boolean().optional(),
      stopOnError: Joi.boolean().optional(),
      deepVerification: Joi.boolean().optional(),
    }).optional(),
  }),

  upload: Joi.object({
    format: Joi.string().valid('json', 'csv', 'pdf', 'image').optional(),
    parseOptions: Joi.object({
      delimiter: Joi.string().optional(),
      headers: Joi.boolean().optional(),
      encoding: Joi.string().optional(),
    }).optional(),
  }),

  list: Joi.object({
    status: Joi.string().valid('pending', 'verified', 'failed', 'processing').optional(),
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'amount', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  reprocess: Joi.object({
    options: Joi.object({
      forceReprocess: Joi.boolean().optional(),
      updateExisting: Joi.boolean().optional(),
    }).optional(),
  }),
};