import { environments } from '../../config/app';

import * as express from 'express';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as path from 'path';
import * as Law from '../../models/orders/law';

import Core from '../../core';
import Time from '../../helpers/time';
import Request from '../../helpers/request';
import Orders from '../../models/orders/orders';
import Identificaton from '../../helpers/identification';
import dc from '../../models/dc/dc';

var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');

/*var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
  httpAdapter: 'https', 
  apiKey: 'AIzaSyAol1Sr_gRBGP4aa4BRYcLuMucjlK5qNN0', 
  formatter: null         
};
var geocoder = NodeGeocoder(options);
*/
export default class OrdersDetailsController {

	public static get routes(): express.Router {

		let OrdersDetailRouter: express.Router = express.Router();

        let ordersCollection = Core.app.get('mongoClient').get('orders');
        let vansCollection = Core.app.get('mongoClient').get('vans');
        let usersCollection = Core.app.get('mongoClient').get('users');
        let routingCollection = Core.app.get('mongoClient').get('routing_orders');
  
        OrdersDetailRouter.route('/single-order-update')
		.get(async (req: express.Request, res: express.Response) => {
            let respond = {
                status : 1,
                msg : "success"
            }
            res.status(200);
            res.json(respond);
        })
        .post(async (req: express.Request, res: express.Response) => {
 
            let respond: any;
            let van_uuid = req.body.van_uuid;
            let color_code = req.body.color_code;
            let order_id = req.body.order_id;
            let sort_no = req.body.sort_no;

            await ordersCollection
            .update(
                { order_id : order_id },
                { $set:
                    {
                        van_uuid: van_uuid,
                        weight : sort_no,
                        color_code : color_code,
                        updated_on : Date.now()
                    }
                }
                )
            .then(document => {
                respond = {
                    status : 1,
                    msg : "Success"
                }
            })
            .catch(error => {});
           
            
            res.status(200);
            res.json(respond);

        });

        OrdersDetailRouter.route('/remove-order-assign')
		.get(async (req: express.Request, res: express.Response) => {
        })
        .post(async (req: express.Request, res: express.Response) => {
 
            let respond: any;
            let order_id = req.body.order_id;
            
            await routingCollection
            .remove({ order_id : order_id })
            .then(document => { })
            .catch(error => {});

            await ordersCollection
            .update(
                { order_id : order_id },
                { $set:
                    {
                        van_uuid: "",
                        weight : "",
                        color_code : "",
                        updated_on : Date.now()
                    }
                }
                )
            .then(document => { })
            .catch(error => {});
          
            respond = {
                status : 1,
                msg : "Success"
            }

            res.status(200);
            res.json(respond);
        });


        OrdersDetailRouter.route('/get-orders-list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
            let options = {
                "sort": { "weight": -1 },
            }; 
    
            let vans_array = [];
                
            await Request.get(
            '/vans-manager/get-vans-list',
            {  }, 
            ).then(response => {
                response.data.forEach(async function (value, index) {
                    vans_array[value.uuid] = value.make +' '+ value.reg_no;
                });
            }).catch(error => {
                console.log('Error: ', error.message);
            });
    
            await ordersCollection
                .find({},options)
                .then(document => {
                    res.status(200);
                    document.forEach(async function (value, index) {
                        if(value.van_uuid){
                            value.van_name = vans_array[value.van_uuid];
                        } else {
                            value.van_name = "";
                        }
                    });
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
            let options = {
                "sort": { "weight": 1 },
            };          

            let vans_array = [];
                
            await Request.get(
            '/vans-manager/get-vans-list',
            {  }, 
            ).then(response => {
                response.data.forEach(async function (value, index) {
                    vans_array[value.uuid] = value.make +' '+ value.reg_no;
                });
            }).catch(error => {
                console.log('Error: ', error.message);
            });
    
            await ordersCollection
                .find(req.body,options)
                .then(document => {
                    res.status(200);
                    document.forEach(async function (value, index) {
                        if(value.van_uuid){
                            value.van_name = vans_array[value.van_uuid];
                        } else {
                            value.van_name = "";
                        }
                    });
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

        OrdersDetailRouter.route('/fetch')
		.get(async (req: express.Request, res: express.Response) => {
            let respond: any;

            let date = req.query.date + ' 00:00:00';

            let existing_order_array = [];
            await ordersCollection
            .find()
            .then(document => {
                document.forEach(async function (value, index) {
                    existing_order_array[value.order_id] = value.order_id;
                });
            })
            .catch(error => {
            });
            
            let headers = {
                "Content-Type" : "application/json",
                "User-Agent": "Request-Promise",
				"Username" : "warehouse_eretail",
                "Password" : "zA6DzQPz'B.fsVj!"
            }

            let body = {
                "delivery_date" : date
            }

            await Request.ext_post(
            'https://dev.avenue11.com/warehouse_api/orders_fetch_api_resources/list',
            {  }, 
            body,
            headers
            ).then(response => {
                console.log("Deva");
                console.log(response);
                if(response.items.length > 0){
                    response.items.forEach(async function (value, index) {
                        let order_id = value.order_id;
                        if(in_array(order_id,existing_order_array)){
                            let order_id = value.order_id;
                            let updateOrder = {
                                uuid : "",
                                order_id : value.order_id,
                                address_1 : value.address_1,
                                address_2 : value.address_2,
                                city : value.city,
                                pin_code : value.pin,
                                order_total : value.order_total,
                                payment_method : value.payment_method,
                                customer_name : value.customer_name,
                                mobile : value.mobile,
                                store : value.store,
                                delivery_charge : value.delivery_charge,
                                delivery_date : value.delivery_date,
                                slot : value.slot,
                                latitude : value.latitude,
                                longitude : value.longitude,
                                dc_name : value.hub_name,
                                status : value.status,
                                updated_on : Date.now()
                            }
                            ordersCollection.update(
                                { order_id: order_id },
                                { $set: updateOrder },
                                { multi: true }
                            )
                            .then(document => {
                                res.status(200);
                                respond = {
                                    success: true,
                                    message: 'order is updated'
                                };
                            })
                            .catch(error => {
                                res.status(500);
                                respond = {
                                    success: false,
                                    message: error.message
                                };
                            });
                        } else {
                            let geocode_values: any;
                            
                            let newOrder = {
                                uuid : "",
                                order_id : value.order_id,
                                address_1 : value.address_1,
                                address_2 : value.address_2,
                                city : value.city,
                                pin_code : value.pin,
                                order_total : value.order_total,
                                payment_method : value.payment_method,
                                customer_name : value.customer_name,
                                mobile : value.mobile,
                                store : value.store,
                                delivery_charge : value.delivery_charge,
                                delivery_date : value.delivery_date,
                                slot : value.slot,
                                latitude : value.latitude,
                                longitude : value.longitude,
                                dc_name : value.hub_name,
                                weight : "",
                                van_uuid : "",
                                color_code : "808080",
                                status : value.status,
                                created_on : value.created_date,
                                updated_on : Date.now()
                            }
                            
                            let orderDetailsData: Law.createOrder = newOrder;
                            let newOrders: Orders = Orders.createOrder(orderDetailsData);
    
                                ordersCollection
                                .insert(newOrders.document)
                                .then(document => {
                                    res.status(200);
                                    respond = {
                                        success: true,
                                        message: 'New order is created'
                                    };
                                })
                                .catch(error => {
                                    res.status(500);
                                    respond = {
                                        success: false,
                                        message: error.message
                                    };
                                });
                        }
                    });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            
            respond = {
                success : true,
                msg : "success"
            }
            
            res.status(200);
            res.json(respond);
		});

        OrdersDetailRouter.route('/assigning-orders')
		    .post(async (req: express.Request, res: express.Response) => {
 
            let respond: any;
            let sort_array = req.body.sort_arr;
            let order_array = req.body.order_arr;
            let van_uuid = req.body.van_uuid;
            let cde_uuid = req.body.cde_uuid;
            let delivery_date = req.body.delivery_date;
            let slot = req.body.slot;
            let dc_uuid = req.body.store_uuid;

            order_array.forEach(async function (value, index) {

                let order_id = value;
                let sort_no = sort_array[index];

                let insertObject = {
                    uuid : Identificaton.generateUuid,
                    delivery_date : delivery_date,
                    slot : slot,
                    order_id : order_id,
                    van_uuid : van_uuid,
                    cde_uuid : cde_uuid,
                    dc_uuid : dc_uuid,
                    status : "1",
                    created_on : Date.now(),
                    updated_on : Date.now()
                }

                await routingCollection
                .insert(insertObject)
                .then(document => {})
                .catch(error => {});
    
            });
            
            respond = {
                status : 1,
                msg : "Success"
            }

            res.json(respond);
        });

        OrdersDetailRouter.route('/csv-import')
		.post(async (req: express.Request, res: express.Response) => {
            let respond: any;
            let doc_output = [];
            let orders_array = [];
            let vans_array = [];
            let cde_array = [];

            await ordersCollection
                .find()
                .then(document => {
                    if(document.length > 0){
                        document.forEach(async function (values, index) {
                            orders_array[values.order_id] = values;
                        });
                    }
                })
                .catch(error => {
                    console.log(error);    
                });
                
                await vansCollection
                .find()
                .then(document => {
                    if(document.length > 0){
                        document.forEach(async function (values, index) {
                            vans_array[values.uuid] = values;
                        });
                    }
                })
                .catch(error => {
                    console.log(error);    
                });

                await usersCollection
                .find()
                .then(document => {
                    if(document.length > 0){
                        document.forEach(async function (values, index) {
                            cde_array[values.uuid] = values;
                        });
                    }
                })
                .catch(error => {
                    console.log(error);    
                });

            let dc_uuid = req.body.dc_uuid;
            let van_uuid = req.body.van_uuid;
            let delivery_date = req.body.delivery_date;
            let slot = req.body.slot;

            await routingCollection
                .find({
                    dc_uuid : dc_uuid,
                    van_uuid : van_uuid,
                    delivery_date : delivery_date,
                    slot : { $in : slot }
                })
                .then(document => {
                    if(document.length > 0){
                        document.forEach(async function (value, index) {
                            let orderValues = orders_array[value.order_id];
                            let vanValues = vans_array[value.van_uuid];
                            let cdeValues = cde_array[value.cde_uuid];
                            let new_object = {
                                "S.No" : orderValues.weight,
                                "Order ID" : value.order_id,
                                "CDE Name" : cdeValues.first_name,
                                "Vechile No" : vanValues.make+' '+vanValues.reg_no,
                                "Delivery Date" : value.delivery_date,
                                "Slot Timings" : value.slot,
                                "Address" : orderValues.address_1,
                                "Customer Name": orderValues.customer_name,
                                "Mobile" : orderValues.mobile,
                                "Order Total" : orderValues.order_total,                                
                            }
                            doc_output.push(new_object);
                        });
                    }
                })
                .catch(error => {
                    console.log(error);    
                });
            
            if(doc_output.length > 0){
                respond = {
                    status : 1,
                    success : true,
                    data : doc_output
                }
            } else {
                respond = {
                    status : "0",
                    success : true,
                    msg : "success"
                }
            }
            
            res.status(200);
            res.json(respond);
        });

		return OrdersDetailRouter;
    
    }
    

}