const express = require('express');
const shopController = require('../controllers/shop');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getAllProducts);
router.get('/product/:productId', shopController.getProduct);
router.get('/cart', authMiddleware, shopController.getCart);
router.post('/add-to-cart', authMiddleware, shopController.postCart);
router.post('/cart-delete-item', authMiddleware, shopController.postCartDelete);
router.get('/checkout', authMiddleware, shopController.getCheckout);
router.get('/orders', authMiddleware, shopController.getOrders);
router.get('/orders/invoice/:orderId', authMiddleware, shopController.getInvoice);

module.exports = router;