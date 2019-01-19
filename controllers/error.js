exports.get404 = (req, res) => {
    res.status(404).render('404', {title: 'Page Not Found', path: '/404'});
};

exports.get500 = (req, res) => {
    res.status(500).render('500', {title: 'Internal server error', path: '/500'});
};