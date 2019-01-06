const fs = require('fs');
const path = require('path');
const Cart = require('../models/cart');

const pathFile = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductFromFile = (callback) => {
    fs.readFile(pathFile, (err, data) => {
        if (err) {
            fs.writeFileSync(pathFile, JSON.stringify([]), err => console.log(err));
            callback([]);
        } else {
            callback(JSON.parse(data));
        }
    });
};

class Product {
    constructor(title, imageUrl, price, description) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(id = null) {
        this.id = id === null ? Math.floor(Math.random() * 1000000) : id;
        getProductFromFile(products => {
            if(id === null) {
                products.push(this);
            } else {
                const productIndex = products.findIndex(product => Number(product.id) === Number(id));
                products[productIndex] = this;
            }
            fs.writeFileSync(pathFile, JSON.stringify(products));
        });
    }

    static delete(id) {
        getProductFromFile(products => {
            const deletedProduct = products.find(product => product.id == id);
            const updatedProducts = products.filter(product => Number(product.id) !== Number(id));
            fs.writeFile(pathFile, JSON.stringify(updatedProducts), err => {
                if(!err) {
                    Cart.delete(id, deletedProduct.price);
                }
            });
        });
    }

    static fetchAll(callback) {
        getProductFromFile(callback);
    }

    static findById(id, callback) {
        getProductFromFile(products => {
            const product = products.find(product => Number(product.id) === Number(id));
            callback(product);
        });
    }
}

module.exports = Product;