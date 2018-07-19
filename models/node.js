const model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const NodeStage = require('./nodestage');
const Stage = require('./stage');
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
			.hget('auth:'+token, 'implementation')
			.then((impldata) => {
				try {
					let impldata = JSON.parse(impldata)
					if (!impldata) {
						throw "Error al obtener datos de sesión"
					}

					return Node.create(_.extend(
						params
					,	{ idImplementation : impldata.id }
					)).then((result) => {
						console.log(result)
						return result.id
					})
				} catch(err) {
					return err
				}
			})
	}
,	get: id => {
		return Node.findById(id)
	}
,	getStagesByNode: (nodeId) => {
		return NodeStage.findAll({
			include: [{
				model: Stage.getModel()
			, 	attributes:['id', 'name', 'is_project', 'order']
			,	where: {active: true}
			}]
		, 	where: {idNode: nodeId}
		}).then((toReturn) => {
			return _.map(toReturn, (obj) => {
				return obj.dataValues.stage.dataValues
			})
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
,	update: (params, idNode) => {
		console.log(params)
		return Node.update(params, {where: {id: idNode}})
				// .then((stage) => {
				// }).catch((err) => {
				// })
	}
}