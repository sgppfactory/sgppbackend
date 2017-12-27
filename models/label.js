
model = require('./Model');

const Label =  model.dbsql.define('label',{
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
	,	colour : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				len: {
					msg: "El nombre tiene un límite máximo de 45 caracteres"
				,	args : [0,45]
				}
			}
		}
	},{
		tableName: 'label'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Label
	}
,	create :(params) => {
		try {
			return Label.create(params)
		}catch(err) {
			console.log(err)
		}
	}
,	get: (id) => {
		return Label.findOne(id)
	}
,	findAll: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Label.findAll()
	}
}
