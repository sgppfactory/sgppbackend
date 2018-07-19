// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
model = require('./Model');
Node = require('./node');
const search = require('../lib/search');

const PorposalProject =  model.dbsql.define(
	'porpose_project'
,	{
		id: { type: model.cte.INTEGER, primaryKey: true, autoIncrement: true }
	,	title : {
			type: model.cte.STRING
		,	allowNull : false
		, 	validate: {
				notEmpty: {
					msg: "El título es requerido"
				}
			,	len: {
					msg: "El título tiene un límite máximo de 250 caracteres"
				,	args : [0,250]
				}
			}
		}
	,	idNode : {
			type: model.cte.INTEGER
		, 	field: 'id_node'
		,	allowNull : false
		,	validate: {
				notNull: {
					msg: "El nodo es requerido"
				}
			,	isInt : {
					msg: "El campo nodo es incorrecto"
				}
			,	unique : value => {

					// msg: "El campo nodo es incorrecto"
				}
			}
		,	references: {
				model: Node.getModel()
			,	key: 'id'
			}
		}
	,	details : {type: model.cte.TEXT, allowNull: true}
	,	location : {
			type: model.cte.TEXT
		, 	allowNull: true
		,	defaultValue: null
		,	validate: { 
				isJSON : {
					msg : "El monto debe tener un formato de moneda del tipo XXXX.XX"
				}
			}
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
	,	idStage : {
			type: model.cte.INTEGER
		, 	field: 'id_stage'
		,	validate: {
				isInt : {
					msg: "El campo de etapa es incorrecto"
				}
			}
		}
	,	idCicle : {
			type: model.cte.INTEGER
		, 	field: 'id_cicle'
		,	validate: {
				isInt : {
					msg: "El campo ciclo es incorrecto"
				}
			}
		}
	,	type: {
			type: model.cte.INTEGER
		,	validate: {
				isInt : {
					msg: "El campo tipo es incorrecto"
				}
			}
		}
	,	active: {
			type: model.cte.BOOLEAN
		,	defaultValue : true
		}
	,	state: {
			type: model.cte.ENUM('Creado', 'Cancelado', 'Avanzado - Propuesta', 'Proyecto nuevo', 'Avanzado - Proyecto', 'Finalizado')
		,	isIn: {
				args: [['Creado', 'Cancelado', 'Avanzado - Propuesta', 'Proyecto nuevo', 'Avanzado - Proyecto', 'Finalizado']]
			,	msg: "El campo de estado es incorrecto"
			}
		}
	},{
		tableName: 'porpose_project'
	,	timestamps: true
	,	updatedAt : false
	,	createdAt : 'created_at'
	}
)

module.exports = {
	getModel : () => {
		return PorposalProject
	}
,	create :(params) => {
		try {
			return PorposalProject.create(params)
		}catch(err) {
			// console.log(err)
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
	}
,	get: (id) => {
		return PorposalProject.findOne(id)
	}
,	search: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return PorposalProject.findAll()
	}
,	count: params => {
		let searchObj = new search.Search(params)
		filter = searchObj.buildFilter(params.filter)
		return 	Person.count({
			where: filter
		})
	}
,	delete: idPerson => {
		if(_.isEmpty(idPerson)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return Person.update({
			active: false
		}, {
			where: {
				id: idPerson
			}
		})
	}
}
