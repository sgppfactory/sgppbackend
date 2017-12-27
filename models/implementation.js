
model = require('./Model');

const Implementation =  model.dbsql.define('Implementation',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	logo : {
			type: model.cte.STRING
		, 	allowNull: true
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
	,	description : {
			type: model.cte.TEXT
		, 	allowNull: true
		}
	,	active : {
			type: model.cte.BOOLEAN
		, 	allowNull: true
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "Debe ser un valor booleano"
				}
			}
		}
	},{
		tableName: 'implementation'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Implementation
	}
,	create :(params) => {
		try {
			return Implementation.create(params)
		}catch(err) {
			console.log(err)
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
	}
,	get: id => {
		return Implementation.findById(id)
	}
,	findBy: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Implementation.findAll()
	}
}
