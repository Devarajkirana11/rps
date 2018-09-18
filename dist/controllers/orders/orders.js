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
const request_1 = require("../../helpers/request");
const express = require("express");
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var jsonexport = require('jsonexport');
class orders {
    static get routes() {
        let OrdersRouter = express.Router();
        OrdersRouter.route('/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield request_1.default.get('/orders-manager/get-orders-list', {}).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('orders_list', { output: respond });
        }));
        OrdersRouter.route('/map-view')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let vans;
            let cde;
            let dcs;
            yield request_1.default.get('/vans-manager/get-vans-list', {}).then(response => {
                vans = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/dc-manager/get-dc-list', {}).then(response => {
                dcs = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/cde-manager/get-cde-list', {}).then(response => {
                cde = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('orders_map', { vans: vans, cde: cde, dc: dcs });
        }));
        OrdersRouter.route('/import')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            res.status(200);
            res.render('orders_import');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let date = req.body.delivery_date;
            yield request_1.default.get('/orders-manager/fetch', { date: date }).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('orders_import', { message: "success" });
        }));
        OrdersRouter.route('/download')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let vans;
            let cde;
            let dcs;
            yield request_1.default.get('/vans-manager/get-vans-list', {}).then(response => {
                vans = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/dc-manager/get-dc-list', {}).then(response => {
                dcs = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/cde-manager/get-cde-list', {}).then(response => {
                cde = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('orders_download', { vans: vans, cde: cde, dc: dcs });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let vans;
            let dcs;
            yield request_1.default.get('/vans-manager/get-vans-list', {}).then(response => {
                vans = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/dc-manager/get-dc-list', {}).then(response => {
                dcs = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            let postValues = req.body;
            yield request_1.default.post('/orders-manager/csv-import', {}, postValues).then(response => {
                if (response.status == 1) {
                    let data = response.data;
                    jsonexport(data, function (err, csv) {
                        if (err)
                            return console.log(err);
                        res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                        res.set('Content-Type', 'text/csv');
                        res.status(200).send(csv);
                    });
                }
                else {
                    res.status(200);
                    res.render('orders_download', { vans: vans, dc: dcs, postValues: postValues, error_message: "No Records Found" });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('orders_download', { vans: vans, dc: dcs, postValues: postValues, error_message: "Something went wrong!. Please try again" });
            });
        }));
        return OrdersRouter;
    }
}
exports.default = orders;
