import Joi from 'joi';

export const chainValidation = {
  verify: Joi.object({
    chainData: Joi.object({
      blocks: Joi.array().items(
        Joi.object({
          hash: Joi.string().required(),
          previousHash: Joi.string().required(),
          timestamp: Joi.number().required(),
          data: Joi.any().required(),
          nonce: Joi.number().optional(),
        })
      ).optional(),
      chainId: Joi.string().optional(),
      networkId: Joi.string().optional(),
    }).required(),
    startBlock: Joi.number().integer().min(0).optional(),
    endBlock: Joi.number().integer().min(0).optional(),
    options: Joi.object({
      validateHashes: Joi.boolean().default(true),
      validateLinks: Joi.boolean().default(true),
      validateTimestamps: Joi.boolean().default(true),
      validateSignatures: Joi.boolean().default(false),
    }).optional(),
  }),

  validateProof: Joi.object({
    proof: Joi.array().items(Joi.string()).required(),
    root: Joi.string().required(),
    leaf: Joi.string().required(),
    index: Joi.number().integer().min(0).optional(),
  }),

  sync: Joi.object({
    sourceUrl: Joi.string().uri().optional(),
    fromBlock: Joi.number().integer().min(0).optional(),
    toBlock: Joi.number().integer().min(0).optional(),
    options: Joi.object({
      validateOnSync: Joi.boolean().default(true),
      overwriteExisting: Joi.boolean().default(false),
      batchSize: Joi.number().integer().min(1).max(1000).default(100),
    }).optional(),
  }),

  getBlock: Joi.object({
    includeTransactions: Joi.boolean().default(true),
    includeReceipts: Joi.boolean().default(false),
  }),

  getTransaction: Joi.object({
    includeReceipt: Joi.boolean().default(true),
    includeBlock: Joi.boolean().default(false),
  }),

  queryBlocks: Joi.object({
    fromBlock: Joi.number().integer().min(0).optional(),
    toBlock: Joi.number().integer().min(0).optional(),
    fromTimestamp: Joi.date().optional(),
    toTimestamp: Joi.date().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};