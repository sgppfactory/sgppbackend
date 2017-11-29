const model = require('../models/auth');
// const modelUser = require('../models/user');
const authLib = require("../lib/auth"); //Librería para manejar la autenticación

UserRoute = function(app){

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
	app.get('/user',authLib.ensureAuthenticated, function(req, res, next) {
		console.log('Request URL: '+req.method+' /user');
		model
			.checkSession(req.token)
			.then((result) => {
				if(!result) {
					res.statusCode = 403
					res.json({"msg":"No se encuentran usuarios"})
				}
				res.statusCode = 200
				res.json(result)
			}
			, 	(err) => {
					res.statusCode = 403
					res.end("No hay nada")
				}
			);
	});

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

}

module.exports = UserRoute