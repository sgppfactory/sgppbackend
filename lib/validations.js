const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar

Helpers = {
	validations : (attributes, params) => {
		arrayResponse = _.map(attributes, (value, key, object)=>{
			if(key in params) {
				if(value.require) {
					if(_.isEmpty(params[key])) {
						val = false
						msg = Helpers.getMessage('')
					} else if(_.isString(value.validation)){
						val = _[value.validation](params[key])
						msg = val ? false : Helpers.getMessage()
					} else {
						val = true
						msg = ''
					}
				} else {
					if(_.isEmpty(params[key])) {
						val = true
						msg = ''
					} else if(_.isString(value.validation)){
						val = _[value.validation](params[key])
						msg = val ? false : Helpers.getMessage()
					}
				}
			} else if(value.require) {
				val = false
				msg = Helpers.getMessage('')
			}

			return {attr: key, validation: val, msg: msg}
		})

		arrayResponse = _.filter(arrayResponse,(value)=>{
			return value.validation == false
		})

		return arrayResponse
	} 
,	getMessage: (functionV) => {
		switch (functionV) {
			case 'isString':
				msg = 'debe ser un texto'
				break;
			case 'isNumber':
				msg = 'debe ser un número'
				break;
			case 'isNumber':
				msg = 'debe ser un número'
				break;
			default:
				msg = 'es requerido'
		}

		return msg
	}
,	buildInsertQuery: (table, params, values) => {



		return 'INSERT INTO ' + table + ' VALUES (' + params + ')'
	}
}

module.exports = Helpers