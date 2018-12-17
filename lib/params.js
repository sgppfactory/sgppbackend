
module.exports = {
	purge: function(params) {
		return _.isObject(params) 
			? 	_.mapObject(_.clone(params), (val, key) => {
					return 	_.isEmpty(val) 
							? 	null 
							: 	(val == 'true' 
								? 	true 
								: 	(val == 'false'
									?	false 
									: 	val))
				})
			: 	{}
	}
}
