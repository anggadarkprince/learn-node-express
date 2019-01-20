const Product = require('../models/product');
const {validationResult} = require('express-validator/check');

const getAddProduct = (req, res) => {
    res.render('admin/form-product', {
        title: 'Create New Product',
        path: '/admin/products/add',
        product: {id: '', title: '', price: '', description: ''},
        editing: false,
        errorMessage: req.flash('error'),
        oldInput: {}
    });
};

const postAddProduct = (req, res, next) => {
    const {title, price, description} = req.body;
    const image = req.file;
    const errors = validationResult(req);

    if (!image) {
        return res.status(422).render('admin/form-product', {
            title: 'Create New Product',
            path: '/admin/products/add',
            product: {id: '', title: '', price: '', description: ''},
            editing: false,
            errorMessage: [{param: 'image', msg: 'Attached file is not an image'}],
            oldInput: req.body
        });
    }

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/form-product', {
            title: 'Create New Product',
            path: '/admin/products/add',
            product: {id: '', title: '', imageUrl: '', price: '', description: ''},
            editing: false,
            errorMessage: errors.array(),
            oldInput: req.body
        });
    }

    const imageUrl = image.path;
    const product = new Product({title, imageUrl, price, description, userId: req.user._id});
    product.save()
        .then(result => {
            req.flash('success', 'Product successfully added');
            res.redirect('/admin/products')
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const getEditProduct = (req, res, next) => {
    const id = req.params.productId;
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    Product.findOne({_id: id, userId: req.user._id})
        .then(product => {
            if (!product) {
                req.flash('error', 'Product not found!');
                return res.redirect('/admin/products')
            }
            res.render('admin/form-product', {
                title: 'Edit Product',
                path: '/admin/products',
                product: product,
                editing: editMode,
                errorMessage: req.flash('error'),
                oldInput: {}
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const postEditProduct = (req, res, next) => {
    const id = req.params.productId;
    const {title, price, description} = req.body;
    const image = req.file;

    if (!image) {
        return res.status(422).render('admin/form-product', {
            title: 'Edit Product',
            path: '/admin/products/add',
            product: {id: '', title: '', price: '', description: ''},
            editing: true,
            errorMessage: [{param: 'image', msg: 'Attached file is not an image'}],
            oldInput: req.body
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/form-product', {
            title: 'Edit Product',
            path: '/admin/products',
            product: {id: '', title: '', price: '', description: ''},
            editing: true,
            errorMessage: errors.array(),
            oldInput: req.body
        });
    }

    Product.findOne({_id: id, userId: req.user._id})
        .then(product => {
            if (image) {
                product.imageUrl = image.path;
            }
            product.title = title;
            product.price = price;
            product.description = description;
            return product.save();
        })
        .then(result => {
            req.flash('success', 'Product successfully updated');
            return res.redirect('/admin/products');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const postDeleteProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findOne({_id: id, userId: req.user._id})
        .then(product => product.remove())
        .then(result => {
            return res.redirect('/admin/products');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

const getAllProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .select('_id title price imageUrl description')
        .populate('userId', 'name')
        .then(products => {
            res.render('admin/product-list', {
                products: products,
                title: 'Admin Products',
                path: '/admin/products',
                errorMessage: req.flash('error'),
                successMessage: req.flash('success')
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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