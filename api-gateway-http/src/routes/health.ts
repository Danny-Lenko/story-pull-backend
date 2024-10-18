import express from 'express';

import { environment, Logger } from '../config';

const router = express.Router();

interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    [key: string]: {
      status: 'OK' | 'ERROR';
      latency: number;
    };
  };
}

const checkServiceHealth = async (
  serviceName: string,
  serviceUrl: string,
): Promise<{ status: 'OK' | 'ERROR'; latency: number }> => {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(serviceUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const latency = Date.now() - start;
    return { status: response.ok ? 'OK' : 'ERROR', latency };
  } catch (error: unknown) {
    const latency = Date.now() - start;
    if (error instanceof Error) {
      Logger.error(`Health check failed for ${serviceName}: ${error.message}`);
    } else {
      Logger.error(`Health check failed for ${serviceName}: Unknown error`);
    }
    return { status: 'ERROR', latency };
  }
};

router.get('/health', async (req, res) => {
  const healthCheck: HealthCheckResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.VERSION || '1.0.0',
    environment,
    services: {},
  };

  // Check the health of connected services
  const services = {
    'auth-service': 'http://auth-service/health',
    'content-service': 'http://content-service/health',
    // Add other services as needed
  };

  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    healthCheck.services[serviceName] = await checkServiceHealth(serviceName, serviceUrl);
  }

  // If any service is down, set overall status to ERROR
  if (Object.values(healthCheck.services).some((service) => service.status === 'ERROR')) {
    healthCheck.status = 'ERROR';
  }

  res.status(healthCheck.status === 'OK' ? 200 : 503).json(healthCheck);
});

export default router;
