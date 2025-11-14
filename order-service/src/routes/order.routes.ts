import { Router } from 'express';
import OrderController from '../controllers/order.controller';

const router = Router();
router.get('/listAll', OrderController.listOrders);
router.patch('/update/:id/status', OrderController.updateOrderStatus);

export default router;
