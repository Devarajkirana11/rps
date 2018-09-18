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
const policies_1 = require("../../models/policies/policies");
var session = require("express-sessions");
var ObjectId = require('mongodb').ObjectID;
const identification_1 = require("../../helpers/identification");
class PoliciesController {
    static get routes() {
        let PoliciesRouter = express.Router();
        PoliciesRouter.route('/cancellation-policies-list')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let condition = req.body.params;
            let PolicyDetails = core_1.default.app.get('mongoClient').get('cancellation_policies');
            yield PolicyDetails
                .find(condition, { "sort": { "_id": -1 } })
                .then(document => {
                respond = {
                    success: true,
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
            });
            res.json(respond);
        }));
        PoliciesRouter.route('/cancellation-policies/create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let PolicyDetailsData = req.body.params;
            let newPolicy = policies_1.default.cancellationcreate(PolicyDetailsData);
            newPolicy['policy_id'] = identification_1.default.generateUuid;
            let PolicyDetailsCollection = core_1.default.app.get('mongoClient').get('cancellation_policies');
            yield PolicyDetailsCollection
                .insert(newPolicy)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `New Policies has been created with id ${document._id}`
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
        PoliciesRouter.route('/cancellation-policies-update')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let policyDetailsData = req.body.params;
            let newPolicy = policies_1.default.cancellationcreate(policyDetailsData);
            let policy_id = req.body.params.policy_id;
            let PolicyDetails = core_1.default.app.get('mongoClient').get('cancellation_policies');
            yield PolicyDetails
                .update({ _policy_id: policy_id }, newPolicy)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Cancellation Policies information updated Successfully`
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
        PoliciesRouter.route('/get-cancellation-policies-details')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let policy_id = req.body.params.policy_id;
            let Policy = core_1.default.app.get('mongoClient').get('cancellation_policies');
            yield Policy
                .find({
                _policy_id: policy_id
            })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Success`,
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
        }));
        return PoliciesRouter;
    }
}
exports.default = PoliciesController;
