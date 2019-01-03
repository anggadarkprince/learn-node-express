const express = require('express');
const path = require('path');
const rootDir = require('../utils/path');
const adminData = require('./admin');

const router = express.Router();

// get: /
router.get('/', (req, res) => {
    console.log(adminData.products);
    const products = adminData.products;
    res.render('shop', {
        products: products,
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
        path: undefined,
        title: 'My Shop'
    });
    //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;