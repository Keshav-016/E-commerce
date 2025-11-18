import { Request, Response } from 'express';
import prisma from '../utils/db';
import inventoryClient from '../grpc/inventory.http-client';
import { OrderStatus } from '../utils/enums';
import kafkaService from '../kafka/kafka.service';

class OrderController {
  createOrder = async (req: Request, res: Response) => {
    let success = true;
    const orderId = Date.now().toString();
    let userId = '';
    try {
      userId = req.headers['user-id'] as string;
      const { shippingAddress } = req.body;

      // Check and reserve inventory using gRPC
      const inventoryResponse: any = await inventoryClient.checkAndReserveInventory(
        userId,
        orderId
      );

      const totalAmount = inventoryResponse.products?.reduce(
        (sum: number, item: any) => sum + item.actualQty * item.price,
        0
      );
      throw new Error('Internal server error');

      const order = await prisma.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount,
          shippingAddress,
          orderItems: {
            create: inventoryResponse.products?.map((item: any) => ({
              productId: item.id,
              quantity: item.actualQty,
              unitPrice: item.price,
              totalPrice: item.actualQty * item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });
      inventoryResponse.products?.map((item: any) => {
        item.totalPrice = item.actualQty * item.price;
      });

      return res.status(400).json({
        inventoryResponse,
        totalAmount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      success = false;
      return res.status(500).json({ error: message });
    } finally {
      kafkaService.send('order.created', {
        orderId,
        userId,
        success,
      });
    }
  };

  getOrder = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { orderItems: true },
      });

      return res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { orderId, status } = req.body;
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { orderItems: true },
      });

      return res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  };

  listOrders = async (req: Request, res: Response) => {
    try {
      const userId = req.headers['user-id'] as string;
      const { page = 1, limit = 10 } = req.body;
      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          include: { orderItems: true },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: { userId } }),
      ]);
      return res.json({ orders, totalCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  };
}
export default new OrderController();
