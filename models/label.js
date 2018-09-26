const model = require('./Model');
const Stage = require('./stage');
const Porpose = require('./porpose');

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
					msg: "El nombre tiene un límite máximo de 45 caracteres"
				,	args : [0,45]
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
,	create :(params) => {
		try {
			return Label.create(params)
		}catch(err) {
			console.log(err)
		}
	}
,	get: (id) => {
		return Label.findOne(id)
	}
,	findAll: (params) => {
		return Label.findAll()
	}
}
