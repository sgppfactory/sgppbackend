const authmodel = require('../models/auth')
const usermodel = require('../models/user')
const authLib = require("../lib/auth"); //Librería para manejar la autenticación
const resultLib = require('../lib/result');

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
				if(result) {
					res.statusCode = 200
					res.json({"result": result, "status": "error"})
				} else {
					res.statusCode = 403
					res.json({"result": "No existe información asociada al usuario"})
				}
			},	(err) => {
					res.statusCode = 409
					res.json({"result": resultLib.getMsgSeq(err), "status": "error"})
				}
			);
	});

	app.get('/user/log', authLib.ensureAuthenticated, function(req, res, next) {
		authmodel
			.getLogBySession(req.token)
			.then((result)=> {
				if(!result) {
					res.statusCode = 403
					res.json({"message": "No se encuentran logs de usuarios", "status": "error"})
				} else {
					res.statusCode = 200
					res.json({"message": result, "status": "OK"})
				}
			}).catch((err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
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
				if(result) {
					res.statusCode = 200
					res.json({'message': result, "status": "OK!"})
				} else {
					res.statusCode = 403
					res.json({"message": "No existe una persona asociada al usuario", "status": "error"})
				}
			},	(err) => {
					res.statusCode = 409
					res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
				}
			);
	});

	/**
	 * @swagger
	 * path: /user
	 * operations:
	 *   -  httpMethod: PUT
	 *      summary: Modificación de datos de usuario y personales
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: user
	 *      consumes: 
	 *        - application/json
	 */
	app.put('/user',authLib.ensureAuthenticated, function(req, res, next) {
		usermodel
			.update(req.params, req.token)
			.then(result => {
				if (result) {
					res.statusCode = 200
					res.json({
						'message': result.responseMsg === 'person'
							? 	'Modificación de datos personales realizada correctamente.'
							: 	'Cambio de contraseña realizada correctamente.',
						'status': 'success'
					})
				} else {
					res.statusCode = 403
					res.json({
						'message': 'Hubo un error al intentar actualizar la información de usuario, inténtelo nuevamente.',
						'status': 'error'
					})
				}
			}).catch((err) => {
				console.log(err)
				res.statusCode = 409
				res.json({'message': resultLib.getMsgSeq(err), 'status': 'error'})
			});
	});
}

module.exports = UserRoute