const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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
    Product.find().populate('userId', 'name')
        .then(products => {
            console.log(products);
            res.render('shop/index', {
                products: products,
                title: 'Shop',
                path: '/'
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
    getInvoice: getInvoice
};