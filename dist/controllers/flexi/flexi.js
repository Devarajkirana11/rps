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
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const express = require("express");
var in_array = require('in_array');
var moment = require('moment');
class Flexi {
    static get routes() {
        let FlexiRouter = express.Router();
        FlexiRouter.route('/config/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.query.hotel_id !== undefined && inputvalidator_1.default.isValidUUID(req.query.hotel_id)) {
                let hotel_id = req.query.hotel_id;
                yield Flexi.fetchRoomTypes(hotel_id)
                    .then(roomTypedataRes => {
                    let roomTypedata = roomTypedataRes;
                    if (roomTypedata.success) {
                        res.status(200).render('flexiconfig', { formstatus: true, mode: 'new', hotel_id: hotel_id, data: roomTypedata.data.rooms });
                    }
                    else {
                        res.status(200).render('flexiconfig', { success: false, mode: 'new', formstatus: false, message: 'Room Types could not be fetched' });
                    }
                }, err => {
                    res.status(200).render('flexiconfig', { success: false, mode: 'new', formstatus: false, message: err.message });
                })
                    .catch(e => {
                    res.status(400).render('flexiconfig', { success: false, mode: 'new', formstatus: false, message: e.message });
                });
            }
            else {
                res.status(200).render('flexiconfig', { success: false, mode: 'new', formstatus: false, message: 'Hotel ID is Required/Invalid' });
            }
        }))
            .post(inputvalidator_1.default.flexiValidate, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let mode;
            var occupancy_levels = new Array();
            req.body.room_level_occupancy.forEach((occupancy, index) => {
                occupancy_levels.push({ room_type: req.body.room_type_ids[index], occupancy_percentage: occupancy });
            });
            var newFlexiDetails = {
                flexi_allowed: (req.body.flexiallowed == "on" ? true : false),
                hotel_id: req.body.hotel_id,
                last_checkin_time: req.body.lastcheckintime,
                price_mark_up: req.body.pricemarkup,
                occupancy_level: occupancy_levels
            };
            console.log('post body', req.body);
            let errorobj = {};
            if (req.query.id !== undefined) {
                newFlexiDetails['flexi_id'] = req.query.id;
                errorobj['hotel_id'] = req.body.hotel_id;
                errorobj['flexi_id'] = req.query.id;
                mode = 'edit';
            }
            else {
                newFlexiDetails['hotel_id'] = req.body.hotel_id;
                mode = 'new';
            }
            errorobj['requestBody'] = req.body;
            errorobj['formstatus'] = true;
            errorobj['hotel_id'] = req.body.hotel_id;
            req.getValidationResult().then(function (result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!result.isEmpty()) {
                        res.status(400);
                        var errors = result.array();
                        for (let error of errors) {
                            var key = error.param;
                            errorobj[key] = error.msg;
                        }
                        yield Flexi.fetchRoomTypes(req.body.hotel_id)
                            .then(roomTypedataRes => {
                            let roomTypedata = roomTypedataRes;
                            let new_room_type_ids = new Array();
                            let new_room_type_names = new Array();
                            let new_room_occupancy = new Array();
                            if (roomTypedata.success) {
                                roomTypedata.data.rooms.forEach(roomType => {
                                    let resMatched = 0;
                                    req.body.room_level_occupancy.forEach((occupancy, index) => {
                                        if (roomType.room_type_id == req.body.room_type_ids[index]) {
                                            resMatched = 1;
                                        }
                                    });
                                    if (resMatched == 0) {
                                        new_room_type_ids.push(roomType.room_type_id);
                                        new_room_type_names.push(roomType._type);
                                        new_room_occupancy.push('');
                                    }
                                });
                                errorobj['requestBody']['room_level_occupancy'].concat(new_room_occupancy);
                                errorobj['requestBody']['room_type_names'].concat(new_room_type_names);
                                errorobj['requestBody']['room_type_ids'].concat(new_room_type_ids);
                                errorobj['requestBody']['flexiallowed'] = (req.body.flexiallowed == "on" ? 'Yes' : 'No');
                                res.render('flexiconfig', errorobj);
                            }
                        }, err => {
                            res.status(400).render('flexiconfig', { success: false, mode: mode, formstatus: false, message: err.message });
                        })
                            .catch(e => {
                            res.status(400).render('flexiconfig', { success: false, mode: mode, formstatus: false, message: e.message });
                        });
                    }
                    else {
                        request_1.default.post('/flexi_manager/saveFlexiConfigInfo', {}, newFlexiDetails)
                            .then(api_result => {
                            if (api_result.success) {
                                res.status(200)
                                    .redirect('/flexi/config/' + api_result.data._flexi_id + '/view?hotel_id=' + req.body.hotel_id);
                            }
                            else {
                                errorobj['success'] = false;
                                errorobj['message'] = api_result.message;
                                res.status(400)
                                    .render('flexiconfig', errorobj);
                            }
                        });
                    }
                });
            });
        }));
        FlexiRouter.route('/config/:id/edit')
            .get(inputvalidator_1.default.paramsViewID('flexiconfig'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let flexi_id = req.params.id;
            request_1.default.get('/flexi_manager/getFlexiDetails', { id: flexi_id })
                .then((fdata) => __awaiter(this, void 0, void 0, function* () {
                if (fdata.success) {
                    let existing_room_level_occupany = new Array();
                    let existing_room_type_ids = new Array();
                    let existing_room_type_names = new Array();
                    let flexi_id = fdata.data._flexi_id;
                    let hotel_id = fdata.data._hotel_id;
                    let editContent = {
                        flexiallowed: fdata.data._flexi_allowed,
                        lastcheckintime: (fdata.data._last_checkin_time === undefined ? 'select' : fdata.data._last_checkin_time),
                        pricemarkup: fdata.data._price_mark_up,
                    };
                    fdata.data._occupancy_level.forEach((occupancy, index) => {
                        existing_room_level_occupany.push(occupancy._occupancy_percentage);
                        existing_room_type_ids.push(occupancy._room_type_id);
                        existing_room_type_names.push(occupancy._room_type);
                    });
                    yield Flexi.fetchRoomTypes(fdata.data._hotel_id)
                        .then(roomTypedataRes => {
                        let roomTypedata = roomTypedataRes;
                        let new_room_type_ids = new Array();
                        let new_room_type_names = new Array();
                        let new_room_occupancy = new Array();
                        if (roomTypedata.success) {
                            roomTypedata.data.rooms.forEach(roomType => {
                                let resMatched = 0;
                                fdata.data._occupancy_level.forEach((occupancy, index) => {
                                    if (roomType.room_type_id == occupancy._room_type_id) {
                                        resMatched = 1;
                                    }
                                });
                                if (resMatched == 0) {
                                    new_room_type_ids.push(roomType.room_type_id);
                                    new_room_type_names.push(roomType._type);
                                    new_room_occupancy.push('');
                                }
                            });
                            editContent['room_level_occupancy'] = existing_room_level_occupany.concat(new_room_occupancy);
                            editContent['room_type_names'] = existing_room_type_names.concat(new_room_type_names);
                            editContent['room_type_ids'] = existing_room_type_ids.concat(new_room_type_ids);
                            res.status(200).render('flexiconfig', { success: true, formstatus: true, message: 'successfully fetched the flexi details', flexi_id: flexi_id, hotel_id: hotel_id, requestBody: editContent });
                        }
                    }, err => {
                        res.status(400).render('flexiconfig', { success: false, mode: 'edit', formstatus: false, message: err.message });
                    })
                        .catch(e => {
                        res.status(400).render('flexiconfig', { success: false, mode: 'edit', formstatus: false, message: e.message });
                    });
                }
                else
                    res.status(400).render('flexiconfig', { success: false, message: 'coul not fetch the flexi details' });
            }))
                .catch(err => {
                res.status(400).render('flexiconfig', { success: false, message: err.message });
            });
        }));
        FlexiRouter.route('/config/:id/view')
            .get(inputvalidator_1.default.paramsViewID('flexiconfig'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let flexi_id = req.params.id;
            request_1.default.get('/flexi_manager/getFlexiDetails', { id: flexi_id })
                .then(data => {
                console.log('data inside', data);
                if (data.success)
                    res.status(200).render('flexiconfig_details', { success: true, message: 'successfully fetched the flexi details', data: data.data });
                else
                    res.status(400).render('flexiconfig_details', { success: false, message: 'coul not fetch the flexi details' });
            })
                .catch(err => {
                console.log('catch err', err.message);
                res.status(400).render('flexiconfig_details', { success: false, message: err.message });
            });
        }));
        return FlexiRouter;
    }
    static fetchRoomTypes(hotel_id) {
        return new Promise((resolve, reject) => {
            request_1.default.get('/room_manager/getRoomTypesByHotel', { hotel_id: hotel_id })
                .then(roomTypedata => {
                if (roomTypedata.success) {
                    resolve({ success: true, data: roomTypedata.data });
                }
                else {
                    reject({ success: false, message: 'Room Types could not be fetched' });
                }
            })
                .catch(e => {
                reject({ success: false, message: e.message });
            });
        });
    }
}
exports.default = Flexi;
