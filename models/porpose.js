// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
const model = require('./Model');
const Node = require('./node');
const Stage = require('./stage');
const Cicle = require('./cicle');
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
			,	unique : value => {

					// msg: "El campo nodo es incorrecto"
				}
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

PorposalProject.hasOne(NodeInstance, {foreignKey: 'id', sourceKey: 'id_node'});
PorposalProject.hasOne(CicleInstance, {foreignKey: 'id', sourceKey: 'id_cicle'});
PorposalProject.hasOne(StageInstance, {foreignKey: 'id', sourceKey: 'id_stage'});

var PersonPorpose = model.dbsql.define('porpose_person',{
	idPorpose : {
		type: model.cte.INTEGER
	, 	field: 'id_porpose_project'
	,	primaryKey: true
	, 	allowNull: false
	,	validate: {
			isInt : {
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
			isInt : {
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
			isInt : {
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
			isInt : {
				msg: "El campo de propuesta / proyecto es incorrecto"
			}
		}
	}
}, {
	tableName: 'label_porpose_project'
,	timestamps: false
})
// NodeStage.belongsTo(node.getModel(), {foreignKey: 'idNode', sourceKey: 'id'})

module.exports = {
	getModel : () => {
		return PorposalProject
	}
,	create: (params, token) => {
		params = paramsLib.purge(params)

		return redisDB
			.hget('auth:'+token, 'implementation')
			.then((impldata) => {
				try {
					impldata = JSON.parse(impldata)
					if (!impldata) {
						throw "Error al obtener datos de sesión"
					}

					return Node.getModel()
						.findOne({where: {idImplementation: impldata.id, id: params.idNode}})
						.then(resultNode => {

							return Stage.getStageFirstByNode(params.idNode).then((firstStage) => {
								if (!firstStage[0]) {
									throw "Error al obtener algunos datos, inténtelo nuevamente"
								}
								return Cicle.getCurrencyByImplementation(impldata.id)
									.then(cicleData => {
										params.idCicle = cicleData.dataValues.id
										params.idStage = firstStage[0].dataValues.id
										return PorposalProject.create(params)
											.then((porpose) => {
											// TODO: FALTA ASIGNAR PERSONAS 
												params.persons = JSON.parse(params.persons)
												return model.dbsql.Promise.map(params.persons, (ppRet) => {
													return PersonPorpose.create(
														{idPerson: ppRet, idPorpose: porpose.dataValues.id}
													)
												})
											})
									})
							})
						})
				} catch(err) {
					return err
				}
			})
	}
,	get: (id) => {
		return PorposalProject.findOne(id)
	}
,	findAll: (params) => {
		let searchObj = new search.Search(params)
		tosearch = searchObj.getSearch(params)
		return PorposalProject.findAll(_.extend(
			tosearch
		,	{
				include: [{
					model: NodeInstance
				,	attributes: ['name', 'amount']
				}, {
					model: StageInstance
				,	attributes: ['name', 'isProject']
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
}
