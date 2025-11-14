import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import path from 'path';
import prisma from '../utils/db.js';
import inventoryService from '../services/inventory.service.js';

// Load proto file
const PROTO_PATH = path.join(__dirname, '../../proto/inventory.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const inventoryProto = grpc.loadPackageDefinition(packageDefinition).inventory as any;

// gRPC Service Implementation
const grpcInventoryController = {
  async CheckAndReserveInventory(call: any, callback: any) {
    try {
      const { orderId, products } = call.request;
      if (!products || products.length === 0) {
        throw new Error('No products provided');
      }

      await inventoryService.CheckAndReserveInventory(products);
      const updatedProducts = products.map(products);
      const hasInsufficientStock = updatedProducts.some(
        (product: any) => product.actualQty < product.requestedQty
      );

      callback(null, {
        orderId,
        status: hasInsufficientStock ? 'partial_fulfillment' : 'fulfilled',
        message: hasInsufficientStock
          ? 'Some products had insufficient stock'
          : 'All products successfully reserved',
        products: updatedProducts,
      });
    } catch (error) {
      console.error('Error in CheckAndReserveInventory:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      callback({ code: grpc.status.INVALID_ARGUMENT, details: message });
    }
  },

  async GetProduct(call: any, callback: any) {
    try {
      const { id } = call.request;
      const product = await prisma.inventory.findUnique({ where: { id } });
      if (!product) {
        return callback(null, { product: null, found: false });
      }
      callback(null, {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          qty: product.qty,
        },
        found: true,
      });
    } catch (error) {
      console.error('Error in GetProduct:', error);
      callback({ code: grpc.status.INTERNAL, details: 'Internal server error' });
    }
  },

  async UpdateProductQuantity(call: any, callback: any) {
    try {
      const { id, newQty } = call.request;
      const updatedProduct = await prisma.inventory.update({
        where: { id },
        data: { qty: newQty },
      });
      callback(null, {
        success: true,
        message: 'Product quantity updated successfully',
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          qty: updatedProduct.qty,
        },
      });
    } catch (error) {
      console.error('Error in UpdateProductQuantity:', error);
      callback(null, {
        success: false,
        message: 'Failed to update product quantity',
        product: null,
      });
    }
  },
  async GetAllProducts(call: any, callback: any) {
    try {
      const products = await prisma.inventory.findMany();
      const productList = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        qty: product.qty,
      }));
      callback(null, { products: productList });
    } catch (error) {
      console.error('Error in GetAllProducts:', error);
      callback({ code: grpc.status.INTERNAL, details: 'Internal server error' });
    }
  },
};

export { grpcInventoryController as inventoryService, inventoryProto };
