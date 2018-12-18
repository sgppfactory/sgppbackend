var model = require('./Model');
var Node = require('./node');
var Person = require('./person');
var User = require('./user');
var search = require('../lib/search');
var paramsLib = require('../lib/params');

const Task =  model.dbsql.define('task',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	title : {
			type: model.cte.DATE
		, 	allowNull: false
		, 	field: 'title'
		,	validations : {
				len: {
					msg: "El Título tiene un límite máximo de 255 caracteres"
				,	args : [0,255]
				}
			,	notEmpty:{
					msg: "El título es requerido"
				}
			}
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
		,	validations : {
				len: {
					msg: "La duración tiene un límite máximo de 10 caracteres"
				,	args : [0,10]
				}
			,	format: value => {
					// Anything
				}
			}
		}
	,	idPorposeProject : {
			type: model.cte.INTEGER
		, 	allowNull: true
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
			,	notEmpty:{
					msg: "El nodo es requerido"
				}
			}
		}
	,	idUserAudit : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_user_audit'
		,	validations : {
				notEmpty:{
					msg: "Se precisa de usuario para auditar"
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
					msg: "El id de tarea debe ser un valor entero"
				}
			}
		}
	,	idPerson : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_person'
		,	validations : {
				isInt:{
					msg: "El id de persona debe ser un valor entero"
				}
			}
		}
	},{
		tableName: 'task_person'
	,	timestamps: false
	}
)

NodeInstance = Node.getModel()
PersonInstance = Person.getModel()
UserInstance = User.getModel()

Task.belongsTo(NodeInstance, {foreignKey: 'id_node'});
Task.belongsTo(UserInstance, {foreignKey: 'id_user_audit'});
// Task.belongsTo(PorposeProjectInstance, {foreignKey: 'id_porpose_project'});
TaskPerson.belongsTo(PersonInstance, {foreignKey: 'id_person'});

module.exports = {
	getModel : () => {
		return Task
	}
,	create: (params, token) => {
		params = paramsLib.purge(params)
		return redisDB
			.hgetall('auth:'+token)
			.then((sessiondata) => {
				sessiondata = JSON.parse(sessiondata)
				if (!sessiondata) {
					throw "Error al obtener datos de sesión"
				}

				return Node.getModel()
					.findOne({where: {idImplementation: sessiondata.id, id: params.idNode}})
					.then(resultNode => {
						resultNode = resultNode.dataValues
						if (!resultNode) {
							throw "El nodo seleccionado no existe"
						}

						return model.dbsql.transaction((t) => {
							params
							return Task.create(params, {transaction: t})
								.then((task) => {
									if (!task) {
										throw "No puedo agregar la tarea, inténtelo nuevamente más tarde."
									}
									return model.dbsql.Promise.map(params.persons, ppRet => {
										TaskPerson.create(
											{idPerson: ppRet, idTask: task.dataValues.id}
										, 	{transaction: t}
										).then(ts => {
											return task.dataValues.id
										})
									})
								})
							})
					})
			})
	}
,	get: id => {
		return Task.findOne({
			attributes: ['dateHour', 'duration', 'idPorposeProject', 'id', 'notes', 'title'],
			where: {
				id: id, 
				active: true
			},
			include: [{
				model: NodeInstance
			,	attributes: ['id', 'name', 'active']
			}, {
				model: UserInstance
			,	attributes: ['id', 'username']
			}]
		}).then(taskResult => {
			var task = taskResult.dataValues

			return TaskPerson.findAll({
				attributes: ['idPerson'],
				where: {idTask: id }
			}).then(persons => {
				var personsId = !_.isEmpty(persons)
					?	_.map(persons, pers => {
							return pers.dataValues.idPerson
						})
					: 	[]

				if (!_.isEmpty(personsId)) {
					return PersonInstance.findAll({
						attributes: ['name', 'lastname', 'email'],
						where: {
							idPerson: {[model.Op.In]: personsId}
						}
					}).then(personsData => {
						task.persons = _.map(personsData, perData => {
							return perData.dataValues
						})

						return task
					})
				} else {
					task.persons = []
					return task
				}
			})
		})
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
