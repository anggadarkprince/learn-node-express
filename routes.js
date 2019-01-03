const fs = require('fs');

const requestHandler = (request, response) => {
    const url = request.url;
    const method = request.method;
    if (url === '/') {
        response.write('<html>');
        response.write('<head><title>Home Page</title></head>');
        response.write('<body><form action="/message" method="post"><input type="text" name="message"><button>Submit</button></form></body>');
        response.write('</html>');
        return response.end();
    }
    if (url === '/message' && method === 'POST') {
        const body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        });
        request.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            fs.writeFile('message.txt', message, err => {
                if(!err) {
                    response.statusCode = 302;
                    response.setHeader('Location', '/');
                    return response.end();
                }
                response.statusCode = 500;
                response.write('Something went wrong');
                return response.end();
            });
        });
    }
};

/*
module.handler = requestHandler;
module.exports = {
    handler: requestHandler,
    someText: "hello"
};
*/

module.exports = requestHandler;
module.exports.myMessage = "Hello";