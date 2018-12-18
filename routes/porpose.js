const model = require('../models/porpose');
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
	app.post('/porpose',authLib.ensureAuthenticated, function(req, res, next) {
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
	 * path: /porpose/:id
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/porpose/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id, req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"Propuesta inexistente","status":"error"})
				}
			},(err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err),"status": "error"})
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
	app.get('/porpose',authLib.ensureAuthenticated, function(req, res, next) {
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

	/**
	 * @swagger
	 * path: /porpose/:id
	 * operations:
	 *   -  httpMethod: PUT
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.put('/porpose/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.put(req.params, req.token)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message": "Propuesta modificada correctamente", "status": "OK"})
				} else {
					res.statusCode = 403
					res.json({"message":"Propuesta inexistente","status":"error"})
				}
			}, (err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err),"status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /porpose/:id
	 * operations:
	 *   -  httpMethod: PUT
	 *      summary: Obtención de datos de un usuario
	 *      notes: Retorna información del usuario
	 *      responseClass: Auth
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 */
	app.put('/porpose/:id/state',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.changeState(req.params) //req.token es necesario para controlar el permiso del usuario
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({
						"id": result.id
					,	"state": result.state
					,	"message": "Cambio de estado realizado correctamente"
					, 	"status": "OK"
					})
				} else {
					res.statusCode = 403
					res.json({"message": "Propuesta inexistente", "status": "error"})
				}
			},(err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
			})
	});
}