const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const md5 = require('crypto-js/md5'); 
const model = require("./Model");
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);
// var mysqlDB = new mysql(config.mysql_connect);
Mod = model.dbsql.define('user', {
	username: model.cte.STRING,
	password: model.cte.STRING,
	firstLogin: {type:model.cte.BOOLEAN, field: 'first_login' },
	idPerson: {type:model.cte.INTEGER, field: 'id_person' },
	idRol: {type:model.cte.INTEGER, field: 'id_rol' }
},{
	tableName: 'user'
})

module.exports = {
	login: (userParams) => {
		console.log(md5(userParams.username).toString())
		if(_.isString(userParams.username) && _.isString(userParams.password)) {
			return Mod.findOne({
				attributes: ['id', 'username']
			,	where: {
					username: userParams.username
				,	password: md5(userParams.username).toString()
				}
			})
		}

		return new Promise((resolve,reject)=>{
			reject("Parámetros no válidos");
		});
	}
,	saveSession: (token,userdata,payload,ip) => {
		// var redisDB = new redis(config.redis_connect);
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
		// var redisDB = new redis(config.redis_connect);
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



// module.exports = AuthModel