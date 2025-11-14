import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import env from '../env';
import { authenticateToken, requireRole } from '../middleware/jwtMiddleware';
import { Role } from '../interface/user.interface';

const router = Router();

// Apply JWT auth to all product routes
router.use('/inventory', authenticateToken);

// Example: Admin-only route for managing products
router.use('/inventory/admin', requireRole([Role.ADMIN]));

router.use(
  '/inventory',
  createProxyMiddleware({
    target: env.INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/inventory': '' },
  })
);

export default router;
