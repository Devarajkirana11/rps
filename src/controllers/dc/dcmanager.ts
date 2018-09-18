import { environments } from '../../config/app';

import Core from '../../core';
import DC from '../../models/dc/dc';
import Time from '../../helpers/time';

import * as express from 'express';
import * as Law from '../../models/dc/law';
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

export default class DcDetailsController {

	public static get routes(): express.Router {

		let dcDetailRouter: express.Router = express.Router();

		let dcCollection = Core.app.get('mongoClient').get('delivery_centers');

        dcDetailRouter.route('/get-dc-list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
            
            await dcCollection
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
		});

		dcDetailRouter.route('/create')
		.post(async (req: express.Request, res: express.Response) => {
			let respond: any;

            let registerDetailsData: Law.createDC = req.body;
			let newDC: DC = DC.createdc(registerDetailsData);

            await dcCollection
				.insert(newDC.document)
				.then(document => {
					res.status(200);
					respond = {
						success: true,
						message: 'New dc is created'
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

		dcDetailRouter.route('/update')
		.post(async (req: express.Request, res: express.Response) => {
			let respond: any;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            await dcCollection
                .update({ uuid: uuid },{$set:updateDocument})
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "dc information updated Successfully"
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


        dcDetailRouter.route('/get-dc-details')
        .get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.query.uuid;

            await dcCollection
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
 

        dcDetailRouter.route('/dc-delete')
        .get(async (req: express.Request, res: express.Response) => {

        })
        .post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let uuid = req.body.uuid;

            await dcCollection
                .remove({ uuid: uuid })
                .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "dc deleted successfully"
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

		return dcDetailRouter;
	}

}