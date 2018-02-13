const model = require('../models/rol');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = app => {
	
	/**
	 * @swagger
	 * path: /rol
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Buscador de nodos
	 *      notes: Retorna información de nodos por filtros aplicados
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/rol',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.token)
			.then((result) => {
				res.statusCode = 200
				res.json({"message":result,"status":"OK"})
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});
}