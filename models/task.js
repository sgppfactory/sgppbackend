model = require('./Model');

const Task =  model.dbsql.define('task',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	notes : {
			type: model.cte.TEXT
		, 	allowNull: true
		}
	,	dateHour : {
			type: model.cte.DATE
		, 	allowNull: false
		, 	field: 'date_hour'
		,	validations : {
				isISO8601:{
					msg: "Debe ser una fecha con formato YYYY-MM-DD"
				}
			}
		}
	,	duration : {
			type: model.cte.STRING
		, 	allowNull: true
		, 	allowNull: true
		,	validations : {
				len: {
					msg: "La duración tiene un límite máximo de 20 caracteres"
				,	args : [0,20]
				}
			,	format: value => {
					// Anything
				}
			}
		}
	,	idPorposeProject : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_porpose_project'
		,	validations : {
				isInt:{
					msg: "El nodo debe ser un valor entero"
				}
			}
		}
	,	idNode : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_node'
		,	validations : {
				isInt:{
					msg: "El nodo debe ser un valor entero"
				}
			}
		}
	},{
		tableName: 'task'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Task
	}
,	create :params => {
		try {
			return Task.create(params)
		}catch(err) {
			console.log(err)
		}
	}
,	get: id => {
		return Task.findById(id)
	}
,	findAll: params => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Task.findAll()
	}
}
