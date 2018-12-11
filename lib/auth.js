const jwt = require('jsonwebtoken'); //jsonwebtoken import
const config = require('./config');
// const fs = require('fs'); //filesystem

Auth = {
	generateToken: function(toSign) {
		return jwt.sign(
			{ id: toSign.id, username: toSign.username }
		, 	config.TOKEN_SECRET
		,	{ expiresIn: config.TTL, issuer: 'SGPP_Systems'}
		);
	}
,	getPayload: function(token) {
		return jwt.decode(token, config.TOKEN_SECRET);
	}
,	ensureAuthenticated: function(req, res, next) {
		if(!req.headers.authorization) {
			res.statusCode = 403
			res.json({message: "Tu petición no tiene cabecera de autorización"});
		}
		try {
			var token = req.headers.authorization.split(" ");
			var payload = jwt.verify(token[1], config.TOKEN_SECRET);
			
			if(!payload) {
				res.statusCode = 401
				res.json({message: "Tu petición no presenta un token correcto"});	
			}

			var timeInMs = Math.floor(Date.now() / 1000);

			if(payload.exp <= timeInMs) {
				res.statusCode = 401
				res.json({message: "El token ha expirado"});
			}
			req.payload = payload;
			req.token = token[1];
			// console.log(token,payload)
		} catch(err) {
			//Se puede registrar los intentos de acceso de jwt defectuosos
			console.log("Error verificando el jwt...")
			res.statusCode = 401
			res.json({message: "Error al validar el token"});
		}
		next();
	}
}

module.exports = Auth
