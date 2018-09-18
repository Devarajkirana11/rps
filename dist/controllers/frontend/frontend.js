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
const APIClient_1 = require("../../helpers/APIClient");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const FileManager_1 = require("../../helpers/FileManager");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const CountryCodeValidator_1 = require("../../helpers/CountryCodeValidator");
const request_1 = require("../../helpers/request");
const time_1 = require("../../helpers/time");
const email_1 = require("../../helpers/email");
const log_1 = require("../../models/log/log");
const express = require("express");
const LogLaw = require("../../models/log/law");
const app_1 = require("../../config/app");
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var session = require("express-sessions");
const Html_Entities = require('html-entities').AllHtmlEntities;
class FrontendController {
    static get routes() {
        let FrontendRouter = express.Router();
        let BookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let RoomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let PaymentCollection = core_1.default.app.get('mongoClient').get('payments');
        FrontendRouter.route("/details")
            .get(inputvalidator_1.default.checkusername, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.place;
            if (req.query.referred_by) {
                req.session.referred_by = req.query.referred_by;
                let sharedhotelsCollection = core_1.default.app.get('mongoClient').get('shared_hotels');
                yield sharedhotelsCollection.update({
                    _user_id: req.query.referred_by,
                    _hotel_id: hotel_id
                }, {
                    $inc: { _link_opens: 1 }
                }, { multi: true });
            }
            let userid = "";
            if (req.session.user)
                userid = res.locals.userid = req.session.user._user_id;
            if (req.query.place !== undefined) {
                let masters = yield LocationMasters_1.default.getMasters();
                yield this.getHotelInfo(masters, req, res, userid)
                    .then(status => {
                    res.status(200);
                    res.render('frontend/search_details', {
                        layout: 'homeLayout', class: "inner-page has-fixed-search-bar", logoChanges: true, userid: userid, hotelid: hotel_id, country_id: status.country_id
                    });
                }, reject => {
                    res.render('frontend/search_details', {
                        layout: 'homeLayout', class: "inner-page has-fixed-search-bar", logoChanges: true, userid: userid, hotelid: hotel_id, country_id: null
                    });
                })
                    .catch(err => {
                    res.status(400);
                    res.render('frontend/search_details', {
                        layout: 'homeLayout', class: "inner-page has-fixed-search-bar", logoChanges: true, userid: userid, hotelid: hotel_id, country_id: null
                    });
                });
            }
        }));
        FrontendRouter.route("/booking")
            .get(inputvalidator_1.default.checkusername, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country_code = newLocation.data;
            let userid = "";
            if (req.session.user)
                userid = res.locals.userid = req.session.user._user_id;
            yield this.getHotelInfo(masters, req, res, userid)
                .then(status => {
                res.status(200);
                res.render('frontend/booking', {
                    layout: 'homeLayout', class: "inner-page", country_code: country_code, stdcodes: CountryCodeValidator_1.default.getPhoneValidations(), locationmasters: masters,
                });
            }, reject => {
                res.render('frontend/booking', {
                    layout: 'homeLayout', class: "inner-page", country_code: country_code, stdcodes: CountryCodeValidator_1.default.getPhoneValidations(), locationmasters: masters,
                });
            })
                .catch(err => {
                res.status(400);
                res.render('frontend/booking', {
                    layout: 'homeLayout', class: "inner-page", country_code: country_code, stdcodes: CountryCodeValidator_1.default.getPhoneValidations(), locationmasters: masters,
                });
            });
        }));
        FrontendRouter.route("/confirmation")
            .get(inputvalidator_1.default.checkusername, (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.locals.metaTags = {
                title: "Hotel NIDA - Best Budget Hotels in Malaysia",
                description: "Are you looking for a Hotel in Malaysia? Book a room at Hotel NIDA, which offers luxurious services with exclusive offers and deals."
            };
            res.status(200);
            res.render('frontend/booking_confirmation', {
                layout: 'homeLayout', class: "inner-page", reference_number: req.query.reference_number, booked_on: req.query.booked_on
            });
        }));
        FrontendRouter.route('/booking-view')
            .get(inputvalidator_1.default.checkusername, inputvalidator_1.default.checkMenuAccessForBookingView, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let booking_uuid = req.query.booking_uuid;
            let paymentData;
            let depositData;
            let room_type_array;
            let hotel_details;
            let hotel_id;
            request_1.default.get('/pms-manager/get-booking-details', {
                bookinguuid: booking_uuid
            }).then(response => {
                let no_of_rooms = response.data.booking.roomReservations.length;
                res.status(200);
                res.render('booking-view', { audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData });
            }).catch(error => {
                console.log('Error: ', error.message);
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        FrontendRouter.route("/get-currency")
            .get(inputvalidator_1.default.checkusername, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let respond;
            let hotelDetails = core_1.default.app.get('mongoClient').get('hotel_details');
            yield hotelDetails
                .findOne({
                _hotel_id: hotel_id
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let currency;
                if (document._country_id == 132) {
                    currency = 'MYR';
                }
                else if (document._country_id == 217) {
                    currency = 'THB';
                }
                else {
                    currency = 'MYR';
                }
                respond = {
                    success: true,
                    msg: "Success",
                    currency: currency
                };
            }))
                .catch(error => {
                respond = {
                    success: true,
                    msg: "Success",
                    currency: "MYR"
                };
            });
            res.status(200);
            res.json(respond);
        }));
        FrontendRouter.route('/ajax')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            res.status(500);
            respond = {
                success: false,
                msg: "Failed"
            };
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let ajaxid = req.body.ajaxid;
            if (ajaxid == 1) {
                let uid = req.body.UserID;
                let userLogin = core_1.default.app.get('mongoClient').get('users');
                yield userLogin
                    .remove({ _id: ObjectId(uid) })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `User information updated Successfully`
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else if (ajaxid == 2) {
                let startDate = req.body.Start_Date;
                let endDate = req.body.End_Date;
                let Default_Value = JSON.parse(req.body.Default_Value);
                let Default_Cost = req.body.Default_Cost;
                var a = moment(startDate);
                var b = moment(endDate);
                let output = '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th><th>Sunday</th></tr></thead><tbody>';
                output += '<tr>';
                let days = a.format('d');
                for (var j = 1; j < days; j++) {
                    output += '<td></td>';
                }
                let i = days - 1;
                for (var m = moment(a); m.isSameOrBefore(b); m.add(1, 'days')) {
                    let remain = i / 7;
                    if (Number.isInteger(remain) && i > 2) {
                        output += '</tr>';
                        output += '</tr>';
                    }
                    let current_date = m.format('DD-MM-YYYY');
                    let final_cost = '';
                    for (var item of Default_Value) {
                        let dates_value = item.dates;
                        let cost_value = item.cost;
                        if (dates_value.indexOf(current_date) > -1) {
                            final_cost = cost_value;
                        }
                    }
                    if (final_cost) { }
                    else {
                        final_cost = Default_Cost;
                    }
                    output += '<td><input type="checkbox" name="' + moment(current_date, 'DD/MM/YYYY').format('DD-MM-YYYY') + '" value="' + moment(current_date, 'DD/MM/YYYY').format('DD-MM-YYYY') + '" class="date-wise-check"><br/>' + current_date + '<br/>' + final_cost + '</td>';
                    i++;
                }
                output += '</tr>';
                output += '</tbody></table>';
                res.status(200);
                respond = {
                    success: true,
                    message: 'User information updated Successfully',
                    data: output
                };
            }
            else if (ajaxid == 4) {
                let username = req.body.user_name;
                let UserDetails = core_1.default.app.get('mongoClient').get('users');
                yield UserDetails.findOne({ _username: username })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        msg: "Username is available"
                    };
                });
            }
            else if (ajaxid == 6) {
                let hotel_id = req.body.hotel_id;
                let RoomDetails = core_1.default.app.get('mongoClient').get('rooms');
                yield RoomDetails
                    .find({ _hotelId: hotel_id })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not avialable"
                    };
                });
            }
            else if (ajaxid == 7) {
                let hotel_id = req.body.hotel_id;
                let room_type = req.body.room_type;
                let RoomDetails = core_1.default.app.get('mongoClient').get('rooms');
                yield RoomDetails
                    .find({ _hotelId: hotel_id, "_type._type": room_type })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 8) {
                let email = req.body.email;
                let RoomDetails = core_1.default.app.get('mongoClient').get('users');
                yield RoomDetails
                    .find({ _email: email })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 9) {
                let hotel_uuid = req.body.hotel_uuid;
                let RoomDetails = core_1.default.app.get('mongoClient').get('RoomReservation');
                yield RoomDetails
                    .find({ hotelUuid: hotel_uuid })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 10) {
                let room_array = [];
                let hotel_id = req.body.hotel_uuid;
                let RoomDetails = core_1.default.app.get('mongoClient').get('RoomReservation');
                yield RoomDetails
                    .find({ hotelUuid: hotel_id })
                    .then(document => {
                    document.forEach(function (item, index) {
                        room_array.push(item.bookingUuid);
                    });
                })
                    .catch(error => {
                    console.log(error);
                });
                let BookingDetails = core_1.default.app.get('mongoClient').get('Booking');
                yield BookingDetails
                    .find({ uuid: { $in: room_array } })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 11) {
                let bookinguuid = req.body.bookinguuid;
                let BookingDetails = core_1.default.app.get('mongoClient').get('Booking');
                yield BookingDetails
                    .find({ uuid: bookinguuid })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 12) {
                let MasterDetails = core_1.default.app.get('mongoClient').get('masters');
                yield MasterDetails
                    .find({ type: 1 })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document[0].dropdown[0].data
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 13) {
                let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                let guest_email = req.body.guest_email;
                let guest_name = req.body.guest_name;
                let bookinguuid = req.body.bookinguuid;
                let hoteluuid = req.body.hotel_id;
                let depositamount = req.body.depositamount;
                let lossdamagefee = req.body.lossdamagefee;
                let lossdamagefeecollected = req.body.lossdamagefeecollected;
                let booking_referenceId = req.body.booking_referenceId;
                let booking_source = req.body.booking_source;
                let depositrefund = req.body.depositrefund;
                let rating_link;
                let DepositCollection = core_1.default.app.get('mongoClient').get('deposit');
                let HotelDetails = core_1.default.app.get('mongoClient').get('hotel_details');
                let PaymentDetails = core_1.default.app.get('mongoClient').get('payments');
                if (depositrefund > 0) {
                    let postvalues = {
                        transaction_id: Math.random(),
                        hoteluuid: hoteluuid,
                        bookinguuid: bookinguuid,
                        booking_referenceId: booking_referenceId,
                        collectionType: 'DEBIT',
                        paymentMethod: 'CASH',
                        pic: req.session.user._user_id,
                        source: ['DEPOSIT REFUND'],
                        bookingSource: booking_source,
                        amount: depositrefund,
                        shiftInchrge: "",
                        nightauditDate: "",
                    };
                    request_1.default.post('/payment-manager/update-audit-trail', {}, postvalues).then(response => {
                        console.log("success");
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }
                if (lossdamagefeecollected > 0) {
                    let postvalues = {
                        transaction_id: Math.random(),
                        hoteluuid: hoteluuid,
                        bookinguuid: bookinguuid,
                        booking_referenceId: booking_referenceId,
                        collectionType: 'CREDIT',
                        paymentMethod: 'CASH',
                        pic: req.session.user._user_id,
                        source: ['LossDamageFee'],
                        bookingSource: booking_source,
                        amount: lossdamagefeecollected,
                        shiftInchrge: "",
                        nightauditDate: "",
                    };
                    request_1.default.post('/payment-manager/update-audit-trail', {}, postvalues).then(response => {
                        console.log("success");
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }
                yield HotelDetails
                    .findOne({ _hotel_id: hoteluuid })
                    .then(document => {
                    rating_link = document._rating_link;
                })
                    .catch(error => { });
                yield PaymentDetails
                    .update({
                    bookinguuid: bookinguuid
                }, {
                    $set: {
                        "depositDetails.0.depositAmount": Number(depositamount),
                        "depositDetails.0.depositCollected": Number(depositamount),
                        "depositDetails.0.lossDamageFee": Number(lossdamagefee),
                        "depositDetails.0.lossDamageFeeCollected": Number(lossdamagefeecollected),
                        "depositDetails.0.depositRefunded": Number(depositrefund),
                        "depositDetails.0.updatedOn": currentMoment
                    }
                })
                    .then(document => { console.log("Success"); })
                    .catch(error => { console.log("Failed"); });
                yield DepositCollection
                    .update({
                    bookinguuid: bookinguuid
                }, {
                    $set: {
                        depositAmount: Number(depositamount),
                        depositCollected: Number(depositamount),
                        lossDamageFee: Number(lossdamagefee),
                        lossDamageFeeCollected: Number(lossdamagefeecollected),
                        depositRefunded: Number(depositrefund),
                        updatedOn: currentMoment
                    }
                })
                    .then(document => {
                    request_1.default.get('/pms-manager/get-booking-details', {
                        bookinguuid: bookinguuid
                    }).then(response => {
                        let no_of_rooms = response.data.booking.roomReservations.length;
                        let booking_channel = response.paymentData.booking_channel;
                        if (booking_channel != 'OTA') {
                            email_1.default.send({
                                from: 'info@hotelnida.com',
                                to: guest_email,
                                subject: 'Check out Confirmation',
                                body: 'Check out Confirmation',
                                category: ['Check out Confirmation'],
                                template: 'check_out_confirmation',
                                templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                            });
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success"
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Failed"
                    };
                });
            }
            else if (ajaxid == 14) {
                let bookinguuid = req.body.bookinguuid;
                let depositamount = req.body.depositamount;
                let DepositCollection = core_1.default.app.get('mongoClient').get('deposit');
                yield DepositCollection
                    .update({
                    bookinguuid: bookinguuid
                }, {
                    $set: {
                        depositCollected: depositamount
                    }
                })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success"
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Failed"
                    };
                });
            }
            else if (ajaxid == 15) {
                let guest_email = req.body.guest_email;
                let guest_name = req.body.guest_name;
                let hoteluuid = req.body.hoteluuid;
                let booking_referenceId = req.body.booking_referenceId;
                let booking_source = req.body.booking_source;
                let bookinguuid = req.body.bookinguuid;
                let depositCollected = req.body.depositCollected;
                let transaction_referrence_id = req.body.transaction_referrence_id ? req.body.transaction_referrence_id : '123456';
                let payment_type = req.body.payment_type;
                let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                let DepositCollection = core_1.default.app.get('mongoClient').get('deposit');
                let PaymentDetails = core_1.default.app.get('mongoClient').get('payments');
                if (depositCollected > 0) {
                    let postvalues = {
                        transaction_id: Math.random(),
                        hoteluuid: hoteluuid,
                        bookinguuid: bookinguuid,
                        booking_referenceId: booking_referenceId,
                        collectionType: 'CREDIT',
                        paymentMethod: payment_type,
                        pic: req.session.user._user_id,
                        source: ['DEPOSIT COLLECTED'],
                        bookingSource: booking_source,
                        amount: depositCollected,
                        shiftInchrge: "",
                        nightauditDate: "",
                    };
                    request_1.default.post('/payment-manager/update-audit-trail', {}, postvalues).then(response => {
                        console.log("success");
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }
                yield PaymentDetails
                    .update({
                    bookinguuid: bookinguuid
                }, {
                    $set: {
                        "depositDetails.0.referenceId": transaction_referrence_id,
                        "depositDetails.0.paymentType": payment_type,
                        "depositDetails.0.paymentStatus": 'CONFIRMED',
                        "depositDetails.0.depositCollected": Number(depositCollected),
                        "depositDetails.0.depositCollectedDate": currentMoment,
                        "depositDetails.0.updatedOn": currentMoment
                    }
                })
                    .then(document => { console.log("Success"); })
                    .catch(error => { console.log("Failed"); });
                yield DepositCollection
                    .update({
                    bookinguuid: bookinguuid
                }, {
                    $set: {
                        depositCollected: Number(depositCollected)
                    }
                })
                    .then(document => {
                    let paymentData;
                    request_1.default.get('/payment-manager/payment/booking', {
                        bookinguuid: bookinguuid
                    }).then(response => {
                        paymentData = response.data;
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                    let depositData;
                    request_1.default.get('/payment-manager/payment/deposit', {
                        bookinguuid: bookinguuid
                    }).then(response => {
                        depositData = response.data;
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                    request_1.default.get('/pms-manager/get-booking-details', {
                        bookinguuid: bookinguuid
                    }).then(response => {
                        let no_of_rooms = response.data.booking.roomReservations.length;
                        if (booking_source != 'OTA') {
                            email_1.default.send({
                                from: 'info@hotelnida.com',
                                to: guest_email,
                                subject: 'Check in Confirmation',
                                body: 'Check in Confirmation',
                                category: ['Check in Confirmation'],
                                template: 'check_in_confirmation',
                                templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                            });
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success"
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Failed"
                    };
                });
            }
            else if (ajaxid == 16) {
                let email = req.body.email;
                let RoomDetails = core_1.default.app.get('mongoClient').get('guest_booking_info');
                yield RoomDetails
                    .find({ _email: email })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 17) {
                let hotel_id = req.body.hotel_uuid;
                let room_type = req.body.room_type;
                let RoomDetails = core_1.default.app.get('mongoClient').get('RoomActivity');
                yield RoomDetails
                    .find({ hotelUuid: hotel_id, roomType: room_type })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 18) {
                let hotel_id = req.body.hotel_uuid;
                let room_type = req.body.room_type;
                let RoomDetails = core_1.default.app.get('mongoClient').get('rooms');
                yield RoomDetails
                    .find({ "_hotelId": hotel_id, "_type._type": room_type })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 19) {
                let hotel_id = req.body.hotel_uuid;
                let RoomDetails = core_1.default.app.get('mongoClient').get('hotel_details');
                yield RoomDetails
                    .findOne({ "_hotel_id": hotel_id })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 20) {
                let hotel_id = req.body.hotel_uuid;
                let type = req.body.type;
                let RoomDetails = core_1.default.app.get('mongoClient').get('rooms');
                yield RoomDetails
                    .find({ "_type._type": type, _hotelId: hotel_id })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success",
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Rooms are not available"
                    };
                });
            }
            else if (ajaxid == 21) {
                let bookinguuid = req.body.booking_uuid;
                let hoteluuid = req.body.hoteluuid;
                let booking_referenceId = req.body.booking_referenceId;
                let booking_source;
                let today = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY').toDate();
                let currentDay = time_1.default.formatGivenDate(today);
                let check_in = req.body.check_in;
                let status;
                let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                let checkInDate = time_1.default.serverMomentInPattern(check_in, 'DD-MM-YYYY').toDate();
                if (checkInDate <= currentMoment) {
                    status = "CHECK_IN";
                }
                else {
                    status = "CONFIRMED";
                }
                yield RoomReservationCollection
                    .update({ bookingUuid: bookinguuid }, { $set: { status: status } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                yield BookingCollection
                    .update({ uuid: bookinguuid }, { $set: { status: status } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                yield PaymentCollection
                    .update({ bookinguuid: bookinguuid }, {
                    $set: {
                        paymentType: "Paid Online",
                        paymentStatus: "CONFIRMED",
                        updatedOn: currentMoment,
                        "transactionDetails.0.paymentType": "Paid Online",
                        "transactionDetails.0.paymentStatus": "CONFIRMED",
                        "transactionDetails.0.updatedOn": currentMoment
                    }
                }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                let paymentData;
                yield request_1.default.get('/payment-manager/payment/booking', {
                    bookinguuid: bookinguuid
                }).then(response => {
                    paymentData = response.data;
                    booking_source = response.data.booking_channel;
                    let postvalues = {
                        transaction_id: Math.random(),
                        hoteluuid: response.data.hoteluuid,
                        bookinguuid: bookinguuid,
                        booking_referenceId: booking_referenceId,
                        collectionType: 'CREDIT',
                        paymentMethod: 'Paid Online',
                        pic: req.session.user._user_id,
                        source: ['BOOKING PRICE'],
                        bookingSource: response.data.booking_channel,
                        amount: response.data.totalAmount,
                        shiftInchrge: "",
                        nightauditDate: "",
                    };
                    request_1.default.post('/payment-manager/update-audit-trail', {}, postvalues).then(response => {
                        console.log("success");
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                let depositData;
                yield request_1.default.get('/payment-manager/payment/deposit', {
                    bookinguuid: bookinguuid
                }).then(response => {
                    depositData = response.data;
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                yield request_1.default.get('/inventory/booking/walk-in', {
                    booking_uuid: bookinguuid
                }).then(response => {
                    let no_of_rooms = response.data.booking.roomReservations.length;
                    response.data.roomReservations[0].checkIn = time_1.default.formatGivenDate(response.data.roomReservations[0].checkIn);
                    response.data.roomReservations[0].checkOut = time_1.default.formatGivenDate(response.data.roomReservations[0].checkOut);
                    response.data.booking.bookedOn = time_1.default.formatGivenDateWithTime(response.data.booking.bookedOn);
                    if (booking_source != 'OTA') {
                        email_1.default.send({
                            from: 'info@hotelnida.com',
                            to: response.data.booking.guest.emailAddress,
                            subject: 'Check in Confirmation',
                            body: 'Check in Confirmation',
                            category: ['Check in Confirmation'],
                            template: 'check_in_confirmation',
                            templateObject: { category: "Check in Confirmation", depositData: depositData, guest_name: response.data.booking.guest.firstName, no_of_rooms: no_of_rooms, output: response.data, paymentData: paymentData }
                        });
                    }
                    res.status(200);
                    respond = {
                        success: true,
                        message: "success"
                    };
                }).catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: "Failed"
                    };
                });
            }
            else if (ajaxid == 22) {
                let bookinguuid = req.body.bookinguuid;
                request_1.default.get('/pms-manager/get-booking-details', {
                    bookinguuid: bookinguuid
                }).then(response => {
                    let no_of_rooms = response.data.booking.roomReservations.length;
                    let booking_channel = response.paymentData.booking_channel;
                    if (booking_channel != 'OTA') {
                        email_1.default.send({
                            from: 'info@hotelnida.com',
                            to: response.data.booking.guest.emailAddress,
                            subject: 'Check in Confirmation',
                            body: 'Check in Confirmation',
                            category: ['Check in Confirmation'],
                            template: 'check_in_confirmation',
                            templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                        });
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                res.status(200);
                respond = {
                    success: true,
                    message: "success"
                };
            }
            res.json(respond);
        }));
        FrontendRouter.route("/refer-earn/send-email")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let user_id = '';
            let user_details = '';
            if (req.session.user) {
                user_id = req.session.user._user_id;
                user_details = req.session.user;
            }
            else {
                user_id = '';
                return res.json({ message: 'failed', redirect: '/users/login?info=refer' });
            }
            var newReferDetails = {
                user_id: req.body.user_id,
                hotel_id: req.body.hotel_id,
                share_url: req.body.share_url,
                hotel_city: req.body.hotel_city,
                share_type: "Email",
                link_opens: 0
            };
            var refer_name = req.body.refer_name;
            var refer_email = req.body.refer_email;
            var hotel_city = req.body.hotel_city;
            var hotel_id = req.body.hotel_id;
            var share_url = req.body.share_url;
            let errorobj = {};
            var postbody = JSON.stringify({ params: newReferDetails });
            errorobj['requestBody'] = req.body;
            req.checkBody('refer_name', 'Name cannot be empty').notEmpty();
            req.checkBody('refer_email', 'Email cannot be empty').notEmpty();
            req.checkBody('refer_email', 'Please enter the valid email').isEmail();
            req.sanitize('refer_name').toString();
            req.getValidationResult().then(function (result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!result.isEmpty()) {
                        errorobj['message'] = "";
                        var errors = result.array();
                        for (let error of errors) {
                            var key = error.param;
                            errorobj['message'] += error.msg + "\r\n";
                        }
                        res.json(errorobj);
                    }
                    else {
                        let masters = yield LocationMasters_1.default.getMasters();
                        yield FrontendController.getHotelInfo(masters, req, res, user_id)
                            .then(tags => {
                            let hotelData = tags;
                            email_1.default.send({
                                from: 'info@hotelnida.com',
                                to: refer_email,
                                subject: 'Your ideal hotel recommended by your Hotel NIDA Agent',
                                body: 'Refer & Earn Share Link',
                                category: ['Refer & Earn'],
                                template: 'refer_earn',
                                templateObject: { hotel_image: hotelData.image, hotel_name: hotelData.hotel_name, category: "Refer & Earn Share Link", refer_name: refer_name, user_details: user_details, hotel_city: hotel_city, share_url: share_url }
                            });
                        })
                            .catch(err => {
                            console.log(err);
                        });
                        let data = {
                            type: LogLaw.Type.REFER_EARN,
                            by: user_id,
                            payload: {
                                refer_name: refer_name,
                                refer_email: refer_email,
                                hotel_id: hotel_id,
                            }
                        };
                        let referEarnLog = log_1.default.create(data);
                        let logCollection = core_1.default.app.get('mongoClient').get('Log');
                        logCollection.insert(referEarnLog.document);
                        APIClient_1.default.send('/booking/refer-earn/share-hotel/', postbody, function (api_result) {
                            if (api_result.success) {
                                res.json({ success: true, message: "success" });
                            }
                            else {
                                res.json({ success: false, message: api_result.message });
                            }
                        });
                    }
                });
            });
        }));
        FrontendRouter.route("/:id/getLandmarks")
            .get(inputvalidator_1.default.paramsID, (req, res) => {
            request_1.default.get('/booking/getHotelLandmarks', { hotel_id: req.params.id })
                .then(response => {
                res.status(200);
                res.json({
                    success: true,
                    landmarks: response.data
                });
            }).catch(error => {
                res.status(400);
                res.json({
                    success: false,
                    message: error
                });
            });
        });
        FrontendRouter.route("/:id/getEssentials")
            .get(inputvalidator_1.default.paramsID, (req, res) => {
            request_1.default.get('/booking/getEssentials', { hotel_id: req.params.id })
                .then(response => {
                res.status(200);
                res.json({
                    success: true,
                    landmarks: response.data
                });
            }).catch(error => {
                res.status(400);
                res.json({
                    success: false,
                    message: error
                });
            });
        });
        return FrontendRouter;
    }
    static getHotelInfo(masters, req, res, userid) {
        let postbody = JSON.stringify({});
        return new Promise(function (resolve, reject) {
            APIClient_1.default.send('/hotel_manager/getHotelDetails/' + req.query.place, postbody, function (api_result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (api_result.success) {
                        let templateData = {};
                        if (api_result.data.length >= 1) {
                            let link = {};
                            api_result.data[0]._city_id = LocationMasters_1.default.getCityNameById(masters, api_result.data[0]._city_id);
                            api_result.data[0]._description = (api_result.data[0]._description === undefined ? '' : api_result.data[0]._description);
                            if (api_result.data[0]._image_fids !== undefined) {
                                if (api_result.data[0]._image_fids !== null) {
                                    let singleFid = new Array();
                                    api_result.data[0]._image_fids.forEach(fid => {
                                        if (singleFid.length == 0 && fid !== null && fid !== undefined) {
                                            singleFid.push(fid);
                                        }
                                    });
                                    let FileManagerlinks = yield FileManager_1.default.getFiles(JSON.stringify(singleFid));
                                    if (FileManagerlinks.success) {
                                        link = FileManagerlinks.data[0];
                                    }
                                }
                            }
                            let dynamichost = app_1.environments[process.env.ENV].emails.email_template_host;
                            let page_url = (dynamichost.indexOf('http') < 0 ? 'http:' + dynamichost : dynamichost) + '/search/details?place=' + api_result.data[0]._hotel_id + '&countryID=' + api_result.data[0]._country_id;
                            if (userid) {
                                page_url = page_url + "&referred_by=" + userid;
                            }
                            let tags = {
                                url: page_url,
                                title: api_result.data[0]._nida_stay_name + ' -  Asia at your doorstep',
                                description: 'Travelling soon? Refine your stay at Hotel NIDA with enhanced flexibility & convenience to suit the needs of a modern traveller.',
                                image: link,
                                hotel_name: api_result.data[0]._nida_stay_name,
                                host: app_1.environments[process.env.ENV].emails.email_template_host,
                                rating_snippet: (api_result.data[0]._rating_snippet === undefined ? '' : FrontendController.htmlEntities.decode(api_result.data[0]._rating_snippet)),
                                country_id: api_result.data[0]._country_id
                            };
                            res.locals.metaTags = tags;
                            resolve(tags);
                        }
                        else {
                            console.log('hotel does not exists to put meta tags');
                        }
                    }
                    else {
                        reject(false);
                    }
                });
            }, 'GET');
        });
    }
}
FrontendController.htmlEntities = new Html_Entities();
exports.default = FrontendController;
