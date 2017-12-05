'use strict';
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */

const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const restify = require('restify'); //framework REST
var debug = require('debug'); //framework REST

const app = restify.createServer({name: 'sgppApi'});

app.use(restify.bodyParser()); // for parsing application/json
app.use(restify.plugins.queryParser());

require("./routes/auth")(app);
require("./routes/user")(app);
// app.pre(authLib.ensureAuthenticated);

app.pre((req,res,next) => {
	console.log('Request URL: '+req.method+' '+req.url);
	// debug('Request URL: '+req.method+' '+req.url)
	next()
});
require("./routes/porpose")(app);

app.listen(3000,'127.0.0.1', () => {
  	console.log('Server "%s" escuchando a la URI %s',app.name,app.url);
  	// debug('Server escuchando el puerto 3000 al server %s',app.url)
});
