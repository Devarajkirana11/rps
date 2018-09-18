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
const express = require("express");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const api_manager_1 = require("../rest_api/api_manager");
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var session = require("express-sessions");
var in_array = require('in_array');
class SocialLoginController {
    static get routes() {
        let SocialRouter = express.Router();
        SocialRouter.route('/socialLogin')
            .post(inputvalidator_1.default.socialLogin, (req, res) => __awaiter(this, void 0, void 0, function* () {
            req.body['registered_device_type'] = "WEB";
            yield api_manager_1.default.socialLoginManager(req.body)
                .then(data => {
                let resData = data;
                if (resData.success) {
                    req.session.user = resData.user_data;
                    delete (resData.user_data);
                    res.status(200).json(resData);
                }
            }, err => {
                res.status(400).json(err);
            })
                .catch(err => {
                res.status(400).json(err);
            });
        }));
        return SocialRouter;
    }
}
exports.default = SocialLoginController;
