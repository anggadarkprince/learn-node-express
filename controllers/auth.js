const User = require('../models/user');

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
    User.findOne({email: req.body.email, password: req.body.password})
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }
            req.session.isLoggedIn = true;
            req.session.userId = user._id;
            // make sure session is persisted before used in another render (optional)
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(console.log);
};

const postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

module.exports = {
    getLogin: getLogin,
    postLogin: postLogin,
    postLogout: postLogout
}