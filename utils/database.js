const Sequelize = require('sequelize');

const sequelize = new Sequelize('shop-express', 'root', 'anggaari', {
    host: 'localhost', port: 3306, dialect: 'mysql', operatorsAliases: false,
});

module.exports = sequelize;