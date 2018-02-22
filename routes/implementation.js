const model = require('../models/implementation');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = function(app) {
	/**
	 * @swagger
	 * path: /implementation
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de la implementación
	 *      notes: Retorna información del usuario
	 *      responseClass: Implementation
	 *      nickname: implementation
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/implementation',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.getByUser(req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"Implementation inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /implementation/structure
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de estructuras de acuerdo a la implementación del usuario
	 *      notes: Retorna información de los nodos estructurales
	 *      responseClass: Implementation
	 *      nickname: implementation
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/implementation/structure',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.structures(req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"Implementation inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});
}