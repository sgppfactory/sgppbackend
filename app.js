'use strict';
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */

const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const restify = require('restify'); //framework REST
// var debug = require('debug');
const sequelize = new (require('sequelize'))('sgpp', 'root', 'root', {host: 'localhost',dialect: 'mysql'});
// const sequelize = new Sequelize('sgpp', 'root', 'root', {host: 'localhost',dialect: 'mysql'});

const app = restify.createServer({name: 'sgppApi'});

app.use(restify.bodyParser()); // for parsing application/json
app.use(restify.plugins.queryParser());
app.get('/status',(req,res,next)=>{
	res.send('ready')
});

var routesArr = ["auth","porpose","node","cicle","stage"]

for(var x = 0; routesArr.length > x; x++) {
	require("./routes/" + routesArr[x])(app);
}
// require("./routes/porpose")(app);
// require("./routes/node")(app);
// require("./routes/cicle")(app);
// require("./routes/stage")(app);
// require("./routes/user")(app);
// app.pre(authLib.ensureAuthenticated);

app.pre((req,res,next) => {
	console.log('Request URL: '+req.method+' '+req.url);
	// debug('Request URL: '+req.method+' '+req.url)
	next()
});

app.listen(3000,'127.0.0.1', () => {
  	console.log('Server "%s" escuchando a la URI %s',app.name,app.url);
  	// debug('Server escuchando el puerto 3000 al server %s',app.url)
});
