const model = require('./Model');
const Auth = require('./auth');
// const Rol = require('./rol');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);

const Implementation =  model.dbsql.define('implementation',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	logo : {
			type: model.cte.STRING
		, 	allowNull: true
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
	,	description : {
			type: model.cte.TEXT
		, 	allowNull: true
		}
	,	active : {
			type: model.cte.BOOLEAN
		, 	allowNull: true
		, 	defaultValue: true
		,	validations : {
				isBoolean:{
					msg: "Debe ser un valor booleano"
				}
			}
		}
	},{
		tableName: 'implementation'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Implementation
	}
,	create: params => {
		try {
			return Implementation.create(params)
		}catch(err) {
			return new Promise((resolve, reject)=>{
				reject(err)
			})
		}
	}
,	get: id => {
		return Implementation.find({
			attributes: ['id', 'logo', 'name', 'description']
		,	where: {
				[model.Op.and]: [{id: id}, {active: true}]
			}
		})
	}
,	getByUser: token => {
		return new Promise((resolve,reject)=>{
			redisDB
				.hget('auth:'+token, 'implementation')
				.then((result,err) => {
					if(err) return reject(err)
					resolve(result)
				});
		});
	}
,	findBy: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Implementation.findAll()
	}
}
