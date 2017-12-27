
model = require('./Model');

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
// ,	create :(params) => {
// 		try {
// 			return Cicle.create(params)
// 		}catch(err) {
// 			console.log(err)
// 		}
// 	}
,	get: (id) => {
		return Rol.findOne(id)
	}
,	findAll: (params) => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Rol.findAll()
	}
}
