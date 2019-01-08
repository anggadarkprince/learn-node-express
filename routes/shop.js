const express = require('express');
const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getAllProducts);
router.get('/product/:productId', shopController.getProduct);
router.get('/cart', shopController.getCart);
router.post('/add-to-cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDelete);
router.get('/checkout', shopController.getCheckout);
router.post('/create-order', shopController.postOrders);
router.get('/orders', shopController.getOrders);

module.exports = router;