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
class Admin {
    static get routes() {
        let AdminRouter = express.Router();
        AdminRouter.route('/dashboard')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('dashboard');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        AdminRouter.route('/users/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield request_1.default.get('/admin-manager/get-users-list', {}).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('users_list', { output: respond });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        AdminRouter.route('/user/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('users_creation');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let firstName = req.body.firstname;
            let lastName = req.body.lastname;
            let userName = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password;
            let roles = req.body.roles;
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
                roles: roles,
                status: "Active",
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: Date.now()
            };
            request_1.default.post('/admin-manager/user-create', {}, postValues).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/admin/users/list');
                }
                else {
                    res.status(400);
                    res.render('users_creation');
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('users_creation');
            });
        }));
        AdminRouter.route('/user/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            request_1.default.get('/admin-manager/get-user-details', { uuid: uuid }).then(response => {
                if (response.success) {
                    res.status(200)
                        .render('users_edit', { output: response.data });
                }
                else {
                    res.status(200)
                        .render('users_edit', { output: response.data });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/admin/users/list');
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let respond;
            let email = req.body.email;
            let password;
            if (req.body.password) {
                password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
            }
            else {
                password = req.body.pass_hidden;
            }
            let editUser = {
                first_name: req.body.firstname,
                last_name: req.body.lastname,
                email: req.body.email,
                username: req.body.username,
                password: password,
                roles: req.body.roles,
                status: 'Active',
                updated_on: Date.now()
            };
            request_1.default.post('/admin-manager/user-update', { uuid: uuid }, editUser).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/admin/users/list');
                }
                else {
                    res.status(400);
                    res.render('users_edit', { output: editUser });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('users_edit', { output: editUser });
            });
        }));
        return AdminRouter;
    }
}
exports.default = Admin;
