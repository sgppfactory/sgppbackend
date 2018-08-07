
Result = {
	getMsgSeq: function(err) {
		return _.isArray(err.errors) 
			? 	_.map(err.errors, (errmsg) => {
					return {message: errmsg.message, field: errmsg.path}
				})
			: 	err
	}
}

module.exports = Result
