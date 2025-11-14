import { Request, Response } from 'express';
import prisma from '../utils/db.js';

class CartController {
  async manageCartItem(req: Request, res: Response) {
    try {
      const { productId, qty } = req.body;
      const userId = req.headers['userid'] as string;

      if (!productId || qty === undefined || !userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, product ID, and quantity are required',
        });
      }

      if (qty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity cannot be negative',
        });
      }

      // Check if product exists in inventory
      const product = await prisma.inventory.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Find or create user's cart
      let cart = await prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }

      // Check if cart item already exists
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      let operation: string;
      let cartItem: any = null;

      if (qty === 0) {
        // Remove item from cart
        if (existingCartItem) {
          await prisma.cartItem.delete({
            where: { id: existingCartItem.id },
          });
          operation = 'removed';
        } else {
          return res.status(404).json({
            success: false,
            message: 'Cart item not found to remove',
          });
        }
      } else {
        // Add or update item (qty > 0)

        // Check if enough stock is available
        if (product.qty < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Available: ${product.qty}, Requested: ${qty}`,
            availableQuantity: product.qty,
          });
        }

        if (existingCartItem) {
          // Update existing cart item
          cartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: { qty },
            include: { product: true },
          });
          operation = 'updated';
        } else {
          // Create new cart item
          cartItem = await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              qty,
            },
            include: { product: true },
          });
          operation = 'added';
        }
      }

      res.status(200).json({
        success: true,
        message: `Item ${operation} successfully`,
        operation,
        cartItem: cartItem
          ? {
              id: cartItem.id,
              cartId: cartItem.cartId,
              productId: cartItem.productId,
              qty: cartItem.qty,
              product: {
                name: cartItem.product.name,
                price: cartItem.product.price,
                availableQty: cartItem.product.qty,
              },
            }
          : null,
      });
    } catch (error) {
      console.error('Error managing cart item:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get cart contents
  async getCart(req: Request, res: Response) {
    try {
      const { cartId } = req.params;

      if (!cartId) {
        return res.status(400).json({
          success: false,
          message: 'Cart ID is required',
        });
      }

      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const cartSummary = cart.cartItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        product: {
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          availableQty: item.product.qty,
        },
        subtotal: item.qty * item.product.price,
      }));

      const totalAmount = cartSummary.reduce((sum, item) => sum + item.subtotal, 0);
      const totalItems = cartSummary.reduce((sum, item) => sum + item.qty, 0);

      res.status(200).json({
        success: true,
        cartId,
        userId: cart.userId,
        items: cartSummary,
        summary: {
          totalItems,
          totalAmount,
          itemCount: cart.cartItems.length,
        },
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Clear entire cart
  async clearCart(req: Request, res: Response) {
    try {
      const { cartId } = req.params;

      if (!cartId) {
        return res.status(400).json({
          success: false,
          message: 'Cart ID is required',
        });
      }

      const deletedItems = await prisma.cartItem.deleteMany({
        where: { cartId },
      });

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        deletedCount: deletedItems.count,
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new CartController();
