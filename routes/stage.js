const model = require('../models/stage');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = app => {
	/**
	 * @swagger
	 * path: /stage
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Login with username and password
	 *      notes: Returns a user based on username
	 *      responseClass: User
	 *      nickname: porpose
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
	app.get('/stage',authLib.ensureAuthenticated, function(req, res, next) {
		console.log(req.params)
		model
			.get(req.params)
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