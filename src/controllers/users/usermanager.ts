import { environments } from '../../config/app';

import Core from '../../core';
import * as express from 'express';
import * as Law from '../../models/users/law';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as passport from 'passport';
import * as path from 'path';
import Users from '../../models/users/users';
//import Identificaton from '../../helpers/identification';
//import Email from '../../helpers/email';
import Time from '../../helpers/time';

var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

export default class UserDetailsController {

	public static get routes(): express.Router {

		let UserDetailRouter: express.Router = express.Router();

		let usersCollection = Core.app.get('mongoClient').get('users');

		UserDetailRouter.route('/login-authentication')
		.post(async (req: express.Request, res: express.Response) => {

			let respond: any;
			
			let username = req.body.username;
			let password = req.body.password;

			await usersCollection
				.find({ $or: [{ username: username }, { email: username }] })
				.then(document => {
					if(document.length > 0){

						let hash = (document[0]['password'] == "" ? bcrypt.hashSync('not a password', bcrypt.genSaltSync(10), null) : document[0]['password']);
						if (bcrypt.compareSync(password, hash)) {
							console.log('bcrypt SUCCESS');
							req.session.regenerate(function(err) {
								// will have a new session here
							  });
							req.session.user = document[0];
							return res.status(200).json({
								success: true,
								message: "Login Successfull",
								data: document[0]
							});
						} else {
							return res.status(200)
								.json({
									success: false,
									message: "Invalid Credentials"
								});
						}

					} else {
						return res.status(200)
						.json({
							success: false,
							message: "Invalid Credentials"
						});
					}
										
				})
				.catch(error => {
					return res.status(400)
						.json({
							success: false,
							message: error.message
						});
				});

		});

		UserDetailRouter.route('/user-register')
		.post(async (req: express.Request, res: express.Response) => {
			
			let respond: any;

			let registerDetailsData: Law.userCreate = req.body;
			let newUsers: Users = Users.usersCreate(registerDetailsData);

			await usersCollection
				.insert(newUsers.document)
				.then(document => {
					res.status(200);
					respond = {
						success: true,
						message: 'New user is created'
					};
				})
				.catch(error => {
					res.status(500);
					respond = {
						success: false,
						message: error.message
					};
				});

			res.json(respond);

		});

		return UserDetailRouter;
	}

}