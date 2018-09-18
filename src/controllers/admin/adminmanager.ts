import { tokenSecret } from '../../config/app';
import { environments } from '../../config/app';

import Core from '../../core';
import Request from '../../helpers/request';
import Time from '../../helpers/time';
import Users from '../../models/users/users';

import * as express from 'express';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as passport from 'passport';
import * as session from 'express-session';
import * as Law from '../../models/users/law';

var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');


export default class Admin {

    public static get routes(): express.Router {

        let AdminManagerRouter: express.Router = express.Router();

        let UsersCollection = Core.app.get('mongoClient').get('users');

        AdminManagerRouter.route('/get-users-list')
        .get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            
            await UsersCollection
                .find()
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
        })
        .post(async (req: express.Request, res: express.Response) => {
     
            
        });

        AdminManagerRouter.route('/get-user-details')
        .get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.query.uuid;

            await UsersCollection
                .findOne({uuid:uuid})
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "successfull",
                        data: document
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
        })
        .post(async (req: express.Request, res: express.Response) => {
     
        });

        AdminManagerRouter.route('/user-create')
        .post(async (req: express.Request, res: express.Response) => {
    		let respond: any;

			let registerDetailsData: Law.userCreate = req.body;
			let newUsers: Users = Users.usersCreate(registerDetailsData);

			await UsersCollection
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
        
        AdminManagerRouter.route('/user-update')
        .get(async (req: express.Request, res: express.Response) => {

        })
        .post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            await UsersCollection
                .update({ uuid: uuid },{$set:updateDocument})
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "User information updated Successfully"
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

        AdminManagerRouter.route('/user-delete')
        .get(async (req: express.Request, res: express.Response) => {

        })
        .post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.body.uuid;

            await UsersCollection
                .remove({ uuid: uuid })
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "User deleted successfully"
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

        return AdminManagerRouter;

    }
 
}

