model = require('./Model');

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

module.exports = {
	getModel : () => {
		return Stage
	}
,	create :(params) => {
		console.log(params)
		params.dateInit = changeDate(params.dateInit)
		if (_.isEmpty(params.idNode)) {
			return Stage.create(params)
		} else {
			return model.dbsql.transaction((t) => {
				return Stage.create(params,{transaction : t})
					.then((resultStg) => {
						return NodeStage.create({
							idNode: params.idNode,
							idStage: resultStg.dataValues.id,
						},{transaction : t})
					})
			})
		}
	}
,	get: (idStage) => {
		return Stage.findOne({ where: { id: idStage, active: true }})
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
		console.log(params)
		return Stage.update(params, {where: {id: params.id, active: true}})
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