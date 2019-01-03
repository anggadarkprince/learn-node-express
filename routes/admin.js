const express = require('express');
const productController = require('../controllers/products');

const router = express.Router();

// get: admin/product
router.get('/product', productController.getAllProducts);

// get: admin/product/add
router.get('/product/add', productController.getAddProduct);

// post: admin/product
router.post('/product', productController.postAddProduct);


module.exports = router;