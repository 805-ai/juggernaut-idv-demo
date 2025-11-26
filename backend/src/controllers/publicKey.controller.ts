import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

class PublicKeyController {
  private keys: Map<string, any> = new Map();
  private currentKeyId: string;

  constructor() {
    // Generate initial key pair
    this.currentKeyId = this.generateAndStoreKeyPair();
  }

  private generateAndStoreKeyPair(): string {
    const keyId = uuidv4();
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.keys.set(keyId, {
      id: keyId,
      publicKey,
      privateKey,
      algorithm: 'RSA',
      keySize: 2048,
      createdAt: new Date(),
      active: true,
    });

    return keyId;
  }

  async getPublicKey(req: Request, res: Response): Promise<void> {
    try {
      const currentKey = this.keys.get(this.currentKeyId);

      res.json({
        success: true,
        publicKey: currentKey.publicKey,
        keyId: currentKey.id,
        algorithm: currentKey.algorithm,
        format: 'PEM',
        createdAt: currentKey.createdAt,
      });
    } catch (error) {
      logger.error('Get public key error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllKeys(req: Request, res: Response): Promise<void> {
    try {
      const keys = Array.from(this.keys.values()).map(key => ({
        id: key.id,
        algorithm: key.algorithm,
        keySize: key.keySize,
        createdAt: key.createdAt,
        active: key.active,
      }));

      res.json({ success: true, keys });
    } catch (error) {
      logger.error('Get all keys error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async rotateKeys(req: Request, res: Response): Promise<void> {
    try {
      const { reason, immediate } = req.body;

      // Deactivate current key
      const currentKey = this.keys.get(this.currentKeyId);
      if (currentKey) {
        currentKey.active = false;
        currentKey.deactivatedAt = new Date();
        currentKey.deactivationReason = reason;
      }

      // Generate new key pair
      this.currentKeyId = this.generateAndStoreKeyPair();

      logger.info(`Keys rotated. Reason: ${reason}`);

      res.json({
        success: true,
        message: 'Keys rotated successfully',
        newKeyId: this.currentKeyId,
        immediate,
      });
    } catch (error) {
      logger.error('Rotate keys error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async verifySignature(req: Request, res: Response): Promise<void> {
    try {
      const { message, signature, publicKey } = req.body;

      const keyToUse = publicKey || this.keys.get(this.currentKeyId)?.publicKey;

      const verify = crypto.createVerify('SHA256');
      verify.write(message);
      verify.end();

      const isValid = verify.verify(keyToUse, signature, 'base64');

      res.json({
        success: true,
        valid: isValid,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Verify signature error:', error);
      res.json({
        success: true,
        valid: false,
        error: 'Signature verification failed',
      });
    }
  }

  async getCertificate(req: Request, res: Response): Promise<void> {
    try {
      // For demo purposes, return a mock certificate
      const certificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKLdQVPy90WjMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMSEwHwYDVQQKDBhKdWdnZXJuYXV0
IElEViBTeXN0ZW0gQ0EwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEhMB8GA1UECgwYSnVn
Z2VybmF1dCBJRFYgU3lzdGVtIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA1234567890...
-----END CERTIFICATE-----`;

      res.type('text/plain').send(certificate);
    } catch (error) {
      logger.error('Get certificate error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getJWKS(req: Request, res: Response): Promise<void> {
    try {
      const currentKey = this.keys.get(this.currentKeyId);

      // Convert PEM to JWK format (simplified for demo)
      const jwks = {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            kid: currentKey.id,
            alg: 'RS256',
            n: crypto.randomBytes(256).toString('base64url'),
            e: 'AQAB',
          },
        ],
      };

      res.json(jwks);
    } catch (error) {
      logger.error('Get JWKS error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async encryptData(req: Request, res: Response): Promise<void> {
    try {
      const { data, algorithm } = req.body;

      const currentKey = this.keys.get(this.currentKeyId);
      const encrypted = crypto.publicEncrypt(
        {
          key: currentKey.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(data)
      );

      res.json({
        success: true,
        encrypted: encrypted.toString('base64'),
        keyId: this.currentKeyId,
        algorithm: algorithm || 'RSA-OAEP',
      });
    } catch (error) {
      logger.error('Encrypt data error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getKeyInfo(req: Request, res: Response): Promise<void> {
    try {
      const { keyId } = req.params;
      const key = this.keys.get(keyId);

      if (!key) {
        return res.status(404).json({ success: false, error: 'Key not found' });
      }

      res.json({
        success: true,
        keyInfo: {
          id: key.id,
          algorithm: key.algorithm,
          keySize: key.keySize,
          createdAt: key.createdAt,
          active: key.active,
          deactivatedAt: key.deactivatedAt,
        },
      });
    } catch (error) {
      logger.error('Get key info error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const publicKeyController = new PublicKeyController();