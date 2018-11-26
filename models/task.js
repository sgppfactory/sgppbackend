model = require('./Model');
const search = require('../lib/search');

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
	,	active : {
			type: model.cte.BOOLEAN
		,	defaultValue : true
		}
	},{
		tableName: 'task'
	,	timestamps: false
	}
)

const TaskPerson =  model.dbsql.define('task_person',{
		idTask : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_task'
		,	validations : {
				isInt:{
					msg: "El nodo debe ser un valor entero"
				}
			}
		}
	,	idPerson : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_person'
		,	validations : {
				isInt:{
					msg: "El nodo debe ser un valor entero"
				}
			}
		}
	},{
		tableName: 'task_person'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Task
	}
,	create: params => {
		return Task.create(params)
			.then((task) => {
				return task
			})
	}
,	get: id => {
		return Task.findById(id)
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
