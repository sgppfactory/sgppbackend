model = require('./Model');
const search = require('../lib/search');

const ProjectStep =  model.dbsql.define('advanceProject',{
		id: { type: model.cte.INTEGER, primaryKey: true, autoIncrement: true }
	,	idPorposeProject : {
			type: model.cte.INTEGER
		, 	field: 'id_porpose_project'
		,	allowNull : false
		, 	validate: {
				notNull: {
					msg: "El ID de propuesta / proyecto es requerido"
				}
			}
		}
	,	percent : {
			type: model.cte.FLOAT
		,	allowNull : false
		, 	validate: {
				notNull: {
					msg: "El porcentaje es requerido"
				}
			,	isFloat: {
					msg: "El monto debe tener un formato de porcentaje del tipo XX.YY"
				}
			,	max: {
					args: 100.00
				,	msg:"El monto tiene un límite máximo de 100%" 
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
	,	timestamps: true
	,	updatedAt : false
	,	createdAt: 'created_at'
	}
)

module.exports = {
	getModel : () => {
		return ProjectStep
	}
,	create: params => {
		return ProjectStep.create(params)
	}
,	get: id => {
		return ProjectStep.findById(id)
	}
,	findAll: params => {
		let searchObj = new search.Search(params)
		searchObj.withActive = false
		tosearch = searchObj.getSearch(params)
		return ProjectStep.findAll(tosearch)
	}
,	count: params => {
		let searchObj = new search.Search(params)
		searchObj.withActive = false
		filter = searchObj.buildFilter(params.filter)
		return 	ProjectStep.count({
			where: filter
		})
	}
}

