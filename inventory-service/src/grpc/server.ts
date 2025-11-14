import * as grpc from '@grpc/grpc-js';
import { inventoryService, inventoryProto } from './grpc.inventory.controller.js';
import env from '../../env.js';

const server = new grpc.Server();
server.addService(inventoryProto.InventoryService.service, inventoryService);

const port = env.GRPC_PORT || 50052;
const host = '0.0.0.0';

server.bindAsync(
  `${host}:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (error, actualPort) => {
    if (error) {
      console.error('Failed to start gRPC server:', error);
      process.exit(1);
    }
    console.log(`🚀 gRPC Server running on ${host}:${actualPort}`);
    server.start();
  }
);
