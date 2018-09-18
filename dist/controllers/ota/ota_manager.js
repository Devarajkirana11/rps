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
const time_1 = require("../../helpers/time");
const request_1 = require("../../helpers/request");
const app_1 = require("../../config/app");
const express = require("express");
var moment = require('moment');
var in_array = require('in_array');
class ota {
    static get routes() {
        let OTARouter = express.Router();
        let RoomsCollection = core_1.default.app.get('mongoClient').get('rooms');
        let RoomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let RoomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
        let RatesCollection = core_1.default.app.get('mongoClient').get('rates');
        let MasterDetails = core_1.default.app.get('mongoClient').get('masters');
        let HotelDetails = core_1.default.app.get('mongoClient').get('hotel_details');
        let PaymentCollection = core_1.default.app.get('mongoClient').get('payments');
        let BookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let OTABookingRequestCollection = core_1.default.app.get('mongoClient').get('OTABookingRequest');
        let OTARatePlansCollection = core_1.default.app.get('mongoClient').get('OTARatePlans');
        OTARouter.route('/get-hotel-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let postvalues = {
                "roomrequest": {
                    "username": app_1.environments[process.env.ENV].staah_credentials.username,
                    "password": app_1.environments[process.env.ENV].staah_credentials.password,
                    "hotel_id": "7752"
                }
            };
            request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, postvalues).then(response => {
                res.status(200);
                respond = {
                    success: true,
                    msg: "Success",
                    data: response
                };
                res.json(respond);
            }).catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    msg: "Failed"
                };
                res.json(respond);
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        OTARouter.route('/bulk-rate-update')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_uuid = req.query.hotel_id;
            let rooms_details;
            let rates_details;
            let respond;
            let start_date;
            let end_date;
            let hotel_code;
            let pms_username;
            let pms_password;
            let cost = 0;
            let final_cost = 0;
            let room_array = [];
            let room_type_array = [];
            let markups_array = [];
            yield HotelDetails
                .findOne({ _hotel_id: hotel_uuid, _status: "1" })
                .then(document => {
                hotel_code = document._ota_hotel_code;
                pms_username = document._ota_username;
                pms_password = document._ota_password;
            })
                .catch(error => { });
            if (hotel_code > 0) {
                yield MasterDetails
                    .find({ type: 1 })
                    .then(document => {
                    room_type_array = document[0].dropdown[0].data;
                })
                    .catch(error => {
                });
                let room_types = [];
                room_type_array.forEach(function (product, index) {
                    room_types[product.value] = product.text;
                });
                yield RatesCollection
                    .findOne({ _hotelId: hotel_uuid })
                    .then(document => {
                    rates_details = document;
                })
                    .catch(error => {
                    console.log(error);
                });
                let postvalues = {
                    "roomrequest": {
                        "username": pms_username,
                        "password": pms_password,
                        "hotel_id": hotel_code
                    }
                };
                yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, postvalues).then(response => {
                    let output = response.roomresponse.rooms.room;
                    rates_details._roomTypeMarkups.forEach(function (value, index) {
                        markups_array[value.roomType] = value.markup;
                    });
                    output.forEach(function (value, index) {
                        let sell_rates_array = [];
                        let room_rates_array = [];
                        let markups;
                        let room_type_id = value.room_id;
                        let room_type_name = value.room_name;
                        let room_type_index = room_types.indexOf(room_type_name);
                        if (room_type_index > 0) {
                            markups = markups_array[room_type_index];
                        }
                        let default_cost = rates_details._defaultCostRate;
                        let datewise = rates_details._defaultDateWiseCost;
                        let sell_rate_plans = rates_details._sellRatePlans;
                        let today = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY').toDate();
                        let today_format = time_1.default.OTAformatGivenDate(today);
                        let multipleRates = value.rates;
                        let breakFastRate = 0;
                        multipleRates.forEach(function (values, indexs) {
                            let dates_array = [];
                            let rate_id = values.rate_id;
                            sell_rate_plans.forEach(function (valuer, indexr) {
                                let ratePlanName = valuer.name + ' With Breakfast';
                                if (ratePlanName == values.rate_name) {
                                    breakFastRate = 0;
                                    sell_rates_array[0] = valuer;
                                }
                                else if (valuer.name == values.rate_name) {
                                    sell_rates_array[0] = valuer;
                                    breakFastRate = 0;
                                }
                            });
                            if (markups.type == 0) {
                                if (markups.coating == 0) {
                                    cost = Number(default_cost) + Number(default_cost) / 100 * Number(markups.value);
                                    if (sell_rates_array.length > 0) {
                                        if (sell_rates_array[0].markup.type == 0) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                        else if (sell_rates_array[0].markup.type == 1) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                    }
                                }
                                else {
                                    cost = Number(default_cost) - Number(default_cost) / 100 * Number(markups.value);
                                    if (sell_rates_array.length > 0) {
                                        if (sell_rates_array[0].markup.type == 0) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                        else if (sell_rates_array[0].markup.type == 1) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if (markups.coating == 0) {
                                    cost = Number(default_cost) + Number(markups.value);
                                    if (sell_rates_array.length > 0) {
                                        if (sell_rates_array[0].markup.type == 0) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                        else if (sell_rates_array[0].markup.type == 1) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                    }
                                }
                                else {
                                    cost = Number(default_cost) - Number(markups.value);
                                    if (sell_rates_array.length > 0) {
                                        if (sell_rates_array[0].markup.type == 0) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(cost) / 100 * Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                        else if (sell_rates_array[0].markup.type == 1) {
                                            if (sell_rates_array[0].markup.coating == 0) {
                                                cost = Number(cost) + Number(sell_rates_array[0].markup.value);
                                            }
                                            else {
                                                cost = Number(cost) - Number(sell_rates_array[0].markup.value);
                                            }
                                        }
                                    }
                                }
                            }
                            cost = cost + breakFastRate;
                            let datewise_value = { "start_date": today_format, "end_date": "2018-12-31", "price": cost };
                            if (cost > 0) {
                                dates_array.push(datewise_value);
                            }
                            datewise.forEach(function (value, index) {
                                if (value.dates[0] >= today) {
                                    if (value.dates[0]) {
                                        start_date = time_1.default.OTAformatGivenDate(value.dates[0]);
                                    }
                                    if (value.dates[1]) {
                                        end_date = time_1.default.OTAformatGivenDate(value.dates[1]);
                                    }
                                    else {
                                        end_date = time_1.default.OTAformatGivenDate(value.dates[0]);
                                    }
                                    if (value.cost > 0) {
                                        cost = value.cost;
                                    }
                                    else {
                                        cost = default_cost;
                                    }
                                    if (markups.type == 0) {
                                        if (markups.coating == 0) {
                                            final_cost = Number(cost) + Number(cost) / 100 * Number(markups.value);
                                            if (sell_rates_array.length > 0) {
                                                if (sell_rates_array[0].markup.type == 0) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                                else if (sell_rates_array[0].markup.type == 1) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            final_cost = Number(cost) - Number(cost) / 100 * Number(markups.value);
                                            if (sell_rates_array.length > 0) {
                                                if (sell_rates_array[0].markup.type == 0) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                                else if (sell_rates_array[0].markup.type == 1) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if (markups.coating == 0) {
                                            final_cost = Number(cost) + Number(markups.value);
                                            if (sell_rates_array.length > 0) {
                                                if (sell_rates_array[0].markup.type == 0) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                                else if (sell_rates_array[0].markup.type == 1) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            final_cost = Number(cost) - Number(markups.value);
                                            if (sell_rates_array.length > 0) {
                                                if (sell_rates_array[0].markup.type == 0) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(final_cost) / 100 * Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                                else if (sell_rates_array[0].markup.type == 1) {
                                                    if (sell_rates_array[0].markup.coating == 0) {
                                                        final_cost = Number(final_cost) + Number(sell_rates_array[0].markup.value);
                                                    }
                                                    else {
                                                        final_cost = Number(final_cost) - Number(sell_rates_array[0].markup.value);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    final_cost = final_cost + breakFastRate;
                                    let datewise_value = { "start_date": start_date, "end_date": end_date, "price": final_cost };
                                    if (final_cost > 0) {
                                        dates_array.push(datewise_value);
                                    }
                                }
                            });
                            let rates = { "rate_id": rate_id, "dates": dates_array };
                            room_rates_array.push(rates);
                        });
                        let room_deta = {
                            "room_id": room_type_id,
                            "rate": room_rates_array
                        };
                        room_array.push(room_deta);
                    });
                }).catch(error => {
                    console.log(error);
                });
                let post_rate_value = {
                    "updaterequest": {
                        "username": pms_username,
                        "password": pms_password,
                        "hotel_id": hotel_code,
                        "version": app_1.environments[process.env.ENV].staah_credentials.version,
                        "room": room_array
                    }
                };
                yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, post_rate_value).then(response => {
                    res.status(200);
                    respond = {
                        success: true,
                        msg: "Success",
                        postvalues: post_rate_value,
                        data: response
                    };
                }).catch(error => {
                    console.log(error);
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    msg: "Property is not available",
                };
            }
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        OTARouter.route('/inventory-update')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_uuid = req.query.hotel_id;
            let rooms_details;
            let respond;
            let output;
            let start_date;
            let end_date;
            let hotel_code;
            let pms_username;
            let pms_password;
            let cost = 0;
            let final_cost = 0;
            let room_array = [];
            let room_type_array = [];
            let markups_array = [];
            let rooms_array = [];
            yield HotelDetails
                .findOne({ _hotel_id: hotel_uuid })
                .then(document => {
                hotel_code = document._ota_hotel_code;
                pms_username = document._ota_username;
                pms_password = document._ota_password;
            })
                .catch(error => { });
            if (hotel_code > 0) {
                yield MasterDetails
                    .find({ type: 1 })
                    .then(document => {
                    room_type_array = document[0].dropdown[0].data;
                })
                    .catch(error => {
                });
                let room_types = [];
                room_type_array.forEach(function (product, index) {
                    room_types[product.value] = product.text;
                });
                yield RoomsCollection
                    .find({ _hotelId: hotel_uuid })
                    .then(document => {
                    rooms_details = document;
                })
                    .catch(error => {
                    console.log(error);
                });
                let postvalues = {
                    "roomrequest": {
                        "username": pms_username,
                        "password": pms_password,
                        "hotel_id": hotel_code
                    }
                };
                yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, postvalues).then(response => {
                    output = response.roomresponse.rooms.room;
                }).catch(error => {
                    console.log(error);
                });
                rooms_details.forEach(function (value, index) {
                    markups_array[value._type._type] = value._type._no_of_rooms;
                });
                for (let value of output) {
                    let no_of_rooms;
                    let dates_array = [];
                    let markups;
                    let room_type_id = value.room_id;
                    let room_type_name = value.room_name;
                    let room_type_index = room_types.indexOf(room_type_name);
                    if (room_type_index > 0) {
                        no_of_rooms = markups_array[room_type_index];
                    }
                    let today = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY').toDate();
                    let today_format = time_1.default.OTAformatGivenDate(today);
                    let datewise_value = { "start_date": today_format, "end_date": "2018-12-31", "roomstosell": no_of_rooms };
                    dates_array.push(datewise_value);
                    var nextYeardate = time_1.default.serverMomentInPattern(time_1.default.nextYearDate(), 'DD-MM-YYYY').toDate();
                    for (var m = moment(today); m.isSameOrBefore(nextYeardate); m.add(1, 'days')) {
                        let current_date = m.format('DD-MM-YYYY');
                        let new_date = time_1.default.serverMomentInPattern(current_date, 'DD-MM-YYYY').toDate();
                        let booked_rooms;
                        let blocked_rooms;
                        yield RoomReservationCollection
                            .find({ status: { $ne: "CANCELLED" }, hotelUuid: hotel_uuid, roomType: String(room_type_index), checkIn: { $lte: new_date }, checkOut: { $gt: new_date } })
                            .then(document => {
                            if (document.length > 0) {
                                booked_rooms = document.length;
                            }
                        })
                            .catch(error => {
                        });
                        yield RoomActivityCollection
                            .find({
                            hotelUuid: hotel_uuid,
                            roomType: String(room_type_index),
                            blockingIssues: {
                                $elemMatch: {
                                    "duration.startDate": { $lte: new_date },
                                    "duration.endDate": { $gte: new_date }
                                }
                            }
                        })
                            .then(document => {
                            if (document.length > 0) {
                                blocked_rooms = document.length;
                            }
                        })
                            .catch(error => {
                        });
                        if (booked_rooms > 0) {
                            booked_rooms = booked_rooms;
                        }
                        else {
                            booked_rooms = 0;
                        }
                        if (blocked_rooms > 0) {
                            blocked_rooms = blocked_rooms;
                        }
                        else {
                            blocked_rooms = 0;
                        }
                        let rooms_not_available = parseInt(booked_rooms) + parseInt(blocked_rooms);
                        if (rooms_not_available > 0) {
                            let new_date_format = time_1.default.OTAformatGivenDate(new_date);
                            let rooms_available = no_of_rooms - rooms_not_available;
                            let datewise_value = { "start_date": new_date_format, "end_date": new_date_format, "roomstosell": rooms_available };
                            dates_array.push(datewise_value);
                        }
                    }
                    let room_deta = {
                        "room_id": room_type_id,
                        "rate": [
                            {
                                "rate_id": "",
                                "dates": dates_array
                            }
                        ]
                    };
                    room_array.push(room_deta);
                }
                let post_rate_value = {
                    "updaterequest": {
                        "username": pms_username,
                        "password": pms_password,
                        "hotel_id": hotel_code,
                        "version": app_1.environments[process.env.ENV].staah_credentials.version,
                        "room": room_array
                    }
                };
                yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, post_rate_value).then(response => {
                    res.status(200);
                    respond = {
                        success: true,
                        msg: "Success",
                        data: response,
                        request: post_rate_value
                    };
                }).catch(error => {
                    console.log(error);
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    msg: "Property is not available",
                };
            }
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_uuid = req.body.hotel_uuid;
            let startDate = req.body.start_date;
            let endDate = req.body.end_date;
            let room_type = req.body.room_type;
            let rooms_details;
            let respond;
            let output;
            let start_date;
            let end_date;
            let hotel_code;
            let pms_username;
            let pms_password;
            let room_array = [];
            let room_type_array = [];
            let markups_array = [];
            let rooms_array = [];
            yield HotelDetails
                .findOne({ _hotel_id: hotel_uuid })
                .then(document => {
                hotel_code = document._ota_hotel_code;
                pms_username = document._ota_username;
                pms_password = document._ota_password;
            })
                .catch(error => { });
            if (hotel_code > 0) {
                yield MasterDetails
                    .find({ type: 1 })
                    .then(document => {
                    room_type_array = document[0].dropdown[0].data;
                })
                    .catch(error => {
                });
                let room_types = [];
                room_type_array.forEach(function (product, index) {
                    room_types[product.value] = product.text;
                });
                yield RoomsCollection
                    .find({ _hotelId: hotel_uuid })
                    .then(document => {
                    rooms_details = document;
                })
                    .catch(error => {
                    console.log(error);
                });
                let postvalues = {
                    "roomrequest": {
                        "username": pms_username,
                        "password": pms_password,
                        "hotel_id": hotel_code
                    }
                };
                yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, postvalues).then(response => {
                    output = response.roomresponse.rooms.room;
                }).catch(error => {
                    console.log(error);
                });
                rooms_details.forEach(function (value, index) {
                    markups_array[value._type._type] = value._type._no_of_rooms;
                });
                for (let value of output) {
                    let no_of_rooms;
                    let dates_array = [];
                    let markups;
                    let room_type_id = value.room_id;
                    let room_type_name = value.room_name;
                    let room_type_index = room_types.indexOf(room_type_name);
                    if (room_type_index == room_type) {
                        if (room_type_index > 0) {
                            no_of_rooms = markups_array[room_type_index];
                        }
                        let today = time_1.default.serverMomentInPattern(startDate, 'DD-MM-YYYY').toDate();
                        let today_format = time_1.default.OTAformatGivenDate(today);
                        var nextYeardate = time_1.default.serverMomentInPattern(endDate, 'DD-MM-YYYY').toDate();
                        for (var m = moment(today); m.isSameOrBefore(nextYeardate); m.add(1, 'days')) {
                            let current_date = m.format('DD-MM-YYYY');
                            let new_date = time_1.default.serverMomentInPattern(current_date, 'DD-MM-YYYY').toDate();
                            let booked_rooms;
                            let blocked_rooms;
                            yield RoomReservationCollection
                                .find({ status: { $ne: "CANCELLED" }, hotelUuid: hotel_uuid, roomType: String(room_type_index), checkIn: { $lte: new_date }, checkOut: { $gt: new_date } })
                                .then(document => {
                                if (document.length > 0) {
                                    booked_rooms = document.length;
                                }
                            })
                                .catch(error => {
                            });
                            yield RoomActivityCollection
                                .find({
                                hotelUuid: hotel_uuid,
                                roomType: String(room_type_index),
                                blockingIssues: {
                                    $elemMatch: {
                                        "duration.startDate": { $lte: new_date },
                                        "duration.endDate": { $gte: new_date }
                                    }
                                }
                            })
                                .then(document => {
                                if (document.length > 0) {
                                    blocked_rooms = document.length;
                                }
                            })
                                .catch(error => {
                            });
                            if (booked_rooms > 0) {
                                booked_rooms = booked_rooms;
                            }
                            else {
                                booked_rooms = 0;
                            }
                            if (blocked_rooms > 0) {
                                blocked_rooms = blocked_rooms;
                            }
                            else {
                                blocked_rooms = 0;
                            }
                            let rooms_not_available = parseInt(booked_rooms) + parseInt(blocked_rooms);
                            if (rooms_not_available > 0) {
                                let new_date_format = time_1.default.OTAformatGivenDate(new_date);
                                let rooms_available = no_of_rooms - rooms_not_available;
                                let datewise_value = { "start_date": new_date_format, "end_date": new_date_format, "roomstosell": rooms_available };
                                dates_array.push(datewise_value);
                            }
                        }
                        let room_deta = {
                            "room_id": room_type_id,
                            "rate": [
                                {
                                    "rate_id": "",
                                    "dates": dates_array
                                }
                            ]
                        };
                        room_array.push(room_deta);
                    }
                }
                let post_rate_value = {
                    "updaterequest": {
                        "username": pms_username,
                        "password": pms_password,
                        "hotel_id": hotel_code,
                        "version": app_1.environments[process.env.ENV].staah_credentials.version,
                        "room": room_array
                    }
                };
                yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, post_rate_value).then(response => {
                    res.status(200);
                    respond = {
                        success: true,
                        msg: "Success",
                        data: response,
                        request: post_rate_value
                    };
                    console.log(respond);
                }).catch(error => {
                    console.log(error);
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    msg: "Property is not available",
                };
            }
            res.json(respond);
        }));
        OTARouter.route('/booking/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let data = JSON.stringify(req.body);
            let output = JSON.parse(data);
            let room_type_array;
            let hotel_id;
            let hotel_deposit_amount;
            let request = output.reservations.reservation[0];
            let finalRoomPrice = 0;
            let finalServiceFee = 0;
            let finalTax = 0;
            let finalTotalAmount = 0;
            yield OTABookingRequestCollection
                .insert(output.reservations)
                .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                .catch(error => { });
            let booking_id = request.booking_id;
            let channel_ref = request.channel_ref;
            let booking_date = request.booking_date;
            let currencycode = request.currencycode;
            let booking_status = request.booking_status;
            let ota_hotel_id = request.hotel_id;
            let channelName = request.company;
            if (booking_status == 'new') {
                yield HotelDetails
                    .findOne({ _ota_hotel_code: ota_hotel_id })
                    .then(document => {
                    hotel_id = document._hotel_id;
                    hotel_deposit_amount = document._deposit_amount;
                })
                    .catch(error => { });
                if (hotel_id) {
                    let totalprice = request.totalprice ? request.totalprice : 0;
                    let hotel_name = request.hotel_name;
                    let room_array = request.room;
                    let checkIn = time_1.default.formatGivenDate(room_array[0].arrival_date);
                    let checkOut = time_1.default.formatGivenDate(room_array[0].departure_date);
                    let guest_name = room_array[0].guest_name;
                    let numberofguests = room_array[0].numberofguests;
                    let numberofchild = room_array[0].numberofchild;
                    let booking_type = request.payment_type;
                    let paymentType;
                    let paymentStatus;
                    let status;
                    if (booking_type == 'Hotel Collect') {
                        paymentType = 'CASH';
                        paymentStatus = 'ON_HOLD';
                        status = 'ON_HOLD';
                    }
                    else if (booking_type == 'Channel Collect') {
                        paymentType = 'Paid Online';
                        paymentStatus = 'ON_HOLD';
                        status = 'ON_HOLD';
                    }
                    else {
                        paymentType = 'Paid Online';
                        paymentStatus = 'ON_HOLD';
                        status = 'ON_HOLD';
                    }
                    let rooms = [];
                    let no_of_rooms = room_array.length;
                    let first_name = request.customer.first_name;
                    let last_name = request.customer.last_name;
                    let email = request.customer.email;
                    let price = [];
                    let breakfastIncluded = [];
                    let roomPriceArray = [];
                    let telephone = request.customer.telephone;
                    let numberOfNights = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').diff(time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY'), 'days');
                    yield MasterDetails
                        .find({ type: 1 })
                        .then(document => {
                        room_type_array = document[0].dropdown[0].data;
                    })
                        .catch(error => {
                    });
                    let room_types = [];
                    room_type_array.forEach(function (product, index) {
                        room_types[product.value] = product.text;
                    });
                    let breakfastPlans;
                    yield OTARatePlansCollection
                        .findOne({ hotelCode: ota_hotel_id })
                        .then(document => {
                        breakfastPlans = document.breakfastRatePlans;
                    })
                        .catch(error => {
                    });
                    let country;
                    let breakfastIncludedValue = "No";
                    if (currencycode == 'MYR') {
                        country = 'Malaysia';
                    }
                    else {
                        country = 'Thailand';
                    }
                    room_array.forEach(function (item, index) {
                        let totalAmount = 0;
                        let commisionPercentage = 0;
                        let commisionAmount = 0;
                        let roomPrice = 0;
                        let tax = 0;
                        let serviceFee = 0;
                        let check_in = time_1.default.formatGivenDate(item.arrival_date);
                        let check_out = time_1.default.formatGivenDate(item.departure_date);
                        let room_type_name = item.name;
                        let room_type = String(room_types.indexOf(room_type_name));
                        if (room_type) {
                            rooms.push(room_type);
                        }
                        let new_price_structure = [];
                        let totalPrice = item.totalprice ? Number(item.totalprice) : 0;
                        if (country == 'Malaysia') {
                            if (channelName == 'TRAVELOKA' || channelName == 'GOIBIBO' || channelName == 'BOOKING.COM') {
                                if (channelName == 'GOIBIBO') {
                                    commisionPercentage = 20;
                                }
                                else {
                                    commisionPercentage = 15;
                                }
                                commisionAmount = totalPrice * commisionPercentage / 100;
                                totalAmount = Number(totalPrice) - Number(commisionAmount);
                            }
                            else {
                                totalAmount = totalPrice;
                            }
                            tax = totalAmount - (totalAmount / 1.06);
                            roomPrice = (totalAmount - tax) / 1.1;
                            serviceFee = roomPrice * 0.1;
                        }
                        else if (country == 'Thailand') {
                            if (channelName == 'BOOKING.COM' || channelName == 'TRAVELOKA') {
                                commisionPercentage = 15;
                                commisionAmount = totalPrice * commisionPercentage / 100;
                                totalAmount = Number(totalPrice) - Number(commisionAmount);
                            }
                            else {
                                totalAmount = totalPrice;
                            }
                            tax = totalAmount - (totalAmount / 1.07);
                            roomPrice = (totalAmount - tax) / 1.1;
                            serviceFee = roomPrice * 0.1;
                        }
                        finalRoomPrice = finalRoomPrice + roomPrice;
                        finalServiceFee = finalServiceFee + serviceFee;
                        finalTax = finalTax + tax;
                        finalTotalAmount = finalTotalAmount + totalAmount;
                        roomPriceArray[room_type] = roomPrice ? Number(roomPrice).toFixed(2) : 0;
                        let dayPrice = roomPrice / numberOfNights;
                        let pricebreakup = Number(dayPrice).toFixed(2);
                        item.price.forEach(function (items, indexs) {
                            let rateId = items.rate_id;
                            if (in_array(rateId, breakfastPlans)) {
                                breakfastIncludedValue = "Yes";
                            }
                            else {
                                breakfastIncludedValue = "No";
                            }
                            let prices = { "date": items.date, "cost": Number(pricebreakup) };
                            new_price_structure.push(prices);
                        });
                        breakfastIncluded[room_type] = breakfastIncludedValue;
                        price[room_type] = new_price_structure;
                    });
                    let guest = { firstName: first_name, lastName: last_name, phoneNumber: telephone, emailAddress: email };
                    let user_uuid = '';
                    if (req.session.user) {
                        user_uuid = req.session.user._user_id;
                    }
                    else {
                        user_uuid = '';
                    }
                    let inputvalues = {
                        status: status,
                        no_of_child: numberofchild,
                        number_of_guests: numberofguests,
                        breakfastIncluded: breakfastIncluded,
                        room_types: JSON.stringify(rooms),
                        check_in: checkIn,
                        check_out: checkOut,
                        guest: JSON.stringify(guest),
                        price: price,
                        roomPriceArray: roomPriceArray,
                        user_uuid: user_uuid
                    };
                    let depositAmount = no_of_rooms * hotel_deposit_amount;
                    yield request_1.default.post('/inventory/booking/ota', {
                        hotel_uuid: hotel_id
                    }, inputvalues).then(response => {
                        let bookingUuid = response.data.uuid;
                        if (bookingUuid) {
                            let depositpostvalues = {
                                bookinguuid: bookingUuid,
                                hoteluuid: hotel_id,
                                depositAmount: depositAmount,
                                depositCollected: 0
                            };
                            request_1.default.post('/payment-manager/payment/deposit', {}, depositpostvalues).then(response => {
                                console.log(response);
                            }).catch(error => {
                                console.log('Error: ', error.message);
                            });
                            let guestvalues = {
                                salutation: "Mr",
                                firstname: first_name,
                                lastname: last_name,
                                gender: req.body.gender,
                                email: email,
                                identification_type: "",
                                identification_doc: "",
                                additional_identification: "",
                                additional_identification_number: "",
                                ic_number: "",
                                nationality: "",
                                reason_to_stay: "",
                                booking_id: bookingUuid,
                                guest_id: " "
                            };
                            request_1.default.post('/pms-manager/guest-info-update', {}, guestvalues).then(response => {
                                console.log(response);
                            }).catch(error => {
                                console.log(error);
                            });
                            let paymentvalues = {
                                "bookinguuid": bookingUuid,
                                "hoteluuid": hotel_id,
                                "user_uuid": "OTA",
                                "paymentReferrenceId": booking_id,
                                "transactionReferrenceId": booking_id,
                                "booking_channel": "OTA",
                                "channel_name": channelName,
                                "totalRoomPrice": finalRoomPrice,
                                "discountType": "PERCENTAGE",
                                "discountValue": parseFloat("0").toFixed(2),
                                "discountAmount": parseFloat("0").toFixed(2),
                                "priceAfterDiscount": finalRoomPrice,
                                "serviceFee": finalServiceFee,
                                "tax": finalTax,
                                "tourismTax": parseFloat("0").toFixed(2),
                                "tourismTaxIncluded": "No",
                                "depositAmount": depositAmount,
                                "depositIncluded": "No",
                                "totalAmountPaid": finalTotalAmount,
                                "totalAmount": finalTotalAmount,
                                "remainingAmount": 0,
                                "paymentCurrency": currencycode,
                                "paymentType": paymentType,
                                "paymentStatus": paymentStatus,
                                "front_desk_name": "Hotel NIDA",
                                "booking_reference_id": booking_id
                            };
                            request_1.default.post('/payment-manager/payment/booking', {}, paymentvalues).then(response => {
                                res.status(200);
                            }).catch(error => {
                                console.log('Error: ', error.message);
                            });
                            res.status(200);
                            respond = {
                                success: true,
                                msg: "Success",
                                data: response
                            };
                        }
                        else {
                            res.status(400);
                            respond = {
                                success: false,
                                msg: "Failed",
                            };
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                        res.status(400);
                        respond = {
                            success: false,
                            msg: "Failed",
                        };
                    });
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        msg: "Failed",
                    };
                }
            }
            else if (booking_status == 'Cancel' || booking_status == 'cancel') {
                let booking_uuid;
                yield PaymentCollection
                    .findOne({ paymentReferrenceId: booking_id })
                    .then(document => { booking_uuid = document.bookinguuid; })
                    .catch(error => { });
                BookingCollection
                    .findOneAndUpdate({
                    uuid: booking_uuid
                }, {
                    $set: { status: 'CANCELLED' }
                })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
                RoomReservationCollection
                    .findOneAndUpdate({
                    bookingUuid: booking_uuid
                }, {
                    $set: { status: 'CANCELLED' }
                })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
                res.status(200);
                respond = {
                    success: true,
                    msg: "Booking Cancellation Successful",
                };
            }
            else if (booking_status == 'Modify') {
                res.status(400);
                respond = {
                    success: false,
                    msg: "Modify",
                };
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    msg: "Failed",
                };
            }
            res.json(respond);
        }));
        OTARouter.route('/config-rate-plan')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let hotelCode;
            let pmsUsername;
            let pmsPassword;
            let ratePlans;
            let isExists;
            let breakfastRatePlans = [];
            let hotelUuid = req.body.hotelUuid;
            let breakfastAmount = req.body.breakfastAmount ? req.body.breakfastAmount : 0;
            yield HotelDetails
                .findOne({ _hotel_id: hotelUuid, _status: "1" })
                .then(document => {
                hotelCode = document._ota_hotel_code;
                pmsUsername = document._ota_username;
                pmsPassword = document._ota_password;
            })
                .catch(error => { });
            let postvalues = {
                "roomrequest": {
                    "username": pmsUsername,
                    "password": pmsPassword,
                    "hotel_id": hotelCode
                }
            };
            yield request_1.default.ext_post('https://nida.staah.net/common-cgi/Services.pl', {}, postvalues).then(response => {
                ratePlans = response.roomresponse.rooms.room;
                ratePlans.forEach(function (item, index) {
                    let rates = item.rates;
                    rates.forEach(function (values, indexs) {
                        let rateName = values.rate_name;
                        if (rateName.indexOf("With Breakfast") > -1) {
                            breakfastRatePlans.push(values.rate_id);
                        }
                    });
                });
            });
            let insertDcoument = {
                "hotelCode": hotelCode,
                "pmsUsername": pmsUsername,
                "pmsPassword": pmsPassword,
                "hotelUuid": hotelUuid,
                "ratePlans": ratePlans,
                "breakfastAmount": Number(breakfastAmount),
                "breakfastRatePlans": breakfastRatePlans
            };
            yield OTARatePlansCollection
                .findOne({ hotelUuid: hotelUuid })
                .then(document => {
                if (document.hotelUuid == hotelUuid) {
                    isExists = "Yes";
                }
            })
                .catch(error => { });
            if (isExists == "Yes") {
                yield OTARatePlansCollection
                    .update({ hotelUuid: hotelUuid }, { $set: insertDcoument })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
            }
            else {
                yield OTARatePlansCollection
                    .insert(insertDcoument)
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
            }
            respond = {
                "msg": "success",
                "success": true
            };
            res.status(200);
            res.json(respond);
        }));
        OTARouter.route('/commision-calculation')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let totalAmount = 0;
            let commisionPercentage = 0;
            let commisionAmount = 0;
            let roomPrice = 0;
            let tax = 0;
            let serviceFee = 0;
            let totalPrice = req.body.totalPrice;
            let country = req.body.country;
            let channelName = req.body.channelName;
            if (country == 'Malaysia') {
                if (channelName == 'TRAVELOKA' || channelName == 'GOIBIBO' || channelName == 'BOOKING.COM') {
                    if (channelName == 'GOIBIBO') {
                        commisionPercentage = 20;
                    }
                    else {
                        commisionPercentage = 15;
                    }
                    commisionAmount = totalPrice * commisionPercentage / 100;
                    totalAmount = Number(totalPrice) - Number(commisionAmount);
                }
                else {
                    totalAmount = totalPrice;
                }
                tax = totalAmount - (totalAmount / 1.06);
                roomPrice = (totalAmount - tax) / 1.1;
                serviceFee = roomPrice * 0.1;
            }
            else if (country == 'Thailand') {
                if (channelName == 'BOOKING.COM') {
                    commisionPercentage = 15;
                    commisionAmount = totalPrice * commisionPercentage / 100;
                    totalAmount = Number(totalPrice) - Number(commisionAmount);
                }
                else {
                    totalAmount = totalPrice;
                }
                tax = totalAmount - (totalAmount / 1.07);
                roomPrice = (totalAmount - tax) / 1.1;
                serviceFee = roomPrice * 0.1;
            }
            respond = {
                "msg": "success",
                "commisionAmount": Number(commisionAmount),
                "roomPrice": Number(roomPrice),
                "serviceFee": Number(serviceFee),
                "tax": Number(tax),
                "totalAmount": Number(totalAmount)
            };
            res.status(200);
            res.json(respond);
        }));
        return OTARouter;
    }
}
exports.default = ota;
