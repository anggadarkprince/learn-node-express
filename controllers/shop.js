const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 4;

const getAllProducts = (req, res) => {
    const page = Number(req.query.page || 1);
    let totalItems = 0;

    Product.find().countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate('userId', 'name');
        })
        .then(products => {
            res.render('shop/product-list', {
                products: {
                    data: products,
                    totalProducts: totalItems,
                    perPage: ITEMS_PER_PAGE,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPrevPage: page > 1,
                    currentPage: page,
                    nextPage: page + 1,
                    prevPage: (page - 1) < 1 ? 1 : page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
                },
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

const getIndex = (req, res, next) => {
    const page = Number(req.query.page || 1);
    let totalItems = 0;

    Product.find().countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate('userId', 'name');
        })
        .then(products => {
            res.render('shop/index', {
                products: {
                    data: products,
                    totalProducts: totalItems,
                    perPage: ITEMS_PER_PAGE,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPrevPage: page > 1,
                    currentPage: page,
                    nextPage: page + 1,
                    prevPage: (page - 1) < 1 ? 1 : page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
                },
                title: 'Shop',
                path: '/',
                page: page
            });
        })
        .catch(next);
};

const getCart = (req, res) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            console.log(user.cart.items);
            res.render('shop/cart', {
                title: 'Your Cart',
                path: '/cart',
                products: user.cart.items
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

const getOrders = (req, res) => {
    Order.find({"user.userId": req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                title: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(console.log);
};

const postOrders = (req, res) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    var stripe = require("stripe")(process.env.STRIPE_KEY);

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express

    let total = 0;

    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            user.cart.items.forEach(product => {
                total += product.quantity * product.productId.price;
            });

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
        .then((result) => {
            const charge = stripe.charges.create({
                amount: total * 100,
                currency: 'usd',
                description: 'Charge order ' + result._id,
                source: token,
                metadata: {order_id: result._id.toString()}
            });
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(console.log);
}

const getCheckout = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            let total = 0;
            products.forEach(product => {
                total += product.quantity * product.productId.price;
            });
            res.render('shop/checkout', {
                path: '/cart',
                title: 'Checkout Your Cart',
                products: products,
                total: total
            })
        })
        .catch(next);
}

const getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }

            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

            if (fs.existsSync(invoicePath)) {
                const currentTime = (new Date()).getTime();
                const lastModified = fs.statSync(invoicePath).mtimeMs;
                const diffTimeInSeconds = Math.round((currentTime - lastModified) / 1000);
                if (diffTimeInSeconds < 300) { // 5 minutes expired
                    console.log('Serve existing invoice - diffTime: ' + diffTimeInSeconds);
                    // stream data for bigger file
                    const file = fs.createReadStream(invoicePath);
                    return file.pipe(res);
                }

                /* simple serve file
                fs.readFile(invoicePath, (err, data) => {
                    if (err) {
                        return next(err);
                    }
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
                    res.send(data);
                });
                */
            }

            console.log('Generate new invoice');
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(20).text('Invoice ' + orderId, {
                underline: true
            }).moveDown();
            pdfDoc.fontSize(14);

            let total = 0;
            let lastIndex = 0;
            order.products.forEach((p, i) => {
                lastIndex = i;
                total += p.quantity * p.product.price;

                pdfDoc.text(p.product.title, 70, 110 + (i * 30), {
                    width: 200
                });
                pdfDoc.text(p.quantity, 300, 110 + (i * 30), {
                    width: 50
                });
                pdfDoc.text('x', 350, 110 + (i * 30), {
                    width: 50
                });
                pdfDoc.text('$' + p.product.price, 400, 110 + (i * 30), {
                    width: 100
                });
            });
            pdfDoc.moveDown();

            const startBottom = 100 + ((lastIndex + 1) * 30);
            pdfDoc.moveTo(70, startBottom)
                .lineTo(500, startBottom)
                .lineWidth(1)
                .stroke();

            pdfDoc.text('Total price', 70, 110 + ((lastIndex + 1) * 30), {
                width: 100
            });
            pdfDoc.text('$' + total, 400, 110 + ((lastIndex + 1) * 30), {
                width: 100
            });

            pdfDoc.end();
        })
        .catch(next);
}

module.exports = {
    getIndex: getIndex,
    getAllProducts: getAllProducts,
    getProduct: getProduct,
    getCart: getCart,
    postCart: postCart,
    postCartDelete: postCartDelete,
    getOrders: getOrders,
    postOrders: postOrders,
    getCheckout: getCheckout,
    getInvoice: getInvoice
};