const model = require('../models/task');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación
const resultLib = require('../lib/result');

module.exports = app => {
	/**
	 * @swagger
	 * path: /task
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Creación de una tarea
	 *      responseClass: Task
	 *      nickname: task
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
	app.post('/tasks',authLib.ensureAuthenticated, (req, res, next) => {
		model
			.create(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 201
					res.json({"result": result,"message":"Tarea creada correctamente","status":"OK"})
				} else {
					res.statusCode = 409
					res.json({"msg":"Hubo un error al crear la tarea, inténtelo nuevamente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err),"status":"error"})
			})
	});
	 
	/**
	 * @swagger
	 * path: /task
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de una tarea por Id
	 *      notes: Retorna información del la tarea
	 *      responseClass: Node
	 *      nickname: node
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/tasks/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"La tarea solicitada no existe","status":"error"})
				}
			},(err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /task
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Buscador de tareas
	 *      notes: Retorna información de tareas por filtros aplicados
	 *      responseClass: Task
	 *      nickname: task
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
	app.get('/tasks',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.findAll(req.params)
			.then((result) => {
				model
					.count(req.params)
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
			},(err) => {
				res.statusCode = 409
				res.json({"result": resultLib.getMsgSeq(err), "status":"error"})
			})
	});
}