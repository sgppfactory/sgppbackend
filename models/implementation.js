const model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const Node = require('./node');
const Stage = require('./stage');
const NodeStage = require('./nodestage');
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


module.exports = {
	getModel : () => {
		return Implementation
	}
,	create: (params, token) => {
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

						}).then((nodes) => {
							nodes = _.flatten(nodes)
							if (!nodes || nodes.length === 0 ) {
								throw "Error al crear los nodos, inténtelo nuevamente más tarde"
							}

							let stages = JSON.parse(params.stages)
							if (stages.length < 2) {
								throw "Cantidad de etapas incorrectas"
							}

							return Cicle.create(
									{date: new Date(), currency: true, idImplementation: impldata.id}
								, 	{transaction: t}
								).then((stageRet) => {
									// TODO: FALTA CREAR UN CICLO
									return model.dbsql.Promise.map(stages, (stage) => {
										stage.isproject = (_.isBoolean(stage.isproject) &&  stage.isproject) 
											|| stage.isproject === 'true'

										stage.dateInit = changeDate(stage.dateInit)

										return Stage.create(stage, {transaction: t})
											.then((stageRet) => {
												return model.dbsql.Promise.map(nodes, (nodeC) => { 
													return NodeStage.create(
														{idStage: stageRet.id, idNode: nodeC.id}, 
														{transaction: t}
													).catch((err) => {
														t.rollback();
														return err
													})
												})
											}).catch((err) => {
												t.rollback();
												return err
											})
									})
								})
						}).then((toReturn) => {
							// creo que acá tengo que tirar la onda
							ok = _.flatten(toReturn)
							return ok.length > 0
						})
				})
		}).catch((err) => {
			return err
		})
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
,	searchStructures: (params, token) => {
		if (!params.filter) {
			params.filter = array()
		}
		params.filter.push('{"key": "id_parent_node", "value": "NULL", "operator": "is"}')
		return Node.search(params, token)
	}
,	structures: async token => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then( async (result, err) => {
				if(err) reject(err)

				result = JSON.parse(result)

				return await Node.getModel().findAll({
					attributes: ['id', 'id_parent_node', 'name', 'description', 'amount', 'cicle']
				,	where: {
						[model.Op.and]: [{id_implementation: result.id}, {active: true}]
					}
				}).then(result => {
					let structure = genStructure(result)
					// console.log(structure)
					return structure
				}).catch(err =>{
					return err
					reject(err)
				})
			})
	}
}

/**
 * Generación de estructura de forma recursiva
 * @param result
 * @retun array
 */
function genStructure(result) {
	let nodesFathers = _.filter(result, (obj) => {
		return _.isNull(obj.dataValues.id_parent_node)
	})

	if (nodesFathers.length === 0) {
		return []
	}

	return _.map(
			nodesFathers
		,  (obj)=>{
				let data = obj.dataValues
				data.childrens = genRecursiveNodes(data, result)
				// console.log(data)
				return data
			}
		)
}

/**
 * Generación de estructura de forma recursiva
 * @param object nodeP
 * @param array allNodes
 * @retun array
 */
function genRecursiveNodes(nodeP, allNodes) {
	let nodesToFilter = _.filter(allNodes, (node) => {
		return nodeP.id === node.dataValues.id_parent_node
	})
	if (nodesToFilter.length === 0) {
		return []
	}

	return _.map(nodesToFilter, (obj) => {
		var data = obj.dataValues
		if (!data.cicle) {
			data.childrens = genRecursiveNodes(data, allNodes)
		}
		return data
	})
}



/**
 * Generación de nodos de forma recursiva
 * @param array nodesByGroup
 * @param object SequelizeTransaction
 * @param integer implementationId
 * @param integer idParentNode
 * @param integer level
 * @param array childrens
 * @retun array
 */
function createNode(nodesByGroup, t, implementationId, idParentNode, level, childrens) {
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
			t.rollback()
			return error
		})
	})
}

/**
 * Cambia el formato de la fecha
 * Date latinDate
 * return: string
 */
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