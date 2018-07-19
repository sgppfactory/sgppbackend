model = require('./Model');
const search = require('../lib/search');

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
		return ProjectStep.create(params)
	}
,	get: id => {
		return ProjectStep.findById(id)
	}
,	findAll: params => {
		let searchObj = new search.Search(params)
		tosearch = searchObj.getSearch(params)
		return Task.findAll(tosearch)
	}
,	count: params => {
		let searchObj = new search.Search(params)
		filter = searchObj.buildFilter(params.filter)
		return 	Task.count({
			where: filter
		})
	}
}

