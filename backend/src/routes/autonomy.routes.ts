import { Router } from 'express';
import { autonomyController } from '../controllers/autonomy.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { verificationRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { autonomyValidation } from '../validations/autonomy.validation';

const router = Router();

/**
 * @swagger
 * /api/autonomy/recompute:
 *   post:
 *     summary: Trigger autonomy recomputation
 *     tags: [Autonomy]
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
 *               - datasetId
 *             properties:
 *               datasetId:
 *                 type: string
 *               parameters:
 *                 type: object
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Recomputation initiated
 *       202:
 *         description: Recomputation queued
 */
router.post(
  '/recompute',
  authenticate,
  requirePermission('compute'),
  verificationRateLimiter,
  validateRequest(autonomyValidation.recompute),
  autonomyController.triggerRecomputation
);

/**
 * @swagger
 * /api/autonomy/status/{computationId}:
 *   get:
 *     summary: Get computation status
 *     tags: [Autonomy]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: computationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Computation status
 *       404:
 *         description: Computation not found
 */
router.get(
  '/status/:computationId',
  authenticate,
  requirePermission('read'),
  autonomyController.getComputationStatus
);

/**
 * @swagger
 * /api/autonomy/results/{computationId}:
 *   get:
 *     summary: Get computation results
 *     tags: [Autonomy]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: computationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Computation results
 *       404:
 *         description: Results not found
 *       202:
 *         description: Computation still in progress
 */
router.get(
  '/results/:computationId',
  authenticate,
  requirePermission('read'),
  autonomyController.getComputationResults
);

/**
 * @swagger
 * /api/autonomy/cancel/{computationId}:
 *   post:
 *     summary: Cancel ongoing computation
 *     tags: [Autonomy]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: computationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Computation cancelled
 *       404:
 *         description: Computation not found
 */
router.post(
  '/cancel/:computationId',
  authenticate,
  requirePermission('compute', 'cancel'),
  autonomyController.cancelComputation
);

/**
 * @swagger
 * /api/autonomy/history:
 *   get:
 *     summary: Get computation history
 *     tags: [Autonomy]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed, cancelled]
 *     responses:
 *       200:
 *         description: Computation history
 */
router.get(
  '/history',
  authenticate,
  requirePermission('read'),
  autonomyController.getComputationHistory
);

/**
 * @swagger
 * /api/autonomy/schedule:
 *   post:
 *     summary: Schedule recurring computation
 *     tags: [Autonomy]
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
 *               - datasetId
 *               - schedule
 *             properties:
 *               datasetId:
 *                 type: string
 *               schedule:
 *                 type: string
 *                 description: Cron expression
 *               parameters:
 *                 type: object
 *     responses:
 *       201:
 *         description: Schedule created
 */
router.post(
  '/schedule',
  authenticate,
  requirePermission('compute', 'schedule'),
  validateRequest(autonomyValidation.schedule),
  autonomyController.scheduleComputation
);

/**
 * @swagger
 * /api/autonomy/metrics:
 *   get:
 *     summary: Get autonomy metrics
 *     tags: [Autonomy]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Autonomy metrics
 */
router.get(
  '/metrics',
  authenticate,
  requirePermission('read'),
  autonomyController.getMetrics
);

export default router;