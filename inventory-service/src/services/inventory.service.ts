import prisma from '../utils/db';

class InventoryService {
  constructor() {}
  async CheckAndReserveInventory(userId: string) {
    try {
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          cartItems: true,
        },
      });
      if (!cart) {
        throw new Error('Cart not found');
      }
      const productIds = cart?.cartItems.map((product: any) => product.productId);
      const inventoryProducts = await prisma.inventory.findMany({
        where: { id: { in: productIds } },
      });
      if (inventoryProducts.length !== productIds.length) {
        throw new Error('Invalid product Data');
      }
      const updatedProducts = [];
      let hasInsufficientStock = false;
      for (const orderProduct of cart?.cartItems) {
        const inventoryProduct = inventoryProducts.find((inv) => inv.id === orderProduct.productId);
        if (!inventoryProduct) continue;
        let actualQty = orderProduct.qty;
        if (inventoryProduct.qty < orderProduct.qty) {
          actualQty = inventoryProduct.qty;
          hasInsufficientStock = true;
        }
        const newQty = inventoryProduct.qty - actualQty;
        await prisma.inventory.update({
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
      return { updatedProducts, hasInsufficientStock };
    } catch (error) {
      throw error;
    }
  }
}

export default new InventoryService();
