const model = require('../models/auth');
const authJWT = require("../lib/auth"); //Librería para manejar la autenticación

// const authJWT = new auth();
// const model = new AuthModel();
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */
 
AuthRoutes = function( ){
	
	/**
	 * @swagger
	 * path: /login
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Login with username and password
	 *      notes: Returns a user based on username
	 *      responseClass: User
	 *      nickname: login
	 *      consumes: 
	 *        - text/html
	 *      parameters:
	 *        - name: username
	 *          description: Your username
	 *          paramType: query
	 *          required: true
	 *          dataType: string
	 *        - name: password
	 *          description: Your password
	 *          paramType: query
	 *          required: true
	 *          dataType: string
	 */
	this.post('/auth', function(req, res, next) {
		model
			.login(req.body)
			.then((result) => {
				if(result.length > 0) {
					//Capturo el token
					var token = authJWT.generateToken(result[0]);
					var payload = authJWT.getPayload(token)

					model
						.saveSession(token,payload,res)
						// .then((resultRedis) => {
						// 	res.statusCode = resultRedis.statusCode
						// 	res.json(resultRedis.msg)
						// })
				} else {
					res.statusCode = 401
					res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
				}
			},(err) => {
				res.statusCode = 401
				res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
			})
	});
}

/**
 * @swagger
 * path: /user
 * operations:
 *   -  httpMethod: GET
 *      summary: Obtención de datos de un usuario
 *      notes: Retorna información del usuario
 *      responseClass: Auth
 *      nickname: user
 *      consumes: 
 *        - application/json
 */
// app.get('/user', authJWT.ensureAuthenticated, function(req, res, next) {
// 	console.log('Request URL: '+req.method+' /user');
// 	redisDB
// 		.get('auth:'+req.token)
// 		.then(
// 			(result)=> {
// 				// console.log(result,JSON.parse(result))
// 				if(!result) {
// 					res.json({"msg":"No se encuentran usuarios"})
// 				}
// 				res.json(result)
// 			}
// 		, 	(err) => {
// 				res.end("No hay nada")
// 			}
// 		);
// });

//Esta acción la voy a usar como ejemplo para guardar logs de actividad de usuarios
// app.post('/loguser', authJWT.ensureAuthenticated, function(req, res, next) {
// 	console.log('Request URL: /user');
// 	// var authHeader = req.headers.authorization.split(" ")
// 	console.log(req.body,req.connection.remoteAddress)
// 	// var payload = authJWT.getPayload(req.token)
// 	redisDB
// 		.sadd(
// 			'loguser:'+req.payload.id
// 		,	JSON.stringify({
// 				ip:req.connection.remoteAddress
// 			,	"accion":req.body.accion
// 			,	time:Date.now()
// 			})
// 		)
// 		.then(
// 			(result)=> {
// 				if(!result) {
// 					res.json({"msg":"Hubo un error al insertar el log"})
// 				}
// 				res.json({"msg":"Logueo agregado"})
// 			}
// 		, 	(err) => {
// 				res.json({"msg":"Hubo un error al insertar el log"})
// 			}
// 		);
// });

// app.get('/loguser/:id', function(req, res, next) {
// 	console.log('Request URL: '+req.method+' /loguser/'+req.params.id);
// 	redisDB
// 		.smembers('loguser:'+req.params.id)
// 		.then(
// 			(result)=> {
// 				// console.log(result,JSON.parse(result))
// 				if(!result) {
// 					res.json({"msg":"No se encuentran logs de usuarios"})
// 				}
// 				res.json(result)
// 			}
// 		, 	(err) => {
// 				res.end("Hubo un error en la consulta...")
// 			}
// 		);
// });

module.export = AuthRoutes