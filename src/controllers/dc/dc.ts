import Core from '../../core';
import Request from '../../helpers/request';
import Time from '../../helpers/time';

import * as express from 'express';
import * as mongodb from 'mongodb';
import * as assert from 'assert';

var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

export default class dc {

    public static get routes(): express.Router {

        let dcRouter: express.Router = express.Router();

        dcRouter.route('/list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;

            await Request.get(
            '/dc-manager/get-dc-list',
            {  }, 
            ).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            
            res.status(200);
            res.render('dc_list',{output:respond});
		});

		dcRouter.route('/create')
		.get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            
			res.status(200);
			res.render('dc_creation',{users:respond});
		})
		.post(async (req: express.Request, res: express.Response) => {
            let name = req.body.name;
            let address_1 = req.body.address_1;
            let address_2 = req.body.address_2;
            let area = req.body.area;
			let city = req.body.city;
            let state = req.body.state;
            let pincode = req.body.pincode;
            let latitude = req.body.latitude;
            let longitude = req.body.longitude;
            let status = req.body.status;
            
            let postValues = {
                name : name,
                address_1 : address_1,
                address_2 : address_2,
                area : area,
				city : city,
                state : state,
                pincode : pincode,
				latitude : latitude,
				longitude : longitude,
                status : status,
                created_on: Date.now(),
                updated_on: Date.now()
            }
			
            Request.post(
            '/dc-manager/create',
            {  }, 
            postValues
            ).then(response => {
                if(response.success == true){
                    res.status(200);
                    res.redirect('/dc/list');                    
                } else {
                    res.status(400);
                    res.render('dc_creation');
                }
            }).catch(error => {
                res.status(400);
                res.render('dc_creation');
			});
			
		});

		dcRouter.route('/:id/view')
		.get(async (req: express.Request, res: express.Response) => {
			let uuid = req.params.id;
            let users: any;
            
            Request.get(
            '/dc-manager/get-dc-details',
            { uuid : uuid }, 
            ).then(response => {
                if(response.success) {
                res.status(200)
                .render('dc_details',{output:response.data});
                } else {
                res.status(200)
                .render('dc_details',{output:response.data});
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/vans/list');
			});
		});

		dcRouter.route('/:id/edit')
		.get(async (req: express.Request, res: express.Response) => {
			let uuid = req.params.id;
            let users: any;
            
            Request.get(
            '/dc-manager/get-dc-details',
            { uuid : uuid }, 
            ).then(response => {
                if(response.success) {
                res.status(200)
                .render('dc_edit',{output:response.data});
                } else {
                res.status(200)
                .render('dc_edit',{output:response.data});
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/dc/list');
			});
		})
        .post(async (req: express.Request, res: express.Response) => {
            let uuid:string = req.params.id;
            let respond: any;
                        
			let editDC = {
                name: req.body.name,
                address_1: req.body.address_1,
                address_2: req.body.address_2,
				area: req.body.area,
				city: req.body.city,
                state : req.body.state,
                pincode : req.body.pincode,
                latitude : req.body.latitude,
                longitude : req.body.longitude,
                status : req.body.status,
                updated_on: Date.now()
            }
            
            Request.post(
                '/dc-manager/update',
                { uuid:uuid }, 
                editDC
                ).then(response => {
                    if(response.success == true){
                        res.status(200);
                        res.redirect('/dc/list');                    
                    } else {
                        res.status(400);
                        res.render('dc_edit',{output:editDC});
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                    res.status(400);
                    res.render('dc_edit',{output:editDC});
                });
        });
        
        return dcRouter;
    }

 
}

