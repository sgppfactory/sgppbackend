const model = require("./Model");
const Rol = require("./rol");
const Person = require("./person");

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
}