import { OrderStatus } from '@prisma/client';

export interface UpdateOrderStatusInterface {
  orderId: string;
  status: OrderStatus;
}

export interface productDataInterface {
  id: number;
  quantity: number;
}
