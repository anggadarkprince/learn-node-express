const Product = require('../models/product');
const Order = require('../models/order');

const getAllProducts = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                products: products,
                title: 'All Products',
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(console.log);
};

const getProduct = (req, res) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                title: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(console.log);
};

const getIndex = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                products: products,
                title: 'Shop',
                path: '/',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(console.log);
};

const getCart = (req, res) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            console.log(user.cart.items);
            res.render('shop/cart', {
                title: 'Your Cart',
                path: '/cart',
                products: user.cart.items,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(console.log);
};

const postCart = (req, res) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(console.log);
};

const postCartDelete = (req, res) => {
    const productId = req.body.productId;
    req.user.removeFromCart(productId)
        .then(cart => {
            res.redirect('/cart');
        })
        .catch(console.log);
}

const getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                title: 'Your Orders',
                path: '/orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(console.log);
};

const postOrders = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, product: {...i.productId._doc}};
            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user._id
                },
                products: products
            })
            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(console.log);
}

module.exports = {
    getIndex: getIndex,
    getAllProducts: getAllProducts,
    getProduct: getProduct,
    getCart: getCart,
    postCart: postCart,
    postCartDelete: postCartDelete,
    getOrders: getOrders,
    postOrders: postOrders
};