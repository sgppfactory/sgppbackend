const model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
const Node = require('./node');
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
				.then((result, err) => {
					if(err) return reject(err)
					resolve(result)
				});
		});
	}
,	findBy: params => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Implementation.findAll()
	}
,	structures: token => {
		return new Promise((resolve, reject) => {
			redisDB
				.hget('auth:'+token, 'implementation')
				.then((result, err) => {
					if(err) reject(err)

					result = JSON.parse(result)

					Node.getModel().findAll({
						attributes: ['id', 'id_parent_node', 'name', 'description', 'amount']
					,	where: {
							[model.Op.and]: [{id_implementation: result.id}, {active: true}]
						}
					}).then((result, err) => {
						console.log(result)
						if(err) reject(err)
						resolve(result)
					})
				})
		})
	}
}
