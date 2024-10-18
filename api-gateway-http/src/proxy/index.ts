import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

import { Logger, services } from '../config';
import { ServiceUnavailableError } from '../middleware/errorHandlerMiddleware';

const { auth, content, user, analytics, media, search } = services;

const urls: Record<string, string> = {
  auth: auth.url,
  content: content.url,
  user: user.url,
  analytics: analytics.url,
  media: media.url,
  search: search.url,
};

export const proxyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // const service = req.path.split('/')[2]; // e.g., /api/auth/login -> auth
  const service = req.path.split('/')[1]; // e.g., /api/auth/login -> auth
  const target = urls[service];

  console.log('PROXY MIDDLEWARE', { service, target });

  // Log incoming request
  Logger.info(`Incoming request`, {
    method: req.method,
    path: req.path,
    service,
    ip: req.ip,
  });

  if (target) {
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/${service}`]: '',
      },
      on: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (err: Error, req: Request, res) => {
          Logger.error(`Proxy error: ${err.message}`, { service, path: req.path });
          const serviceError = new ServiceUnavailableError(service);

          Logger.info(`Sending error response`, {
            method: req.method,
            path: req.path,
            service,
            statusCode: serviceError.statusCode,
            error: serviceError.message,
          });

          next(serviceError);
        },
        proxyReq: (proxyReq, req) => {
          // Log the proxied request
          Logger.info(`Proxying request`, {
            method: req.method,
            path: req.path,
            service,
            target,
          });

          fixRequestBody(proxyReq, req);
        },

        proxyRes: (proxyRes, req) => {
          // Log the proxied response
          Logger.info(`Received response from service`, {
            method: req.method,
            path: req.path,
            service,
            statusCode: proxyRes.statusCode,
          });
        },
      },
    })(req, res, next);
  } else {
    Logger.warn(`Unrecognized service requested`, {
      method: req.method,
      path: req.path,
      service,
    });
    next();
  }
};
