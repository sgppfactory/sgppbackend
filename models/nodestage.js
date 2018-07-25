const model = require('./Model');
// const node = require('./node');
const Stage = require('./stage');

NodeStage = model.dbsql.define('node_stage',{
	idNode : {
		type: model.cte.INTEGER
	,	primaryKey: true
	, 	field: 'id_node'
	, 	allowNull: false
	// ,	references: {
	// 		model: Node.getModel()
	// 	,	key: 'id'
	// 	}
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
	// ,	references: {
	// 		model: Stage.getModel()
	// 	,	key: 'id'
	// 	}
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

// NodeStage.belongsTo(node.getModel(), {foreignKey: 'idNode', sourceKey: 'id'})
NodeStage.belongsTo(Stage.getModel(), {foreignKey: 'idStage', sourceKey: 'id'})

module.exports = {
	getModel : () => {
		return NodeStage
	}
,	create: (params, tr) => {
		return NodeStage.create(params, tr)
	}
,	findAll: params => { //Necesario para otro endpoint
		return NodeStage.findAll(params)
	}
}
