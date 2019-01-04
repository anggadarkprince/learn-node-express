const fs = require('fs');
const path = require('path');

const pathFile = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductFromFile = (callback) => {
    fs.readFile(pathFile, (err, data) => {
        if (err) {
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

    save() {
        this.id = Math.floor(Math.random() * 1000000);
        getProductFromFile(products => {
            products.push(this);
            fs.writeFileSync(pathFile, JSON.stringify(products));
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