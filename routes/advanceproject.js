const model = require('../models/advanceProject');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = app => {
	/**
	 * @swagger
	 * path: /advanceproject
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Creación de un avance de proyecto
	 *      responseClass: Advanceproject
	 *      nickname: advanceProject
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
	app.post('/advanceproject',authLib.ensureAuthenticated, (req, res, next) => {
		model
			.create(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 201
					res.json({"result": result,"message":"Avance de proyecto añadido correctamente","status":"OK"})
				} else {
					res.statusCode = 409
					res.json({"msg":"Hubo un error al crear a la persona, inténtelo nuevamente","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message":err,"status":"error"})
			})
	});
	 
	/**
	 * @swagger
	 * path: /advanceproject/{idAdvProj}
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de una avance de project por Id
	 *      notes: Retorna información del nodo
	 *      responseClass: Person
	 *      nickname: person
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/advanceproject/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"El avance de proyecto solicitado no existe","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /advanceproject
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de una avances de proyecto
	 *      notes: Retorna información del nodo
	 *      responseClass: Person
	 *      nickname: person
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
	app.get('/advanceproject',authLib.ensureAuthenticated, function(req, res, next) {
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