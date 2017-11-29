const model = require('../models/porpose');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

PorposeRoute = function(app){
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
			.create(req.body)
			.then((result) => {
				console.log(result)
				if(result == true) {
					res.statusCode = 201
					res.json({"msg":"Propuesta creada correctamente"})
				} else if(_.isArray(result)){
					res.statusCode = 401
					res.json(result)
				}
			},(err) => {
				res.statusCode = 401
				res.json({"msg":"Nombre de usuario o contraseña incorrecto"})
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

		
	});
}

module.exports = PorposeRoute