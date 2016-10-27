'use strict';

const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const restify = require('restify'); //framework REST
const mysql = require("./lib/mysql");
const redis = require("./lib/redis"); //Manipulador de la conexión de la BD
const auth = require("./lib/auth"); //Librería para manejar la autenticación
const app = restify.createServer();

const mysqlDB = new mysql({host: 'localhost',user: 'root',password : 'root',database : 'sgpp'});
const redisDB = new redis({"host": "localhost","port": 6379});
const authJWT = new auth();

app.use(restify.bodyParser()); // for parsing application/json

app.get('/user', authJWT.ensureAuthenticated, function(req, res, next) {
	console.log('Request URL: '+req.method+' /user');
	redisDB
		.get('auth:'+req.token)
		.then(
			(result)=> {
				// console.log(result,JSON.parse(result))
				if(!result) {
					res.json({"msg":"No se encuentran usuarios"})
				}
				res.json(result)
			}
		, 	(err) => {
				res.end("No hay nada")
			}
		);
});

//Esta acción la voy a usar como ejemplo para guardar logs de actividad de usuarios
app.post('/loguser', authJWT.ensureAuthenticated, function(req, res, next) {
	console.log('Request URL: /user');
	// var authHeader = req.headers.authorization.split(" ")
	console.log(req.body,req.connection.remoteAddress)
	// var payload = authJWT.getPayload(req.token)
	redisDB
		.sadd(
			'loguser:'+req.payload.id
		,	JSON.stringify({
				ip:req.connection.remoteAddress
			,	"accion":req.body.accion
			,	time:Date.now()
			})
		)
		.then(
			(result)=> {
				if(!result) {
					res.json({"msg":"Hubo un error al insertar el log"})
				}
				res.json({"msg":"Logueo agregado"})
			}
		, 	(err) => {
				res.json({"msg":"Hubo un error al insertar el log"})
			}
		);
});

app.post('/auth', function(req, res, next) {
	mysqlDB
		.login(req.body)
		.then((result) => {
			if(result.length > 0) {
				//Capturo el token
				var token = authJWT.generateToken(result[0]);
				// Guardo en Redis la sesión
				// TODO: implementar el log de usuario
				// console.log(JSON.stringify(authJWT.getPayload(token)))
				var payload = authJWT.getPayload(token)
				redisDB
					.set('auth:'+token, JSON.stringify(payload))
					.then(
						() => {
							redisDB
								.sadd(
									'loguser:'+payload.id
								,	JSON.stringify({
										ip:req.connection.remoteAddress
									,	"accion":"Ingreso"
									,	time:Date.now()
									})
								)
								.then(
									(result)=> {
										console.log("LogUser ingreso")
									}
								, 	(err) => {
										console.log("error al registrar al LogUser ingreso")
									}
								);

							res.json({"jwt": token, "msg": "Succesfully"});	
						}
					,	(err) => {
							res.statusCode = 401
							res.json({"msg":"Error al manipular la sesión, vuelva a loguearse"})
						}
					);	
			} else {
				res.statusCode = 401
				res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
			}
		},(err) => {
			res.statusCode = 401
			res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
		})
});

app.get('/loguser/:id', function(req, res, next) {
	console.log('Request URL: '+req.method+' /loguser/'+req.params.id);
	redisDB
		.smembers('loguser:'+req.params.id)
		.then(
			(result)=> {
				// console.log(result,JSON.parse(result))
				if(!result) {
					res.json({"msg":"No se encuentran logs de usuarios"})
				}
				res.json(result)
			}
		, 	(err) => {
				res.end("Hubo un error en la consulta...")
			}
		);
});

app.listen(3000, () => {
  	console.log('Server escuchando el puerto 3000 al server %s',app.url);
});




// RedisServer.prototype.redisClientPrueba = function () {
// 	var self = this;
// 	console.log("redisClient");

//     // Implementar hashes
// 	try {
// 		// self.redis = redis.createClient(self.redisConf);
// 	    self.redis.on('connect',function() {
// 			console.log("Redis to "+redisConf.host);
// 		    for(var x=0; x < cervezasNombre.length; x++) {
// 				self.redis.set('cervezas:'+x,JSON.stringify(cervezasNombre[x]),(err,res) => {
// 					console.log("cerveza loaded: "+res)
// 				});

// 			    self.redis.set('cervezas:'+x+':likes','0',(err,res) => {
// 					console.log("cerveza like param loaded: "+res)
// 				})
// 			}
// 	    })

// 	} catch(e) {
// 		console.log(e)
// 	}
// }

// RedisServer.prototype.redisClientHash = function () {
// 	var self = this;
// 	console.log("hash data examples load data");

// 	try {
// 		//conecto a redis
// 		// self.redis = redis.createClient(self.redisConf);
// 	    self.redis.on('connect',function() {
// 			// console.log("Redis to "+redisConf.host);
// 		    for(var x=0; x < cervezasNombre.length; x++) {
// 				self.redis.hset('hcervezas:'+x,'nombre',cervezasNombre[x].nombre,(err,res) => {
// 					console.log("nombre hash data in cerveza loaded: "+res)
// 				});

// 				self.redis.hset('hcervezas:'+x,'pais',cervezasNombre[x].pais,(err,res) => {
// 					console.log("pais hash data in cerveza : "+res)
// 				});

// 			    self.redis.hset('hcervezas:'+x,'likes','0',(err,res) => {
// 					console.log("cerveza like param loaded by hash  example: "+res)
// 				})
// 			}
// 	    })

// 	} catch(e) {
// 		console.log(e)
// 	}
// }
//Ejecuto app para cargar los datos
// new RedisServer()

// const server = http.createServer();

// server.on('request',(req,res)=>{
// 	var urlSplit = req.url.split('/')
// 	if(req.method === 'GET') {
// 		new Request(res,req,urlSplit)
// 	} else {
// 		res.end("Only response GET petitions")
// 	}
// })

// function Request(res,req,urlSplit) {
// 	console.log("init request")

// 	var redisServer = redis.createClient(redisConf);
// 	var verb = urlSplit[1]
// 	var key = parseInt(urlSplit[2])
	
// 	if(verb === 'getData') {
// 		this.getOne(key,req,res,redisServer)
// 	} else if(verb === 'likeUp') {
// 		this.likeUp(key,req,res,redisServer)
// 	} else{
// 		res.end('error en request')
// 	}
// }

// Request.prototype.getOne = (key,res,redisServer) => {
// 	var self = this

// 	redisServer.get('cervezas:'+key,(error,val) => {
// 		if(error) res.end(error)

// 		res.end(val)
// 	})
// }

// Request.prototype.likeUp = (key,res,redisServer) => {
// 	var self = this

// 	redisServer.incr('cervezas:'+key+':likes',(error,val) => {
// 		if(error) res.end(error)

// 		res.end(val)
// 	})
// }

// Request.prototype.getOneByHash = (key) => {
// 	req.on('end',() => {
// 		redisServer.incr('cervezas:'+key,(error,val) => {
// 			if(error) res.end(error)

// 			res.end(val)
// 		})
// 	})	
// }

// server.listen(8000);
