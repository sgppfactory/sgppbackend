const config = require("../lib/config"); //Config
const mysql = require("../lib/mysql");
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const mysqlDB = new mysql(config.mysql_connect);
const redisDB = new redis(config.redis_connect);

// const Auth = new mongoose.Schema({
//     task: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     status: {
//         enum: ['pending', 'complete', 'overdue']
//     },
// }, { minimize: false });


AuthModel = {
	login: function(userParams) {
		// var self = this 
		// console.log(JSON.parse(userParams))
		userParams = JSON.parse(userParams)
		return new Promise(function(resolve, reject){
			if(_.isString(userParams.username) && _.isString(userParams.password)) {
				mysqlDB.request(
					'SELECT * FROM usuarios WHERE username = "' 
					+ 	userParams.username 
					+ 	'" AND password = md5(' 
					+ 	userParams.password + ')'
				)
			}
			else {
				reject("Parámetros no válidos");
			} 

	    });
	}
,	saveSession: function(token,payload,res) {
		redisDB
			.set('auth:'+token, JSON.stringify(payload))
			.then(() => {
					redisDB
						.sadd(
							'loguser:' + payload.id
						,	JSON.stringify({
								ip: req.connection.remoteAddress
							,	"accion": "Ingreso"
							,	time: Date.now()
							})
						)
						.then(
							(result)=> {
								console.log("LogUser ingreso")
							}
						, 	(err) => {
								console.log("error al registrar al LogUser ingreso")
							}
						);

					res.json({"jwt": token, "msg": "Succesfully"});	
				}
			,	(err) => {
					res.statusCode = 401
					res.json({"msg":"Error al manipular la sesión, vuelva a loguearse"})
				}
			);
	}
}



// const Todo = mongoose.model('Todo', TodoSchema)
module.exports = AuthModel