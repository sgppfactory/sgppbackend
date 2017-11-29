'use strict';
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */

const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const restify = require('restify'); //framework REST

const app = restify.createServer();

app.use(restify.bodyParser()); // for parsing application/json

require("./routes/auth")(app);
require("./routes/user")(app);
// app.pre(authLib.ensureAuthenticated);

app.pre((req,res,next) => {
	console.log('Request URL: '+req.method+' '+req.url);
	next()
});
require("./routes/porpose")(app);

app.listen(3000, () => {
  	console.log('Server escuchando el puerto 3000 al server %s',app.url);
});
