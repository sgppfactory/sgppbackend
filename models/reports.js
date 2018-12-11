model = require('./Model');
const search = require('../lib/search');

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
		, 	field: 'id_user'
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
		return Report.create(params)
			.then((stage) => {
				resolve(stage)
			}).catch((err) => {
				reject(err)
			})
	}
,	get: id => {
		return Report.findOne(id)
	}
,	findAll: params => {
		let searchObj = new search.Search(params)
		tosearch = searchObj.getSearch(params)
		return Report.findAll(tosearch)
	}
,	count: params => {
		let searchObj = new search.Search(params)
		filter = searchObj.buildFilter(params.filter)
		return 	Report.count({
			where: filter
		})
	}
}
