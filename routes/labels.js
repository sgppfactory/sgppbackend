const model = require('../models/label');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación
const resultLib = require('../lib/result');

module.exports = function(app) {
	/**
	 * @swagger
	 * path: /porpose
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
	app.post('/labels',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.create(req.params, req.token)
			.then((result) => {
				// console.log(result)
				if(result) {
					res.statusCode = 201
					res.json({
						"id": result.dataValues.id
					,	"message":"Propuesta creada correctamente"
					,	"status":"OK"
					})
				} else {
					res.statusCode = 409
					res.json({
						"message":"Hubo un error al crear la propuesta, inténtelo nuevamente"
					,	"status":"error"
					})
				}
			}).catch((err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err),"status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /porpose
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/labels',authLib.ensureAuthenticated, function(req, res, next) {
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
				res.json({"result": err, "status":"error"})
			})
	});
}