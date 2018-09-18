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
const vans_1 = require("../../models/vans/vans");
const express = require("express");
var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class VansDetailsController {
    static get routes() {
        let vansDetailRouter = express.Router();
        let vansCollection = core_1.default.app.get('mongoClient').get('vans');
        vansDetailRouter.route('/get-vans-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield vansCollection
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
        }));
        vansDetailRouter.route('/create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let registerDetailsData = req.body;
            let newVan = vans_1.default.createvan(registerDetailsData);
            yield vansCollection
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
        }));
        vansDetailRouter.route('/update')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            yield vansCollection
                .update({ uuid: uuid }, { $set: updateDocument })
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
        }));
        vansDetailRouter.route('/get-van-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            yield vansCollection
                .findOne({ uuid: uuid })
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
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        vansDetailRouter.route('/van-delete')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.body.uuid;
            yield vansCollection
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
        }));
        return vansDetailRouter;
    }
}
exports.default = VansDetailsController;
