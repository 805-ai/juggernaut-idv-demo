import Joi from 'joi';

export const publicKeyValidation = {
  verifySignature: Joi.object({
    message: Joi.string().required(),
    signature: Joi.string().required(),
    publicKey: Joi.string().optional(),
    algorithm: Joi.string()
      .valid('RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512')
      .default('RS256'),
  }),

  encrypt: Joi.object({
    data: Joi.string().required(),
    algorithm: Joi.string()
      .valid('RSA-OAEP', 'RSA-OAEP-256', 'RSA-OAEP-384', 'RSA-OAEP-512')
      .default('RSA-OAEP-256'),
    encoding: Joi.string().valid('base64', 'hex').default('base64'),
  }),

  rotateKeys: Joi.object({
    reason: Joi.string().max(500).optional(),
    immediate: Joi.boolean().default(false),
    gracePeriod: Joi.number().integer().min(0).max(86400).default(3600), // seconds
    notifyClients: Joi.boolean().default(true),
  }),

  generateKeyPair: Joi.object({
    keyType: Joi.string().valid('RSA', 'EC', 'Ed25519').default('RSA'),
    keySize: Joi.number().integer().valid(2048, 3072, 4096).default(2048),
    format: Joi.string().valid('PEM', 'DER', 'JWK').default('PEM'),
    purpose: Joi.string().valid('signing', 'encryption', 'both').default('both'),
  }),

  importKey: Joi.object({
    key: Joi.string().required(),
    format: Joi.string().valid('PEM', 'DER', 'JWK').required(),
    keyType: Joi.string().valid('public', 'private').required(),
    purpose: Joi.string().valid('signing', 'encryption', 'both').default('both'),
  }),

  exportKey: Joi.object({
    keyId: Joi.string().required(),
    format: Joi.string().valid('PEM', 'DER', 'JWK').default('PEM'),
    includePrivate: Joi.boolean().default(false),
  }),
};