import { Router } from 'express';
import { receiptController } from '../controllers/receipt.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { verificationRateLimiter, uploadRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { receiptValidation } from '../validations/receipt.validation';
import multer from 'multer';
import { config } from '../config/config';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

/**
 * @swagger
 * /api/receipts/verify:
 *   post:
 *     summary: Verify a single receipt
 *     tags: [Receipts]
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
 *               - receiptData
 *             properties:
 *               receiptData:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Verification result
 *       400:
 *         description: Invalid receipt data
 */
router.post(
  '/verify',
  authenticate,
  requirePermission('verify'),
  verificationRateLimiter,
  validateRequest(receiptValidation.verify),
  receiptController.verifyReceipt
);

/**
 * @swagger
 * /api/receipts/batch-verify:
 *   post:
 *     summary: Verify multiple receipts in batch
 *     tags: [Receipts]
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
 *               - receipts
 *             properties:
 *               receipts:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Batch verification results
 *       400:
 *         description: Invalid request
 */
router.post(
  '/batch-verify',
  authenticate,
  requirePermission('verify'),
  verificationRateLimiter,
  validateRequest(receiptValidation.batchVerify),
  receiptController.batchVerifyReceipts
);

/**
 * @swagger
 * /api/receipts/upload:
 *   post:
 *     summary: Upload and verify receipt file
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Receipt uploaded and verified
 *       400:
 *         description: Invalid file
 */
router.post(
  '/upload',
  authenticate,
  requirePermission('verify', 'upload'),
  uploadRateLimiter,
  upload.single('file'),
  receiptController.uploadAndVerify
);

/**
 * @swagger
 * /api/receipts/{receiptId}:
 *   get:
 *     summary: Get receipt details
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: receiptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt details
 *       404:
 *         description: Receipt not found
 */
router.get(
  '/:receiptId',
  authenticate,
  requirePermission('read'),
  receiptController.getReceipt
);

/**
 * @swagger
 * /api/receipts:
 *   get:
 *     summary: List receipts with filters
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, failed]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
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
 *         description: List of receipts
 */
router.get(
  '/',
  authenticate,
  requirePermission('read'),
  receiptController.listReceipts
);

/**
 * @swagger
 * /api/receipts/{receiptId}/reprocess:
 *   post:
 *     summary: Reprocess a receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: receiptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt reprocessed
 *       404:
 *         description: Receipt not found
 */
router.post(
  '/:receiptId/reprocess',
  authenticate,
  requirePermission('verify', 'write'),
  verificationRateLimiter,
  receiptController.reprocessReceipt
);

/**
 * @swagger
 * /api/receipts/{receiptId}:
 *   delete:
 *     summary: Delete a receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: receiptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt deleted
 *       404:
 *         description: Receipt not found
 */
router.delete(
  '/:receiptId',
  authenticate,
  requirePermission('delete'),
  receiptController.deleteReceipt
);

/**
 * @swagger
 * /api/receipts/stats:
 *   get:
 *     summary: Get receipt statistics
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Receipt statistics
 */
router.get(
  '/stats',
  authenticate,
  requirePermission('read'),
  receiptController.getStatistics
);

export default router;