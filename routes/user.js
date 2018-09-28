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

	app.get('/user/log', authLib.ensureAuthenticated, function(req, res, next) {
		authmodel
			.getLogBySession(req.token)
			.then((result)=> {
				if(!result) {
					res.statusCode = 403
					res.json({"message":"No se encuentran logs de usuarios", "status": "error"})
				} else {
					res.statusCode = 200
					res.json({"message":result, "status": "OK"})
				}
			}).catch((err) => {
				res.statusCode = 409
				res.json({"message":err, "status": "error"})
			});
	});

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
	app.get('/user/person',authLib.ensureAuthenticated, function(req, res, next) {
		authmodel
			.getPersonBySession(req.token)
			.then((result) => {
				if(!result) {
					res.statusCode = 403
					res.json({"message":"No existe una persona asociada al usuario", "status": "error"})
				} else {
					res.statusCode = 200
					res.json({'message': result, "status": "OK!"})
				}
			},	(err) => {
					res.statusCode = 409
					res.json({"message":err, "status": "error"})
				}
			);
	});
}

module.exports = UserRoute