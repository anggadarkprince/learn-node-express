const express = require('express');
const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const router = express.Router();

const products = [];

// get: admin/product/add
router.get('/product/add', (req, res) => {
    console.log('another middleware');
    //res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
    //res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('add-product', {
        title: 'Create New Product',
        activeAddProduct: true,
        formsCSS: true,
        path: '/admin/product/add',
    });
});

// post: admin/product
router.post('/product', (req, res) => {
    products.push({title: req.body.title});
    fs.appendFile('message.txt', ', ' + req.body.title, err => {
        if (!err) {
            res.statusCode = 302;
            return res.redirect('/admin/product');
        }
        res.statusCode = 500;
        return res.send('<p>Something went wrong</p>');
    });
});

// get: admin/product
router.get('/product', (req, res, next) => {
    console.log('another middleware');
    res.render('shop', {
        products: products,
        title: 'Admin Product',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
        path: '/'
    });
    //res.send('<h1>All Product</h1>');
});

module.exports.routes = router;
module.exports.products = products;