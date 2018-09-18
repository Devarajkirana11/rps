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
const bcrypt = require("bcrypt-nodejs");
var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
class Users {
    static get routes() {
        let UsersRouter = express.Router();
        UsersRouter.route('/register')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('register');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let firstName = req.body.firstname;
            let lastName = req.body.lastname;
            let userName = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password;
            if (req.body.password) {
                password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
            }
            else {
                password = req.body.pass_hidden;
            }
            let postValues = {
                first_name: firstName,
                last_name: lastName,
                username: userName,
                password: password,
                email: email,
                mobile: phone,
                roles: ['1'],
                status: "Active",
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: Date.now()
            };
            request_1.default.post('/user-manager/user-register', {}, postValues).then(response => {
                console.log(response);
                res.status(200);
                res.render('register');
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('register', { errors: error.message });
            });
        }));
        UsersRouter.route('/login')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('login');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let username = req.body.username;
            let password = req.body.password;
            let postValues = {
                username: username,
                password: password
            };
            request_1.default.post('/user-manager/login-authentication', {}, postValues).then(response => {
                if (response.success == true) {
                    req.session.user = response.data;
                    res.status(200);
                    res.redirect('/orders/import');
                }
                else {
                    res.status(400);
                    res.render('login', { errors: response.message });
                }
            }).catch(error => {
                res.status(400);
                res.render('login', { errors: error.message });
            });
        }));
        UsersRouter.route('/logout')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            req.session.destroy(function (err) { });
            res.status(200);
            res.redirect('/');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        return UsersRouter;
    }
}
exports.default = Users;
