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
class dc {
    static get routes() {
        let dcRouter = express.Router();
        dcRouter.route('/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield request_1.default.get('/dc-manager/get-dc-list', {}).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('dc_list', { output: respond });
        }));
        dcRouter.route('/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            res.status(200);
            res.render('dc_creation', { users: respond });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
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
                name: name,
                address_1: address_1,
                address_2: address_2,
                area: area,
                city: city,
                state: state,
                pincode: pincode,
                latitude: latitude,
                longitude: longitude,
                status: status,
                created_on: Date.now(),
                updated_on: Date.now()
            };
            request_1.default.post('/dc-manager/create', {}, postValues).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/dc/list');
                }
                else {
                    res.status(400);
                    res.render('dc_creation');
                }
            }).catch(error => {
                res.status(400);
                res.render('dc_creation');
            });
        }));
        dcRouter.route('/:id/view')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let users;
            request_1.default.get('/dc-manager/get-dc-details', { uuid: uuid }).then(response => {
                if (response.success) {
                    res.status(200)
                        .render('dc_details', { output: response.data });
                }
                else {
                    res.status(200)
                        .render('dc_details', { output: response.data });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/vans/list');
            });
        }));
        dcRouter.route('/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let users;
            request_1.default.get('/dc-manager/get-dc-details', { uuid: uuid }).then(response => {
                if (response.success) {
                    res.status(200)
                        .render('dc_edit', { output: response.data });
                }
                else {
                    res.status(200)
                        .render('dc_edit', { output: response.data });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/dc/list');
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let respond;
            let editDC = {
                name: req.body.name,
                address_1: req.body.address_1,
                address_2: req.body.address_2,
                area: req.body.area,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                status: req.body.status,
                updated_on: Date.now()
            };
            request_1.default.post('/dc-manager/update', { uuid: uuid }, editDC).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/dc/list');
                }
                else {
                    res.status(400);
                    res.render('dc_edit', { output: editDC });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('dc_edit', { output: editDC });
            });
        }));
        return dcRouter;
    }
}
exports.default = dc;
