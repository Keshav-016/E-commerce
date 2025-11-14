import { Router } from 'express';
import inventoryController from '../controller/inventory.controller';

const router = Router();

router.delete('/deleteProduct/:id', inventoryController.deleteProduct);
router.put('/manageProduct', inventoryController.manageProduct);

export default router;
