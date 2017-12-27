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
			.create(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 201
					res.json({"result": result,"message":"Nodo creado correctamente","status":"OK"})
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
	 * path: /node
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
}