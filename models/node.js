const model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const NodeStage = require('./nodestage');
const Stage = require('./stage');
const search = require('../lib/search');
var redisDB = new redis(model.config.redis_connect);

const Node =  model.dbsql.define('node',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	name : {
			type: model.cte.STRING
		, 	allowNull: false
		, 	validate: {
				notNull: {
					msg: "El título es requerido"
				}
			,	len: {
					msg: "El título tiene un límite máximo de 250 caracteres"
				,	args : [0,250]
				}
			}
		}
	,	idParentNode : {
			type: model.cte.INTEGER
		, 	field: 'id_parent_node'
		, 	allowNull: true
		// ,	references: {
		// 		model: Node
		// 	,	key: 'id'
		// 	}
		,	validate: {
				isInt : {
					msg: "El campo nodo padre es incorrecto"
				}
			}
		}
		// Es del tipo ciclo?
	,	cicle : {
			type: model.cte.BOOLEAN
		,	validate : {
				isBoolean: {
					msg: "El monto debe tener un formato de moneda del tipo XXXX.XX"
				}
			}
		}
	,	description : {
			type: model.cte.TEXT
		, 	allowNull: true
		}
	,	active : {
			type: model.cte.BOOLEAN
		,	defaultValue : true
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
	,	idImplementation : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_implementation'
		,	validate : {
				isInt: {
					msg: "Referencia de Implementación incorrecta"
				}
			}
		}
	},{
		tableName: 'node'
	,	timestamps: false
	,	updatedAt : false
	,	createdAt : false
	}
)

module.exports = {
	getModel : () => {
		return Node		
	}
,	create: (params, token) => {
		return redisDB
			.hget('auth:' + token, 'implementation')
			.then((impldata) => {
				try {
					impldata = JSON.parse(impldata)
					if (!impldata) {
						throw "Error al obtener datos de sesión"
					}
					if (_.isEmpty(params.amount)) {
						delete params.amount;
					}
					// console.log(params)
					return Node.create(_.extend(
						params
					,	{ idImplementation : impldata.id }
					))
				} catch(err) {
					return err
				}
			})
	}
,	get: idNode => {
		return Node.findOne({ where: { id: idNode, active: true }})
	}
,	getStagesByNode: (nodeId, token) => {
		if(_.isEmpty(nodeId)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return redisDB
			.hget('auth:' + token, 'implementation')
			.then((impldata) => {
				impldata = JSON.parse(impldata)
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				return Node.findOne({
					where: {idImplementation : impldata.id, active: true, id: nodeId}
				}).then(node => {
					if (node) {
						return NodeStage.findAll({
							include: [{
								model: Stage.getModel()
							, 	attributes: ['id', 'name', 'is_project', 'order']
							,	where: {active: true}
							}]
						, 	where: {idNode: nodeId}
						}).then((toReturn) => {
							return _.sortBy(_.map(toReturn, (obj) => {
								return obj.dataValues.stage.dataValues
							}), 'order')
						})
					} else {
						throw "Nodo desconocido"
					}
				})

			})
	}
,	search: (params, token) => {
		if(_.isEmpty(token)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return redisDB
			.hget('auth:' + token, 'implementation')
			.then((impldata) => {
				impldata = JSON.parse(impldata)
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				params.filter.push({"key":"idImplementation","value":impldata.id,"operator_sup":"AND"})
				
				let searchObj = new search.Search(params)
				tosearch = searchObj.getSearch(params)

				return Node.findAll(tosearch)
			})
	}
,	delete: idNode => {
		if(_.isEmpty(idNode)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return Node.update({
			active: false
		}, {
			where: {
				id: idNode
			}
		})
	}
,	update: (params) => {
		idNode = params.id
		delete params.id
		if (_.isEmpty(params.amount) || params.amount === 'null') {
			delete params.amount;
		}
		return Node.update(params, {where: {id: idNode, active: true}})
	}
}