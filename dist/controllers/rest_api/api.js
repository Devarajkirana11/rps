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
const app_1 = require("../../config/app");
const request_1 = require("../../helpers/request");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const api_1 = require("../../middlewares/validation/api");
const api_manager_1 = require("../rest_api/api_manager");
const express = require("express");
var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var jwt = require('jsonwebtoken');
class API {
    static get routes() {
        let APIRouter = express.Router();
        APIRouter.route('/authenticateAppToken')
            .get((req, res) => {
            api_1.default.apiResponse(res, 200, true, 'app-token generated');
        });
        APIRouter.route('/login')
            .post(inputvalidator_1.default.login, (req, res) => __awaiter(this, void 0, void 0, function* () {
            req.getValidationResult().then(function (result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!result.isEmpty()) {
                        res.status(400);
                        var errors = result.array();
                        res.json({ success: false, msg: 'There are form errors', errors: errors });
                    }
                    else {
                        let ManagerInstance = 'loginManager';
                        if (req.body.auth_type !== undefined) {
                            if (req.body.auth_type == 'SOCIAL') {
                                ManagerInstance = 'socialLoginManager';
                            }
                            else {
                                ManagerInstance = 'loginManager';
                            }
                        }
                        yield api_manager_1.default[ManagerInstance](req.body)
                            .then(data => {
                            let resData = data;
                            if (resData.success) {
                                let user_data = resData.user_data;
                                resData['data'] = { "client-token": API.generateClientToken(user_data._user_id) };
                                delete (resData.user_data);
                                delete (resData.url);
                                api_1.default.apiResponse(res, 200, true, resData.message, resData['data']);
                            }
                        }, err => {
                            console.log('there is a promise reject');
                            api_1.default.apiResponse(res, 400, false, err.message);
                        })
                            .catch(err => {
                            api_1.default.apiResponse(res, 400, false, err.message);
                        });
                    }
                });
            });
        }));
        APIRouter.route('/register')
            .post(inputvalidator_1.default.register, (req, res) => __awaiter(this, void 0, void 0, function* () {
            req.getValidationResult().then(function (result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!result.isEmpty()) {
                        res.status(400);
                        var errors = result.array();
                        res.json({ success: false, msg: 'There are form errors', errors: errors });
                    }
                    else {
                        req.body['registered_device_type'] = "MOBILE";
                        yield api_manager_1.default.register(req.body)
                            .then(data => {
                            let resData = data;
                            if (resData.success) {
                                delete (resData.status);
                                api_1.default.apiResponse(res, 200, true, resData.message, { email: resData.email });
                            }
                        }, err => {
                            api_1.default.apiResponse(res, 400, false, err.message);
                        })
                            .catch(e => {
                            api_1.default.apiResponse(res, 400, false, e.message);
                        });
                    }
                });
            });
        }));
        APIRouter.route('/email/verification')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let email = req.query.email;
        }));
        APIRouter.route('/profile')
            .get(api_1.default.validateClientToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let uuid = API.getUUIDFromClientToken(req.headers['client-token']);
                yield api_manager_1.default.getProfile(uuid)
                    .then(data => {
                    let resData = data;
                    if (resData.success) {
                        api_1.default.apiResponse(res, 200, true, resData.message, { first_name: resData.data._first_name, last_name: resData.data._last_name, email: resData.data._email, username: resData.data._username });
                    }
                }, err => {
                    api_1.default.apiResponse(res, 400, false, err.message);
                })
                    .catch(e => {
                    api_1.default.apiResponse(res, 400, false, e.message);
                });
            }
            catch (e) {
                api_1.default.apiResponse(res, 400, false, e.message);
            }
        }))
            .put(api_1.default.validateClientToken, inputvalidator_1.default.profileUpdate, (req, res) => __awaiter(this, void 0, void 0, function* () {
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    var errors = result.array();
                    api_1.default.apiResponse(res, 400, false, 'There are some form erros', { errors: errors });
                }
                else {
                    api_manager_1.default.updateProfile(req.body)
                        .then(data => {
                        let resData = data;
                        if (resData.success) {
                            api_1.default.apiResponse(res, 200, true, resData.message);
                        }
                    }, err => {
                        api_1.default.apiResponse(res, 400, true, err.message);
                    })
                        .catch(e => {
                        res.status(400).render('profile', { success: false, message: e.message });
                    });
                }
            });
        }));
        APIRouter.route('/resetPassword')
            .post(inputvalidator_1.default.emailValidate, (req, res) => __awaiter(this, void 0, void 0, function* () {
            req.getValidationResult().then(function (result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!result.isEmpty()) {
                        res.status(400);
                        var errors = result.array();
                        api_1.default.apiResponse(res, 400, false, 'Invalid Email Address.', errors);
                    }
                    else {
                        yield api_manager_1.default.forgotPassword(req.body)
                            .then(data => {
                            let resData = data;
                            if (resData.success) {
                                api_1.default.apiResponse(res, 200, true, resData.message, { email: resData.email_string, email_status: resData.status });
                            }
                        }, err => {
                            api_1.default.apiResponse(res, 400, false, err.message);
                        });
                    }
                });
            });
        }));
        APIRouter.route('/logout')
            .get(api_1.default.validateClientToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let uuid = API.getUUIDFromClientToken(req.headers['client-token']);
                yield api_manager_1.default.updateLogoutTime(uuid);
                api_1.default.apiResponse(res, 200, true, 'User Logged Out!');
            }
            catch (e) {
                api_1.default.apiResponse(res, 400, false, e.message);
            }
        }));
        APIRouter.route('/getAllHotels')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                request_1.default.get('/hotel_manager/getAllHotelsToFrontend', {})
                    .then(data => {
                    api_1.default.apiResponse(res, 200, true, data.message, data.data);
                })
                    .catch(e => {
                    api_1.default.apiResponse(res, 400, false, e.message);
                });
            }
            catch (e) {
                api_1.default.apiResponse(res, 400, false, e.message);
            }
        }));
        APIRouter.route('/getAllRoomTypesByHotel')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                request_1.default.get('/room_manager/getRoomTypesByHotel', { hotel_id: req.query.hotel_id })
                    .then(data => {
                    api_1.default.apiResponse(res, 200, true, data.message, data.data);
                })
                    .catch(e => {
                    api_1.default.apiResponse(res, 400, false, e.message);
                });
            }
            catch (e) {
                api_1.default.apiResponse(res, 400, false, e.message);
            }
        }));
        return APIRouter;
    }
    static generateClientToken(uuid) {
        return jwt.sign({ uuid: uuid }, app_1.tokenSecret);
    }
    static getUUIDFromClientToken(token) {
        try {
            var payload = jwt.verify(token, app_1.tokenSecret);
            return payload.uuid;
        }
        catch (e) {
            console.error(e);
        }
    }
}
exports.default = API;
