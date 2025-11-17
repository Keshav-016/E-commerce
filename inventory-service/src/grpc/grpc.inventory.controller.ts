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
      const { userId } = call.request;
      if (!userId) {
        throw new Error('User ID is required');
      }

      const data = await inventoryService.CheckAndReserveInventory(userId);
      if (!data) {
        throw new Error('Internal server error');
      }

      callback(null, {
        status: data.hasInsufficientStock ? 'partial_fulfillment' : 'fulfilled',
        message: data.hasInsufficientStock
          ? 'Some products had insufficient stock'
          : 'All products successfully reserved',
        products: data.updatedProducts,
      });
    } catch (error) {
      console.error('Error in CheckAndReserveInventory:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      callback({ code: grpc.status.INVALID_ARGUMENT, details: message });
    }
  },
};

export { grpcInventoryController as inventoryService, inventoryProto };
