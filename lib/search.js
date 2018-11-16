_ = require('underscore')

function Search(params){
	this.data = params

	this.withActive = true

	this.parseValue = valueToSearch  => {
		var aux = {}
		if(_.isString(valueToSearch.operator) 
			&& 	valueToSearch.operator.trim().toLowerCase() == "like") {
			aux[valueToSearch.key] = {}
			aux[valueToSearch.key][model.Op.like] = '%' + valueToSearch.value + '%'
		} else if(_.isString(valueToSearch.operator) 
			&& 	valueToSearch.operator.trim().toLowerCase() == "is"
			&& 	valueToSearch.value.trim().toLowerCase() == "null" ) {
			aux[valueToSearch.key] = {}
			aux[valueToSearch.key][model.Op.eq] = null
		} else {
			aux[valueToSearch.key] = valueToSearch.value
		}
		return aux
	}

	this.buildFilter = filters => {
		if(this.withActive) {
			if(_.isEmpty(filters)) {
				filters = [{key: 'active', value: true}]
			} else {
				filters = _.union([{key: 'active', value: true, operator_sup: 'and'}], filters)
			}
		}
		filter = {}
		if(filters) {
			filters = _.map(filters, (valueToParse) => {
				try {
					jsAux = JSON.parse(valueToParse)
				} catch (e) {
					jsAux = valueToParse
				}

				if(_.isUndefined(jsAux.operator_sup)) {
					jsAux.operator_sup = "and"
				}

				return jsAux
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

			filter[model.Op.or] = _.map(filter[model.Op.or], this.parseValue)

			filter[model.Op.and] = _.map(filter[model.Op.and], this.parseValue)

			if(_.isEmpty(filter[model.Op.or])) {
				delete filter[model.Op.or]
			}

			if(_.isEmpty(filter[model.Op.and])) {
				delete filter[model.Op.and]
			}
		}
		return filter
	}

	this.getLimit = (bypage) => {
		return 	!_.isUndefined(bypage) && bypage > 0
				?	parseInt(bypage)
				: 	15
	}

	this.getOffset = (bypage, page) => {
		return 	!_.isUndefined(bypage) && !_.isUndefined(page) && bypage > 0 && page > 1 
				? 	(page - 1) * bypage 
				: 	0
	}

	this.getOrder = (orderby, criteria) => {
		crit = _.isString(criteria) 
			? 	criteria.trim().toUpperCase() 
			: 	'ASC'

		ord = _.isString(orderby)
			? 	orderby
			: 	'id'
		return 	crit == 'ASC' || crit == 'DESC' 
				?	[[ord, crit]]
				: 	[] 
	}

	this.getSearch = (params) => {
		// TODO: AGREGAR VALIDACIONES CON LOS CAMPOS
		filter 	= this.buildFilter(params.filter)
		limit 	= this.getLimit(params.bypage)
		offset 	= this.getOffset(limit, params.page)
		order 	= this.getOrder(params.orderby, params.criteria)

		return {
			where: filter
		,	limit: limit
		,	offset: offset
		,	order: order
		}
	}
}
module.exports = {
	Search: Search
};