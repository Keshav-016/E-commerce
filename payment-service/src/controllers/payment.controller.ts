import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import {
  CreatePaymentDTO,
  UpdatePaymentStatusDTO,
  CreateTransactionDTO,
  CreateRefundDTO,
  UpdateRefundStatusDTO,
  PaymentQueryParams,
} from '../types/payment.types';

export class PaymentController {
  // Create a new payment
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const data: CreatePaymentDTO = req.body;
      const userId = req.headers['user-id'] as string;

      // Validate required fields
      if (userId || !data.amountCents || !data.method) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, amountCents, method',
        });
        return;
      }

      // Check for idempotency
      if (data.idempotencyKey) {
        const existing = await paymentService.getPaymentByIdempotencyKey(data.idempotencyKey);
        if (existing) {
          res.status(200).json({
            success: true,
            data: existing,
            message: 'Payment already exists (idempotent response)',
          });
          return;
        }
      }

      const payment = await paymentService.createPayment({ ...data, userId });
      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Get payment by ID
  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Get payments with filters
  async getPayments(req: Request, res: Response): Promise<void> {
    try {
      const params: PaymentQueryParams = {
        userId: req.query.userId as string,
        parentOrderId: req.query.parentOrderId as string,
        subOrderId: req.query.subOrderId as string,
        status: req.query.status as any,
        method: req.query.method as any,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const payments = await paymentService.getPayments(params);

      res.status(200).json({
        success: true,
        data: payments,
        count: payments.length,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Update payment status
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdatePaymentStatusDTO = req.body;

      if (!data.status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      const payment = await paymentService.updatePaymentStatus(id, data);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Create a transaction for a payment
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTransactionDTO = req.body;

      if (!data.paymentId || !data.provider || !data.amountCents || !data.status) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: paymentId, provider, amountCents, status',
        });
        return;
      }

      const transaction = await paymentService.createTransaction(data);

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Get transactions for a payment
  async getTransactionsByPaymentId(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const transactions = await paymentService.getTransactionsByPaymentId(paymentId);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Create a refund
  async createRefund(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateRefundDTO = req.body;

      if (!data.paymentId || !data.amountCents) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: paymentId, amountCents',
        });
        return;
      }

      const refund = await paymentService.createRefund(data);

      res.status(201).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Update refund status
  async updateRefundStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateRefundStatusDTO = req.body;

      if (!data.status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      const refund = await paymentService.updateRefundStatus(id, data);

      res.status(200).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      console.error('Error updating refund status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Get refunds for a payment
  async getRefundsByPaymentId(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const refunds = await paymentService.getRefundsByPaymentId(paymentId);

      res.status(200).json({
        success: true,
        data: refunds,
      });
    } catch (error) {
      console.error('Error fetching refunds:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

export const paymentController = new PaymentController();
