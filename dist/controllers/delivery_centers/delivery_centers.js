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
const core_1 = require("../../core");
const request_1 = require("../../helpers/request");
const express = require("express");
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class dc {
    static get routes() {
        let vansRouter = express.Router();
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        vansRouter.route('/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield request_1.default.get('/vans-manager/get-vans-list', {}).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('vans_list', { output: respond });
        }));
        vansRouter.route('/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield usersCollection
                .find({ roles: { $in: ["3"] } })
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
            res.render('vans_creation', { users: respond });
        }))
            .post(upload.single('documents'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let make = req.body.make;
            let reg_no = req.body.reg_no;
            let type = req.body.type;
            let capacity = req.body.capacity;
            let provider = req.body.provider;
            let gps_tracking_id = req.body.gps_tracking_id;
            let documents = req.body.filename;
            let dc_name = req.body.dc_name;
            let status = req.body.status;
            let postValues = {
                make: make,
                reg_no: reg_no,
                type: type,
                capacity: capacity,
                provider: provider,
                gps_tracking_id: gps_tracking_id,
                documents: documents,
                dc_name: dc_name,
                status: status,
                created_on: Date.now(),
                updated_on: Date.now()
            };
            request_1.default.post('/vans-manager/create', {}, postValues).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/vans/list');
                }
                else {
                    res.status(400);
                    res.render('vans_creation');
                }
            }).catch(error => {
                res.status(400);
                res.render('vans_creation');
            });
        }));
        vansRouter.route('/:id/view')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let users;
            request_1.default.get('/vans-manager/get-van-details', { uuid: uuid }).then(response => {
                if (response.success) {
                    res.status(200)
                        .render('vans_details', { output: response.data });
                }
                else {
                    res.status(200)
                        .render('vans_details', { output: response.data });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/vans/list');
            });
        }));
        vansRouter.route('/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let users;
            yield usersCollection
                .find({ roles: { $in: ["3"] } })
                .then(document => {
                res.status(200);
                users = {
                    success: true,
                    message: "successfull",
                    data: document
                };
            })
                .catch(error => {
                res.status(500);
                users = {
                    success: false,
                    message: error.message
                };
            });
            request_1.default.get('/vans-manager/get-van-details', { uuid: uuid }).then(response => {
                if (response.success) {
                    res.status(200)
                        .render('vans_edit', { users: users, output: response.data });
                }
                else {
                    res.status(200)
                        .render('vans_edit', { users: users, output: response.data });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/vans/list');
            });
        }))
            .post(upload.single('documents'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let respond;
            let document_name;
            if (req.body.filename) {
                document_name = req.body.filename;
            }
            else {
                document_name = req.body.documents;
            }
            let editVan = {
                make: req.body.make,
                reg_no: req.body.reg_no,
                type: req.body.type,
                capacity: req.body.capacity,
                provider: req.body.provider,
                documents: document_name,
                dc_name: req.body.dc_name,
                status: req.body.status,
                updated_on: Date.now()
            };
            request_1.default.post('/vans-manager/update', { uuid: uuid }, editVan).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/vans/list');
                }
                else {
                    res.status(400);
                    res.render('vans_edit', { output: editVan });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('vans_edit', { output: editVan });
            });
        }));
        return vansRouter;
    }
}
exports.default = dc;
