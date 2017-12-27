model = require('./Model');

const Person =  model.dbsql.define('person',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	name : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				notEmpty:{
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	lastname : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				notEmpty:{
					msg: "El apellido es requerido"
				}
			,	len: {
					msg: "El apellido tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	email : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				isEmail:{
					msg: "El campo email tiene formato incorrecto"
				}
			}
		}
	,	tel : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				isInt: {
					msg: "El teléfono fijo debe poseer 10 dígitos"
				,	args : { min: 1000000000, max: 9999999999 }
				}
			}
		}
	,	cel : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				isInt: {
					msg: "El número de celular debe poseer máximo 12 dígitos"
				,	args : { min: 1000000000, max: 999999999999 }
				}
			}
		}
	,	location : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				isJSON:{
					msg: "El formato de la locación es incorrecto, debe ser en coordenadas."
				}
			}
		}
	,	active : {
			type: model.cte.BOOLEAN
		, 	allowNull: false
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "El campo activo debe ser 'true' o 'false'"
				}
			}
		}
	},{
		tableName: 'person'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Person
	}
,	create : params => {
		try {
			return Person.create(params)
		}catch(err) {
			console.log(err)
		}
	}
,	get: id => {
		return Person.findById(id)
	}
,	findAll: params => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Person.findAll()
	}
}