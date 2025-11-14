import { Request, Response } from 'express';
import prisma from '../utils/db';

class InventoryController {
  manageProduct = async (req: Request, res: Response) => {
    try {
      const { id, name, description, price, qty, unit, packSize } = req.body;

      if (!name || !description || !price || !qty || !unit) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      if (isNaN(price) || isNaN(qty)) {
        return res.status(400).json({
          success: false,
          message: 'Price and quantity must be numbers',
        });
      }

      const result = await prisma.inventory.upsert({
        where: { id: id || 'non-existent-id' },
        update: {
          name,
          description,
          price,
          qty,
          unit,
          packSize,
        },
        create: {
          name,
          description,
          price,
          qty,
          unit,
          packSize,
        },
      });

      const operation = id ? 'updated' : 'created';
      res.status(200).json({
        success: true,
        message: `Product ${operation} successfully`,
        operation,
        product: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({
        success: false,
        message,
      });
    }
  };

  getProducts = async (req: Request, res: Response) => {
    try {
      const products = await prisma.inventory.findMany();
      res.status(200).json(products);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ message });
    }
  };

  getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Product ID is required');
      }
      const product = await prisma.inventory.findUnique({
        where: {
          id,
        },
      });
      if (!product) {
        throw new Error('Product not found');
      }
      res.status(200).json(product);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ message });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await prisma.inventory.delete({
        where: {
          id,
        },
      });
      if (!product) {
        throw new Error('Product not found');
      }
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ message });
    }
  };
}

export default new InventoryController();
