const model = require('../models/implementation');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación
const resultLib = require('../lib/result');

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
					res.json({"message":"Implementación inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err),"status": "error"})
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
	app.get('/implementation/structure', authLib.ensureAuthenticated, function(req, res, next) {
		model
			.structures(req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"message":"Implementación inexistente", "status": "error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
			})
	});

	/**
	 * @swagger
	 * path: /implementation
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Crear toda la estructura de implementación
	 *      notes: Se le pasa información de los nodos, stages y la apliación a crear
	 *      responseClass: Implementation
	 *      nickname: implementation
	 *      consumes: 
	 *        - application/json
	 */
	app.post('/implementation', authLib.ensureAuthenticated, function(req, res, next) {
		model
			.create(req.params, req.token)
			.then(result => {
				if(result) {
					res.statusCode = 201
					res.json({"message": "Estructura creada correctamente", "status": "OK"})
				} else {
					res.statusCode = 403
					res.json({"message": "Error al crear la configuración", "status": "error"})
				}
			}).catch(err => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
			})
	});

	/**
	 * @swagger
	 * path: /structure
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de las configuraciones de estructuras
	 *      notes: Retorna estructuras de acuerdo a lo buscado
	 *      responseClass: Implementation
	 *      nickname: implementation
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/structure', authLib.ensureAuthenticated, function(req, res, next) {
		model
			.searchStructures(req.params, req.token)
			.then((result) => {
				res.statusCode = 200
				res.json({"message": result, "status": "OK"})
			}).catch((err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status":"error"})
			})
	});
}