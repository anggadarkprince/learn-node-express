const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const csrf = require('csurf');

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
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'data/images');
    },
    filename: (req, file, callback) => {
        callback(null, (new Date()).toISOString() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, callback) => {
    if (['image/png', 'image/jpg', 'image/jpeg'].find(mime => mime === file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({destination: 'images', storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'data', 'images')));
app.use(session({secret: 'secret98sh968sdf7s8df6', resave: false, saveUninitialized: false, store: store}));
app.use(flash());
app.use(csrfProtection);

app.use((req, res, next) => {
    console.log('Logging all request');
    next();
});

// executed when request is coming
app.use((req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(console.log);
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.get('/500', errorController.get500);
app.use('/admin', authMiddleware, adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);
app.use(errorController.get404);
app.use((error, req, res, next) => {
    console.log(error);
    if (!res.locals.isAuthenticated) {
        res.locals.isAuthenticated = false;
    }
    res.status(500).render('500', {title: 'Internal server error', path: '/500'});
});

mongoose.set('debug', true); // logging to console
mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
    .then(() => {
        app.listen(3000);
    })
    .catch(console.log);
mongoose.Promise = Promise;
