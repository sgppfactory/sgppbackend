// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
const model = require('./Model');
const Node = require('./node');
const NodeStage = require('./nodestage');
const Stage = require('./stage');
const Label = require('./label');
const ProjectStep = require('./advanceProject');
const Cicle = require('./cicle');
const Task = require('./task');
const Person = require('./person');
const search = require('../lib/search');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const paramsLib = require('../lib/params');
var redisDB = new redis(model.config.redis_connect);

const PorposalProject =  model.dbsql.define(
	'porpose_project'
,	{
		id: { type: model.cte.INTEGER, primaryKey: true, autoIncrement: true }
	,	title : {
			type: model.cte.STRING
		,	allowNull : false
		, 	validate: {
				notEmpty: {
					msg: "El título es requerido"
				}
			,	len: {
					msg: "El título tiene un límite máximo de 250 caracteres"
				,	args : [0,250]
				}
			}
		}
	,	idNode : {
			type: model.cte.INTEGER
		, 	field: 'id_node'
		,	allowNull : false
		,	validate: {
				notNull: {
					msg: "El nodo es requerido"
				}
			,	isInt : {
					msg: "El campo nodo es incorrecto"
				}
			// ,	unique : value => {

			// 		// msg: "El campo nodo es incorrecto"
			// 	}
			}
		,	references: {
				model: Node.getModel()
			,	key: 'id'
			}
		}
	,	details : {type: model.cte.TEXT, allowNull: true}
	,	location : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validate: { 
				isJSON : {
					msg : "La ubicación posee un formato incorrecto"
				}
			}
		}
	,	amount : {
			type: model.cte.FLOAT
		, 	allowNull: true
		,	validate : {
				isFloat: {
					msg: "El monto debe tener un formato de moneda del tipo XXXX.XX"
				}
			,	max: {
					args: 999999999999999.99
				,	msg:"El monto tiene un límite máximo de 15 dígitos" 
				}
			}
		}
	,	idStage : {
			type: model.cte.INTEGER
		, 	field: 'id_stage'
		,	validate: {
				isInt : {
					msg: "El campo de etapa es incorrecto"
				}
			}
		}
	,	idCicle : {
			type: model.cte.INTEGER
		, 	field: 'id_cicle'
		,	validate: {
				isInt : {
					msg: "El campo ciclo es incorrecto"
				}
			}
		}
	,	type: {
			type: model.cte.INTEGER
		,	validate: {
				isInt : {
					msg: "El campo tipo es incorrecto"
				}
			}
		}
	,	active: {
			type: model.cte.BOOLEAN
		,	defaultValue : true
		}
	,	state: {
			type: model.cte.ENUM('Creado', 'Cancelado', 'Avanzado - Propuesta', 'Proyecto nuevo', 'Avanzado - Proyecto', 'Finalizado')
		,	isIn: {
				args: [['Creado', 'Cancelado', 'Avanzado - Propuesta', 'Proyecto nuevo', 'Avanzado - Proyecto', 'Finalizado']]
			,	msg: "El campo de estado es incorrecto"
			}
		}
	},{
		tableName: 'porpose_project'
	,	timestamps: true
	,	updatedAt : false
	,	createdAt : 'created_at'
	}
)

NodeInstance = Node.getModel()
CicleInstance = Cicle.getModel()
StageInstance = Stage.getModel()
PersonInstance = Person.getModel()
LabelInstance = Label.getModel()

PorposalProject.belongsTo(CicleInstance, {foreignKey: 'id_cicle'});
PorposalProject.belongsTo(NodeInstance, {foreignKey: 'id_node'});
PorposalProject.belongsTo(StageInstance, {foreignKey: 'id_stage'});
// PorposalProject.hasOne(NodeInstance, {foreignKey: 'id', sourceKey: 'id_node'});
// PorposalProject.hasOne(CicleInstance, {foreignKey: 'id', sourceKey: 'id_cicle'});
// PorposalProject.hasOne(StageInstance, {foreignKey: 'id', sourceKey: 'id_stage'});

var PersonPorpose = model.dbsql.define('porpose_person',{
	idPorpose : {
		type: model.cte.INTEGER
	, 	field: 'id_porpose_project'
	,	primaryKey: true
	, 	allowNull: false
	,	validate: {
			notNull:{
				msg: "El id de propuesta o proyecto es requerido"
			}
		,	isInt : {
				msg: "El id de propuesta o proyecto es incorrecto"
			}
		}
	}
,	idPerson : {
		type: model.cte.INTEGER
	, 	field: 'id_person'
	,	primaryKey: true
	, 	allowNull: false
	,	validate: {
			notNull:{
				msg: "El id de persona es requerido"
			}
		,	isInt : {
				msg: "El id de persona es incorrecto"
			}
		}
	}
}, {
	tableName: 'person_porpose_project'
,	timestamps: false
})

LabelPorpose = model.dbsql.define('label_porpose_project',{
	idLabel : {
		type: model.cte.INTEGER
	,	primaryKey: true
	, 	field: 'id_label'
	, 	allowNull: false
	,	validate: {
			notNull:{
				msg: "El campo de etiqueta es requerido"
			}
		,	isInt : {
				msg: "El campo de etiqueta es incorrecto"
			}
		}
	},
	idPorposeProject : {
		type: model.cte.INTEGER
	, 	field: 'id_porpose_project'
	,	primaryKey: true
	, 	allowNull: false
	,	validate: {
			notNull:{
				msg: "El campo de propuesta / proyecto es requerido"
			}
		,	isInt : {
				msg: "El campo de propuesta / proyecto es incorrecto"
			}
		}
	}
}, {
	tableName: 'label_porpose_project'
,	timestamps: false
})

LabelPorpose.belongsTo(LabelInstance, {foreignKey: 'id_label'});
PersonPorpose.belongsTo(PersonInstance, {foreignKey: 'id_person'});

module.exports = {
	getModel : () => {
		return PorposalProject
	}
,	create: (params, token) => {
		params = paramsLib.purge(params)
		// console.log(params)
		return model.dbsql.transaction((t) => {
			return redisDB
				.hget('auth:'+token, 'implementation')
				.then((impldata) => {
					impldata = JSON.parse(impldata)
					if (!impldata) {
						throw "Error al obtener datos de sesión"
					}

					return Node.getModel()
						.findOne({where: {idImplementation: impldata.id, id: params.idNode}})
						.then(resultNode => {
							resultNode = resultNode.dataValues
							if (!resultNode) {
								throw "El nodo seleccionado no existe"
							}
							return Stage.getStageFirstByNode(params.idNode).then((firstStage) => {
								if (!firstStage[0]) {
									throw "Error al obtener algunos datos, inténtelo nuevamente"
								}

								return Cicle.getCurrencyByImplementation(impldata.id).then(cicleData => {
									params.idCicle = cicleData.dataValues.id
									params.idStage = firstStage[0].dataValues.id
									params.type = 1 //tipo 1 es propuesta y 2 es proyecto
									return PorposalProject.create(params, {transaction: t})
										.then(porpose => {
											params.persons = JSON.parse(params.persons)
											params.tags = JSON.parse(params.tags)
											return model.dbsql.Promise.map(params.persons, ppRet => {
												return PersonPorpose.create(
													{idPerson: ppRet, idPorpose: porpose.dataValues.id}
												, 	{transaction: t}
												)
											}).then(pp => {
												return model.dbsql.Promise.map(params.tags, tRet => {
													if (tRet.id) {
														return LabelPorpose.create(
															{idLabel: tRet.id, idPorposeProject: porpose.dataValues.id}
														, 	{transaction: t}
														)
													} 
													throw "Etiqueta incorrecta, seleccione otra etiqueta."
												}).then(lp => {
													return Task.create().then(task => {
														return porpose
													})
												})
											})
										})
									})
							})
						})
				})
		})
	}
,	get: (id, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {
				return PorposalProject.findOne({where:{ id: id, active: true}})
					.then(pp => {
						porpose = _.clone(pp.dataValues)
						return LabelPorpose.findAll({
								include: [{
									model: Label.getModel()
								, 	attributes: ['id', 'name', 'colour']
								,	where: {active: true} //No voy a incluir el id de implementación (?)
								}]
							, 	where: {idPorposeProject: porpose.id}
							}).then(labels => {
								return PersonPorpose.findAll({
										include: [{
											model: Person.getModel()
										, 	attributes: ['id', 'name', 'lastname', 'email']
										,	where: {active: true}
										}]
									, 	where: {idPorpose: porpose.id}
									}).then(persons => {
										// TODO: ver esto después
										porpose.labels = _.map(labels , label => {
											return label.dataValues.label
										})
										porpose.persons = _.map(persons, pers => {
											return pers.dataValues.person
										})
										// Del tipo proyecto? traigo la data de los avances
										if (porpose.type === 2) {
											var params = {}
											params.filter = [{
												key: 'id_porpose_project', 
												value: porpose.id, 
												operator: '=', 
												operator_sup: 'AND'
											}]
											return ProjectStep.findAll(params)
												.then(steps => {
													porpose.project_steps = _.map(steps, step => {
														return step.dataValues
													})
													return porpose
												})
										}
										console.log(porpose)
										return porpose
									})
							})
					})
			})
	}
,	findAll: (params) => {
		let searchObj = new search.Search(params)
		tosearch = searchObj.getSearch(params)
		return PorposalProject.findAll(_.extend(
			tosearch
		,	{
				include: [{
					model: NodeInstance
				,	attributes: ['name', 'amount', 'active']
				}, {
					model: StageInstance
				,	attributes: ['name', 'isProject', 'active']
				}, {
					model: CicleInstance
				,	attributes: ['date', 'currency']
				}]
			}
		))
	}
,	count: params => {
		let searchObj = new search.Search(params)
		filter = searchObj.buildFilter(params.filter)
		return 	PorposalProject.count({
			where: filter
		})
	}
,	delete: idPorpose => {
		if(_.isEmpty(idPorpose)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return PorposalProject.update({
			active: false
		}, {
			where: {
				id: idPorpose
			}
		})
	}
,	changeState: params => {
		if(_.isEmpty(params.id) || _.isEmpty(params.state)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		// 'Creado', 'Cancelado', 'Avanzado - Propuesta', 'Proyecto nuevo', 'Avanzado - Proyecto', 'Finalizado'
		return PorposalProject.findOne({where: {id: params.id, active: true}}).then(pp => {
				porpose = _.clone(pp.dataValues)
				var toUpdate = {}
				if (porpose.type == 1) {
					if ((porpose.state == "Creado" || porpose.state == "Avanzado - Propuesta") 
						&& params.state == "advance") {
						return NodeStage.getStageByNode(porpose.id_node).then(psteps => {
							let nexstage = ''
							for (x = 0; psteps.length > x; x++) {
								if (psteps[x].dataValues.stage.dataValues.id == porpose.id_stage) {
									nexstage = psteps[x + 1].dataValues.stage.dataValues
									break;
								}
							}
							// Acá se debe preguntar si la etapa es del tipo proyecto y así hacer el cambio
							if (nexstage.is_project) {
								toUpdate = {
									state: "Proyecto nuevo",
									idStage: nexstage.id,
									type: 2
								}
							} else {
								toUpdate = {
									state: "Avanzado - Propuesta",
									idStage: nexstage.id
								}
							}

							return PorposalProject.update(toUpdate, {
								where: {id: params.id, active: true}
							}).then(result => {
								if (result && result[0]) {
									return {id: params.id, state: params.state}
								} else {
									throw "No se pudo modificar la Propuesta."
								}
							})
						})
					} else if (params.state == "delete") {
						toUpdate = {state: "Cancelado", active: false}
					} else {
						throw "Error al actualizar Propuesta"
					}
				} else if (porpose.type == 2) {
					if ((porpose.state == "Proyecto nuevo" || porpose.state == "Avanzado - Proyecto") 
						&& params.state == "notify") {
						// params.advance.percent = params.advance.percent
						if (params.advance.percent >= 100) {
							throw "Porcentaje debe ser menor a 100%"
						}

						if (params.advance.mount >= porpose.mount) {
							throw "Porcentaje incorrecto"
						}

						return ProjectStep.findAll({
							filter: [{key: 'id_porpose_project', value: porpose.id, operator: '=', operator_sup: 'AND'}]
						}).then(projectSteps => {
							console.log(projectSteps)
							var percentAcum = 0
							var acountAcum = 0 

							_.each(projectSteps, (item, index) => {
								percentAcum += item.dataValues.percent
								acountAcum += item.dataValues.amount
							})
							params.advance = JSON.parse(params.advance)

							if (percentAcum + params.advance.percent >= 100) {
								throw "El porcentaje supera al 100%"
							}
							// No voy a validar excedentes de monto
							// if (acountAcum + params.advance.mount >= porpose.mount) {
							// 	throw "El monto supera el monto total del proyecto"
							// }
							return ProjectStep.create(_.extend({
								idPorposeProject: porpose.id
							}, params.advance)).then(pstep => {
								return PorposalProject.update({
									state: "Avanzado - Proyecto"
								}, {
									where: {
										id: params.id
									,	active: true
									}
								}).then(result => {
									if (result && result[0]) {
										return {id: params.id, state: params.state}
									} else {
										throw "Error al modificar la Propuesta o Proyecto."
									}
								})	
							})
						})
					} else if (params.state == "delete") {
						toUpdate = {state: "Cancelado", active: false}
					} else if (params.state == "final") {
						toUpdate = {state: "Finalizado"}
					} else {
						throw "Error al actualizar Proyecto"
					}
				} else {
					throw "Error al actualizar Propuesta / Proyecto"
				}
				
				return PorposalProject.update(toUpdate, {
					where: {
						id: params.id
					,	active: true
					}
				}).then(result => {
					if (result && result[0]) {
						return {id: params.id, state: params.state}
					} else {
						throw "Error al modificar la Propuesta o Proyecto."
					}
				})
			})
	}
,	put: (params, token) => {
		if(_.isEmpty(params.id)) {
			throw "Parámetros incorrectos"
		}
		return model.dbsql.transaction((t) => {
			return PorposalProject.update(
				{
					title: params.title, 
					idNode: params.idNode, 
					details: params.details, 
					location: params.location, 
					amount: params.amount
				}, 
				{where: {id: params.id, active: true}},
				{transaction: t}
			).then(updateResult => {
				if (!updateResult[0]) {
					throw "No puedo ser modificada la propuesta, inténtelo nuevamente más tarde."
				}
				params.persons = JSON.parse(params.persons)
				params.tags = JSON.parse(params.tags)
				return PersonPorpose.destroy({
					where: {
						idPerson: {[model.Op.in]: params.persons}, 
						idPorpose: params.id
					}
				}, {transaction: t}).then(ppdestroy => {
					var tagsId = _.map(params.tags, (tag) => {
						return tag.id
					})
					return LabelPorpose.destroy({
						where: {
							idLabel: {[model.Op.in]: tagsId}, 
							idPorposeProject: params.id
						}
					}, {transaction: t}).then(lpdestroy => {
						// console.log(lpdestroy)
						return model.dbsql.Promise.map(params.persons, ppRet => {
							return PersonPorpose.create(
								{idPerson: ppRet, idPorpose: params.id}
							, 	{transaction: t}
							)
						}).then(pp => {
							return model.dbsql.Promise.map(params.tags, tRet => {
								// console.log(params.tags, tRet)
								return LabelPorpose.create(
									{idLabel: tRet.id, idPorposeProject: params.id}
								, 	{transaction: t}
								)
							}).then(lp => {
								return updateResult
							})
						})
					})
				})


			})
		})
	}
}
