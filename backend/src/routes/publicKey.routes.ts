import { Router } from 'express';
import { publicKeyController } from '../controllers/publicKey.controller';
import { authenticate, requirePermission, optionalAuth } from '../middleware/auth';
import { publicRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { publicKeyValidation } from '../validations/publicKey.validation';

const router = Router();

/**
 * @swagger
 * /api/keys/public:
 *   get:
 *     summary: Get system public key
 *     tags: [Public Keys]
 *     responses:
 *       200:
 *         description: System public key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *                 algorithm:
 *                   type: string
 *                 format:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */
router.get(
  '/public',
  publicRateLimiter,
  publicKeyController.getPublicKey
);

/**
 * @swagger
 * /api/keys/all:
 *   get:
 *     summary: Get all public keys
 *     tags: [Public Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: List of all public keys
 */
router.get(
  '/all',
  authenticate,
  requirePermission('read'),
  publicKeyController.getAllKeys
);

/**
 * @swagger
 * /api/keys/rotate:
 *   post:
 *     summary: Rotate system keys
 *     tags: [Public Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               immediate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Keys rotated successfully
 */
router.post(
  '/rotate',
  authenticate,
  requirePermission('admin', 'rotate-keys'),
  publicKeyController.rotateKeys
);

/**
 * @swagger
 * /api/keys/verify-signature:
 *   post:
 *     summary: Verify a signature using public key
 *     tags: [Public Keys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - signature
 *             properties:
 *               message:
 *                 type: string
 *               signature:
 *                 type: string
 *               publicKey:
 *                 type: string
 *                 description: Optional, uses system key if not provided
 *     responses:
 *       200:
 *         description: Signature verification result
 */
router.post(
  '/verify-signature',
  publicRateLimiter,
  validateRequest(publicKeyValidation.verifySignature),
  publicKeyController.verifySignature
);

/**
 * @swagger
 * /api/keys/certificate:
 *   get:
 *     summary: Get system certificate
 *     tags: [Public Keys]
 *     responses:
 *       200:
 *         description: System certificate in PEM format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get(
  '/certificate',
  publicRateLimiter,
  publicKeyController.getCertificate
);

/**
 * @swagger
 * /api/keys/jwks:
 *   get:
 *     summary: Get JSON Web Key Set
 *     tags: [Public Keys]
 *     responses:
 *       200:
 *         description: JWKS for JWT verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  '/jwks',
  publicRateLimiter,
  publicKeyController.getJWKS
);

/**
 * @swagger
 * /api/keys/encrypt:
 *   post:
 *     summary: Encrypt data using public key
 *     tags: [Public Keys]
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
 *                 type: string
 *               algorithm:
 *                 type: string
 *                 enum: [RSA-OAEP, RSA-OAEP-256]
 *     responses:
 *       200:
 *         description: Encrypted data
 */
router.post(
  '/encrypt',
  authenticate,
  requirePermission('encrypt'),
  validateRequest(publicKeyValidation.encrypt),
  publicKeyController.encryptData
);

/**
 * @swagger
 * /api/keys/key-info/{keyId}:
 *   get:
 *     summary: Get detailed key information
 *     tags: [Public Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Key information
 *       404:
 *         description: Key not found
 */
router.get(
  '/key-info/:keyId',
  optionalAuth,
  publicKeyController.getKeyInfo
);

export default router;