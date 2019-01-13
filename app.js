const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const path = require('path');

const authMiddleware = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb://localhost:27017/shop-express';
const mongoose = require('mongoose');
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'secret98sh968sdf7s8df6', resave: false, saveUninitialized: false, store: store}));

app.use((req, res, next) => {
    console.log('Logging all request');
    next();
});

// executed when request is coming
app.use((req, res, next) => {
    if(!req.session.userId) {
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(console.log);
});
app.use('/admin', authMiddleware, adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoose.set('debug', true); // logging to console
mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
    .then(() => {
        app.listen(3000);
    })
    .catch(console.log);
mongoose.Promise = Promise;
