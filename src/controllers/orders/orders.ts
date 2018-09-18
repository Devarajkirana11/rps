import Core from '../../core';
import Request from '../../helpers/request';
import Time from '../../helpers/time';

import * as express from 'express';
import * as mongodb from 'mongodb';
import * as assert from 'assert';

var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var jsonexport = require('jsonexport');

export default class orders {

    public static get routes(): express.Router {

        let OrdersRouter: express.Router = express.Router();

        OrdersRouter.route('/list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;

            await Request.get(
            '/orders-manager/get-orders-list',
            {  }, 
            ).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            
            res.status(200);
            res.render('orders_list',{output:respond});
        });
        
        OrdersRouter.route('/map-view')
		.get(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let vans: any;
            let cde: any;
            let dcs: any;
            
            await Request.get(
                '/vans-manager/get-vans-list',
                {  }, 
                ).then(response => {
                    vans = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });

            await Request.get(
                '/dc-manager/get-dc-list',
                {  }, 
                ).then(response => {
                    dcs = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                            
            await Request.get(
                '/cde-manager/get-cde-list',
                {  }, 
                ).then(response => {
                    cde = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                
            res.status(200);
            res.render('orders_map',{vans:vans, cde:cde, dc: dcs});
        });

        OrdersRouter.route('/import')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
            
            res.status(200);
            res.render('orders_import');
        })
        .post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let date = req.body.delivery_date;
            
            await Request.get(
                '/orders-manager/fetch',
                { date : date }, 
                ).then(response => {
                    respond = response;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
        
                res.status(200);
                res.render('orders_import',{message:"success"});
        });

        OrdersRouter.route('/download')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
            let vans: any;
            let cde: any;
            let dcs: any;
            
            await Request.get(
                '/vans-manager/get-vans-list',
                {  }, 
                ).then(response => {
                    vans = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });

            await Request.get(
                '/dc-manager/get-dc-list',
                {  }, 
                ).then(response => {
                    dcs = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                            
            await Request.get(
                '/cde-manager/get-cde-list',
                {  }, 
                ).then(response => {
                    cde = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                
            res.status(200);
            res.render('orders_download',{vans:vans, cde:cde, dc: dcs});
        })
        .post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let vans: any;
            let dcs: any;
            
            await Request.get(
                '/vans-manager/get-vans-list',
                {  }, 
                ).then(response => {
                    vans = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });

            await Request.get(
                '/dc-manager/get-dc-list',
                {  }, 
                ).then(response => {
                    dcs = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
            
            let postValues = req.body;

            await Request.post(
                '/orders-manager/csv-import',
                {  }, 
                postValues
                ).then(response => {
                    if(response.status == 1){
                        let data = response.data;
                        jsonexport(data,function(err, csv){
                            if(err) return console.log(err);
                            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                            res.set('Content-Type', 'text/csv');
                            res.status(200).send(csv);
                        });
                    } else {
                        res.status(200);
                        res.render('orders_download',{vans:vans, dc: dcs, postValues : postValues, error_message:"No Records Found"});
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                    res.status(400);
                    res.render('orders_download',{vans:vans, dc: dcs, postValues : postValues, error_message:"Something went wrong!. Please try again"});
                });
        });
        
        return OrdersRouter;
    }

 
}

