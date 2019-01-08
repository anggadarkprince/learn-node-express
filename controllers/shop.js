const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

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
    req.user.getCart()
    .then(cart => {
        return cart.getProducts()
        .then(products => {
            console.log('data', products);
            res.render('shop/cart', {
                title: 'Your Cart',
                path: '/cart',
                cart: {products: products}
            });
        })
        .catch(console.log);
    })
    .catch(console.log);
    /*
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
    */
};

const postCart = (req, res) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: productId}});
        })
        .then(products => {
            let product;
            if(products.length > 0) {
                product = products[0];
            }

            if(product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: {quantity: newQuantity}
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(console.log);
    /*
    Product.findById(productId, product => {
        if (product) {
            Cart.addProduct(product.id, product.price);
        }
        return res.redirect('/cart');
    });
    */
};

const postCartDelete = (req, res) => {
    const productId = req.body.productId;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({where: {id: productId}});
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(console.log);

    /*
    Product.findById(productId, product => {
        if (product) {
            Cart.delete(productId, product.price);
        }
        return res.redirect('/cart');
    });
    */
}

const getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout'
    });
};

const getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                title: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(console.log);
};

const postOrders = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = {quantity: product.cartItem.quantity};
                        return product;
                    }));
                })
                .catch(console.log);
        })
        .then(result => {
            return fetchedCart.setProducts(null);
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
    getCheckout: getCheckout,
    getOrders: getOrders,
    postOrders: postOrders
};