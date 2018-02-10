const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const md5 = require('crypto-js/md5'); 
const model = require("./Model");
const Rol = require("./rol");
const Person = require("./person");
const Action = require("./action");
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);
// var mysqlDB = new mysql(config.mysql_connect);
RolInstance = Rol.getModel()
ActionInstance = Action.getModel()
PersonInstance = Person.getModel()

Mod = model.dbsql.define('user', {
	username: model.cte.STRING,
	password: model.cte.STRING,
	firstLogin: {type:model.cte.BOOLEAN, field: 'first_login' },
	idPerson: {
		type:model.cte.INTEGER
	, 	field: 'id_person' 
	,	references: {
			model: PersonInstance
		,	key: 'id'
		}
	}
,	idRol: {
		type:model.cte.INTEGER
	, 	field: 'id_rol'
	,	references: {
			model: RolInstance
		,	key: 'id'
		} 
	}
},{
	tableName: 'user'
,	timestamps: false
,	updatedAt : false
,	createdAt : 'create_time'
})

Auditory = model.dbsql.define('user_auditory', {
	ip: model.cte.STRING,
	dateHour: model.cte.DATE,
	idUser: {
		type:model.cte.INTEGER
	, 	field: 'id_user' 
	,	references: {
			model: Mod
		,	key: 'id'
		}
	}
},{
	tableName: 'user_auditory'
,	timestamps: false
,	updatedAt : false
,	createdAt : false
})

ActionRol = model.dbsql.define('action_rol', {
	idAction: {
		type:model.cte.INTEGER
	, 	field: 'id_action' 
	// ,	references: {
	// 		model: ActionInstance
	// 	,	key: 'id'
	// 	}
	},
	idRol: {
		type:model.cte.INTEGER
	, 	field: 'id_rol'
	// ,	references: {
	// 		model: RolInstance
	// 	,	key: 'id'
	// 	} 
	}
},{
	tableName: 'action_rol'
,	timestamps: false
,	updatedAt : false
,	createdAt : false
})


// User.belongsTo(RolInstance, {foreignKey: 'fk_rol_user'});

// RolInstance.hasMany(ActionRol, {sourceKey: 'id_rol', foreignKey: 'id_rol', as: 'actr'})
// Mod.hasMany(ActionRol, {foreignKey: 'id_rol', sourceKey: 'id_rol', as: 'actionsRol'})
RolInstance.hasOne(Mod, {foreignKey: 'id_rol', sourceKey: 'id'});
// Mod.belongsTo(RolInstance, {foreignKey: 'id_rol'})
RolInstance.belongsToMany(ActionInstance, { through: {model: ActionRol}, foreignKey: 'id_rol'});
ActionInstance.belongsToMany(RolInstance, { through: {model: ActionRol}, foreignKey: 'id_action'});
// RolInstance.hasMany(ActionRol, {foreignKey: 'fk_action_action_rol', as: 'actionsRol'})
// ActionRol.hasOne(ActionInstance, {foreignKey: 'id', sourceKey: 'id_action'})
// ActionRol.belongsTo(ActionInstance, {sourceKey: 'id_action', foreignKey: 'id', as: 'Actions'})

module.exports = {
	login: (userParams) => {
		// console.log(md5(userParams.username).toString())
		if(_.isString(userParams.username) && _.isString(userParams.password)) {
			return Mod.findOne({
				attributes: ['id', 'username', 'avatar']
			,	where: {
					username: userParams.username
				,	password: md5(userParams.password).toString()
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
			ActionInstance.findAll({
				attributes: ['id','name','url','label','menu','level']
			, 	include: [{
					model: RolInstance
				, 	attributes:['id']
				, 	include:[{
						model: Mod
					,	where: {id : userdata.id}
					,	attributes: ['id']
					}]
				}]
			}).then((actionToSave) => {
				actions = _.map(
					actionToSave
				,	function(acti){
						delete acti.dataValues.rols
						return acti.dataValues
					}
				)

				redisDB.multi()
					.hset('auth:'+token, "payload", JSON.stringify(payload))
					.expire('auth:'+token, 1000000)
					.hset('auth:'+token, "userdata", JSON.stringify(userdata))
					.hset('auth:'+token, "actions", JSON.stringify(actions))
					.sadd(
						'loguser:' + userdata.id
					,	JSON.stringify({
							ip: ip
						,	"accion": "Ingreso"
						,	time: Date.now()
						})
					)
					.exec((err,result)=>{
						// No voy a tomar mucho en cuenta si se crea la auditoría o no...
						Auditory.create({
							ip: ip
						,	idUser: userdata.id
						});

						if(err) return reject(err)
						resolve(result)
					})
				},(error) => {
					reject(error)
					// console.log(error)
				})
			})
	}
,	getUserBySession: (token) => {
		return new Promise((resolve,reject)=>{
			redisDB
				.hget('auth:'+token, 'userdata')
				.then((result,err) => {
					if(err) return reject(err)
					resolve(result)
				});
		});
	}
,	getModel: () => {
		return Mod
	}
}
