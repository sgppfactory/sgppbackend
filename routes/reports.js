const model = require('../models/reports');
const resultLib = require('../lib/result');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = app => {
	
	/**
	 * @swagger
	 * path: /reports
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Buscador de reportes
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
	app.get('/reports',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.findAll(req.params, req.token)
			.then((result) => {
				model
					.count(req.params, req.token)
					.then((resultCount) => {
						if(result) {
							res.statusCode = 200
							res.json({
								"result": result,
								"total": resultCount,
								"pages": (req.params.bypage 
										? 	parseInt(resultCount / req.params.bypage) + 1
										: 	parseInt(resultCount / 15) + 1 ),
								"status": "OK"
							})
						} else {
							res.statusCode = 403
							res.json({"result":[],"status":"error"})
						}
					})
			}).catch(err => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /reports/try
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Realiza una simulación de los reportes para previsualizar en gráficos
	 *      notes: Retorna información de nodos por filtros aplicados
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/reports/try', authLib.ensureAuthenticated, function(req, res, next) {
		model
			.generate(req.params, req.token)
			.then(result => {
				res.statusCode = 200
				res.json({'message': result, 'status': 'OK'})
			}).catch(err => {
				res.statusCode = 409
				res.json({'message': resultLib.getMsgSeq(err), 'status': 'error'})
			})
	});

	/**
	 * @swagger
	 * path: /reports/:id
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Buscador de reportes
	 *      notes: Retorna información de nodos por filtros aplicados
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/reports/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id, req.token)
			.then((result) => {
				res.statusCode = 200
				res.json({"message":result,"status":"OK"})
			}).catch(err => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /reports
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Buscador de reportes
	 *      notes: Retorna información de nodos por filtros aplicados
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.post('/reports', authLib.ensureAuthenticated, function(req, res, next) {
		model
			.create(req.params, req.token)
			.then((result) => {
				if (result) {
					res.statusCode = 201
					res.json({
						"id": result, 
						"message": "Reporte guardado correctamente",
						"status": "OK"
					})
				} else {
					res.statusCode = 403
					res.json({
						"message": "Hubo un error al crear el reporte, inténtelo nuevamente más tarde", 
						"status":"error"
					})	
				}
			}).catch(err => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
			})
	});
}