model = require('./Model');

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
,	create: params => {
		try {
			return Node.create(params)
		} catch(err) {
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
	}
,	get: id => {
		return Node.findById(id)
	}
}
