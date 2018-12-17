const model = require("./Model");
const Rol = require("./rol");
const Person = require("./person");
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);
const md5 = require('crypto-js/md5'); 

RolInstance = Rol.getModel()
PersonInstance = Person.Person

const User = model.dbsql.define('user', {
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

module.exports = {
	getModel: () => {
		return User
	}
,	update: (paramsa, token) => {
		if (!paramsa || _.isEmpty(paramsa.passConfirmation)) {
			throw 'Se necesita confirmar con la contraseña actual.'
		}
		return model.dbsql.transaction((t) => {
			return redisDB
				.hget('auth:'+token, 'userdata')
				.then((userdata) => {
					userdata = JSON.parse(userdata)
					if(!userdata) {
						reject("Se venció la sesión")
					}
					var params = _.clone(paramsa)

					return UserInstance.findOne({
						attributes: ['id', 'password', 'idPerson']
					,	where: {
							id: userdata.id
						,	password: md5(params.passConfirmation).toString()
						,	active: true
						}
					}).then(userReturn => {
						if (_.isEmpty(userReturn)) {
							throw 'Contraseña incorrecta'
						}
						var user = userReturn.dataValues
						return PersonInstance.update(
							{
								email: params.email,
								tel: params.tel,
								cel: params.cel,
								location: params.location,
								dateBirth: params.date_birth
							}, 
							{where: {id: user.idPerson, active: true}},
							{transaction: t}
						).then(pUp => {
							if (!_.isEmpty(params.password)) {
								if (params.password !== params.rePassword) {
									throw 'Las contraseñas deben ser iguales'
								}
								if (user.password === md5(params.password).toString()) {
									throw 'Las contraseña no debe ser igual a la anterior'
								}

								return User.update(
									{password: md5(params.password).toString()},
									{where: {id: userdata.id, active: true}},
									{transaction: t}
								).then(uUp => {
									return uUp ? {responseMsg: 'user', id: userReturn.idPerson} : null
								})
							} else {
								return pUp ? {responseMsg: 'person', id: userReturn.idPerson} : null
							}
						})
					})
				})
		})
	}
}