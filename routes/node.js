const model = require('../models/node');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación
const resultLib = require('../lib/result');

module.exports = app => {
	/**
	 * @swagger
	 * path: /node
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Creación de un nodo
	 *      responseClass: Node
	 *      nickname: node
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
	app.post('/nodes',authLib.ensureAuthenticated, (req, res, next) => {
		model
			.create(req.params, req.token)
			.then((result) => {
				if(result.dataValues) {
					res.statusCode = 201
					res.json({
						"id": result.dataValues.id
					, 	"message": "Nodo creado correctamente"
					, 	"status": "OK"
					})
				} else {
					res.statusCode = 409
					res.json({
						"message": "Hubo un error al crear el nodo, inténtelo nuevamente"
					, 	"status": "error"
					})
				}
			}).catch((err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status":"error"})
			})
	});
	 
	/**
	 * @swagger
	 * path: /node/:id
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de un nodo por Id de nodo
	 *      notes: Retorna información del nodo
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/nodes/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"message":"El nodo solicitado no existe","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /node/:id/stages
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de un nodo por Id de nodo
	 *      notes: Retorna información del nodo
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/nodes/:id/stages',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.getStagesByNode(req.params.id, req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"message":"No existen etapas para el nodo solicitado","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /nodes
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Buscador de nodos
	 *      notes: Retorna información de nodos por filtros aplicados
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 *      parameters:
	 *        - name: filters
	 *          description: Formato JSON de búsqueda: {'field':'{field}','value':'{value}','operator':'{operator}'}
	 *          paramType: query
	 *          required: false
	 *          dataType: string
	 *        - name: bypage
	 *          description: Cantidad de registro por página
	 *          paramType: query
	 *          required: false
	 *          dataType: integer
	 *        - name: page
	 *          description: Número de página
	 *          paramType: query
	 *          required: false
	 *          dataType: integer
	 */
	app.get('/nodes',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.search(req.params, req.token)
			.then((result) => {
				res.statusCode = 200
				res.json({"message":result,"status":"OK"})
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /node
	 * operations:
	 *   -  httpMethod: DELETE
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.del('/nodes/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.delete(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":"Nodo dada de baja correctamente","status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"message":"Nodo inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /node/:id
	 * operations:
	 *   -  httpMethod: PUT
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.put('/nodes/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.update(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":"Nodo modificado correctamente","status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"message":"Etapa inexistente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err),"status":"error"})
			})
	});
}