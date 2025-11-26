import { Router } from 'express';
import { chainController } from '../controllers/chain.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { verificationRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { chainValidation } from '../validations/chain.validation';

const router = Router();

/**
 * @swagger
 * /api/chain/verify:
 *   post:
 *     summary: Verify blockchain chain integrity
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chainData
 *             properties:
 *               chainData:
 *                 type: object
 *               startBlock:
 *                 type: number
 *               endBlock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Chain verification result
 */
router.post(
  '/verify',
  authenticate,
  requirePermission('verify'),
  verificationRateLimiter,
  validateRequest(chainValidation.verify),
  chainController.verifyChain
);

/**
 * @swagger
 * /api/chain/block/{blockId}:
 *   get:
 *     summary: Get block details
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Block details
 *       404:
 *         description: Block not found
 */
router.get(
  '/block/:blockId',
  authenticate,
  requirePermission('read'),
  chainController.getBlock
);

/**
 * @swagger
 * /api/chain/transaction/{txId}:
 *   get:
 *     summary: Get transaction details
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: txId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get(
  '/transaction/:txId',
  authenticate,
  requirePermission('read'),
  chainController.getTransaction
);

/**
 * @swagger
 * /api/chain/integrity:
 *   get:
 *     summary: Check overall chain integrity
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Chain integrity status
 */
router.get(
  '/integrity',
  authenticate,
  requirePermission('read'),
  chainController.checkIntegrity
);

/**
 * @swagger
 * /api/chain/sync:
 *   post:
 *     summary: Sync chain with external source
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceUrl:
 *                 type: string
 *               fromBlock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sync initiated
 */
router.post(
  '/sync',
  authenticate,
  requirePermission('write', 'sync'),
  chainController.syncChain
);

/**
 * @swagger
 * /api/chain/validate-proof:
 *   post:
 *     summary: Validate merkle proof
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proof
 *               - root
 *               - leaf
 *             properties:
 *               proof:
 *                 type: array
 *                 items:
 *                   type: string
 *               root:
 *                 type: string
 *               leaf:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proof validation result
 */
router.post(
  '/validate-proof',
  authenticate,
  requirePermission('verify'),
  validateRequest(chainValidation.validateProof),
  chainController.validateProof
);

/**
 * @swagger
 * /api/chain/stats:
 *   get:
 *     summary: Get chain statistics
 *     tags: [Chain]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Chain statistics
 */
router.get(
  '/stats',
  authenticate,
  requirePermission('read'),
  chainController.getStatistics
);

export default router;