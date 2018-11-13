'use strict';
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */
const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const restify = require('restify'); //framework REST
const fs = require('fs'); //filesystem
const corsMiddleware = require('restify-cors-middleware')
// var debug = require('debug');
// const sequelize = new (require('sequelize'))('sgpp', 'root', 'root', {host: 'localhost',dialect: 'mysql'});
// const sequelize = new Sequelize('sgpp', 'root', 'root', {host: 'localhost',dialect: 'mysql'});
const cors = corsMiddleware({
	origins: ['*'],
	allowHeaders: ['Authorization']
})

const app = restify.createServer({
	name: 'sgppApi',
	// certificate: fs.readFileSync('/var/certs/ssl/cert.pem'),
	// key: fs.readFileSync('/var/certs/ssl/privkey.pem')
});

app.pre((req,res,next) => {
	console.log('Request URL: '+req.method+' '+req.url);
	next()
});

app.pre(cors.preflight)
app.use(cors.actual)
app.use(restify.bodyParser()); // for parsing application/json
app.use(restify.plugins.queryParser());

app.get('/status',(req,res,next)=>{
	res.send('ready')
});

var routesArr = ["auth","porpose","node","cicle","stage","person","user","action","implementation","rol","reports","task","labels"]

for(var x = 0; routesArr.length > x; x++) {
	require("./routes/" + routesArr[x])(app);
}

app.listen(3000, '0.0.0.0', () => {
  	console.log('Server "%s" escuchando a la URI %s',app.name,app.url);
  	// debug('Server escuchando el puerto 3000 al server %s',app.url)
});
