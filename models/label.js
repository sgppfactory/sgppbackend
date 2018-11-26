const model = require('./Model');
const Stage = require('./stage');
// const Porpose = require('./porpose');
const redis = require("../lib/redis");
const search = require('../lib/search');
var redisDB = new redis(model.config.redis_connect);

const Label =  model.dbsql.define('label',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	name : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				notEmpty:{
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	active : {
			type: model.cte.BOOLEAN
		, 	allowNull: false
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "El campo activo debe ser 'true' o 'false'"
				}
			}
		}
	,	colour : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				len: {
					msg: "La definición del color tiene un límite máximo de 45 caracteres"
				,	args : [0,45]
				}
			}
		}
	,	idImplementation : {
			type: model.cte.INTEGER
		, 	field: 'id_implementation'
		, 	allowNull: false
		,	validations : {
				notEmpty:{
					msg: "La implementación es requerida"
				}
			}
		}
	},{
		tableName: 'label'
	,	timestamps: false
	}
)

// LabelPorpose = model.dbsql.define('label_porpose_project',{
// 	idLabel : {
// 		type: model.cte.INTEGER
// 	,	primaryKey: true
// 	, 	field: 'id_label'
// 	, 	allowNull: false
// 	,	validate: {
// 			isInt : {
// 				msg: "El campo de etiqueta es incorrecto"
// 			}
// 		}
// 	},
// 	idPorposeProject : {
// 		type: model.cte.INTEGER
// 	, 	field: 'id_porpose_project'
// 	,	primaryKey: true
// 	, 	allowNull: false
// 	,	validate: {
// 			isInt : {
// 				msg: "El campo de propuesta / proyecto es incorrecto"
// 			}
// 		}
// 	}
// }, {
// 	tableName: 'label_porpose_project'
// ,	timestamps: false
// })

module.exports = {
	getModel : () => {
		return Label
	}
,	create: (params, token) => {
		if (_.isEmpty(token) || _.isEmpty(params)) {
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
				params.idImplementation = impldata.id
				params.active = true

				return Label.create(params)
			})
	}
,	get: (id) => {
		return Label.findById(id)
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
				let filter = {"key": "idImplementation", "value": impldata.id, "operator_sup": "AND"}
				if (params.filter) {
					params.filter.push(filter)
				} else {
					params.filter = [filter]
				}
				
				let searchObj = new search.Search(params)
				tosearch = searchObj.getSearch(params)

				return Label.findAll(tosearch)
			})
	}
}
