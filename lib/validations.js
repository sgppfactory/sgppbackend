const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar

Helpers = {
	validations : (attributes, params) => {
		arrayResponse = _.pick(	attributes, (value, key, object)=>{
			if(key in params) {
				if(value.require) {
					return  _.isString(value.validation)
							?	 _[value.validation](params[key])
							: 	!_.isEmpty(params[key]);
				} else {
					return  !_.isEmpty(params[key])
							?	(_.isString(value.validation)
								?	_[value.validation](params[key])
								: 	true)
							: 	true;
				}
			}
			return false
		})

		return arrayResponse
	}
}
// Helpers.prototype.generateQuery = () => {
	
// }

module.exports = Helpers