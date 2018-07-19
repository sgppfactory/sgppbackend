const model = require('../models/action');
const authLib = require("../lib/auth"); //Librería para manejar la autenticación

UserRoute = function(app){

	/**
	 * @swagger
	 * path: /menu
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Obtención del menú asociado al usuario
	 *      notes: Retorna información del menu la cual posee permiso el usuario
	 *      responseClass: Menu
	 *      nickname: menu
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/menu',authLib.ensureAuthenticated, function(req, res, next) {
		model
			.findMenu(req.token)
			.then((result) => {
				if(!result) {
					res.statusCode = 403
					res.json({"msg":"No posee acciones habilitadas"})
				} else {
					res.statusCode = 200
					res.json({"result": result, "msg":"finded!"})
				}
			}
			, 	(err) => {
					res.statusCode = 403
					res.end("No hay nada")
				}
			);
	});
}

module.exports = UserRoute