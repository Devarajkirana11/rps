"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const core_1 = require("../../core");
const request_1 = require("../../helpers/request");
const orders_1 = require("../../models/orders/orders");
const identification_1 = require("../../helpers/identification");
var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
class OrdersDetailsController {
    static get routes() {
        let OrdersDetailRouter = express.Router();
        let ordersCollection = core_1.default.app.get('mongoClient').get('orders');
        let vansCollection = core_1.default.app.get('mongoClient').get('vans');
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        let routingCollection = core_1.default.app.get('mongoClient').get('routing_orders');
        OrdersDetailRouter.route('/single-order-update')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond = {
                status: 1,
                msg: "success"
            };
            res.status(200);
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let van_uuid = req.body.van_uuid;
            let color_code = req.body.color_code;
            let order_id = req.body.order_id;
            let sort_no = req.body.sort_no;
            yield ordersCollection
                .update({ order_id: order_id }, { $set: {
                    van_uuid: van_uuid,
                    weight: sort_no,
                    color_code: color_code,
                    updated_on: Date.now()
                }
            })
                .then(document => {
                respond = {
                    status: 1,
                    msg: "Success"
                };
            })
                .catch(error => { });
            res.status(200);
            res.json(respond);
        }));
        OrdersDetailRouter.route('/remove-order-assign')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let order_id = req.body.order_id;
            yield routingCollection
                .remove({ order_id: order_id })
                .then(document => { })
                .catch(error => { });
            yield ordersCollection
                .update({ order_id: order_id }, { $set: {
                    van_uuid: "",
                    weight: "",
                    color_code: "",
                    updated_on: Date.now()
                }
            })
                .then(document => { })
                .catch(error => { });
            respond = {
                status: 1,
                msg: "Success"
            };
            res.status(200);
            res.json(respond);
        }));
        OrdersDetailRouter.route('/get-orders-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let options = {
                "sort": { "weight": -1 },
            };
            let vans_array = [];
            yield request_1.default.get('/vans-manager/get-vans-list', {}).then(response => {
                response.data.forEach(function (value, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        vans_array[value.uuid] = value.make + ' ' + value.reg_no;
                    });
                });
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield ordersCollection
                .find({}, options)
                .then(document => {
                res.status(200);
                document.forEach(function (value, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (value.van_uuid) {
                            value.van_name = vans_array[value.van_uuid];
                        }
                        else {
                            value.van_name = "";
                        }
                    });
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
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let options = {
                "sort": { "weight": 1 },
            };
            let vans_array = [];
            yield request_1.default.get('/vans-manager/get-vans-list', {}).then(response => {
                response.data.forEach(function (value, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        vans_array[value.uuid] = value.make + ' ' + value.reg_no;
                    });
                });
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield ordersCollection
                .find(req.body, options)
                .then(document => {
                res.status(200);
                document.forEach(function (value, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (value.van_uuid) {
                            value.van_name = vans_array[value.van_uuid];
                        }
                        else {
                            value.van_name = "";
                        }
                    });
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
        }));
        OrdersDetailRouter.route('/fetch')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let date = req.query.date + ' 00:00:00';
            let existing_order_array = [];
            yield ordersCollection
                .find()
                .then(document => {
                document.forEach(function (value, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        existing_order_array[value.order_id] = value.order_id;
                    });
                });
            })
                .catch(error => {
            });
            let headers = {
                "Content-Type": "application/json",
                "User-Agent": "Request-Promise",
                "Username": "warehouse_eretail",
                "Password": "zA6DzQPz'B.fsVj!"
            };
            let body = {
                "delivery_date": date
            };
            yield request_1.default.ext_post('https://dev.avenue11.com/warehouse_api/orders_fetch_api_resources/list', {}, body, headers).then(response => {
                console.log("Deva");
                console.log(response);
                if (response.items.length > 0) {
                    response.items.forEach(function (value, index) {
                        return __awaiter(this, void 0, void 0, function* () {
                            let order_id = value.order_id;
                            if (in_array(order_id, existing_order_array)) {
                                let order_id = value.order_id;
                                let updateOrder = {
                                    uuid: "",
                                    order_id: value.order_id,
                                    address_1: value.address_1,
                                    address_2: value.address_2,
                                    city: value.city,
                                    pin_code: value.pin,
                                    order_total: value.order_total,
                                    payment_method: value.payment_method,
                                    customer_name: value.customer_name,
                                    mobile: value.mobile,
                                    store: value.store,
                                    delivery_charge: value.delivery_charge,
                                    delivery_date: value.delivery_date,
                                    slot: value.slot,
                                    latitude: value.latitude,
                                    longitude: value.longitude,
                                    dc_name: value.hub_name,
                                    status: value.status,
                                    updated_on: Date.now()
                                };
                                ordersCollection.update({ order_id: order_id }, { $set: updateOrder }, { multi: true })
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
                            }
                            else {
                                let geocode_values;
                                let newOrder = {
                                    uuid: "",
                                    order_id: value.order_id,
                                    address_1: value.address_1,
                                    address_2: value.address_2,
                                    city: value.city,
                                    pin_code: value.pin,
                                    order_total: value.order_total,
                                    payment_method: value.payment_method,
                                    customer_name: value.customer_name,
                                    mobile: value.mobile,
                                    store: value.store,
                                    delivery_charge: value.delivery_charge,
                                    delivery_date: value.delivery_date,
                                    slot: value.slot,
                                    latitude: value.latitude,
                                    longitude: value.longitude,
                                    dc_name: value.hub_name,
                                    weight: "",
                                    van_uuid: "",
                                    color_code: "808080",
                                    status: value.status,
                                    created_on: value.created_date,
                                    updated_on: Date.now()
                                };
                                let orderDetailsData = newOrder;
                                let newOrders = orders_1.default.createOrder(orderDetailsData);
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
                    });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            respond = {
                success: true,
                msg: "success"
            };
            res.status(200);
            res.json(respond);
        }));
        OrdersDetailRouter.route('/assigning-orders')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let sort_array = req.body.sort_arr;
            let order_array = req.body.order_arr;
            let van_uuid = req.body.van_uuid;
            let cde_uuid = req.body.cde_uuid;
            let delivery_date = req.body.delivery_date;
            let slot = req.body.slot;
            let dc_uuid = req.body.store_uuid;
            order_array.forEach(function (value, index) {
                return __awaiter(this, void 0, void 0, function* () {
                    let order_id = value;
                    let sort_no = sort_array[index];
                    let insertObject = {
                        uuid: identification_1.default.generateUuid,
                        delivery_date: delivery_date,
                        slot: slot,
                        order_id: order_id,
                        van_uuid: van_uuid,
                        cde_uuid: cde_uuid,
                        dc_uuid: dc_uuid,
                        status: "1",
                        created_on: Date.now(),
                        updated_on: Date.now()
                    };
                    yield routingCollection
                        .insert(insertObject)
                        .then(document => { })
                        .catch(error => { });
                });
            });
            respond = {
                status: 1,
                msg: "Success"
            };
            res.json(respond);
        }));
        OrdersDetailRouter.route('/csv-import')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let doc_output = [];
            let orders_array = [];
            let vans_array = [];
            let cde_array = [];
            yield ordersCollection
                .find()
                .then(document => {
                if (document.length > 0) {
                    document.forEach(function (values, index) {
                        return __awaiter(this, void 0, void 0, function* () {
                            orders_array[values.order_id] = values;
                        });
                    });
                }
            })
                .catch(error => {
                console.log(error);
            });
            yield vansCollection
                .find()
                .then(document => {
                if (document.length > 0) {
                    document.forEach(function (values, index) {
                        return __awaiter(this, void 0, void 0, function* () {
                            vans_array[values.uuid] = values;
                        });
                    });
                }
            })
                .catch(error => {
                console.log(error);
            });
            yield usersCollection
                .find()
                .then(document => {
                if (document.length > 0) {
                    document.forEach(function (values, index) {
                        return __awaiter(this, void 0, void 0, function* () {
                            cde_array[values.uuid] = values;
                        });
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
            yield routingCollection
                .find({
                dc_uuid: dc_uuid,
                van_uuid: van_uuid,
                delivery_date: delivery_date,
                slot: { $in: slot }
            })
                .then(document => {
                if (document.length > 0) {
                    document.forEach(function (value, index) {
                        return __awaiter(this, void 0, void 0, function* () {
                            let orderValues = orders_array[value.order_id];
                            let vanValues = vans_array[value.van_uuid];
                            let cdeValues = cde_array[value.cde_uuid];
                            let new_object = {
                                "S.No": orderValues.weight,
                                "Order ID": value.order_id,
                                "CDE Name": cdeValues.first_name,
                                "Vechile No": vanValues.make + ' ' + vanValues.reg_no,
                                "Delivery Date": value.delivery_date,
                                "Slot Timings": value.slot,
                                "Address": orderValues.address_1,
                                "Customer Name": orderValues.customer_name,
                                "Mobile": orderValues.mobile,
                                "Order Total": orderValues.order_total,
                            };
                            doc_output.push(new_object);
                        });
                    });
                }
            })
                .catch(error => {
                console.log(error);
            });
            if (doc_output.length > 0) {
                respond = {
                    status: 1,
                    success: true,
                    data: doc_output
                };
            }
            else {
                respond = {
                    status: "0",
                    success: true,
                    msg: "success"
                };
            }
            res.status(200);
            res.json(respond);
        }));
        return OrdersDetailRouter;
    }
}
exports.default = OrdersDetailsController;
