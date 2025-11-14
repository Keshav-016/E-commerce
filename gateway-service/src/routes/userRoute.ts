import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import env from '../env';
import { optionalAuth } from '../middleware/jwtMiddleware';

const router = Router();

router.use('/users', optionalAuth);
router.use(
  '/users',
  createProxyMiddleware({
    target: env.USERS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
  })
);
export default router;
