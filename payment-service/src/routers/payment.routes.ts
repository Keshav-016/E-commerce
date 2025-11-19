import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

// Payment routes
router.post('/payments', (req, res) => paymentController.createPayment(req, res));
router.get('/payments', (req, res) => paymentController.getPayments(req, res));
router.get('/payments/:id', (req, res) => paymentController.getPaymentById(req, res));
router.patch('/payments/:id/status', (req, res) => paymentController.updatePaymentStatus(req, res));

// Transaction routes
router.post('/transactions', (req, res) => paymentController.createTransaction(req, res));
router.get('/payments/:paymentId/transactions', (req, res) =>
  paymentController.getTransactionsByPaymentId(req, res)
);

// Refund routes
router.post('/refunds', (req, res) => paymentController.createRefund(req, res));
router.patch('/refunds/:id/status', (req, res) => paymentController.updateRefundStatus(req, res));
router.get('/payments/:paymentId/refunds', (req, res) =>
  paymentController.getRefundsByPaymentId(req, res)
);

export default router;
