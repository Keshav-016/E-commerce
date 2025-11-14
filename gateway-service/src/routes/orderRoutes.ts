import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import env from '../env';
import { authenticateToken, requireRole } from '../middleware/jwtMiddleware';
import { Role } from '../interface/user.interface';

const router = Router();
router.use('/orders', authenticateToken);

// Example: Admin-only route for managing products
router.use('/orders/admin', requireRole([Role.ADMIN]));
router.use(
  '/orders',
  createProxyMiddleware({
    target: env.ORDERS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '' },
  })
);

export default router;
