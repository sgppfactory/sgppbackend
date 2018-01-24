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
			.getUserBySession(req.token)
			.then((result) => {
				console.log("noerror", result)
				if(!result) {
					res.statusCode = 403
					res.json({"result":"No existe información asociada al usuario"})
				}
				res.statusCode = 200
				res.json({'result': result})
			},	(err) => {
					res.statusCode = 409
					res.json({"result":err})
				}
			);
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
}

module.exports = UserRoute