const User = require('../models/user');
const bcrypt = require('bcryptjs');

const getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        title: 'Signup',
        isAuthenticated: false
    });
};

const postSignup = (req, res) => {
    const {name, email, password} = req.body;
    User.findOne({email: email})
        .then(existUser => {
            if (existUser) {
                return res.redirect('/signup');
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({name, email, password: hashedPassword, cart: {items: []}});
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                });
        })
        .catch(console.log);
};

const getLogin = (req, res) => {
    //const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1] == 'true';
    const isLoggedIn = req.session.isLoggedIn;
    if (isLoggedIn) {
        res.redirect('/');
    }
    res.render('auth/login', {
        path: '/login',
        title: 'Login',
        isAuthenticated: req.session.isLoggedIn
    })
};

const postLogin = (req, res) => {
    //res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=1000; HttpOnly');
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }
            bcrypt.compare(req.body.password, user.password)
                .then(matchedPassword => {
                    if (matchedPassword) {
                        req.session.isLoggedIn = true;
                        req.session.userId = user._id;
                        // make sure session is persisted before used in another render (optional)
                        req.session.save(err => {
                            console.log(err);
                            return res.redirect('/');
                        });
                    } else {
                        res.redirect('/login');
                    }
                })
                .catch(console.log);
        })
        .catch(console.log);
};

const postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

module.exports = {
    getSignup: getSignup,
    postSignup: postSignup,
    getLogin: getLogin,
    postLogin: postLogin,
    postLogout: postLogout
}