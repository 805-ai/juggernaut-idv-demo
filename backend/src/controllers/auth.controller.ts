import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

class AuthController {
  // In-memory storage for demo purposes
  private users: Map<string, any> = new Map();
  private apiKeys: Map<string, any> = new Map();
  private refreshTokens: Set<string> = new Set();

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, organization } = req.body;

      // Check if user already exists
      if (this.users.has(email)) {
        throw new AppError('User already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
        organization,
        role: 'user',
        permissions: ['read', 'verify'],
        createdAt: new Date(),
      };

      this.users.set(email, user);

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = this.users.get(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!this.refreshTokens.has(refreshToken)) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      const user = Array.from(this.users.values()).find(u => u.id === decoded.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      res.json({
        success: true,
        accessToken,
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a real app, invalidate the token in Redis or database
      logger.info(`User logged out: ${req.user?.email}`);
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === req.user?.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
          role: user.role,
          permissions: user.permissions,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async generateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { name, permissions } = req.body;
      const userId = req.user?.id;

      const apiKey = {
        id: uuidv4(),
        key: `jug_${uuidv4().replace(/-/g, '')}`,
        name,
        userId,
        permissions: permissions || ['read', 'verify'],
        tier: 'basic',
        createdAt: new Date(),
        lastUsed: null,
      };

      this.apiKeys.set(apiKey.key, apiKey);

      logger.info(`API key generated for user: ${userId}`);

      res.status(201).json({
        success: true,
        apiKey: {
          id: apiKey.id,
          key: apiKey.key,
          name: apiKey.name,
          permissions: apiKey.permissions,
          createdAt: apiKey.createdAt,
        },
      });
    } catch (error) {
      logger.error('Generate API key error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async listApiKeys(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userKeys = Array.from(this.apiKeys.values())
        .filter(key => key.userId === userId)
        .map(key => ({
          id: key.id,
          name: key.name,
          permissions: key.permissions,
          createdAt: key.createdAt,
          lastUsed: key.lastUsed,
        }));

      res.json({
        success: true,
        apiKeys: userKeys,
      });
    } catch (error) {
      logger.error('List API keys error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async revokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { keyId } = req.params;
      const userId = req.user?.id;

      const apiKey = Array.from(this.apiKeys.values()).find(
        key => key.id === keyId && key.userId === userId
      );

      if (!apiKey) {
        throw new AppError('API key not found', 404);
      }

      this.apiKeys.delete(apiKey.key);

      logger.info(`API key revoked: ${keyId}`);

      res.json({
        success: true,
        message: 'API key revoked successfully',
      });
    } catch (error) {
      logger.error('Revoke API key error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  private generateRefreshToken(user: any): string {
    const token = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
    this.refreshTokens.add(token);
    return token;
  }
}

export const authController = new AuthController();