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
const cde_1 = require("../../models/cde/cde");
const express = require("express");
var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class CDEDetailsController {
    static get routes() {
        let CDEDetailRouter = express.Router();
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        CDEDetailRouter.route('/get-cde-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield usersCollection
                .find({ roles: { $in: ["3"] } })
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
        CDEDetailRouter.route('/create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let registerDetailsData = req.body;
            let newUsers = cde_1.default.createCDE(registerDetailsData);
            yield usersCollection
                .insert(newUsers.document)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'New cde is created'
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
        CDEDetailRouter.route('/update')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            yield usersCollection
                .update({ uuid: uuid }, { $set: updateDocument })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: "CDE information updated Successfully"
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
        return CDEDetailRouter;
    }
}
exports.default = CDEDetailsController;
