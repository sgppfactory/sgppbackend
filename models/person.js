model = require('./Model');
_ = require('underscore');

const Person =  model.dbsql.define('person',{
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
	,	lastname : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				notEmpty:{
					msg: "El apellido es requerido"
				}
			,	len: {
					msg: "El apellido tiene un límite máximo de 100 caracteres"
				,	args : [0,100]
				}
			}
		}
	,	email : {
			type: model.cte.STRING
		, 	allowNull: false
		,	validations : {
				isEmail:{
					msg: "El campo email tiene formato incorrecto"
				}
			}
		}
	,	tel : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				isInt: {
					msg: "El teléfono fijo debe poseer 10 dígitos"
				,	args : { min: 1000000000, max: 9999999999 }
				}
			}
		}
	,	cel : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				isInt: {
					msg: "El número de celular debe poseer máximo 12 dígitos"
				,	args : { min: 1000000000, max: 999999999999 }
				}
			}
		}
	,	location : {
			type: model.cte.STRING
		, 	allowNull: true
		,	validations : {
				isJSON:{
					msg: "El formato de la locación es incorrecto, debe ser en coordenadas."
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
	},{
		tableName: 'person'
	,	timestamps: false
	}
)

module.exports = {
	getModel : () => {
		return Person
	}
,	create : params => {
		try {
			return Person.create(params)
		}catch(err) {
			console.log(err)
		}
	}
,	get: id => {
		return Person.findById(id)
	}
,	findAll: params => {
		// filter:[{key:,value:,operator:}]
		// console.log(params)
		filter = _buildFilter(params.filter)
		// console.log(filter)
		return Person.findAll({
			where: filter
		})
	}
,	count: params => {
		filter = _buildFilter(params.filter)
		return 	Person.count({
			where: filter
		})
	}
}

_buildFilter = filters => {
	filter = {}
	if(filters) {
		filters = _.map(filters, (valueToParse) => {
			return JSON.parse(valueToParse)
		})
		filter[model.Op.or] = _.filter(filters, (valueToSearch) => {
			return (_.isString(valueToSearch.operator_sup) 
				&& 	valueToSearch.operator_sup.trim().toLowerCase() == "or"
				&&	!_.isUndefined(valueToSearch.value) 
				&& 	valueToSearch.value !== "")
		})

		filter[model.Op.and] = _.filter(filters, (valueToSearch) => {
			return (_.isString(valueToSearch.operator_sup) 
				&& 	valueToSearch.operator_sup.trim().toLowerCase() == "and"
				&&	!_.isUndefined(valueToSearch.value) 
				&& 	valueToSearch.value !== "")
		})

		filter[model.Op.or] = _.map(filter[model.Op.or], (valueToSearch) => {
			var aux = {}
			if(_.isString(valueToSearch.operator) 
				&& 	valueToSearch.operator.trim().toLowerCase() == "like") {
				aux[valueToSearch.key] = {}
				aux[valueToSearch.key][model.Op.like] = '%' + valueToSearch.value + '%'
			} else {
				aux[valueToSearch.key] = valueToSearch.value
			}
			return aux
		})

		filter[model.Op.and] = _.map(filter[model.Op.and], (valueToSearch) => {
			var aux = {}
			if(_.isString(valueToSearch.operator) 
				&& 	valueToSearch.operator.trim().toLowerCase() == "like") {
				aux[valueToSearch.key] = {}
				aux[valueToSearch.key][model.Op.like] = '%' + valueToSearch.value + '%'
			} else {
				aux[valueToSearch.key] = valueToSearch.value
			}
			return aux
		})

		// console.log(filter)
		// if(_.isArray(filter[model.Op.and]) && filter[model.Op.and].length > 0 ) {
			
		// }
	}

	return filter
}
