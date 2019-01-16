const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {validationResult} = require('express-validator/check');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}))

const getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        title: 'Signup',
        errorMessage: req.flash('error')
    });
};

const postSignup = (req, res) => {
    const {name, email, password, confirmPassword} = req.body;
    if (!name && !email) {
        req.flash('error', 'User data is required');
        return res.redirect('/signup');
    }
    if (password != confirmPassword) {
        req.flash('error', 'Password is mismatch');
        return res.redirect('/signup');
    }
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            title: 'Signup',
            errorMessage: errors.array()
        });
    }
    User.findOne({email: email})
        .then(existUser => {
            if (existUser) {
                req.flash('error', 'User already exist');
                return res.redirect('/signup');
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({name, email, password: hashedPassword, cart: {items: []}});
                    return user.save();
                })
                .then(() => {
                    req.flash('success', 'You are registered!');
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: `"${name}" <${email}>`,
                        from: `"Express Shop" <no-reply@express-shop.app>`,
                        subject: 'Welcome Aboard!',
                        html: `<h3>Hi ${name}, you are successfully signed up!</h3>`
                    });
                })
                .catch(console.log);
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
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
    });
};

const postLogin = (req, res) => {
    //res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=1000; HttpOnly');
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email address');
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
                        req.flash('error', 'Invalid credentials, try again!');
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

const getReset = (req, res) => {
    res.render('auth/reset', {
        path: '/reset',
        title: 'Reset Password',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
    })
}

const postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            req.flash('error', 'Generate token failed, try again!');
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) {
                    req.flash('error', 'Email is not registered!');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                req.flash('success', 'Your reset links already sent');
                res.redirect('/login');
                return transporter.sendMail({
                    to: req.body.email,
                    from: `"Express Shop" <no-reply@express-shop.app>`,
                    subject: 'Reset Password',
                    html: `
                        <h3>Hi ${result.name}, your reset link is ready.</h3>
                        <p>You requested a password reset</p>
                        <p>Click <a href="http://localhost:3000/reset/${token}">this link</a> to set a new password</p>
                    `
                });
            })
            .catch(console.log);
    })
}

const getRecovery = (req, res) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if (!user) {
                req.flash('error', 'Token is invalid or already expired!');
                return res.redirect('/login');
            }
            res.render('auth/recovery', {
                path: '/recovery',
                title: 'Password Recovery',
                userId: user._id.toString(),
                email: user.email,
                token: user.resetToken,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success')
            });
        })
        .catch(console.log);
}

const postRecovery = (req, res) => {
    const {id, token, password} = req.body;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}, _id: id})
        .then(user => {
            if (!user) {
                req.flash('error', 'Token is invalid or already expired!');
                return res.redirect('/login');
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.resetToken = undefined;
                    user.resetTokenExpiration = undefined;
                    return user.save();
                })
                .then(() => {
                    req.flash('success', 'Your password successfully reset!');
                    res.redirect('/login');
                })
                .catch(console.log);
        })
        .catch(console.log);
}

module.exports = {
    getSignup: getSignup,
    postSignup: postSignup,
    getLogin: getLogin,
    postLogin: postLogin,
    postLogout: postLogout,
    getReset: getReset,
    postReset: postReset,
    getRecovery: getRecovery,
    postRecovery: postRecovery,
}