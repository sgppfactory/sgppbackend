model = require('./Model');
const search = require('../lib/search');
const user = require('./auth');
const md5 = require('crypto-js/md5'); 
_ = require('underscore');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'franco.soto.z@gmail.com',
		pass: 'simco2016cotiave'
	}
})

var mailOptions = {
	from: 'franco.soto.z@gmail.com',
	subject: 'Creación de usuario para SGPP'
}

var htmlBody = '<h3>Bienvenidos al sistema de gestión de Presupuestos Participativos</h3><p>A partir de ahora, puede ingresar al sistema con la siguiente credencial.</p><p><b>Usuario: {{username}}</b></p><p><b>Contraseña: {{pass}}</b></p><p>Recuerde que puede cambiar su contraseña una vez ingresado al sistema.</p>'

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
	,	dateBirth : {
			type: model.cte.DATE
		, 	field: 'date_birth' 
		, 	allowNull: true
		,	validations : {
				isDate:{
					msg: "El formato de la fecha de nacimiento debe ser dd/mm/yyyy"
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
	,	createdAt: 'created_at'
	,	updatedAt: false
	}
)

module.exports = {
	getModel : () => {
		return Person
	}
,	create : params => {
		return Promise((resolve, reject) => {
			Person.create(params)
				.then((result) => {
					console.log(result)
					if (params.withuser) {
						password = Math.random() * Date.now()
						user.getModel().create({
							username: params.email
						,	password: md5(password).toString()
						,	idRol: params.rol
						,	firstLogin: false
						,	idPerson: result.person
						}).then((result) => {
							transporter.sendMail(
								_.extend(
									mailOptions
								,	{
										html: htmlBody
											.replace("{{username}}", params.email)
											.replace("{{pass}}", password)
									,	to: params.email
									}
								)
							,	(error, info) => {
									if(error) {
										resolve(result)
									} else {
										reject(error)
									}
								}
							)
						}, (err) => {
							reject(err)
						})
					} else {
						resolve(result)
					}
				}, (err) => {
					reject(err)
				})
		})
	}
,	get: id => {
		return Person.findById(id)
	}
,	findAll: params => {
		let searchObj = new search.Search(params)
		tosearch = searchObj.getSearch(params)
		return Person.findAll(tosearch)
	}
,	count: params => {
		let searchObj = new search.Search(params)
		filter = searchObj.buildFilter(params.filter)
		return 	Person.count({
			where: filter
		})
	}
,	delete: idPerson => {
		if(_.isEmpty(idPerson)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return Person.update({
			active: false
		}, {
			where: {
				id: idPerson
			}
		})
	}
}
