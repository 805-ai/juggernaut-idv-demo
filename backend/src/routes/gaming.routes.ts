import { Router } from 'express';
import { gamingController } from '../controllers/gaming.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { verificationRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { gamingValidation } from '../validations/gaming.validation';

const router = Router();

/**
 * @swagger
 * /api/gaming/detect:
 *   post:
 *     summary: Detect gaming patterns in data
 *     tags: [Gaming Detection]
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
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *               analysisType:
 *                 type: string
 *                 enum: [pattern, anomaly, statistical, ml-based]
 *               threshold:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Gaming detection results
 */
router.post(
  '/detect',
  authenticate,
  requirePermission('analyze'),
  verificationRateLimiter,
  validateRequest(gamingValidation.detect),
  gamingController.detectGaming
);

/**
 * @swagger
 * /api/gaming/evaluate:
 *   post:
 *     summary: Evaluate gaming risk score
 *     tags: [Gaming Detection]
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
 *               - entityId
 *               - timeRange
 *             properties:
 *               entityId:
 *                 type: string
 *               timeRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       200:
 *         description: Gaming risk evaluation
 */
router.post(
  '/evaluate',
  authenticate,
  requirePermission('analyze'),
  verificationRateLimiter,
  validateRequest(gamingValidation.evaluate),
  gamingController.evaluateGamingRisk
);

/**
 * @swagger
 * /api/gaming/patterns:
 *   get:
 *     summary: Get known gaming patterns
 *     tags: [Gaming Detection]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: List of gaming patterns
 */
router.get(
  '/patterns',
  authenticate,
  requirePermission('read'),
  gamingController.getPatterns
);

/**
 * @swagger
 * /api/gaming/report/{entityId}:
 *   get:
 *     summary: Get gaming detection report for entity
 *     tags: [Gaming Detection]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gaming detection report
 *       404:
 *         description: Entity not found
 */
router.get(
  '/report/:entityId',
  authenticate,
  requirePermission('read'),
  gamingController.getGamingReport
);

/**
 * @swagger
 * /api/gaming/alerts:
 *   get:
 *     summary: Get gaming detection alerts
 *     tags: [Gaming Detection]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved, dismissed]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
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
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get(
  '/alerts',
  authenticate,
  requirePermission('read'),
  gamingController.getAlerts
);

/**
 * @swagger
 * /api/gaming/alert/{alertId}/resolve:
 *   post:
 *     summary: Resolve gaming alert
 *     tags: [Gaming Detection]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert resolved
 *       404:
 *         description: Alert not found
 */
router.post(
  '/alert/:alertId/resolve',
  authenticate,
  requirePermission('write', 'resolve'),
  gamingController.resolveAlert
);

/**
 * @swagger
 * /api/gaming/train:
 *   post:
 *     summary: Train gaming detection model with new data
 *     tags: [Gaming Detection]
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
 *               - trainingData
 *             properties:
 *               trainingData:
 *                 type: array
 *                 items:
 *                   type: object
 *               modelType:
 *                 type: string
 *     responses:
 *       202:
 *         description: Training initiated
 */
router.post(
  '/train',
  authenticate,
  requirePermission('admin', 'train'),
  validateRequest(gamingValidation.train),
  gamingController.trainModel
);

/**
 * @swagger
 * /api/gaming/statistics:
 *   get:
 *     summary: Get gaming detection statistics
 *     tags: [Gaming Detection]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Gaming detection statistics
 */
router.get(
  '/statistics',
  authenticate,
  requirePermission('read'),
  gamingController.getStatistics
);

export default router;