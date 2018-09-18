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
class cde {
    static get routes() {
        let CDERouter = express.Router();
        CDERouter.route('/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield request_1.default.get('/cde-manager/get-cde-list', {}).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            res.status(200);
            res.render('cde_list', { output: respond });
        }));
        CDERouter.route('/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            res.status(200);
            res.render('cde_creation');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let firstName = req.body.firstname;
            let lastName = req.body.lastname;
            let email = req.body.email;
            let phone = req.body.phone;
            let age = req.body.age;
            let employee_id = req.body.employee_id;
            let joining_date = req.body.joining_date;
            let postValues = {
                first_name: firstName,
                last_name: lastName,
                password: "123456",
                email: email,
                mobile: phone,
                age: age,
                employee_id: employee_id,
                joining_date: joining_date,
                roles: ["3"],
                status: "Active",
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: Date.now()
            };
            request_1.default.post('/cde-manager/create', {}, postValues).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/cde/list');
                }
                else {
                    res.status(400);
                    res.render('cde_creation');
                }
            }).catch(error => {
                res.status(400);
                res.render('cde_creation');
            });
        }));
        CDERouter.route('/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            request_1.default.get('/admin-manager/get-user-details', { uuid: uuid }).then(response => {
                if (response.success) {
                    res.status(200)
                        .render('cde_edit', { output: response.data });
                }
                else {
                    res.status(200)
                        .render('cde_edit', { output: response.data });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/cde/list');
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.params.id;
            let respond;
            let email = req.body.email;
            let password = req.body.pass_hidden;
            let editCDE = {
                first_name: req.body.firstname,
                last_name: req.body.lastname,
                email: req.body.email,
                age: req.body.age,
                employee_id: req.body.employee_id,
                joining_date: req.body.joining_date,
                updated_on: Date.now()
            };
            request_1.default.post('/cde-manager/update', { uuid: uuid }, editCDE).then(response => {
                if (response.success == true) {
                    res.status(200);
                    res.redirect('/cde/list');
                }
                else {
                    res.status(400);
                    res.render('cde_edit', { output: editCDE });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('cde_edit', { output: editCDE });
            });
        }));
        return CDERouter;
    }
}
exports.default = cde;
