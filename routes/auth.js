const authmodel = require('../models/auth');
const authLib = require("../lib/auth"); //Librería para manejar la autenticación
/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */
 
module.exports = function(app){
	/**
	 * @swagger
	 * path: /auth
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Login with username and password
	 *      notes: Returns a user based on username
	 *      responseClass: User
	 *      nickname: auth
	 *      consumes: 
	 *        - text/html
	 *      parameters:
	 *        - name: username
	 *          description: Your username
	 *          paramType: formParam
	 *          required: true
	 *          dataType: string
	 *        - name: password
	 *          description: Your password
	 *          paramType: formParam
	 *          required: true
	 *          dataType: string
	 */
	app.post('/auth', function(req, res, next) {
		authmodel
			.login(req.body)
			.then(result => {
				if(result) {
					//Capturo el token
					var token = authLib.generateToken(JSON.stringify(result.dataValues));
					var payload = authLib.getPayload(token)
					
					authmodel
						.saveSession(token, result.dataValues, payload, req.connection.remoteAddress)
						.then((resultRedis) => {
							res.json({"jwt": token, "msg": "Succesfully"});
						}).catch((err) => {
							res.statusCode = 401
							res.json({"msg": "Error al manipular la sesión, vuelva a loguearse", "status": "error"})
						})
				} else {
					res.statusCode = 401
					res.json({"msg": "Nombre de usuario o contraseña incorrecto", "status": "error"})
				}
			}).catch(err => {
				res.statusCode = 401
				res.json({"msg": err, "status": "error"})
			})
	});
}