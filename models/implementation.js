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

//Función recursiva
function createNode(nodesByGroup, t, implementationId, idParentNode, level, childrens) {
	return _.each(childrens, (nodeGB, index) => {
		objectToSave = _.clone(nodeGB)
		if(objectToSave.amount == '') {
			delete objectToSave.amount
		}
		delete objectToSave.id
		return Node.create(_.extend(
			objectToSave
		,	{ idImplementation: implementationId, idParentNode: idParentNode }
		), {transaction: t}).then((node_result, err) => {
			if(err) return err
			child = _.filter(nodesByGroup[level + 1], (obj)=>{
				console.log("find",obj.fatherNode, nodeGB.id)
				return obj.fatherNode === nodeGB.id
			})
			console.log("hijos",childrens)
			if(child && child.length > 0) {
				createNode(nodesByGroup, t, implementationId, node_result.dataValues.id, level + 1, child)
			}
		})
	})
}

module.exports = {
	getModel : () => {
		return Implementation
	}
,	create: (params, token) => {
		try {
			return model.dbsql.transaction((t) => {
				return redisDB
					.hget('auth:'+token, 'implementation')
					.then((impldata, err) => {
						if (err) {
							throw "Error al obtener datos de sesión"
						}

						let appdata = JSON.parse(params.appdata)
						impldata = JSON.parse(impldata)

						// console.log(params.appdata, impldata)
						return Node.create(
							_.extend(
								appdata
							,	{idImplementation: impldata.id}
							)
						, 	{transaction: t}).then((resultImpl) => {
							let stages = JSON.parse(params.stages)
							let nodes = JSON.parse(params.nodes)

							if (stages.length < 2) {
								throw "Cantidad de etapas incorrectas"
							}
							if (nodes.length < 1) {
								throw "Cantidad de nodos incorrectos"
							}

							let nodesByGroup = _.groupBy(nodes, 'level')
							// console.log(nodesByGroup)
							if (!nodesByGroup[0]) {
								throw "No hay nodos de pimer nivel"
							}
							// var nodesId = []

							createNode(nodesByGroup, t, impldata.id, resultImpl.dataValues.id, 0, nodesByGroup[0])

							_.each(stages, (stage, index) => {
								console.log(stage)
								// TODO: Setear isproject como booleano
								stage.isproject = stage.isproject === 'true'
								Stage.create(stage, {transaction: t})
									.then((ok, err) => {
										// console.log(ok,err)
									})
							})
						})
					});
			})
		} catch(err) {
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
