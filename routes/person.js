const model = require('../models/person');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación
const resultLib = require('../lib/result');

module.exports = app => {
	/**
	 * @swagger
	 * path: /person
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Creación de una persona con usuario si es seleccionado
	 *      responseClass: Person
	 *      nickname: person
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
	app.post('/person',authLib.ensureAuthenticated, (req, res, next) => {
		model
			.create(req.params)
			.then((result) => {
				if(result) {
					res.statusCode = 201
					res.json({
						"result": result.get('id'), 
						"message": "Persona creada correctamente",
						"status":"OK"
					})
				} else {
					res.statusCode = 409
					res.json({
						"message": "Hubo un error al crear a la persona, inténtelo nuevamente",
						"status": "error"
					})
				}
			}).catch((err) => {
				res.statusCode = 409
				res.json({"message": resultLib.getMsgSeq(err), "status": "error"})
			})
	});
	 
	/**
	 * @swagger
	 * path: /person/{id}
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de una persona por Id de persona
	 *      notes: Retorna información del nodo
	 *      responseClass: Person
	 *      nickname: person
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/person/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.get(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":result,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"La persona solicitada no existe","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /person
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención de datos de personas
	 *      notes: Búsqueda de personas
	 *      responseClass: Person
	 *      nickname: person
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/person',authLib.ensureAuthenticated, function(req, res, next) {
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
	 * path: /person
	 * operations:
	 *   -  httpMethod: DELETE
	 *      summary: Borrado lógico de una persona
	 *      notes: -
	 *      responseClass: Person
	 *      nickname: person
	 *      consumes: 
	 *        - application/json
	 */
	app.del('/person/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.delete(req.params.id)
			.then((result) => {
				if(result) {
					res.statusCode = 200
					res.json({"message":"Persona deshabilitada correctamente", "id": req.params.id ,"status":"OK"})
				} else {
					res.statusCode = 403
					res.json({"msg":"La persona solicitada no existe","status":"error"})
				}
			},(err) => {
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});

	/**
	 * @swagger
	 * path: /person
	 * operations:
	 *   -  httpMethod: PUT
	 *      summary: Borrado lógico de una persona
	 *      notes: -
	 *      responseClass: Person
	 *      nickname: person
	 *      consumes: 
	 *        - application/json
	 */
	app.put('/person/:id',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.put(req.params)
			.then((result) => {
				// if(result) {
				res.statusCode = 200
				res.json({"message":"Persona modificada correctamente", "id": req.params.id ,"status":"OK"})
				// } 
				// else {
				// 	res.statusCode = 403
				// 	res.json({"message":"La persona solicitada no existe","status":"error"})
				// }
			}).catch((err) => {
				console.log(err)
				res.statusCode = 409
				res.json({"message": err, "status":"error"})
			})
	});
}