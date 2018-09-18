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
const APIClient_1 = require("../../helpers/APIClient");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const maintenance_manager_1 = require("./maintenance_manager");
const RoomManager_1 = require("../rooms/RoomManager");
const FacilitiesAndServices_1 = require("../hotel_info/FacilitiesAndServices");
const time_1 = require("../../helpers/time");
const moment = require('moment');
class MaintenanceController {
    static get routes() {
        let MaintenanceRouter = express.Router();
        MaintenanceRouter.route('/rooms')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond = {};
            let masters = yield RoomManager_1.default.getAllMasters();
            let UserSession = res.locals.user_details;
            if (UserSession !== undefined) {
                if (Object.keys(UserSession._roles).length) {
                    if (UserSession._roles['Admin'] === undefined && UserSession._hotel_name !== undefined && UserSession._hotel_name != "") {
                        res.status(200);
                        respond = { success: true, roomLinkable: 1, masters: masters, hotel_id: UserSession._hotel_name, message: 'Successfully retrived Hotel Rooms' };
                    }
                }
                else {
                    res.status(400);
                    respond = { success: false, message: 'Hotel ID is not updated for a given USER' };
                }
            }
            else {
                res.status(400);
                respond = { success: false, message: 'User session does not exists' };
            }
            res.render('rooms_listings', respond);
        }));
        MaintenanceRouter.route('/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield maintenance_manager_1.default.getAllMasters();
            res.status(200);
            res.render('pms/maintenance_list', { masters: masters });
        }));
        MaintenanceRouter.route('/:id/view')
            .get(inputvalidator_1.default.paramsViewID('pms/maintenance'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield maintenance_manager_1.default.getAllMasters();
            APIClient_1.default.send('/maintenance_manager/' + req.params.id, JSON.stringify({}), function (api_result) {
                if (api_result.success) {
                    try {
                        api_result.data[0]['status'] = FacilitiesAndServices_1.default.findMastertext(masters, 'status', api_result.data[0]['status']);
                        api_result.data[0]['reason'] = FacilitiesAndServices_1.default.findMastertext(masters, 'reason', api_result.data[0]['reason']);
                        api_result.data[0]['from_date'] = time_1.default.formatGivenDate(api_result.data[0]['from_date']);
                        api_result.data[0]['to_date'] = time_1.default.formatGivenDate(api_result.data[0]['to_date']);
                        api_result.data[0]['modifiedTime'] = time_1.default.formatGivenDate(api_result.data[0]['modifiedTime']);
                        api_result.data[0]['blockstatus'] = FacilitiesAndServices_1.default.findMastertext(masters, 'blockstatus', api_result.data[0]['blockstatus']);
                        res.status(200)
                            .render('pms/maintenance_view', { success: api_result.success, message: api_result.message, data: api_result.data[0] });
                    }
                    catch (e) {
                        res.status(400)
                            .render('pms/maintenance_view', { success: false, message: e });
                    }
                }
                else {
                    res.status(400)
                        .render('pms/maintenance_view', api_result);
                }
            }, 'GET');
        }));
        MaintenanceRouter.route('/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield maintenance_manager_1.default.getAllMasters();
            let RoomMasters = yield RoomManager_1.default.getAllMasters();
            let requestBody = {};
            APIClient_1.default.send('/maintenance_manager/' + req.params.id, JSON.stringify({}), function (api_result) {
                if (api_result.success) {
                    let room_json = {};
                    let requestBody = api_result.data[0];
                    requestBody['from_date'] = time_1.default.formatGivenDate(api_result.data[0]['from_date']),
                        requestBody['to_date'] = time_1.default.formatGivenDate(api_result.data[0]['to_date']),
                        room_json['room_id'] = api_result.data[0]['room_id'];
                    room_json['flooNumber'] = api_result.data[0]['floor_no'];
                    room_json['room_name'] = api_result.data[0]['room_name'];
                    room_json['value'] = api_result.data[0]['room_no'];
                    room_json['text'] = api_result.data[0]['room_no'];
                    requestBody['room_details'] = JSON.stringify([room_json]);
                    res.status(200)
                        .render('pms/maintenance', { mode: 'edit', hotel_id: res.locals.user_details._hotel_name, blockid: req.params.id, masters: masters, formstatus: true, success: api_result.success, message: api_result.message, requestBody: requestBody });
                }
                else {
                    res.status(400)
                        .render('pms/maintenance', api_result);
                }
            }, 'GET');
        }));
        MaintenanceRouter.route('/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let postbody = JSON.stringify({});
            let masters = yield maintenance_manager_1.default.getAllMasters();
            res.status(200).render('pms/maintenance', { formstatus: true, masters: masters, mode: 'create', hotel_id: res.locals.user_details._hotel_name });
        }))
            .post(inputvalidator_1.default.maintainanceValidate('web'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            errorobj['masters'] = yield maintenance_manager_1.default.getAllMasters();
            console.log(req.session.user._user_id);
            let Mdata = {
                user_id: req.session.user._user_id,
                from_date: req.body.from_date,
                to_date: req.body.to_date,
                reason: req.body.reason,
                status: req.body.status,
                room_details: req.body.room_details,
                blockstatus: req.body.blockstatus
            };
            if (req.query.blockid !== undefined && inputvalidator_1.default.isValidUUID(req.query.blockid)) {
                errorobj['blockid'] = req.query.blockid;
                Mdata['blockid'] = req.query.blockid;
            }
            let postbody = JSON.stringify(Mdata);
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    errorobj['formstatus'] = true;
                    res.render('pms/maintenance', errorobj);
                }
                else {
                    APIClient_1.default.send('/maintenance_manager/', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/pms/maintenance/list');
                        }
                        else {
                            errorobj['success'] = api_result.success;
                            errorobj['message'] = api_result.message;
                            errorobj['formstatus'] = true;
                            res.status(400)
                                .render('pms/maintenance', errorobj);
                        }
                    });
                }
            });
        }));
        return MaintenanceRouter;
    }
}
exports.default = MaintenanceController;
