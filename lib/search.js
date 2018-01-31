_ = require('underscore')

function Search(params){
	this.data = params

	this.buildFilter = filters => {
		filter = {}
		if(filters) {
			filters = _.map(filters, (valueToParse) => {
				return JSON.parse(valueToParse)
			})
			console.log("filter",filters)
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
		}

		return filter
	}

	this.getLimit = (bypage) => {
		return 	!_.isUndefined(bypage) && bypage > 0
				?	bypage
				: 	15
	}

	this.getOffset = (bypage, page) => {
		return 	!_.isUndefined(bypage) && !_.isUndefined(page) && bypage > 0 && page > 0 
				? 	page * (bypage - 1) 
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
				?	[orderby, crit]
				: 	[] 
	}

	this.getSearch = (params) => {
		// TODO: AGREGAR VALIDACIONES CON LOS CAMPOS
		filter 	= this.buildFilter(params.filter)
		limit 	= this.getLimit(params.bypage)
		offset 	= this.getOffset(params.bypage, params.page)
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