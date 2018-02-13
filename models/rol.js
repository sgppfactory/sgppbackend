const model = require('./Model');
const redis = require("../lib/redis"); //Manipulador de la conexión de la BD
var redisDB = new redis(model.config.redis_connect);

const Rol =  model.dbsql.define('rol',{
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
	,	idImplementation : {
			type: model.cte.INTEGER
		, 	field: 'id_implementation'
		, 	allowNull: false
		,	validations : {
				isInteger:{
					msg: "Debe ser un valor entero"
				}
			}
		}
	},{
		tableName: 'rol'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Rol
	}
,	get: token => {
		return new Promise((resolve,reject)=>{
			redisDB
				.hget('auth:'+token, 'implementation')
				.then((implData,err) => {
					console.log(implData)
					implData = JSON.parse(implData)
					if(err) return reject(err)
					if(_.isEmpty(implData)) {
						reject("Error al recuperar información de la sesión")
					}
					Rol.findAll({
						attributes: ['id', 'name']
					,	where: {
							idImplementation: implData.id
						}
					}).then((resultData) => {
						resultData = _.map(
							resultData
						,	function(rol) {
								return rol.dataValues
							}
						)
						console.log(resultData)
						resolve(resultData)
					}, 	(errRol) => {
						reject(errRol)
					})
				});
		});
	}
}
