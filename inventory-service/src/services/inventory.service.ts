import prisma from '../utils/db';
interface Product {
  id: string;
  qty: number;
}
class InventoryService {
  constructor() {}
  async CheckAndReserveInventory(products: Product[]) {
    try {
      const productIds = products.map((product: any) => product.id);
      const inventoryProducts = await prisma.inventory.findMany({
        where: { id: { in: productIds } },
      });
      if (inventoryProducts.length !== productIds.length) {
        throw new Error('Invalid product Data');
      }
      const updatedProducts = [];
      let hasInsufficientStock = false;
      for (const orderProduct of products) {
        const inventoryProduct = inventoryProducts.find((inv) => inv.id === orderProduct.id);
        if (!inventoryProduct) continue;
        let actualQty = orderProduct.qty;
        if (inventoryProduct.qty < orderProduct.qty) {
          actualQty = inventoryProduct.qty;
          hasInsufficientStock = true;
        }
        const newQty = inventoryProduct.qty - actualQty;
        await prisma.inventory.update({
          where: { id: orderProduct.id },
          data: { qty: newQty },
        });
        updatedProducts.push({
          id: orderProduct.id,
          requestedQty: orderProduct.qty,
          actualQty,
          availableQty: newQty,
          name: inventoryProduct.name,
          price: inventoryProduct.price,
        });
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new InventoryService();
