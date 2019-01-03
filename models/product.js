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
    constructor(title) {
        this.title = title;
    }

    save() {
        getProductFromFile(products => {
            products.push(this);
            fs.writeFileSync(pathFile, JSON.stringify(products));
        });
    }

    static fetchAll(callback) {
        getProductFromFile(callback);
    }
}

module.exports = Product;