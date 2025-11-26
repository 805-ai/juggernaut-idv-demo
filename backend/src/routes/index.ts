import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import receiptRoutes from './receipt.routes';
import chainRoutes from './chain.routes';
import autonomyRoutes from './autonomy.routes';
import gamingRoutes from './gaming.routes';
import publicKeyRoutes from './publicKey.routes';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/receipts', receiptRoutes);
router.use('/chain', chainRoutes);
router.use('/autonomy', autonomyRoutes);
router.use('/gaming', gamingRoutes);
router.use('/keys', publicKeyRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Juggernaut IDV API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      receipts: '/api/receipts',
      chain: '/api/chain',
      autonomy: '/api/autonomy',
      gaming: '/api/gaming',
      keys: '/api/keys',
    },
  });
});

export default router;