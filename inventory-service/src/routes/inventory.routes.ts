import { Router } from 'express';
import inventoryController from '../controller/inventory.controller';

const router = Router();

router.get('/getProducts', inventoryController.getProducts);
router.get('/getProductById/:id', inventoryController.getProductById);

export default router;
