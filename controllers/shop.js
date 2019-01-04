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

const getProduct = (req, res) => {
    const productId = req.params.productId;
    Product.findById(productId, (product) => {
        res.render('shop/product-detail', {
            product: product,
            title: 'Product Detail',
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

const postCart = (req, res, next) => {
    const productId = req.body.productId;
    return redirect('/cart');
};

const getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout'
    });
};

const getOrders = (req, res, next) => {
    res.render('shop/orders', {
        title: 'Your Orders',
        path: '/orders'
    });
};


module.exports = {
    getIndex: getIndex,
    getAllProducts: getAllProducts,
    getProduct: getProduct,
    getCart: getCart,
    postCart: postCart,
    getCheckout: getCheckout,
    getOrders: getOrders
};