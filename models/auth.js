const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const md5 = require('crypto-js/md5'); 
const model = require("./Model");
const Rol = require("./rol");
const Person = require("./person");
const User = require("./user");
const Action = require("./action");
const Impl = require("./implementation");
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);
// var mysqlDB = new mysql(config.mysql_connect);
RolInstance = Rol.getModel()
ActionInstance = Action.getModel()
UserInstance = User.getModel()
// PersonInstance = Person.getModel()
// PersonInstance = Person.Person

const Auditory = model.dbsql.define('user_auditory', {
	ip: model.cte.STRING,
	dateHour: {
		type:model.cte.DATE
	, 	field: 'date_hour'
	},
	idUser: {
		type:model.cte.INTEGER
	, 	field: 'id_user' 
	,	references: {
			model: UserInstance
		,	key: 'id'
		}
	}
},{
	tableName: 'user_auditory'
,	timestamps: false
,	updatedAt : false
,	createdAt : false
})

const ActionRol = model.dbsql.define('action_rol', {
	idAction: {
		type:model.cte.INTEGER
	, 	field: 'id_action'
	},
	idRol: {
		type:model.cte.INTEGER
	, 	field: 'id_rol'
	}
},{
	tableName: 'action_rol'
,	timestamps: false
,	updatedAt : false
,	createdAt : false
})

// RolInstance.hasMany(ActionRol, {sourceKey: 'id_rol', foreignKey: 'id_rol', as: 'actr'})
// User.hasMany(ActionRol, {foreignKey: 'id_rol', sourceKey: 'id_rol', as: 'actionsRol'})
RolInstance.hasOne(UserInstance, {foreignKey: 'id_rol', sourceKey: 'id'});
// User.belongsTo(RolInstance, {foreignKey: 'id_rol'})
RolInstance.belongsToMany(ActionInstance, { through: {model: ActionRol}, foreignKey: 'id_rol'});
ActionInstance.belongsToMany(RolInstance, { through: {model: ActionRol}, foreignKey: 'id_action'});
// RolInstance.hasMany(ActionRol, {foreignKey: 'fk_action_action_rol', as: 'actionsRol'})
// ActionRol.hasOne(ActionInstance, {foreignKey: 'id', sourceKey: 'id_action'})
// ActionRol.belongsTo(ActionInstance, {sourceKey: 'id_action', foreignKey: 'id', as: 'Actions'})

module.exports = {
	login: (userParams) => {
		// console.log(md5(userParams.username).toString())
		if(_.isString(userParams.username) && _.isString(userParams.password)) {
			return UserInstance.findOne({
				attributes: ['id', 'username', 'avatar', 'idPerson']
			,	where: {
					username: userParams.username
				,	password: md5(userParams.password).toString()
				,	active: true
				}
			})
		}

		return new Promise((resolve,reject)=>{
			reject("Parámetros no válidos");
		});
	}
,	saveSession: (token, userdata, payload, ip) => {
		// var redisDB = new redis(config.redis_connect);
		return new Promise((resolve,reject)=>{
			ActionInstance.findAll({
				attributes: ['id','name','url','label','menu','level']
			, 	include: [{
					model: RolInstance
				, 	attributes:['id','idImplementation']
				, 	include:[{
						model: UserInstance
					,	where: {id : userdata.id}
					,	attributes: ['id']
					}]
				}]
			}).then((actionToSave) => {
				if(!_.isUndefined(actionToSave[0]) && !_.isEmpty(actionToSave[0].dataValues.rols)) {
					rol = actionToSave[0].dataValues.rols[0].dataValues
				} else {
					reject("El usuario no posee permiso")
				}

				Impl.get(rol.idImplementation)
					.then((implementation) => {
						if(_.isEmpty(implementation.dataValues)) {
							reject("Implementación deshabilitada")
						}

						actions = _.map(
							actionToSave
						,	function(acti) {
								delete acti.dataValues.rols
								return acti.dataValues
							}
						)

						redisDB.multi()
							.hset('auth:'+token, "payload", JSON.stringify(payload))
							.expire('auth:'+token, 1000000)
							.hset('auth:'+token, "userdata", JSON.stringify(userdata))
							.hset('auth:'+token, "implementation", JSON.stringify(implementation))
							.hset('auth:'+token, "actions", JSON.stringify(actions))
							.sadd(  //Esto es medio al pedo
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
					},(err)=> {
						reject(err)
					})
				},(error) => {
					reject(error)
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
,	getLogBySession: (token) => {
		return new Promise((resolve,reject)=>{
			redisDB
				.hget('auth:'+token, 'userdata')
				.then((result) => {
					result = JSON.parse(result)
					if(!result) {
						reject("Se venció la sesión")
					}

					Auditory
						.findAll({where: {idUser: result.id}, limit: 5, order: [['date_hour','DESC']]})
						.then(resolve).catch(reject)
					// return redisDB.smembers('loguser:'+result.id)
					// 			.then()
				})
		})
	}
,	getPersonBySession: (token) => {
		return new Promise((resolve,reject)=>{
			redisDB
				.hget('auth:'+token, 'userdata')
				.then((result) => {
					result = JSON.parse(result)
					if(!result) {
						reject("Se venció la sesión")
					}

					Person.getModel()
						.findOne({
							attributes: ['id', 'name', 'lastname', 'email', 'tel', 'cel', 'location', 'dateBirth'], 
							where: { id: result.idPerson, active: true }
						}).then(resolve).catch(reject)

							// {where: {idUser: result.id}, limit: 5, order: [['date_hour','DESC']]})
					// return redisDB.smembers('loguser:'+result.id)
					// 			.then()
				})
		})
	}
}
