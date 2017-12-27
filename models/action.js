// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
model = require('./Model');

const Action =  model.dbsql.define('action',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	name : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				notNull:{
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	label : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				notNull:{
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	menu : {
			type: model.cte.BOOLEAN
		, 	allowNull: true
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "Debe ser un valor booleano"
				}
			}
		}
	,	level : {
			type: model.cte.BOOLEAN
		, 	allowNull: true
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "Debe ser un valor booleano"
				}
			}
		}
	,	url : {
			type: model.cte.BOOLEAN
		, 	allowNull: true
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "Debe ser un valor booleano"
				}
			}
		}
	}
)

module.exports = {
	getModel : () => {
		return Action
	}
// ,	create :(params) => {
// 		try {
// 			return Cicle.create(params)
// 		}catch(err) {
// 			console.log(err)
// 		}
// 	}
,	get: (id) => {
		return Action.findOne(id)
	}
,	findAll: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Action.findAll()
	}
}