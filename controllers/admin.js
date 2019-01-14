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
    const {title, image: imageUrl, price, description} = req.body;
    const product = new Product({title, imageUrl, price, description, userId: req.user._id});
    product.save()
        .then(result => {
            req.flash('success', 'Product successfully added');
            res.redirect('/admin/products')
        })
        .catch(console.log);
};

const getEditProduct = (req, res) => {
    const id = req.params.productId;
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    Product.findOne({_id: id, userId: req.user._id})
        .then(product => {
            if(!product) {
                req.flash('error', 'Product not found!');
                return res.redirect('/admin/products')
            }
            res.render('admin/form-product', {
                title: 'Edit Product',
                path: '/admin/products',
                product: product,
                editing: editMode
            });
        })
        .catch(console.log);
};

const postEditProduct = (req, res) => {
    const id = req.params.productId;
    const {title, image, price, description} = req.body;

    Product.findOne({_id: id, userId: req.user._id})
        .then(product => {
            product.title = title;
            product.imageUrl = image;
            product.price = price;
            product.description = description;
            return product.save();
        })
        .then(result => {
            req.flash('success', 'Product successfully updated');
            return res.redirect('/admin/products');
        })
        .catch(console.log);
};

const postDeleteProduct = (req, res) => {
    const id = req.params.productId;
    Product.findOne({_id: id, userId: req.user._id})
        .then(product => product.remove())
        .then(result => {
            return res.redirect('/admin/products');
        })
        .catch(console.log);
}

const getAllProducts = (req, res) => {
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
        .catch(console.log);
};


module.exports = {
    getAllProducts: getAllProducts,
    getAddProduct: getAddProduct,
    postAddProduct: postAddProduct,
    getEditProduct: getEditProduct,
    postEditProduct: postEditProduct,
    postDeleteProduct: postDeleteProduct,
};