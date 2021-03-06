model = require('./Model');
const search = require('../lib/search');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const Porpose = require("./porpose"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);
var paramsLib = require('../lib/params');

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
	,	createdAt: 'created_at'
	,	updatedAt: 'updated_at'
	}
)

function generateQuery (impldata, params) {
	var query = 'SELECT COUNT(pp.id) AS cant '
	var from = 'FROM porpose_project pp'
	var join = 'INNER JOIN node n ON pp.id_node = n.id '
	var where = 'WHERE n.id_implementation = ' + impldata.id + ' AND pp.active = 1 '
	var group = 'GROUP BY '

	if (params.projects && !params.porposes) {
		where += 'AND pp.type = 2'
	} else if (params.porposes && !params.projects) {
		where += 'AND pp.type = 1'
	} else if(!params.porposes && !params.projects) {
		throw 'Debe seleccionar un tipo de reporte'
	}

	if (params.subcategory == 1 || params.subcategory == 2) { // Por etiquetas o categorías
		query += ', l.name AS labelName'
		group += 'l.id'
		if (params.subcategory == 2) { // Por etiquetas o categorías X nodo
			query += ', n.name AS labelSubName'
			group += ', n.id'
		}
		join += 'INNER JOIN label_porpose_project lpp ON pp.id = lpp.id_porpose_project INNER JOIN label l ON lpp.id_label = l.id'
	} else if (params.subcategory == 3) { // Por avances
		query += ', pp.state AS labelName'
		group += 'pp.state'
	} else if (params.subcategory == 4) { // Por nodo / estructura
		query += ', n.name AS labelName'
		group += 'n.id'
	} else {
		throw 'Debe seleccionar un subtipo de segregación'
	}

	if (params.cicle > 0) { // Ciclos en particular
		where += 'AND id_cicle = ' + params.cicle
	}// else: Todos los ciclos (Sin filtro)

	return query + ' ' + from + ' ' + join + ' ' + where + ' ' + group
}

module.exports = {
	getModel: () => {
		return Report
	}
,	create: (params, token) => {
		return redisDB
			.hgetall('auth:' + token)
			.then(sessionData => {
				if (!sessionData.implementation) {
					throw "Error al obtener datos de sesión"
				}

				let impldata = JSON.parse(sessionData.implementation)
				let userdata = JSON.parse(sessionData.userdata)
				var queryParams = JSON.parse(params.query)

				params.query.sql = generateQuery(impldata, queryParams)

				return Report.create(_.extend(
					params,
					{active: true, idUser: userdata.id, idImplementation: impldata.id}
				))
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
				return Report.findOne({where: {id: id, active: true, idImplementation: impldata.id}})
			})
	}
,	remove: (id, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				return Report.update(
					{active: false},
					{where: {id: id, active: true, idImplementation: impldata.id}}
				)
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
				if (!params.filter) {
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
		params = paramsLib.purge(params)
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				var query = generateQuery(impldata, params)
				return model.dbsql.query(query, {type: model.dbsql.QueryTypes.SELECT })
					.then(results => {
						return results
					})
			})
	}
}
