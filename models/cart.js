const fs = require('fs');
const path = require('path');

const pathFile = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

class Cart {
    static getProducts(callback) {
        fs.readFile(pathFile, (err, file) => {
            if(err) {
                callback(null);
            }
            const cart = JSON.parse(file);
            callback(cart);
        });
    }

    static addProduct(id, productPrice) {
        // fetch previous cart
        fs.readFile(pathFile, (err, file) => {
            let cart = {products: [], totalPrice: 0}
            if (!err) {
                cart = JSON.parse(file);
            }

            // analyze the cart, find existing product
            const existingProductIndex = cart.products.findIndex(product => product.id == id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            // add new product / increase quantity
            if (existingProduct) {
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {id: id, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(pathFile, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }

    static delete(id, productPrice) {
        fs.readFile(pathFile, (err, file) => {
            let cart = {products: [], totalPrice: 0}
            if (err) {
                return;
            } else {
                cart = JSON.parse(file);
            }
            const updatedCart = {...cart};
            const product = updatedCart.products.find(product => product.id == id);

            if(product) {
                updatedCart.products = updatedCart.products.filter(product => product.id != id);
                updatedCart.totalPrice = updatedCart.totalPrice - (productPrice * product.qty);
                if (cart.totalPrice < 0) cart.totalPrice = 0;

                fs.writeFile(pathFile, JSON.stringify(updatedCart), err => {
                    console.log(err);
                });
            }
        });
    }
}

module.exports = Cart;