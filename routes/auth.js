const model = require('../models/auth');
const authLib = require("../lib/auth"); //Librería para manejar la autenticación

/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */
 
AuthRoutes = function(app){
	/**
	 * @swagger
	 * path: /login
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Login with username and password
	 *      notes: Returns a user based on username
	 *      responseClass: User
	 *      nickname: login
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
	app.post('/auth', function(req, res, next) {
		model
			.login(req.body)
			.then((result) => {
				if(result.length > 0) {
					//Capturo el token
					var token = authLib.generateToken(JSON.stringify(result[0]));
					var payload = authLib.getPayload(token)

					model
						.saveSession(token,result[0],payload,req.connection.remoteAddress)
						.then(
							(resultRedis) => {
								res.json({"jwt": token, "msg": "Succesfully"});
							}
						,	(err) => {
								res.statusCode = 401
								res.json({"msg":"Error al manipular la sesión, vuelva a loguearse"})
							}
						)
				} else {
					res.statusCode = 401
					res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
				}
			},(err) => {

				res.statusCode = 401
				res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
			})
	});
}

module.exports = AuthRoutes