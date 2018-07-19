const model = require('../models/stage');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = app => {
	/**
	 * @swagger
	 * path: /stage
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Create a stage
	 *      notes: Returns a stage created
	 *      responseClass: Stage
	 *      nickname: stage
	 *      consumes: 
	 *        - application/json
	 *      parameters:
	 *        - name: name
	 *          description: Name of stage
	 *          paramType: formParam
	 *          required: true
	 *          dataType: string
	 *        - name: password
	 *          description: Your password
	 *          paramType: query
	 *          required: true
	 *          dataType: string
	 */
	app.post('/stage',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.create(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 201
					res.json({"id": result,"message":"Etapa creada correctamente","status":"OK"})
				} else {
					res.statusCode = 409
					res.json({"msg":"Hubo un error al crear la propuesta, inténtelo nuevamente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});
	 
	/**
	 * @swagger
	 * path: /stage
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/stage:id',authLib.ensureAuthenticated, function(req, res, next) {
		console.log(req.params)
		model
			.get(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"Etapa inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /stage
	 * operations:
	 *   -  httpMethod: DELETE
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.del('/stage:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.delete(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":"Etapa dada de baja correctamente","status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"Etapa inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /stage
	 * operations:
	 *   -  httpMethod: PUT
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.put('/stage:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.update(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"Etapa inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});
}