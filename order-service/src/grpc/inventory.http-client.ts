import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// gRPC client to communicate with inventory service
export class InventoryGrpcClient {
  private client: any;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    // Load inventory proto file
    const INVENTORY_PROTO_PATH = path.join(__dirname, '../../protos/inventory-client.proto');

    const packageDefinition = protoLoader.loadSync(INVENTORY_PROTO_PATH, {});

    const inventoryProto = grpc.loadPackageDefinition(packageDefinition).inventory as any;

    const target = process.env.INVENTORY_SERVICE_ADDR || 'inventory-service:50052';
    this.client = new inventoryProto.InventoryService(target, grpc.credentials.createInsecure());
  }

  async checkAndReserveInventory(userId: string, orderId: string) {
    return new Promise((resolve, reject) => {
      this.client.CheckAndReserveInventory({ userId, orderId }, (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }
}

export default new InventoryGrpcClient();
