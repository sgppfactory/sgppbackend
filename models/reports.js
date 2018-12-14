model = require('./Model');
const search = require('../lib/search');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const Porpose = require("./porpose"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);

const Report =  model.dbsql.define('report',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	title : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations: {
				notEmpty:{
					msg: "El nombre es requerido"
				}
			,	len: {
					msg: "El nombre tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	idUser : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_user'
		,	validations: {
				isInt:{
					msg: "Debe ser un valor entero"
				}
			}
		}
	,	query : {
			type: model.cte.TEXT
		, 	allowNull: false
		}
	,	active : {
			type: model.cte.BOOLEAN
		, 	allowNull: false
		, 	defaultValue: true
		,	validations: {
				isBoolean:{
					msg: "El campo activo debe ser 'true' o 'false'"
				}
			}
		}
	,	idImplementation : {
			type: model.cte.INTEGER
		, 	allowNull: false
		, 	field: 'id_implementation'
		,	validations: {
				notEmpty:{
					msg: "La implementación es requerida"
				}
			,	isInt:{
					msg: "Debe ser un valor entero"
				}
			}
		}
	},{
		tableName: 'reports'
	,	timestamps: true
	}
)

module.exports = {
	getModel: () => {
		return Report
	}
,	create: (params, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				return Report.create(_.extend(params, {idImplementation: impldata.id}))
			})
	}
,	get: (id, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				return redisReport.findOne({where: {id: id, active: true}})
			})
	}
,	findAll: (params, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				if (params.filter) {
					params.filter = []
				}
				params.filter.push({
					value: impldata.id, 
					key: "id_implementation", 
					operator: "=", 
					operator_sup: "AND"
				})
				let searchObj = new search.Search(params)
				tosearch = searchObj.getSearch(params)
				return Report.findAll(tosearch)
			})
	}
,	count: (params, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				let searchObj = new search.Search(params)
				if (params.filter) {
					params.filter = []
				}
				params.filter.push({
					value: impldata.id, 
					key: "id_implementation", 
					operator: "=", 
					operator_sup: "AND"
				})
				filter = searchObj.buildFilter(params.filter)
				return 	Report.count({
					where: filter
				})
			})
	}
,	generate: (params, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				console.log(params)
				if (params.porpose) {
					return Porpose.findAll()
				}
				if (params.project) {
					return Porpose.findAll()	
				}
			})
	}
}
