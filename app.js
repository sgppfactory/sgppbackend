'use strict';
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */

const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const restify = require('restify'); //framework REST
const corsMiddleware = require('restify-cors-middleware')
// var debug = require('debug');
const sequelize = new (require('sequelize'))('sgpp', 'root', 'root', {host: 'localhost',dialect: 'mysql'});
// const sequelize = new Sequelize('sgpp', 'root', 'root', {host: 'localhost',dialect: 'mysql'});
const cors = corsMiddleware({
	// origins: ['http://localhost:8080'],
	origins: ['*'],
	allowHeaders: ['Authorization']
	// exposeHeaders: ['API-Token-Expiry']
})

const app = restify.createServer({name: 'sgppApi'});

app.pre((req,res,next) => {
	console.log('Request URL: '+req.method+' '+req.url);
	// debug('Request URL: '+req.method+' '+req.url)
	next()
});

app.pre(cors.preflight)
app.use(cors.actual)
app.use(restify.bodyParser()); // for parsing application/json
app.use(restify.plugins.queryParser());
// app.pre(
// 	function crossOrigin(req,res,next){
// 		res.header("Access-Control-Allow-Origin", "*");
// 		res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept');
// 		res.header('Access-Control-Allow-Credentials', 'true');
// 		if(req.method === "OPTIONS") {
// 			res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// 			return;
// 		} else {
// 			return next();
// 		}
// 	}
// );
// app.use(cors())
app.get('/status',(req,res,next)=>{
	res.send('ready')
});

var routesArr = ["auth","porpose","node","cicle","stage","person","user","action"]

for(var x = 0; routesArr.length > x; x++) {
	require("./routes/" + routesArr[x])(app);
}
// require("./routes/porpose")(app);
// require("./routes/node")(app);
// require("./routes/cicle")(app);
// require("./routes/stage")(app);
// require("./routes/user")(app);
// app.pre(authLib.ensureAuthenticated);


app.listen(3000,'127.0.0.1', () => {
  	console.log('Server "%s" escuchando a la URI %s',app.name,app.url);
  	// debug('Server escuchando el puerto 3000 al server %s',app.url)
});
