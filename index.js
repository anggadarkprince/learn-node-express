const http = require('http');
const routes = require('./routes');

console.log(routes.myMessage);

const server = http.createServer(routes);

/*
const server = http.createServer(function (request, response) {
routes(request, response);

const url = request.url;
const method = request.method;

response.setHeader('Content-Type', 'text/html');
response.write('<html>');
response.write('<head><title>First Page</title></head>');
response.write('<body>Hi, this is from node js server</body>');
response.write('</html>');
response.end();

//console.log(request.url, request.method, request.headers);
//process.exit();
});
*/

server.listen(3000);