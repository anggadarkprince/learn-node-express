const express = require('express');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/products', adminController.getAllProducts);
router.get('/products/add', adminController.getAddProduct);
router.get('/product/edit/:productId', adminController.getEditProduct);
router.post('/product/edit/:productId', adminController.postEditProduct);
router.post('/product/delete/:productId', adminController.postDeleteProduct);
router.post('/products', adminController.postAddProduct);


module.exports = router;