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
const RoomManager_1 = require("./RoomManager");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const FacilitiesAndServices_1 = require("../hotel_info/FacilitiesAndServices");
const FileManager_1 = require("../../helpers/FileManager");
var ObjectId = require('mongodb').ObjectID;
class Rooms {
    static get routes() {
        let RoomsRouter = express.Router();
        RoomsRouter.route('/:id/rooms')
            .get(inputvalidator_1.default.paramsViewID('rooms_listings'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let Masters = yield RoomManager_1.default.getAllMasters();
            res.status(200);
            res.render('rooms_listings', { masters: Masters, hotel_id: req.params.id });
        }));
        RoomsRouter.route('/:id/room/type')
            .get(inputvalidator_1.default.paramsID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let Master = yield RoomManager_1.default.getAllMasters();
            let postbody = JSON.stringify({});
            APIClient_1.default.send('/room_manager/types?hotel_id=' + req.params.id, postbody, function (api_result) {
                let templateData = {};
                if (api_result.success) {
                    Object.keys(api_result.data).forEach((key) => __awaiter(this, void 0, void 0, function* () {
                        api_result.data[key]['type']['_type_id'] = api_result.data[key]['type']['_type'];
                        api_result.data[key]['type']['_type'] = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', api_result.data[key]['type']['_type']);
                        api_result.data[key]['type']['_name'] = FacilitiesAndServices_1.default.findMastertext(Master, 'room_names', api_result.data[key]['type']['_name']);
                        let links = yield FileManager_1.default.getFiles(JSON.stringify(api_result.data[key]['type']['_image_fids']), 'medium');
                        api_result.data[key]['type']['_uploadformFids'] = JSON.stringify(api_result.data[key]['type']['_image_fids']);
                        if (links.success) {
                            let NewImageArr = new Array();
                            Object.keys(links.data).forEach(image => {
                                NewImageArr.push({ image: links.data[image], fid: links.fids[image] });
                            });
                            api_result.data[key]['type']['_image_fids'] = NewImageArr;
                        }
                    }));
                    templateData['success'] = true,
                        templateData['message'] = api_result.message,
                        templateData['hotel_id'] = req.params.id,
                        templateData['data'] = api_result.data;
                    templateData['displayStatus'] = true;
                    res.status(200)
                        .render('roomtypelist', templateData);
                }
                else {
                    templateData['success'] = false,
                        templateData['message'] = api_result.message,
                        templateData['hotel_id'] = req.params.id,
                        templateData['displayStatus'] = false;
                    res.status(400)
                        .render('roomtypelist', templateData);
                }
            }, 'GET');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        RoomsRouter.route('/room/type/create')
            .get(inputvalidator_1.default.checkQueryHidValid('roomtypecreation'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let Masters = yield RoomManager_1.default.getAllMasters();
            let requestparams = Masters;
            requestparams['requestBody'] = { hotel_id: req.query.hid, mode: 'create' };
            requestparams['formstatus'] = true;
            res.status(200);
            res.render('roomtypecreation', requestparams);
        }))
            .post(inputvalidator_1.default.validateRoomType('web'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let room_data_list = new Array();
            if (req.body.virtual_room === undefined) {
                req.body.virtual_room = new Array();
            }
            Object.keys(req.body.room_number).forEach((room, index) => {
                room_data_list.push({ number: req.body.room_number[room], floorNumber: req.body.floor_number[room] });
                req.body.virtual_room.forEach((vr, key) => {
                    if (vr == "virtual_room_" + (index + 1)) {
                        room_data_list[index]['virtualRoom'] = true;
                        req.body.virtual_room[index] = 'on';
                    }
                });
                if (room_data_list[index]['virtualRoom'] === undefined) {
                    room_data_list[index]['virtualRoom'] = false;
                }
            });
            if (req.query.id !== undefined) {
                Object.keys(req.body.room_number).forEach((room, index) => {
                    room_data_list[room]['room_id'] = req.body.room_id[index];
                });
            }
            let bedStandardArrangement = new Array();
            Object.keys(req.body.standard_bed_type).forEach(stbt => {
                bedStandardArrangement.push({ type: req.body.standard_bed_type[stbt], number: req.body.standard_no_of_beds[stbt] });
            });
            let bedAlternativeArrangement = new Array();
            Object.keys(req.body.addon_bed_type).forEach(abt => {
                bedAlternativeArrangement.push({ type: req.body.addon_bed_type[abt], number: req.body.addon_no_of_beds[abt] });
            });
            let roomTypeData = {};
            roomTypeData['type'] = req.body.room_type;
            roomTypeData['smokingPolicy'] = req.body.smoking_policy;
            roomTypeData['no_of_rooms'] = req.body.no_of_rooms;
            roomTypeData['no_of_guest_stay'] = req.body.guest_number;
            roomTypeData['no_of_bedrooms'] = req.body.no_of_bedrooms;
            roomTypeData['bedStandardArrangement'] = bedStandardArrangement;
            roomTypeData['bedAlternativeArrangement'] = bedAlternativeArrangement;
            roomTypeData['measurementUnit'] = req.body.measurement_unit;
            roomTypeData['size'] = req.body.room_size;
            roomTypeData['image_fids'] = this.convertImageStringsToArray(req.body.room_type_images);
            let ArrayFields = new Array({ field: 'RA', fieldobj: 'room' }, { field: 'BA', fieldobj: 'bathroom' }, { field: 'MT', fieldobj: 'mediaAndTechnology' }, { field: 'FD', fieldobj: 'foodAndDrink' }, { field: 'SE', fieldobj: 'servicesAndExtras' }, { field: 'OV', fieldobj: 'outdoorAndView' }, { field: 'ACC', fieldobj: 'accessibility' }, { field: 'EFS', fieldobj: 'entertainmentAndFamilyServices' });
            let room_amenities_data = {};
            Object.keys(ArrayFields).forEach(key => {
                room_amenities_data[ArrayFields[key]['fieldobj']] = FacilitiesAndServices_1.default.buildCheckboxObject(ArrayFields[key]['field'], req.body[ArrayFields[key]['field']], req);
            });
            let newRoomDetails = {};
            newRoomDetails['hotel_id'] = req.body.hotel_id;
            newRoomDetails['initial_no_of_rooms'] = req.body.initial_no_of_rooms;
            newRoomDetails['room_data_list'] = room_data_list;
            newRoomDetails['room_type_data'] = roomTypeData;
            newRoomDetails['room_amenities_data'] = room_amenities_data;
            let errorobj = yield RoomManager_1.default.getAllMasters();
            errorobj['requestBody'] = req.body;
            if (req.query.id !== undefined) {
                newRoomDetails['roomtype_id'] = req.query.id;
                var postbody = JSON.stringify(newRoomDetails);
                errorobj['roomtype_id'] = req.query.id;
                errorobj['requestBody']['mode'] = 'edit';
            }
            else {
                errorobj['requestBody']['mode'] = 'create';
                var postbody = JSON.stringify(newRoomDetails);
            }
            errorobj['formstatus'] = true;
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    var err = result.array();
                    errorobj['success'] = false;
                    errorobj['message'] = "There are some form erros. Please check";
                    errorobj['data'] = err;
                    errorobj['formErrorExists'] = true;
                    for (let error of err) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    res.status(400).render('roomtypecreation', errorobj);
                }
                else {
                    let method = 'POST';
                    if (req.query.id !== undefined) {
                        method = 'PUT';
                    }
                    APIClient_1.default.send('/room_manager', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/hotel/' + req.body.hotel_id + '/room/type');
                        }
                        else {
                            errorobj['success'] = api_result.success;
                            errorobj['message'] = api_result.message;
                            errorobj['formErrorExists'] = true;
                            res.status(400)
                                .render('roomtypecreation', errorobj);
                        }
                    }, method);
                }
            }).catch(err => {
                if (err) {
                    errorobj['success'] = false;
                    errorobj['message'] = "There are some form erros. Please check";
                    errorobj['data'] = err;
                    errorobj['formErrorExists'] = true;
                    for (let error of err) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    res.status(400).render('roomtypecreation', errorobj);
                }
            });
        }));
        RoomsRouter.route('/:hotel_id/room/type/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let dataObj = yield RoomManager_1.default.getAllMasters();
            dataObj['formstatus'] = true;
            dataObj['roomtype_id'] = req.params.id;
            let roomsData = yield RoomManager_1.default.getRoomTypeDetailsByType(req.params.hotel_id, req.params.id);
            if (roomsData.success) {
                let requestBody = { mode: 'edit' };
                requestBody['room_number'] = new Array();
                requestBody['room_id'] = new Array();
                requestBody['floor_number'] = new Array();
                requestBody['standard_bed_type'] = new Array();
                requestBody['standard_no_of_beds'] = new Array();
                requestBody['addon_bed_type'] = new Array();
                requestBody['addon_no_of_beds'] = new Array();
                requestBody['virtual_room'] = new Array();
                roomsData.data.forEach((room, index) => {
                    requestBody['room_number'][index] = room._number;
                    requestBody['floor_number'][index] = room._floorNumber;
                    requestBody['room_id'][index] = room._room_id;
                    requestBody['virtual_room'][index] = (room['_virtualRoom'] === undefined ? "off" : (room['_virtualRoom'] === true ? "on" : "off"));
                });
                let room = roomsData.data[0];
                requestBody['hotel_id'] = room._hotelId;
                requestBody['no_of_rooms'] = room._type._no_of_rooms;
                requestBody['room_type'] = room._type._type;
                requestBody['smoking_policy'] = room._type._smokingPolicy;
                requestBody['measurement_unit'] = room._type._measurementUnit;
                requestBody['room_size'] = room._type._size;
                requestBody['guest_number'] = room._type._no_of_guest_stay;
                requestBody['no_of_bedrooms'] = room._type._no_of_bedrooms;
                room._type._bedStandardArrangement.forEach((sbed, index) => {
                    requestBody['standard_bed_type'][index] = sbed.type;
                    requestBody['standard_no_of_beds'][index] = sbed.number;
                });
                room._type._bedAlternativeArrangement.forEach((abed, index) => {
                    requestBody['addon_bed_type'][index] = abed.type;
                    requestBody['addon_no_of_beds'][index] = abed.number;
                });
                requestBody['room_type_images'] = JSON.stringify(room._type._image_fids);
                let ArrayFields = new Array({ field: 'RA', fieldobj: 'room' }, { field: 'BA', fieldobj: 'bathroom' }, { field: 'MT', fieldobj: 'mediaAndTechnology' }, { field: 'FD', fieldobj: 'foodAndDrink' }, { field: 'SE', fieldobj: 'servicesAndExtras' }, { field: 'OV', fieldobj: 'outdoorAndView' }, { field: 'ACC', fieldobj: 'accessibility' }, { field: 'EFS', fieldobj: 'entertainmentAndFamilyServices' });
                ArrayFields.forEach((fieldProp, key) => {
                    let amenity = new Array();
                    let dbArray = room._amenities['_' + ArrayFields[key]['fieldobj']];
                    dbArray.forEach(field => {
                        amenity.push(field._parent_id);
                        let imagefield = 'image_' + ArrayFields[key]["field"] + '_' + field._parent_id;
                        requestBody[imagefield] = field._image_fids;
                    });
                    requestBody[ArrayFields[key]['field']] = amenity;
                });
                dataObj['requestBody'] = requestBody;
                res.status(200);
                res.render('roomtypecreation', dataObj);
            }
            else {
                res.status(400);
                dataObj['message'] = 'Invalid Room Type';
                res.render('roomtypecreation', dataObj);
            }
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        RoomsRouter.route('/uploadRoomTypeImage')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let room_type = req.body.roomtype;
            let fids = req.body.fids;
            let result = yield RoomManager_1.default.saveRoomTypeImages(hotel_id, room_type, JSON.parse(fids));
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }))
            .delete((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let room_type = req.body.roomtype;
            let fid = req.body.fid;
            let result = yield RoomManager_1.default.deleteRoomTypeImage(hotel_id, room_type, fid);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }));
        RoomsRouter.use(function (req, res) {
            res.type("text/html");
            res.status(404);
            res.render("404");
        });
        RoomsRouter.use(function (req, res) {
            res.status(500);
            res.render("500");
        });
        return RoomsRouter;
    }
    static convertImageStringsToArray(formString) {
        let ImageArray = new Array();
        if (formString !== null && formString != "" && formString !== undefined) {
            formString = JSON.parse(formString);
            Object.keys(formString).forEach(fid => {
                ImageArray.push(formString[fid]);
            });
            return ImageArray;
        }
        else {
            return ImageArray;
        }
    }
}
exports.default = Rooms;
