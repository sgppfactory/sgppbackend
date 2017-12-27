const node = require('../models/node');
const stage = require('../models/stage');
const cicle = require('../models/cicle');
const authLib = require('../lib/auth'); //Librería para manejar la autenticación

module.exports = app => {
	/**
	 * @swagger
	 * path: /structure
	 * operations:
	 *   -  httpMethod: POST
	 *      summary: Create a structure of application
	 *      notes: Returns a user based on username
	 *      responseClass: User
	 *      nickname: porpose
	 *      consumes: 
	 *        - application/json
	 *      parameters:
	 *        - name: nodes
	 *          description: Json's array of nodes
	 *          paramType: formParam
	 *          required: true
	 *          dataType: string
	 *        - name: stages
	 *          description: Json's array of stages
	 *          paramType: formParam
	 *          required: true
	 *          dataType: string
	 */
	app.post('/structure',authLib.ensureAuthenticated, function(req, res, next) {
		console.log(req.params)
	});
	 
	/**
	 * @swagger
	 * path: /structure
	 * operations:
	 *   -  httpMethod: GET
	 *      summary: Get all structures by user
	 *      notes: Return a application structure
	 *      responseClass: Structure
	 *      nickname: structure
	 *      consumes: 
	 *        - application/json
	 */
	app.get('/structure',authLib.ensureAuthenticated, function(req, res, next) {
		console.log(req.params)
	});
}