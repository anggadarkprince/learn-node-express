//const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const rootDir = require('./utils/path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();
//app.engine('handlebars', expressHandlebars({layoutsDir: 'views/layouts/', defaultLayout: 'app', extname: 'handlebars'}));
//app.set('view engine', 'handlebars');
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('Logging request');
    next();
});

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);

app.use((req, res) => {
    res.render('404', {title: 'Page Not Found'});
    //res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});


// const server = http.createServer(app);
// server.listen(3000);

// shortcut to create server and run it
app.listen(3000);