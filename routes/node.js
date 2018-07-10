const model = require('../models/node');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

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
	app.post('/node',authLib.ensureAuthenticated, (req, res, next) => {
		model
			.create(req.params, req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 201
					res.json({"id": result,"message":"Nodo creado correctamente","status":"OK"})
				} else {
					res.statusCode = 409
					res.json({"msg":"Hubo un error al crear el nodo, inténtelo nuevamente","status":"error"})
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
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de un nodo por Id de nodo
	 *      notes: Retorna información del nodo
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/node/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"El nodo solicitado no existe","status":"error"})
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
	app.get('/node/:id/stages',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.getStagesByNode(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"No existen etapas para el nodo solicitado","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /node
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
	app.get('/node',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params)
			.then((result) => {
				res.statusCode = 200
				res.json({"message":result,"status":"OK"})
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});
}