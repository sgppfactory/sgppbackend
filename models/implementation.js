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

module.exports = {
	getModel : () => {
		return Implementation
	}
,	create: (params, token) => {
		try {
			return model.dbsql.transaction((t) => {
				redisDB
					.hget('auth:'+token, 'implementation')
					.then((impldata, err) => {
						if (err) 
							throw "Error al obtener datos de sesión"

						console.log(params.appdata, result)
						
						let appdata = JSON.parse(params.appdata)
						impldata = JSON.parse(impldata)

						return Node.create(
							_.extend(
								appdata
							,	{idImplementation: impldata.id}
							)
						, 	{transaction: t}).then((resultImpl) => {
							let stages = JSON.parse(params.stages)
							let nodes = JSON.parse(params.nodes)

							if (stages.length < 2) {
								throw "Cantidad de etapas incorrectos"
							}
							if (nodes.length < 1) {
								throw "Cantidad de nodos incorrectos"
							}
							console.log(nodes,resultImpl)
							// nodesOrder  = []
							// _.each(nodes, (nodeF) => {
							// 	nodesOrder.push(nodeF)
							// 	if (!nodeF.iscicle) {
							// 		nodesOrder = nodesOrder.concat(this.findNodes(groupNodes, nodeF, 1))
							// 	}
							// })

							let nodesByGroup = _.groupBy(nodes, 'level')
							console.log(nodesByGroup)
							if (!nodesByGroup[0]) {
								throw "No hay nodos de nivel 0"
							}
							_.each(nodesByGroup[0], (node, index) => {
								Node.create(_.extend(
									node
								,	{idImplementation: impldata.id}
								), {transaction: t}).then((node_result) => {
									console.log("node_result", node_result)
									// node_result.add
								})
							})

							_.each(stages, (stage, index) => {
								Stage.create(stage, {transaction: t})
							})

							// nodes childrens
							// _.each(stages, (stage, index) => {
							// 	Stage.create(stage, {transaction: t})
							// })
						})
					});
			})
		}catch(err) {
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
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
