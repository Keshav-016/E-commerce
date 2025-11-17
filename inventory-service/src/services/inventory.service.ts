import prisma from '../utils/db';

class InventoryService {
  constructor() {}
  async CheckAndReserveInventory(userId: string, orderId: string) {
    try {
      // Use Prisma transaction to ensure atomicity
      return await prisma.$transaction(async (tx) => {
        // Fetch cart with items
        const cart = await tx.cart.findFirst({
          where: { userId },
          include: {
            cartItems: true,
          },
        });

        if (!cart) {
          throw new Error('Cart not found');
        }

        const productIds = cart.cartItems.map((product: any) => product.productId);

        // Fetch inventory products
        const inventoryProducts = await tx.inventory.findMany({
          where: { id: { in: productIds } },
        });

        if (inventoryProducts.length !== productIds.length) {
          throw new Error('Invalid product Data');
        }

        const updatedProducts = [];
        let hasInsufficientStock = false;

        // Process each cart item and update inventory
        for (const orderProduct of cart.cartItems) {
          const inventoryProduct = inventoryProducts.find(
            (inv) => inv.id === orderProduct.productId
          );
          if (!inventoryProduct) continue;

          let actualQty = orderProduct.qty;
          if (inventoryProduct.qty < orderProduct.qty) {
            actualQty = inventoryProduct.qty;
            hasInsufficientStock = true;
          }

          const newQty = inventoryProduct.qty - actualQty;

          // Update inventory within transaction
          await tx.inventory.update({
            where: { id: orderProduct.productId },
            data: { qty: newQty },
          });

          updatedProducts.push({
            id: orderProduct.productId,
            requestedQty: orderProduct.qty,
            actualQty,
            availableQty: newQty,
            name: inventoryProduct.name,
            price: inventoryProduct.price,
          });
        }

        // Create reserved stock within transaction
        await tx.reservedStock.create({
          data: {
            orderId,
            products: {
              create: updatedProducts.map((product) => ({
                productId: product.id,
                qty: product.actualQty,
              })),
            },
          },
        });

        return { updatedProducts, hasInsufficientStock };
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new InventoryService();
