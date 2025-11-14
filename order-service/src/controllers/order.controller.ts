import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import prisma from '../utils/db';
import inventoryClient from '../clients/inventory.http-client';

class OrderController {
  createOrder = async (req: Request, res: Response) => {
    try {
      const { customerId, customerEmail, items, shippingAddress } = req.body;

      // Format items for inventory check
      const inventoryItems = items.map((item: any) => ({
        id: item.productId,
        qty: item.quantity,
      }));

      // Generate a preliminary orderId for reservation
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Check and reserve inventory using gRPC
      const inventoryResponse: any = await inventoryClient.checkAndReserveInventory(
        orderId,
        inventoryItems
      );
      console.log(inventoryResponse);

      // If inventory check fails or only partial fulfillment is possible
      if (inventoryResponse.status !== 'fulfilled') {
        return res.status(400).json({
          error: 'Insufficient inventory',
          message: inventoryResponse.message,
          details:
            inventoryResponse.products?.map((p: any) => ({
              productId: p.id,
              requested: p.requestedQty,
              available: p.actualQty,
              name: p.name,
            })) || [],
        });
      }

      // Use prices from inventory response
      const itemsWithInventoryPrices = items.map((item: any) => {
        const inventoryProduct = inventoryResponse.products?.find(
          (p: any) => p.id === item.productId
        );

        return {
          ...item,
          unitPrice: inventoryProduct?.price || item.unitPrice,
          totalPrice: (inventoryProduct?.price || item.unitPrice) * item.quantity,
        };
      });

      const totalAmount = itemsWithInventoryPrices.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
      );

      const order = await prisma.order.create({
        data: {
          customerId,
          customerEmail,
          status: OrderStatus.PENDING,
          totalAmount,
          shippingAddress,
          orderItems: {
            create: itemsWithInventoryPrices.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      return res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
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
      const { customerId, page = 1, limit = 10 } = req.body;
      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          include: { orderItems: true },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: { customerId } }),
      ]);
      return res.json({ orders, totalCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  };
}
export default new OrderController();
