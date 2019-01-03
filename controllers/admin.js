const Product = require('../models/product');

const getAddProduct = (req, res) => {
    res.render('admin/add-product', {
        title: 'Create New Product',
        activeAddProduct: true,
        formsCSS: true,
        path: '/admin/products/add',
    });
};

const postAddProduct = (req, res) => {
    const product = new Product(req.body.title);
    product.save();

    return res.status(302).redirect('/admin/products');
};

const getAllProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render('admin/product-list', {
            products: products,
            title: 'Admin Products',
            path: '/admin/products'
        });
    });
};


module.exports = {
    getAllProducts: getAllProducts,
    getAddProduct: getAddProduct,
    postAddProduct: postAddProduct,
};