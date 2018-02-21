const authmodel = require('../models/auth');
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
		authmodel
			.getUserBySession(req.token)
			.then((result) => {
				// console.log("noerror", result)
				if(!result) {
					res.statusCode = 403
					res.json({"result":"No existe información asociada al usuario"})
				} else {
					res.statusCode = 200
					res.json({'result': result})
				}
			},	(err) => {
					res.statusCode = 409
					res.json({"result":err})
				}
			);
	});

	app.get('/loguser/:id', function(req, res, next) {
		// console.log('Request URL: '+req.method+' /loguser/'+req.params.id);
		redisDB
			.smembers('loguser:'+req.params.id)
			.then(
				(result)=> {
					// console.log(result,JSON.parse(result))
					if(!result) {
						res.json({"msg":"No se encuentran logs de usuarios"})
					} else {
						res.json(result)
					}
				}
			, 	(err) => {
					res.end("Hubo un error en la consulta...")
				}
			);
	});
}

module.exports = UserRoute