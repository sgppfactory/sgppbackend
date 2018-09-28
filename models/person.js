_ = require('underscore');
const md5 = require('crypto-js/md5'); 
const nodemailer = require('nodemailer');
const model = require('./Model');
const user = require('./user');
const search = require('../lib/search');

var transporter = nodemailer.createTransport({
	service: 	'gmail',
	auth: 		model.config.mail_connect
})

var mailOptions = {
	from: 		model.config.mail_connect.from,
	subject: 	'Creación de usuario para SGPP'
}

var htmlBody = '<h3>Bienvenido/a al sistema de gestión de Presupuestos Participativos!</h3><p>A partir de ahora, puede ingresar al sistema con la siguiente credencial.</p><p><b>Usuario: {{username}}</b></p><p><b>Contraseña: {{pass}}</b></p><p>Recuerde que puede cambiar su contraseña una vez ingresado al sistema.</p><p>Ingrese a <a href="https://forkb.com.ar">forkb.com.ar</a></p>'

UserInstance = user.getModel();

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
		return model.dbsql.transaction((t) => {
			return Person
				.findOne({where: {email: params.email, active: 1}})
				.then((aPerson) => {
					if (aPerson) {
						throw "Ya existe una persona con el mismo email ingresado."
					} else {
						return Person.create({
								name: 		params.name
							,	lastname: 	params.lastname
							,	email: 		params.email
							,	tel: 		params.tel
							,	cel: 		params.cel
							,	location: 	params.location
							,	dateBirth: 	params.dateBirth
							}, {transaction: t}
						).then((resultPerson) => {
							if (params.withuser == 'true') {
								password = parseInt(Math.random() * Date.now()).toString()
								return UserInstance.create({
										username: params.email
									,	password: md5(password).toString()
									,	idRol: params.rol
									,	firstLogin: false
									,	idPerson: resultPerson.get('id')
									}, {transaction: t}
								).then((resultUser) => {
									return transporter.sendMail(
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
											if (error) {
												throw "No se pudo enviar el mail";
											} else {
												return resultPerson
											}
										}
									)
								}).catch((err) => {
									t.rollback()
									return err
								})
							} 

							return resultPerson
						})
					}
				}).catch((err) => {
					return err
				})
		}).then((result) => {
			return result
		}).catch((err) => {
			return err
		})
	}
,	get: idPerson => {
		if(_.isEmpty(idPerson)) {
			return Promise((resolve, reject) => {
				reject("Error de parámetros")
			})
		}

		return Person
			.findOne({
				attributes: ['id', 'name', 'lastname', 'email', 'tel', 'cel', 'location', 'dateBirth'], 
				where: { id: idPerson, active: true }
			}).then((resultPerson) => {
				return 	resultPerson
						?	UserInstance
								.findOne({
									attributes: ['username', 'idRol'],
									where: {idPerson: idPerson, active: true}
								}).then((resultUser) => {
									return 	resultUser 
											? 	_.extend(
													resultPerson.dataValues
												, 	resultUser.dataValues
												)
											: 	resultPerson.dataValues
								})
						: 	null
			})
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

module.exports.Person = Person
