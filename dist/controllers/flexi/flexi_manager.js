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
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const identification_1 = require("../../helpers/identification");
const request_1 = require("../../helpers/request");
const time_1 = require("../../helpers/time");
const flexi_1 = require("../../models/flexi/flexi");
const RoomManager_1 = require("../rooms/RoomManager");
const FacilitiesAndServices_1 = require("../hotel_info/FacilitiesAndServices");
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
class FlexiManager {
    static get routes() {
        let FlexiRouter = express.Router();
        let FlexiCollection = core_1.default.app.get('mongoClient').get('flexi');
        FlexiRouter.route('/getFlexiDetails')
            .get(inputvalidator_1.default.queryID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let flexi_id = req.query.id;
            FlexiManager.getFlexiDetails(flexi_id)
                .then(data => {
                let resData = data;
                if (resData.success) {
                    return res.status(resData.status).json({ success: true, message: resData.message, data: resData.data });
                }
            }, err => {
                return res.status(err.status).json({ success: false, message: err.message });
            })
                .catch(err => {
                return res.status(400).json({ success: false, message: err.message });
            });
        }));
        FlexiRouter.route('/saveFlexiConfigInfo')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let newFlexiConfigData = req.body;
            let newFlexiDetails = flexi_1.default.createFlexi(newFlexiConfigData);
            let inputstatement;
            if (req.body.flexi_id !== undefined && inputvalidator_1.default.isValidUUID(req.body.flexi_id)) {
                inputstatement = FlexiCollection.findOneAndUpdate({
                    _flexi_id: req.body.flexi_id
                }, {
                    $set: newFlexiDetails
                });
            }
            else {
                newFlexiDetails['_flexi_id'] = identification_1.default.generateUuid;
                inputstatement = FlexiCollection.insert(newFlexiDetails);
            }
            yield inputstatement
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: (req.body.contactDetails_id !== undefined ? `Flexi Details has been updated with id ${document._flexi_id}` : `Flexi Details has been stored with id ${document._flexi_id}`),
                    data: document
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        FlexiRouter.route('/getOccupanyResults')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let check_in = req.body.check_in;
            let check_out = req.body.check_out;
            let occupancyRates = new Array();
            let rooms = yield RoomManager_1.default.getRoomTypes(hotel_id)
                .then(result => {
                if (result.success) {
                    request_1.default.post('/hotels-manager/manager/rates/sell/web', { hotel_uuid: hotel_id }, { check_in: check_in, check_out: time_1.default.addDays(1, check_out) })
                        .then(rateData => {
                        if (rateData.success) {
                            result.data.forEach(totalOccupanyType => {
                                rateData.data.rooms.forEach(roomType => {
                                    if (totalOccupanyType.type._type == roomType.type) {
                                        console.log('room type ' + roomType.type + ' room available ' + roomType.availability + ' total rooms ' + totalOccupanyType.rooms);
                                        let occupancyPer = ((Number(roomType.availability) / Number(totalOccupanyType.rooms)) * Number(100)).toFixed(2);
                                        occupancyRates.push({ roomType: roomType.type, availability_per: occupancyPer });
                                    }
                                });
                            });
                            if (occupancyRates.length > 0) {
                                FlexiManager.getFlexiDetails(null, hotel_id)
                                    .then(flexiRes => {
                                    if (flexiRes.success) {
                                        if (flexiRes.data._flexi_allowed == 'Yes') {
                                            let FlexiValidRoomTypesCount = 0;
                                            let FlexiAllowedRoomTypes = new Array();
                                            flexiRes.data._occupancy_level.forEach(occupancyLevel => {
                                                occupancyRates.forEach(freePerObj => {
                                                    if (freePerObj.roomType == occupancyLevel._room_type_id) {
                                                        let InventoryOccupancy = (100 - Number(freePerObj.availability_per));
                                                        if (occupancyLevel._occupancy_percentage >= InventoryOccupancy) {
                                                            FlexiValidRoomTypesCount++;
                                                            FlexiAllowedRoomTypes.push(freePerObj.roomType);
                                                        }
                                                    }
                                                });
                                            });
                                            if (FlexiValidRoomTypesCount > 0) {
                                                return res.status(200).json({ success: true, message: 'flexi is allowed ', data: { occupancy_rates: occupancyRates, flexiMarkup: flexiRes.data._price_mark_up, FlexiAllowedTypes: FlexiAllowedRoomTypes } });
                                            }
                                            else {
                                                return res.status(200).json({ success: false, message: 'flexi is not allowed', data: occupancyRates });
                                            }
                                        }
                                        else {
                                            return res.status(200).json({ success: false, message: 'Flexi is not enabled for this hotel' });
                                        }
                                    }
                                    else {
                                        return res.status(200).json({ success: false, message: 'count not find the flexi for the given hotel' });
                                    }
                                }, err => {
                                    return res.status(200).json({ success: false, message: err.message });
                                })
                                    .catch(err => {
                                    return res.status(400).json({ success: false, message: err.message });
                                });
                            }
                            else {
                                return res.status(200).json({ success: false, message: 'Occupancy Rate are not loaded' });
                            }
                        }
                        else {
                            return res.status(200).json({ success: false, message: 'count not find the avilabilty for the given dates' });
                        }
                    })
                        .catch(err => {
                        res.status(400).json({ success: false, message: err.message });
                    });
                }
                else {
                    res.status(200).json({ success: false, message: 'No rooms Available for a given hotel' });
                }
            })
                .catch(err => {
                res.status(400).json({ success: false, message: err.message });
            });
        }));
        return FlexiRouter;
    }
    static getFlexiDetails(flexi_id = null, hotel_id = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let Master = yield RoomManager_1.default.getAllMasters();
            let FlexiCollection = core_1.default.app.get('mongoClient').get('flexi');
            let query = {};
            if (hotel_id === null && flexi_id !== null) {
                query['_flexi_id'] = flexi_id;
            }
            else if (hotel_id !== null) {
                query['_hotel_id'] = hotel_id;
            }
            yield FlexiCollection
                .find(query)
                .then(data => {
                if (data.length > 0) {
                    let flexi = data[0];
                    flexi._occupancy_level.forEach(occupancy => {
                        occupancy._room_type_id = occupancy._room_type;
                        occupancy._room_type = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', occupancy._room_type);
                    });
                    data[0]._flexi_allowed = (data[0]._flexi_allowed === true ? 'Yes' : 'No');
                    resolve({ success: true, status: 200, message: 'successfully fetched the flexi details', data: data[0] });
                }
                else {
                    reject({ success: false, status: 200, message: 'could not  fetched the flexi details' });
                }
            })
                .catch(err => {
                reject({ success: false, status: 400, message: err.message });
            });
        }));
    }
}
exports.default = FlexiManager;
