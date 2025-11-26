import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'juggernaut_idv',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // API Keys
  apiKeys: {
    masterKey: process.env.MASTER_API_KEY || 'master-key-change-this',
    systemKey: process.env.SYSTEM_API_KEY || 'system-key-change-this',
  },

  // Cryptography
  crypto: {
    algorithm: 'aes-256-gcm',
    secretKey: process.env.CRYPTO_SECRET_KEY || 'your-32-byte-secret-key-change-me',
    ivLength: 16,
    saltLength: 64,
    tagLength: 16,
    pbkdf2Iterations: 100000,
  },

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ],

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
  },

  // File upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: [
      'application/json',
      'application/pdf',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    directory: process.env.LOG_DIR || './logs',
  },

  // External services
  services: {
    emailService: {
      enabled: process.env.EMAIL_SERVICE_ENABLED === 'true',
      apiKey: process.env.EMAIL_API_KEY || '',
      from: process.env.EMAIL_FROM || 'noreply@juggernaut.ai',
    },
    webhookUrl: process.env.WEBHOOK_URL || '',
  },

  // Blockchain configuration
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    network: process.env.BLOCKCHAIN_NETWORK || 'testnet',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  },

  // Feature flags
  features: {
    enableGamingDetection: process.env.ENABLE_GAMING_DETECTION !== 'false',
    enableAutonomyRecomputation: process.env.ENABLE_AUTONOMY_RECOMPUTATION !== 'false',
    enableChainVerification: process.env.ENABLE_CHAIN_VERIFICATION !== 'false',
    enableReceiptVerification: process.env.ENABLE_RECEIPT_VERIFICATION !== 'false',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  },

  // Performance
  performance: {
    maxWorkers: parseInt(process.env.MAX_WORKERS || '4', 10),
    queueConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10', 10),
    batchSize: parseInt(process.env.BATCH_SIZE || '100', 10),
  },
};

// Validate critical configuration
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'CRYPTO_SECRET_KEY',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate crypto key length
  if (config.crypto.secretKey.length !== 32) {
    console.warn('Warning: CRYPTO_SECRET_KEY should be exactly 32 characters for AES-256');
  }
};