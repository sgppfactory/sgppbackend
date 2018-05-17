model = require('./Model');

const Report =  model.dbsql.define('report',{
		id: { 
			type: model.cte.INTEGER
		, 	primaryKey: true
		, 	autoIncrement: true 
		}
	,	title : {
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
	,	idUser : {
			type: model.cte.INTEGER
		, 	allowNull: false
		,	validations : {
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
		,	validations : {
				isBoolean:{
					msg: "El campo activo debe ser 'true' o 'false'"
				}
			}
		}
	},{
		tableName: 'reports'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Report
	}
,	create :params => {
		return new Promise((resolve, reject) => {
			Report.create(params)
				.then((stage) => {
					resolve(stage)
				}).catch((err) => {
					reject(err)
				})
		})
	}
,	get: id => {
		return Report.findOne(id)
	}
,	findAll: params => {
		// filter:[{key:,value:,operator:}]
		// filter = {}
		// if(params.filters) {
		// 	filter.where = params.filters.map
		// }
		// return PorposalProject.findAll(filter)
		return Report.findAll()
	}
}
