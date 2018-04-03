model = require('./Model');

const Stage =  model.dbsql.define('stage',{
		id: { type: model.cte.INTEGER, primaryKey: true, autoIncrement: true }
	,	name : {
			type: model.cte.STRING
		,	allowNull : false
		, 	validate: {
				notNull: {
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	isProject : {
			type: model.cte.BOOLEAN
		, 	field: 'is_project'
		,	allowNull : true
		,	defaultValue : false
		, 	validate: {
				isBoolean: {
					msg: "Debe ser un campo booleano"
				}
			}
		}
	,	date_init : {
			type: model.cte.DATE
		, 	allowNull: false
		, 	validate: {
				notNull: {
					msg: "La fecha de comienzo es requerida"
				}
			,	isDate: {
					msg: "El formato de la fecha de inicio debe ser DD-MM-YYYY o DD/MM/YYYY"
				}
			}
		}
	,	order : {
			type: model.cte.INTEGER
		, 	allowNull: true
		, 	validate: {
				isInt: {
					msg: "El orden debe ser un entero"
				}
			}
		}
	,	active : {
			type: model.cte.BOOLEAN
		,	defaultValue : true
		}
	},{
		tableName: 'stage'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Stage
	}
,	create :(params) => {
		try {
			return Stage.create(params)
		} catch(err) {
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
	}
,	get: (id) => {
		return Stage.findById(id)
	}
,	search: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Stage.findAll()
	}
}

