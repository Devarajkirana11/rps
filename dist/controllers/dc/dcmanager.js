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
const dc_1 = require("../../models/dc/dc");
const express = require("express");
var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class DcDetailsController {
    static get routes() {
        let dcDetailRouter = express.Router();
        let dcCollection = core_1.default.app.get('mongoClient').get('delivery_centers');
        dcDetailRouter.route('/get-dc-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield dcCollection
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
        dcDetailRouter.route('/create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let registerDetailsData = req.body;
            let newDC = dc_1.default.createdc(registerDetailsData);
            yield dcCollection
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
        }));
        dcDetailRouter.route('/update')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            yield dcCollection
                .update({ uuid: uuid }, { $set: updateDocument })
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
        }));
        dcDetailRouter.route('/get-dc-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            yield dcCollection
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
        dcDetailRouter.route('/dc-delete')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.body.uuid;
            yield dcCollection
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
        }));
        return dcDetailRouter;
    }
}
exports.default = DcDetailsController;
