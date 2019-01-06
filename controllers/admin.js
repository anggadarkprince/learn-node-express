const Product = require('../models/product');

const getAddProduct = (req, res) => {
    res.render('admin/form-product', {
        title: 'Create New Product',
        path: '/admin/products/add',
        product: {id: '', title: '', imageUrl: '', price: '', description: ''},
        editing: false
    });
};

const postAddProduct = (req, res) => {
    const {title, image, price, description} = req.body;
    const product = new Product(title, image, price, description);
    product.save();

    return res.redirect('/admin/products');
};

const getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    Product.findById(req.params.productId, product => {
        res.render('admin/form-product', {
            title: 'Create New Product',
            path: '/admin/products',
            product: product,
            editing: editMode
        });
    });
};

const postEditProduct = (req, res) => {
    const id = req.params.productId;
    const {title, image, price, description} = req.body;
    const product = new Product(title, image, price, description);
    product.save(id);

    return res.redirect('/admin/products');
};

const postDeleteProduct = (req, res) => {
    const id = req.params.productId;
    Product.delete(id);
    return res.redirect('/admin/products');
}

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
    getEditProduct: getEditProduct,
    postEditProduct: postEditProduct,
    postDeleteProduct: postDeleteProduct,
};