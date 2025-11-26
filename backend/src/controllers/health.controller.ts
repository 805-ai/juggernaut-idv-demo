import { Request, Response } from 'express';
import os from 'os';
import { logger } from '../utils/logger';

class HealthController {
  async basicCheck(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'juggernaut-idv',
    });
  }

  async detailedCheck(req: Request, res: Response): Promise<void> {
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'juggernaut-idv',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          percentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model,
          loadAverage: os.loadavg(),
        },
      },
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      dependencies: {
        database: await this.checkDatabaseHealth(),
        redis: await this.checkRedisHealth(),
        external: await this.checkExternalServices(),
      },
    };

    const overallHealth = this.calculateOverallHealth(healthInfo);

    res.status(overallHealth === 'healthy' ? 200 : 503).json({
      ...healthInfo,
      status: overallHealth,
    });
  }

  async readinessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check if all required services are ready
      const dbReady = await this.checkDatabaseHealth();
      const redisReady = await this.checkRedisHealth();

      if (dbReady && redisReady) {
        res.json({ status: 'ready' });
      } else {
        res.status(503).json({
          status: 'not ready',
          services: {
            database: dbReady,
            redis: redisReady,
          },
        });
      }
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({ status: 'not ready', error: 'Internal check failed' });
    }
  }

  async livenessCheck(req: Request, res: Response): Promise<void> {
    // Simple liveness check - if the server can respond, it's alive
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // TODO: Implement actual database health check
      // For now, return true to simulate healthy database
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      // TODO: Implement actual Redis health check
      // For now, return true to simulate healthy Redis
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  private async checkExternalServices(): Promise<boolean> {
    try {
      // TODO: Implement checks for external services
      // For now, return true
      return true;
    } catch (error) {
      logger.error('External services health check failed:', error);
      return false;
    }
  }

  private calculateOverallHealth(healthInfo: any): string {
    const { database, redis, external } = healthInfo.dependencies;

    if (database && redis && external) {
      return 'healthy';
    } else if (database && redis) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }
}

export const healthController = new HealthController();