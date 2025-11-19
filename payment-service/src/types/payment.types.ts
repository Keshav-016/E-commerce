import { PaymentMethod, PaymentStatus, TransactionStatus, RefundStatus } from '@prisma/client';

export interface CreatePaymentDTO {
  parentOrderId?: string;
  subOrderId?: string;
  userId: string;
  amountCents: number;
  currency?: string;
  method: PaymentMethod;
  idempotencyKey?: string;
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
  gatewayRef?: string;
}

export interface CreateTransactionDTO {
  paymentId: string;
  provider: string;
  providerRef?: string;
  amountCents: number;
  status: TransactionStatus;
  attempt?: number;
  meta?: any;
}

export interface CreateRefundDTO {
  paymentId: string;
  amountCents: number;
  providerRef?: string;
}

export interface UpdateRefundStatusDTO {
  status: RefundStatus;
  providerRef?: string;
}

export interface PaymentQueryParams {
  userId?: string;
  parentOrderId?: string;
  subOrderId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}
