const express = require('express');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/products', adminController.getAllProducts);
router.get('/products/add', adminController.getAddProduct);
router.post('/products', adminController.postAddProduct);


module.exports = router;