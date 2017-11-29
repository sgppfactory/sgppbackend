const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const config = require("../lib/config"); //Config
const mysql = require("../lib/mysql");
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
// var mysqlDB = new mysql(config.mysql_connect);
// var redisDB = new redis(config.redis_connect);

AuthModel = {
	login: (userParams) => {
		if(_.isString(userParams.username) && _.isString(userParams.password)) {
			var mysqlDB = new mysql(config.mysql_connect);
			return mysqlDB.request(
				'SELECT id,username FROM user WHERE username = "' 
				+ 	userParams.username 
				+ 	'" AND password = sha1(' 
				+ 	userParams.password + ')'
				//  AND active = 1
			)
		}

		return new Promise((resolve,reject)=>{
			reject("Parámetros no válidos");
		});
	}
,	saveSession: (token,userdata,payload,ip) => {
		var redisDB = new redis(config.redis_connect);
		return new Promise((resolve,reject)=>{
			redisDB.multi()
				.hset('auth:'+token, "payload", JSON.stringify(payload))
				.expire('auth:'+token, 1000000)
				.hset('auth:'+token, "userdata", JSON.stringify(userdata))
				.sadd(
					'loguser:' + userdata.id
				,	JSON.stringify({
						ip: ip
					,	"accion": "Ingreso"
					,	time: Date.now()
					})
				)
				.exec((err,result)=>{
					if(err) return reject(err)
					resolve(result)
				})
			})
	}
,	checkSession: function(token) {
		var redisDB = new redis(config.redis_connect);
		return new Promise((resolve,reject)=>{
			redisDB
				.hgetall('auth:'+token)
				.then((err,result) => {
					console.log(result)
					if(err) return reject(err)
					resolve(result)
				});
		});
	}
}



module.exports = AuthModel