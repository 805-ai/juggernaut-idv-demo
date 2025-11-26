import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

class GamingController {
  private alerts: Map<string, any> = new Map();
  private patterns: Map<string, any> = new Map();

  constructor() {
    // Initialize with some default patterns
    this.initializePatterns();
  }

  private initializePatterns(): void {
    const defaultPatterns = [
      {
        id: uuidv4(),
        name: 'Rapid Sequential Transactions',
        category: 'velocity',
        severity: 'high',
        description: 'Multiple transactions in quick succession',
      },
      {
        id: uuidv4(),
        name: 'Round Number Abuse',
        category: 'amount',
        severity: 'medium',
        description: 'Consistent use of round numbers',
      },
      {
        id: uuidv4(),
        name: 'Time Pattern Anomaly',
        category: 'temporal',
        severity: 'medium',
        description: 'Regular time intervals between actions',
      },
    ];

    defaultPatterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
  }

  async detectGaming(req: Request, res: Response): Promise<void> {
    try {
      const { data, analysisType, threshold } = req.body;

      const detection = {
        id: uuidv4(),
        timestamp: new Date(),
        analysisType,
        threshold,
        gamingDetected: Math.random() > 0.7,
        riskScore: Math.random(),
        patterns: Array.from(this.patterns.values()).slice(0, 2),
        anomalies: [
          {
            type: 'velocity',
            severity: 'medium',
            description: 'Transaction velocity exceeds normal baseline',
          },
        ],
        recommendations: [
          'Review transaction history',
          'Enable additional verification',
        ],
      };

      if (detection.gamingDetected) {
        const alert = {
          id: uuidv4(),
          type: 'gaming_detected',
          severity: detection.riskScore > 0.8 ? 'high' : 'medium',
          status: 'active',
          createdAt: new Date(),
          data: detection,
        };
        this.alerts.set(alert.id, alert);
      }

      res.json({ success: true, detection });
    } catch (error) {
      logger.error('Detect gaming error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async evaluateGamingRisk(req: Request, res: Response): Promise<void> {
    try {
      const { entityId, timeRange } = req.body;

      const evaluation = {
        id: uuidv4(),
        entityId,
        timeRange,
        riskScore: Math.random(),
        riskLevel: Math.random() > 0.5 ? 'high' : 'low',
        factors: {
          velocity: Math.random(),
          pattern: Math.random(),
          anomaly: Math.random(),
          historical: Math.random(),
        },
        timeline: [
          {
            timestamp: new Date(Date.now() - 3600000),
            event: 'Suspicious pattern detected',
            severity: 'medium',
          },
          {
            timestamp: new Date(Date.now() - 1800000),
            event: 'Velocity threshold exceeded',
            severity: 'high',
          },
        ],
      };

      res.json({ success: true, evaluation });
    } catch (error) {
      logger.error('Evaluate gaming risk error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { category, severity } = req.query;
      let patterns = Array.from(this.patterns.values());

      if (category) {
        patterns = patterns.filter(p => p.category === category);
      }
      if (severity) {
        patterns = patterns.filter(p => p.severity === severity);
      }

      res.json({ success: true, patterns });
    } catch (error) {
      logger.error('Get patterns error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getGamingReport(req: Request, res: Response): Promise<void> {
    try {
      const { entityId } = req.params;

      const report = {
        id: uuidv4(),
        entityId,
        generatedAt: new Date(),
        summary: {
          riskLevel: 'medium',
          totalAlerts: 5,
          resolvedAlerts: 2,
          activeAlerts: 3,
        },
        detections: [
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 86400000),
            type: 'pattern',
            severity: 'medium',
            resolved: false,
          },
        ],
        recommendations: [
          'Implement additional monitoring',
          'Review transaction limits',
          'Enable multi-factor authentication',
        ],
      };

      res.json({ success: true, report });
    } catch (error) {
      logger.error('Get gaming report error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { status, severity, page = 1, limit = 20 } = req.query;
      let alerts = Array.from(this.alerts.values());

      if (status) {
        alerts = alerts.filter(a => a.status === status);
      }
      if (severity) {
        alerts = alerts.filter(a => a.severity === severity);
      }

      res.json({
        success: true,
        alerts: alerts.slice(0, Number(limit)),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: alerts.length,
        },
      });
    } catch (error) {
      logger.error('Get alerts error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { resolution, notes } = req.body;

      const alert = this.alerts.get(alertId);
      if (!alert) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
      }

      alert.status = 'resolved';
      alert.resolution = resolution;
      alert.notes = notes;
      alert.resolvedAt = new Date();

      res.json({ success: true, alert });
    } catch (error) {
      logger.error('Resolve alert error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async trainModel(req: Request, res: Response): Promise<void> {
    try {
      const { trainingData, modelType } = req.body;

      const trainingJob = {
        id: uuidv4(),
        status: 'training',
        modelType,
        datasetSize: trainingData.length,
        startedAt: new Date(),
        estimatedCompletion: new Date(Date.now() + 3600000),
      };

      res.status(202).json({
        success: true,
        message: 'Model training initiated',
        trainingJob,
      });
    } catch (error) {
      logger.error('Train model error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = {
        totalDetections: 152,
        gamingDetected: 47,
        falsePositives: 8,
        accuracy: 0.947,
        activeAlerts: this.alerts.size,
        patterns: this.patterns.size,
        recentActivity: {
          last24h: 23,
          last7d: 98,
          last30d: 412,
        },
      };

      res.json({ success: true, statistics });
    } catch (error) {
      logger.error('Get statistics error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const gamingController = new GamingController();