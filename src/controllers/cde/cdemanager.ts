import { environments } from '../../config/app';

import Core from '../../core';
import CDE from '../../models/cde/cde';
import Time from '../../helpers/time';

import * as express from 'express';
import * as Law from '../../models/cde/law';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as passport from 'passport';
import * as path from 'path';

var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

export default class CDEDetailsController {

	public static get routes(): express.Router {

		let CDEDetailRouter: express.Router = express.Router();

		let usersCollection = Core.app.get('mongoClient').get('users');

        CDEDetailRouter.route('/get-cde-list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
            
            await usersCollection
                .find({ roles: { $in: ["3"] } })
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "successfull",
                        data: document,
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

		CDEDetailRouter.route('/create')
		.post(async (req: express.Request, res: express.Response) => {
			let respond: any;

			let registerDetailsData: Law.createCDE = req.body;
			let newUsers: CDE = CDE.createCDE(registerDetailsData);
			
			await usersCollection
				.insert(newUsers.document)
				.then(document => {
					res.status(200);
					respond = {
						success: true,
						message: 'New cde is created'
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

		CDEDetailRouter.route('/update')
		.post(async (req: express.Request, res: express.Response) => {
			let respond: any;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            await usersCollection
                .update({ uuid: uuid },{$set:updateDocument})
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "CDE information updated Successfully"
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
        
		return CDEDetailRouter;
	}

}