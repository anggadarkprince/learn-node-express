const Product = require('../models/product');

const getAllProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            products: products,
            title: 'All Products',
            path: '/products'
        });
    });
};

const getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            products: products,
            title: 'Shop',
            path: '/'
        });
    });
};

const getCart = (req, res, next) => {
    res.render('shop/cart', {
        title: 'Your Cart',
        path: '/cart'
    });
};

const getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout'
    });
};

module.exports = {
    getIndex: getIndex,
    getAllProducts: getAllProducts,
    getCart: getCart,
    getCheckout: getCheckout
};