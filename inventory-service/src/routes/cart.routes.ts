import CartController from '../controller/cart.controller';

import { Router } from 'express';

const router = Router();

router.post('/manageCart', CartController.manageCartItem);
router.get('/getCart/:cartId', CartController.getCart);
router.delete('/clear/:cartId', CartController.clearCart);

export default router;
