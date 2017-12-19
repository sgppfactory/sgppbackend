// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
model = require('./Model');

const Cicle =  model.dbsql.define('cicle',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	date : {
			type: model.cte.STRING
		, 	allowNull: true
		}
	,	currency : {
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
		return Cicle
	}
,	create :(params) => {
		try {
			return Cicle.create(params)
		}catch(err) {
			console.log(err)
		}
	}
,	get: (id) => {
		return Cicle.findOne(id)
	}
,	search: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Cicle.findAll()
	}
}
