// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);

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
		type: model.cte.INTEGER
	, 	allowNull: true
	,	validations : {
			isBoolean:{
				msg: "Debe ser un valor entero"
			}
		}
	}
,	url : {
		type: model.cte.STRING
	, 	allowNull: true
	,	validations : {
			isBoolean:{
				msg: "Debe ser un valor entero"
			}
		}
	}
},{
	tableName: 'action'
,	timestamps: false
,	updatedAt : false
,	createdAt : false
}
)

module.exports = {
	getModel : () => {
		return Action
	}
,	findMenu: (token) => {
		return redisDB.hget('auth:'+token, "actions")
	}
}

module.exports.Action = Action