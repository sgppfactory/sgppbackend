const model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const Node = require('./node');
const Stage = require('./stage');
var redisDB = new redis(model.config.redis_connect);

const Implementation =  model.dbsql.define('implementation',{
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


NodeStage = model.dbsql.define('node_stage',{
	idNode : {
		type: model.cte.INTEGER
	,	primaryKey: true
	, 	field: 'id_node'
	, 	allowNull: false
	,	references: {
			model: Node
		,	key: 'id'
		}
	,	validate: {
			isInt : {
				msg: "El campo nodo es incorrecto"
			}
		}
	},
	idStage : {
		type: model.cte.INTEGER
	, 	field: 'id_stage'
	,	primaryKey: true
	, 	allowNull: false
	,	references: {
			model: Stage
		,	key: 'id'
		}
	,	validate: {
			isInt : {
				msg: "El campo de etapa es incorrecto"
			}
		}
	}
}, {
	tableName: 'node_stage'
,	timestamps: false
})

//Función recursiva
function createNode(nodesByGroup, t, implementationId, idParentNode, level, childrens) {
	// return _.each(childrens, (nodeGB, index) => {
	return model.dbsql.Promise.map(childrens, (nodeGB) => {
		objectToSave = _.clone(nodeGB)
		if(objectToSave.amount == '') {
			delete objectToSave.amount
		}

		delete objectToSave.id

		return Node.create(_.extend(
			objectToSave
		,	{ idImplementation: implementationId, idParentNode: idParentNode }
		), {transaction: t})
		.then((node_result) => {
			child = _.filter(nodesByGroup[level + 1], (obj)=>{
				return obj.fatherNode === nodeGB.id
			})

			if(child && child.length > 0) {
				return createNode(
					nodesByGroup
				, 	t
				, 	implementationId
				, 	node_result.dataValues.id
				, 	level + 1
				, 	child
				)
			} else {
				return node_result.dataValues
			}
		}).catch((error) => {
			// console.log(error)
			t.rollback()
			return error
		})
	})
}

function getAllNodesIDChildrens (nodes) {
	console.log("filtrar nodos",_.filter(nodes, (node) => {
		return node.cicle 
	}))
	return _.map(_.filter(nodes, (node) => {
		return node.cicle 
	}), (nodeB) => {
		return nodeB.id
	})
}

function changeDate (latinDate) {
	var dma = latinDate.split('/')
  	if (dma.length === 3) {
  		return dma[2] + '-' + dma[1] + '-' + dma[0]	
  	} else if (dma.length === 2) {
		let year = (new Date()).getFullYear()
  		return year + '-' + dma[1] + '-' + dma[0]	
  	} else {
  		return latinDate
  	}
}


module.exports = {
	getModel : () => {
		return Implementation
	}
,	create: (params, token) => {
		// return new Promise((resolve, reject) => {
			return model.dbsql.transaction((t) => {
				return redisDB
					.hget('auth:'+token, 'implementation')
					.then((impldata) => {
						if (!impldata) {
							throw "Error al obtener datos de sesión"
						}

						let appdata = JSON.parse(params.appdata)
						impldata = JSON.parse(impldata)

						return Node.create(
								_.extend(
									appdata
								,	{idImplementation: impldata.id}
								)
							, 	{transaction: t}
							).then((resultImpl) => {
								let nodes = JSON.parse(params.nodes)
								if (nodes.length < 1) {
									throw "Cantidad de nodos incorrectos"
								}

								let nodesByGroup = _.groupBy(nodes, 'level')
								
								if (!nodesByGroup[0]) {
									throw "No hay nodos de primer nivel"
								}

								if (!resultImpl.dataValues) {
									throw "Error al crear los nodos, inténtelo nuevamente más tarde"
								}

								return createNode(
									nodesByGroup
								, 	t
								, 	impldata.id
								, 	resultImpl.dataValues.id
								, 	0
								, 	nodesByGroup[0]
								)

								// nodesChildrens = getAllNodesIDChildrens(nodes)
								// console.log(nodesChildrens)
							}).then((nodes) => {
								nodes = _.flatten(nodes)
								if (!nodes || nodes.length === 0 ) {
									throw "Error al crear los nodos, inténtelo nuevamente más tarde"
								}

								let stages = JSON.parse(params.stages)
								if (stages.length < 2) {
									throw "Cantidad de etapas incorrectas"
								}

								return model.dbsql.Promise.map(stages, (stage) => {
									stage.isproject = (_.isBoolean(stage.isproject) &&  stage.isproject) 
										|| stage.isproject === 'true'

									stage.dateInit = changeDate(stage.dateInit)

									return Stage.create(stage, {transaction: t})
										.then((stageRet) => {
											// return _.each(nodesChildrens, (nodeC) => {
											return model.dbsql.Promise.map(nodes, (nodeC) => { 
												return NodeStage.create(
													{idStage: stageRet.id, idNode: nodeC.id}, 
													{transaction: t}
												).catch((err) => {
													t.rollback();
													// reject(err)
													return err
												})
											})
										}).catch((err) => {
											// console.log(err)
											t.rollback();
											// reject(err)
											return err
										})
								})
							}).then((toReturn) => {
								// creo que acá tengo que tirar la onda
								// t.commit();
								// resolve(ok);
								// console.log("ok",ok)
								ok = _.flatten(toReturn)
								return ok.length > 0
							}).catch((err) => {
								// console.log("error",err)
								t.rollback();
								// reject(err)
								return err
							})
					}).catch((err) => {
						// console.log("error",err)
						t.rollback();
						// reject(err)
						return err
					})
			})
		// })
	}
,	get: id => {
		return Implementation.find({
			attributes: ['id', 'logo', 'name', 'description']
		,	where: {
				[model.Op.and]: [{id: id}, {active: true}]
			}
		})
	}
,	getByUser: token => {
		return new Promise((resolve,reject)=>{
			redisDB
				.hget('auth:'+token, 'implementation')
				.then((result, err) => {
					if(err) return reject(err)
					resolve(result)
				});
		});
	}
,	findBy: params => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Implementation.findAll()
	}
,	structures: token => {
		return new Promise((resolve, reject) => {
			redisDB
				.hget('auth:'+token, 'implementation')
				.then((result, err) => {
					if(err) reject(err)

					result = JSON.parse(result)

					Node.getModel().findAll({
						attributes: ['id', 'id_parent_node', 'name', 'description', 'amount']
					,	where: {
							[model.Op.and]: [{id_implementation: result.id}, {active: true}]
						}
					}).then((result, err) => {
						console.log(result)
						if(err) reject(err)
						resolve(result)
					})
				})
		})
	}
}
