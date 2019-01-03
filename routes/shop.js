const express = require('express');
const productController = require('../controllers/products');

const router = express.Router();

router.get('/', productController.getAllProducts);

module.exports = router;