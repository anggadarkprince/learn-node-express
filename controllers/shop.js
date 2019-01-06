const Product = require('../models/product');
const Cart = require('../models/cart');

const getAllProducts = (req, res) => {
    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                products: products,
                title: 'All Products',
                path: '/products'
            });
        })
        .catch(console.log);
};

const getProduct = (req, res) => {
    const productId = req.params.productId;
    Product.findByPk(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                title: product.title,
                path: '/products'
            });
        })
        .catch(console.log);
};

const getIndex = (req, res) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                products: products,
                title: 'Shop',
                path: '/'
            });
        })
        .catch(console.log);
};

const getCart = (req, res) => {
    Cart.getProducts(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (let product of products) {
                const cartProduct = cart.products.find(prod => prod.id == product.id);
                if (cartProduct) {
                    cartProducts.push({...product, qty: cartProduct.qty});
                }
            }
            res.render('shop/cart', {
                title: 'Your Cart',
                path: '/cart',
                cart: {products: cartProducts, total: cart.totalPrice}
            });
        })
    });
};

const postCart = (req, res) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        if (product) {
            Cart.addProduct(product.id, product.price);
        }
        return res.redirect('/cart');
    });
};

const postCartDelete = (req, res) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        if (product) {
            Cart.delete(productId, product.price);
        }
        return res.redirect('/cart');
    });
}

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
    postCartDelete: postCartDelete,
    getCheckout: getCheckout,
    getOrders: getOrders
};