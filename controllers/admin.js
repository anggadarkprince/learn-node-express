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
    req.user.createProduct({
        title, imageUrl, price, description,
        userId: req.user.id
    })
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(console.log);
    
    /*
    Product.create({
        title, imageUrl, price, description,
        userId: req.user.id
    })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(console.log);
    */
};

const getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    req.user.getProducts({where: {id: req.params.productId}})
    //Product.findByPk(req.params.productId)
        .then(product => {
            res.render('admin/form-product', {
                title: 'Edit Product',
                path: '/admin/products',
                product: product[0],
                editing: editMode
            });
        })
        .catch(console.log);
};

const postEditProduct = (req, res) => {
    const id = req.params.productId;
    const {title, image, price, description} = req.body;

    Product.findByPk(id)
        .then(product => {
            product.title = title;
            product.imageUrl = image;
            product.price = price;
            product.description = description;
            return product.save();
        })
        .then(result => {
            return res.redirect('/admin/products');
        })
        .catch(console.log);
};

const postDeleteProduct = (req, res) => {
    const id = req.params.productId;
    Product.findByPk(id)
        .then(product => product.destroy())
        .then(result => {
            return res.redirect('/admin/products');
        })
        .catch(console.log);
}

const getAllProducts = (req, res) => {
    req.user.getProducts()
    //Product.findAll()
        .then(products => {
            res.render('admin/product-list', {
                products: products,
                title: 'Admin Products',
                path: '/admin/products'
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