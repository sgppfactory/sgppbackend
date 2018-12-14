model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);

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
	,	idImplementation : {
			type: model.cte.INTEGER
		, 	field: 'id_implementation'
		, 	allowNull: false
		,	validations : {
				isInt:{
					msg: "El campo de implemementación es incorrecto"
				}
			}
		}
	}, {
		tableName: 'cicle'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Cicle
	}
,	create: params => {
		return Cicle.create(params)
	}
,	get: id => {
		return Cicle.findById(id)
	}
,	getCurrencyByImplementation: idImpl => {
		return Cicle.findOne({
			where: {
				idImplementation: idImpl
			,	currency: true
			}
		})
	}
,	search: (params, token) => {
		return redisDB
			.hget('auth:'+token, 'implementation')
			.then(impldata => {	
				if (!impldata) {
					throw "Error al obtener datos de sesión"
				}
				impldata = JSON.parse(impldata)
				return Cicle.findAll({where: {idImplementation: impldata.id}})
			})
	}
}
