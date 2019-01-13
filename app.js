const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');
const User = require('./models/user');

const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('Logging all request');
    next();
});

// executed when request is coming
app.use((req, res, next) => {
    User.findById('5c3a00a243a93711559a8829')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(console.log);
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/shop-express', {useNewUrlParser: true})
    .then(() => {
        User.findOne().then(user => {
            if(!user) {
                const user = new User({
                    name: 'Angga Ari Wijaya',
                    email: 'angga@mail.com',
                    password: 'secret',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch(console.log);
mongoose.Promise = Promise;
