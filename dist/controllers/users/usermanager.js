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
const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const users_1 = require("../../models/users/users");
var in_array = require('in_array');
var slash = require('slash');
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class UserDetailsController {
    static get routes() {
        let UserDetailRouter = express.Router();
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        UserDetailRouter.route('/login-authentication')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let username = req.body.username;
            let password = req.body.password;
            yield usersCollection
                .find({ $or: [{ username: username }, { email: username }] })
                .then(document => {
                if (document.length > 0) {
                    let hash = (document[0]['password'] == "" ? bcrypt.hashSync('not a password', bcrypt.genSaltSync(10), null) : document[0]['password']);
                    if (bcrypt.compareSync(password, hash)) {
                        console.log('bcrypt SUCCESS');
                        req.session.regenerate(function (err) {
                        });
                        req.session.user = document[0];
                        return res.status(200).json({
                            success: true,
                            message: "Login Successfull",
                            data: document[0]
                        });
                    }
                    else {
                        return res.status(200)
                            .json({
                            success: false,
                            message: "Invalid Credentials"
                        });
                    }
                }
                else {
                    return res.status(200)
                        .json({
                        success: false,
                        message: "Invalid Credentials"
                    });
                }
            })
                .catch(error => {
                return res.status(400)
                    .json({
                    success: false,
                    message: error.message
                });
            });
        }));
        UserDetailRouter.route('/user-register')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let registerDetailsData = req.body;
            let newUsers = users_1.default.usersCreate(registerDetailsData);
            yield usersCollection
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
        return UserDetailRouter;
    }
}
exports.default = UserDetailsController;
