import Core from '../../core';
import User from '../../models/vans/vans';
import Request from '../../helpers/request';
import Time from '../../helpers/time';
import multer = require('multer');

import * as express from 'express';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as Law from '../../models/vans/law';

var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        let name = Date.now()+file.originalname;
        cb(null, name);
        if(file.originalname){
            req.body.filename = name;
        }
  }
})
 
var upload = multer({ storage: storage });

export default class vans {

    public static get routes(): express.Router {

        let vansRouter: express.Router = express.Router();

        let usersCollection = Core.app.get('mongoClient').get('users');
        let vansCollection = Core.app.get('mongoClient').get('vans');
        let dcCollection = Core.app.get('mongoClient').get('delivery_centers');

        vansRouter.route('/list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;

            await Request.get(
            '/vans-manager/get-vans-list',
            {  }, 
            ).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            
            res.status(200);
            res.render('vans_list',{output:respond});
		});

		vansRouter.route('/create')
		.get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            
            await dcCollection
                .find({ status : "1" })
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
                
			res.status(200);
			res.render('vans_creation',{dc:respond});
		})
		.post(upload.single('documents'), async (req: express.Request, res: express.Response) => {
            let make = req.body.make;
            let reg_no = req.body.reg_no;
            let type = req.body.type;
            let capacity = req.body.capacity;
			let provider = req.body.provider;
			let gps_tracking_id = req.body.gps_tracking_id;
            let documents = req.body.filename;
            let dc_uuid = req.body.dc_uuid;
            let dc_name = req.body.dc_name;
            let status = req.body.status;
            let color_code = req.body.color_code;

            let postValues = {
                make : make,
                reg_no : reg_no,
                type : type,
                capacity : capacity,
				provider : provider,
				gps_tracking_id : gps_tracking_id,
				documents : documents,
                dc_uuid : dc_uuid,
                dc_name : dc_name,
                color_code : color_code,
                status : status,
                created_on: Date.now(),
                updated_on: Date.now()
                
            }
			
            Request.post(
            '/vans-manager/create',
            {  }, 
            postValues
            ).then(response => {
                if(response.success == true){
                    res.status(200);
                    res.redirect('/vans/list');                    
                } else {
                    res.status(400);
                    res.render('vans_creation');
                }
            }).catch(error => {
                res.status(400);
                res.render('vans_creation');
			});
			
		});

		vansRouter.route('/:id/view')
		.get(async (req: express.Request, res: express.Response) => {
			let uuid = req.params.id;
            let users: any;
            
            Request.get(
            '/vans-manager/get-van-details',
            { uuid : uuid }, 
            ).then(response => {
                if(response.success) {
                res.status(200)
                .render('vans_details',{output:response.data});
                } else {
                res.status(200)
                .render('vans_details',{output:response.data});
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/vans/list');
			});
		});

		vansRouter.route('/:id/edit')
		.get(async (req: express.Request, res: express.Response) => {
			let uuid = req.params.id;
            let dcs: any;
            
            await dcCollection
                .find({ status : "1" })
                .then(document => {
                    res.status(200);
                    dcs = {
                        success: true,
                        message: "successfull",
                        data: document
			        };
                })
                .catch(error => {
                    res.status(500);
                    dcs = {
                        success: false,
                        message: error.message
                    };
                });

            Request.get(
            '/vans-manager/get-van-details',
            { uuid : uuid }, 
            ).then(response => {
                if(response.success) {
                res.status(200)
                .render('vans_edit',{dc:dcs,output:response.data});
                } else {
                res.status(200)
                .render('vans_edit',{dc:dcs,output:response.data});
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/vans/list');
			});
		})
        .post(upload.single('documents'), async (req: express.Request, res: express.Response) => {
            let uuid:string = req.params.id;
            let respond: any;
            let document_name: any;
            if(req.body.filename){
                document_name = req.body.filename;
            } else {
                document_name = req.body.documents;
            }
			let editVan = {
                make: req.body.make,
                reg_no: req.body.reg_no,
                type: req.body.type,
				capacity: req.body.capacity,
				provider: req.body.provider,
                documents : document_name,
                dc_uuid : req.body.dc_uuid,
                dc_name : req.body.dc_name,
                color_code : req.body.color_code,
                status : req.body.status,
                updated_on: Date.now()
            }
            
            Request.post(
                '/vans-manager/update',
                { uuid:uuid }, 
                editVan
                ).then(response => {
                    if(response.success == true){
                        res.status(200);
                        res.redirect('/vans/list');                    
                    } else {
                        res.status(400);
                        res.render('vans_edit',{output:editVan});
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                    res.status(400);
                    res.render('vans_edit',{output:editVan});
                });
        });
        
        return vansRouter;
    }

 
}

