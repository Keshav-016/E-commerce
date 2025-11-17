import prisma from '../utils/db';
import KafkaService from './kafka.service';
async function startOrderCreatedConsumer() {
  const consumer = await KafkaService.createConsumer('inventory-service');

  await KafkaService.subscribe(consumer, 'order.created', async ({ message }) => {
    const data = JSON.parse(message.value!.toString());
    if (data.success === false) {
      const reservedStock = await prisma.reservedStock.findUnique({
        where: {
          orderId: data.orderId,
        },
        include: {
          products: true,
        },
      });

      if (reservedStock) {
        reservedStock.products.forEach(async (product) => {
          await prisma.inventory.update({
            where: {
              id: product.productId,
            },
            data: {
              qty: {
                increment: product.qty,
              },
            },
          });
        });
      }
    } else {
      await prisma.cart.update({
        where: {
          userId: data.userId,
        },
        data: {
          cartItems: {
            deleteMany: {},
          },
        },
      });
    }
    await prisma.reservedStock.delete({
      where: {
        orderId: data.orderId,
      },
    });

    console.log('📩 Received message:', data);
  });
}

export default startOrderCreatedConsumer;
