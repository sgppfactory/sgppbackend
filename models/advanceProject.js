model = require('./Model');

const ProjectStep =  model.dbsql.define('advanceProject',{
		id: { type: model.cte.INTEGER, primaryKey: true, autoIncrement: true }
	,	idPorposeProject : {
			type: model.cte.STRING
		, 	field: 'id_porpose_project'
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
	,	percent : {
			type: model.cte.FLOAT
		,	allowNull : false
		, 	validate: {
				isFloat: {
					msg: "El monto debe tener un formato de moneda del tipo XXXX.XX"
				}
			,	max: {
					args: 100.00
				,	msg:"El monto tiene un límite máximo de 15 dígitos" 
				}
			}
		}
	,	dateInit : {
			type: model.cte.DATE
		, 	allowNull: false
		,	field: 'date_init'
		, 	validate: {
				notNull: {
					msg: "La fecha de comienzo es requerida"
				}
			,	isDate: {
					msg: "El formato de la fecha de inicio debe ser DD-MM-YYYY o DD/MM/YYYY"
				}
			}
		}
	,	amount : {
			type: model.cte.FLOAT
		, 	allowNull: true
		,	validate : {
				isFloat: {
					msg : "El monto debe tener un formato de moneda del tipo XXXX.XX"
				}
			,	max: {
					args : 999999999999999.99
				,	msg : "El monto tiene un límite máximo de 15 dígitos" 
				}
			}
		}
	,	notes : {
			type: model.cte.TEXT
		, 	allowNull: true
		}
	},{
		tableName: 'advance_project'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return ProjectStep
	}
,	create :(params) => {
		try {
			return ProjectStep.create(params)
		}catch(err) {
			console.log(err)
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
	}
,	get: id => {
		return ProjectStep.findById(id)
	}
,	search: params => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return ProjectStep.findAll()
	}
}

