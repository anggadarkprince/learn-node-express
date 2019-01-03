const Product = require('../models/product');

const getAddProduct = (req, res) => {
    res.render('add-product', {
        title: 'Create New Product',
        activeAddProduct: true,
        formsCSS: true,
        path: '/admin/product/add',
    });
};

const postAddProduct = (req, res) => {
    const product = new Product(req.body.title);
    product.save();

    return res.status(302).redirect('/admin/product');
};

const getAllProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render('shop', {
            products: products,
            title: 'Admin Product',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
            path: '/'
        });
    });
};

module.exports = {
    getAllProducts: getAllProducts,
    getAddProduct: getAddProduct,
    postAddProduct: postAddProduct
};