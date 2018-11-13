const model = require('./Model');
// const nodestage = require('./nodestage');
// NodeStageInstance = NodeStage.getModel()

const Stage =  model.dbsql.define('stage',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	name : {
			type: model.cte.STRING
		,	allowNull : false
		, 	validate: {
				notNull: {
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	isProject : {
			type: model.cte.BOOLEAN
		, 	field: 'is_project'
		,	allowNull : true
		,	defaultValue : false
		, 	validate: {
				isBoolean: {
					msg: "Debe ser un campo booleano"
				}
			}
		}
	,	dateInit : {
			type: model.cte.DATE
		, 	allowNull: false
		, 	field: 'date_init'
		, 	validate: {
				notNull: {
					msg: "La fecha de comienzo es requerida"
				}
			,	isDate: {
					msg: "El formato de la fecha de inicio debe ser DD-MM-YYYY o DD/MM/YYYY"
				}
			}
		}
	,	order : {
			type: model.cte.INTEGER
		, 	allowNull: true
		, 	validate: {
				isInt: {
					msg: "El orden debe ser un entero"
				}
			}
		}
	,	active : {
			type: model.cte.BOOLEAN
		,	defaultValue : true
		}
	},{
		tableName: 'stage'
	,	timestamps: false
	}
)

const NodeStage = model.dbsql.define('node_stage',{
	idNode : {
		type: model.cte.INTEGER
	,	primaryKey: true
	, 	field: 'id_node'
	, 	allowNull: false
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

Stage.hasMany(NodeStage, {foreignKey: 'idStage'})

module.exports = {
	getModel : () => {
		return Stage
	}
,	create :(params) => {
		params.dateInit = changeDate(params.dateInit)
		if (_.isEmpty(params.idNode)) {
			return Stage.create(params)
		} else {
			return Stage.findAll({
					attributes: ['id', 'order']
				,	where: {active: true}
				,	include: [{
						model: NodeStage
					,	where: { idNode: params.idNode }
					,	attributes: []
					}]
				})
				.then((stages) => {
					var max_order = _.max(stages, (st) => { 
						return st.dataValues.order ? st.dataValues.order : 0; 
					});

					max_order = max_order.dataValues.order + 1

					if(_.isEmpty(params.order)) {
						return model.dbsql.transaction((t) => {
							params.order = max_order
							return Stage.create(params, {transaction : t})
								.then((resultStg) => {
									return NodeStage.create({
										idNode: params.idNode,
										idStage: resultStg.dataValues.id,
									},{transaction : t})
								})
						})
					} else {
						if (max_order < params.order) {
							params.order = max_order
						}

						return model.dbsql.transaction((t) => {
							return Stage.create(params, {transaction: t})
								.then((resultStg) => {
									return NodeStage.create({
										idNode: params.idNode,
										idStage: resultStg.dataValues.id,
									},{transaction : t})
									.then((ns) => {
										return model.dbsql.Promise.map(stages, (stage) => {
											return Stage.update(
												{order: stage.dataValues.order + 1}
											, 	{where: {
													[model.Op.and]: [
														{id: stage.id}, {active: true}, 
														{order: {[model.Op.gte]: params.order}} //TODO: Poner mayor a!
													]
												}, transaction: t}
											) 
										}).then((result) => {
											return resultStg
										})
									})
								})
						}) 
					}
				})
		}
	}
,	get: (idStage) => {
		return Stage.findOne({ where: { id: idStage, active: true }, orderBy: ['order', 'DESC']})
	}
,	delete: idStage => {
		if(_.isEmpty(idStage)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return Stage.update({
			active: false
		}, {
			where: {
				id: idStage
			}
		})
	}
,	update: (params) => {
		return Stage.update(params, {where: {id: params.id, active: true}})
	}
,	getStageFirstByNode: (idNode) => {
		return Stage.findAll({
			attributes: ['id', 'order']
		,	where: {active: true, order: 1}
		,	include: [{
				model: NodeStage
			,	where: { idNode: idNode }
			,	attributes: []
			}]
		})
	}
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