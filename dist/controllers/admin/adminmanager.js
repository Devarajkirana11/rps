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
const users_1 = require("../../models/users/users");
const express = require("express");
var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
class Admin {
    static get routes() {
        let AdminManagerRouter = express.Router();
        let UsersCollection = core_1.default.app.get('mongoClient').get('users');
        AdminManagerRouter.route('/get-users-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield UsersCollection
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
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        AdminManagerRouter.route('/get-user-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            yield UsersCollection
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
        AdminManagerRouter.route('/user-create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let registerDetailsData = req.body;
            let newUsers = users_1.default.usersCreate(registerDetailsData);
            yield UsersCollection
                .insert(newUsers.document)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'New user is created'
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
        AdminManagerRouter.route('/user-update')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.query.uuid;
            let updateDocument = req.body;
            yield UsersCollection
                .update({ uuid: uuid }, { $set: updateDocument })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: "User information updated Successfully"
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
        AdminManagerRouter.route('/user-delete')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let uuid = req.body.uuid;
            yield UsersCollection
                .remove({ uuid: uuid })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: "User deleted successfully"
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
        return AdminManagerRouter;
    }
}
exports.default = Admin;
