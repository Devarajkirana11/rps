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
const APIClient_1 = require("../../helpers/APIClient");
var ObjectId = require('mongodb').ObjectID;
class Policies {
    static get routes() {
        let PoliciesRouter = express.Router();
        PoliciesRouter.route('/cancellation-policies')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let userLogin = core_1.default.app.get('mongoClient').get('cancellation_policies');
            yield userLogin
                .find({}, { "sort": { "_id": -1 } })
                .then(document => {
                respond = {
                    success: true,
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
            });
            res.status(200);
            res.render('cancellationpolicies', { output: respond });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let output;
            let name = req.body.name;
            let status = req.body.status;
            let inputs = { "name": name, "status": status };
            let input_array = [];
            if (name) {
                input_array["_name"] = { $regex: name, $options: "si" };
            }
            if (status) {
                input_array["_status"] = status;
            }
            let condition = Object.assign({}, input_array);
            let postbody = JSON.stringify({ params: condition });
            APIClient_1.default.send('/policies-manager/cancellation-policies-list', postbody, function (api_result) {
                if (api_result.success) {
                    res.status(200)
                        .render('cancellationpolicies', { output: api_result, inputs: inputs });
                }
                else {
                    res.status(400)
                        .render('cancellationpolicies', { output: api_result, inputs: inputs });
                }
            });
        }));
        PoliciesRouter.route('/cancellation-policies/add')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('cancellationpoliciescreation');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let newPolicy = {
                name: req.body.name,
                status: req.body.status,
                duration: req.body.duration,
                duration_hours: req.body.duration_hours,
                percentage_value: req.body.value_percentage
            };
            var postbody = JSON.stringify({ params: newPolicy });
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('name', 'Please enter the policy name').notEmpty();
            req.checkBody('status', 'Please select the status').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('cancellationpoliciescreation', { errors: errors, output: newPolicy, input: newPolicy });
                }
                else {
                    APIClient_1.default.send('/policies-manager/cancellation-policies/create', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/admin/cancellation-policies");
                        }
                        else {
                            res.status(400)
                                .render('cancellationpoliciescreation', api_result);
                        }
                    });
                }
            });
        }));
        PoliciesRouter.route('/cancellation-policies/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let query = { policy_id: req.params.id };
            let postbody = JSON.stringify({ params: query });
            const errorobj = {};
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('cancellationpoliciesedit', { errors: errors });
                }
                else {
                    APIClient_1.default.send('/policies-manager/get-cancellation-policies-details', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .render('cancellationpoliciesedit', { output: api_result.data[0] });
                        }
                        else {
                            res.status(400)
                                .render('cancellationpoliciesedit', { output: api_result.data[0] });
                        }
                    });
                }
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let respond;
            let editPolicy = {
                id: id,
                policy_id: req.body.policy_id,
                name: req.body.name,
                status: req.body.status,
                duration: req.body.duration,
                duration_hours: req.body.duration_hours,
                percentage_value: req.body.value_percentage,
            };
            let Postvalues = {
                _id: id,
                _policy_id: req.body.policy_id,
                _name: req.body.name,
                _duration: req.body.duration,
                _duration_hours: req.body.duration_hours,
                _value_percentage: req.body.value_percentage,
                _status: req.body.status
            };
            let postbody = JSON.stringify({ params: editPolicy });
            const errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('name', 'Please enter the policy name').notEmpty();
            req.checkBody('status', 'Please select the status').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('cancellationpoliciesedit', { errors: errors, output: Postvalues });
                }
                else {
                    APIClient_1.default.send('/policies-manager/cancellation-policies-update', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/admin/cancellation-policies");
                        }
                        else {
                            res.status(400)
                                .render('cancellationpoliciesedit', api_result);
                        }
                    });
                }
            });
        }));
        PoliciesRouter.route('/payment-policies')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('paymentpolicies');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PoliciesRouter.use(function (req, res) {
            res.type("text/html");
            res.status(404);
            res.render("404");
        });
        PoliciesRouter.use(function (req, res) {
            res.status(500);
            res.render("500");
        });
        return PoliciesRouter;
    }
}
exports.default = Policies;
