import { environments } from '../../config/app';

import Core from '../../core';
import VANS from '../../models/vans/vans';
import Time from '../../helpers/time';

import * as express from 'express';
import * as Law from '../../models/vans/law';
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

export default class VansDetailsController {

	public static get routes(): express.Router {

		let vansDetailRouter: express.Router = express.Router();

		let vansCollection = Core.app.get('mongoClient').get('vans');

        vansDetailRouter.route('/get-vans-list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
            
            await vansCollection
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
            let respond: any;
            let postBody = req.body;
            
            await vansCollection
                .find(postBody)
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

        });

		vansDetailRouter.route('/create')
		.post(async (req: express.Request, res: express.Response) => {
			let respond: any;

			let registerDetailsData: Law.createVan = req.body;
			let newVan: VANS = VANS.createvan(registerDetailsData);
			
			await vansCollection
				.insert(newVan.document)
				.then(document => {
					res.status(200);
					respond = {
						success: true,
						message: 'New van is created'
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

		vansDetailRouter.route('/update')
		.post(async (req: express.Request, res: express.Response) => {
			let respond: any;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            await vansCollection
                .update({ uuid: uuid },{$set:updateDocument})
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "Vans information updated Successfully"
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


        vansDetailRouter.route('/get-van-details')
        .get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.query.uuid;

            await vansCollection
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
        });
 

        vansDetailRouter.route('/van-delete')
        .get(async (req: express.Request, res: express.Response) => {

        })
        .post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.body.uuid;

            await vansCollection
                .remove({ uuid: uuid })
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "Van deleted successfully"
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

		return vansDetailRouter;
	}

}