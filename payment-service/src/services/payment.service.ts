import { PrismaClient, Payment, Transaction, Refund, Prisma } from '@prisma/client';
import {
  CreatePaymentDTO,
  UpdatePaymentStatusDTO,
  CreateTransactionDTO,
  CreateRefundDTO,
  UpdateRefundStatusDTO,
  PaymentQueryParams,
} from '../types/payment.types';

const prisma = new PrismaClient();

export class PaymentService {
  // Create a new payment
  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    try {
      const payment = await prisma.payment.create({
        data: {
          parentOrderId: data.parentOrderId,
          subOrderId: data.subOrderId,
          userId: data.userId,
          amountCents: data.amountCents,
          currency: data.currency || 'INR',
          method: data.method,
          idempotencyKey: data.idempotencyKey,
        },
        include: {
          transactions: true,
          refunds: true,
        },
      });

      return payment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Payment with this idempotency key already exists');
        }
      }
      throw error;
    }
  }

  // Get payment by ID
  async getPaymentById(id: string): Promise<Payment | null> {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        transactions: true,
        refunds: true,
      },
    });
  }

  // Get payments with filters
  async getPayments(params: PaymentQueryParams): Promise<Payment[]> {
    const where: Prisma.PaymentWhereInput = {};

    if (params.userId) where.userId = params.userId;
    if (params.parentOrderId) where.parentOrderId = params.parentOrderId;
    if (params.subOrderId) where.subOrderId = params.subOrderId;
    if (params.status) where.status = params.status;
    if (params.method) where.method = params.method;

    if (params.fromDate || params.toDate) {
      where.createdAt = {};
      if (params.fromDate) where.createdAt.gte = new Date(params.fromDate);
      if (params.toDate) where.createdAt.lte = new Date(params.toDate);
    }

    return await prisma.payment.findMany({
      where,
      include: {
        transactions: true,
        refunds: true,
      },
      take: params.limit || 50,
      skip: params.offset || 0,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update payment status
  async updatePaymentStatus(id: string, data: UpdatePaymentStatusDTO): Promise<Payment> {
    const updateData: Prisma.PaymentUpdateInput = {
      status: data.status,
    };

    if (data.gatewayRef) {
      updateData.gatewayRef = data.gatewayRef;
    }

    return await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        transactions: true,
        refunds: true,
      },
    });
  }

  // Create a transaction for a payment
  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    return await prisma.transaction.create({
      data: {
        paymentId: data.paymentId,
        provider: data.provider,
        providerRef: data.providerRef,
        amountCents: data.amountCents,
        status: data.status,
        attempt: data.attempt || 1,
        meta: data.meta || {},
      },
    });
  }

  // Get transactions for a payment
  async getTransactionsByPaymentId(paymentId: string): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create a refund
  async createRefund(data: CreateRefundDTO): Promise<Refund> {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { refunds: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Calculate total refunded amount
    const totalRefunded = payment.refunds
      .filter((r) => r.status === 'SUCCESS')
      .reduce((sum, r) => sum + r.amountCents, 0);

    if (totalRefunded + data.amountCents > payment.amountCents) {
      throw new Error('Refund amount exceeds payment amount');
    }

    const refund = await prisma.refund.create({
      data: {
        paymentId: data.paymentId,
        amountCents: data.amountCents,
        providerRef: data.providerRef,
      },
    });

    // Update payment status
    const newTotalRefunded = totalRefunded + data.amountCents;
    const newStatus = newTotalRefunded === payment.amountCents ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    await prisma.payment.update({
      where: { id: data.paymentId },
      data: { status: newStatus },
    });

    return refund;
  }

  // Update refund status
  async updateRefundStatus(id: string, data: UpdateRefundStatusDTO): Promise<Refund> {
    const updateData: Prisma.RefundUpdateInput = {
      status: data.status,
    };

    if (data.providerRef) {
      updateData.providerRef = data.providerRef;
    }

    return await prisma.refund.update({
      where: { id },
      data: updateData,
    });
  }

  // Get refunds for a payment
  async getRefundsByPaymentId(paymentId: string): Promise<Refund[]> {
    return await prisma.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get payment by idempotency key
  async getPaymentByIdempotencyKey(key: string): Promise<Payment | null> {
    return await prisma.payment.findUnique({
      where: { idempotencyKey: key },
      include: {
        transactions: true,
        refunds: true,
      },
    });
  }
}

export const paymentService = new PaymentService();
