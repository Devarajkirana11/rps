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
const request_1 = require("../../helpers/request");
const masters_1 = require("../../helpers/masters");
const time_1 = require("../../helpers/time");
const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const InventoryLaw = require("../../models/inventory/law");
var handlebars = require('handlebars');
var ObjectId = require('mongodb').ObjectID;
var in_array = require('in_array');
class Pms {
    static get routes() {
        let PmsRouter = express.Router();
        let LogDetails = core_1.default.app.get('mongoClient').get('Log');
        let UserCollection = core_1.default.app.get('mongoClient').get('users');
        let HotelCollection = core_1.default.app.get('mongoClient').get('hotel_details');
        let GuestCollection = core_1.default.app.get('mongoClient').get('guest_booking_info');
        let MasterDetails = core_1.default.app.get('mongoClient').get('masters');
        let BookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let RoomCollection = core_1.default.app.get('mongoClient').get('rooms');
        let TaxCollection = core_1.default.app.get('mongoClient').get('tax');
        let logCollection = core_1.default.app.get('mongoClient').get('Log');
        let RoomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        PmsRouter.route('/audit-trail')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('audit-trail', { output: "sdf" });
        }));
        PmsRouter.route('/booking-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let booking_uuid = req.query.booking_uuid;
            let hoteluuid = req.query.hotel_id;
            let user_uuid = req.session.user._user_id;
            let paymentData;
            let depositData;
            let room_type_array;
            let guest_data;
            let identification_type;
            let identification_doc_url;
            let identification_doc_fid;
            let postvalues1;
            let ic_number;
            let check_in_details;
            let check_out_details;
            let created_by;
            let user_details_Array = [];
            let time;
            let by;
            let guest_details;
            let country_name;
            if (hoteluuid == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country = newLocation.data;
            yield UserCollection
                .find()
                .then(document => {
                document.forEach(function (value, index) {
                    user_details_Array[value._user_id] = value._first_name + ' ' + value._last_name;
                });
            })
                .catch(error => {
            });
            yield LogDetails
                .findOne({ type: "CHECK_IN", "payload.bookingUuid": booking_uuid })
                .then(document => {
                if (document.moment) {
                    time = time_1.default.countryFormatGivenDateWithTime(document.moment, country_name);
                    by = document.by;
                    check_in_details = user_details_Array[by] + ' ' + time;
                }
            })
                .catch(error => {
            });
            yield LogDetails
                .findOne({ type: "CHECK_OUT", "payload.bookingUuid": booking_uuid })
                .then(document => {
                if (document.moment) {
                    let time = time_1.default.countryFormatGivenDateWithTime(document.moment, country_name);
                    let by = document.by;
                    check_out_details = user_details_Array[by] + ' ' + time;
                }
            })
                .catch(error => {
            });
            yield LogDetails
                .findOne({ type: "BOOKING_CREATE", "payload.bookingUuid": booking_uuid })
                .then(document => {
                if (document.moment) {
                    let time = time_1.default.countryFormatGivenDateWithTime(document.moment, country_name);
                    let by = document.by;
                    created_by = user_details_Array[by];
                }
            })
                .catch(error => {
            });
            yield request_1.default.get('/pms-manager/guest-info-update', {
                booking_id: booking_uuid
            }).then(response => {
                identification_type = response.data._identification_type;
                ic_number = response.data._ic_number;
                if (response.data) {
                    identification_doc_fid = JSON.parse(response.data._identification_doc);
                    if (identification_doc_fid[0]) {
                        postvalues1 = {
                            params: {
                                files: identification_doc_fid
                            }
                        };
                        request_1.default.post('/file/get', {}, postvalues1).then(response => {
                            identification_doc_url = response.links[0];
                            console.log(identification_doc_url);
                        }).catch(error => {
                            console.log('Error: ', error.message);
                        });
                    }
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/pms-manager/get-booking-details', {
                bookinguuid: booking_uuid
            }).then(response => {
                depositData = response.depositData;
                paymentData = response.paymentData;
                guest_details = response.guest_details;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
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
            yield request_1.default.get('/inventory/booking/walk-in', {
                booking_uuid: booking_uuid
            }).then(response => {
                console.log(guest_details);
                let ic_url = identification_doc_url;
                if (response.success) {
                    let isCheckInDay = time_1.default.serverMoment.isSame(time_1.default.serverMomentInPattern(response.data.checkIn, 'DD-MM-YYYY'), 'day') ? true : false;
                    res.status(200);
                    res.render('pms-booking-view', { country_name: country_name, guest_details: guest_details, locationmasters: masters, country: country, created_by: created_by, check_in_details: check_in_details, check_out_details: check_out_details, user_uuid: user_uuid, ic_number: ic_number, identification_doc_url: ic_url, identification_type: identification_type, room_types: room_types, output: response.data, isCheckInDay: isCheckInDay, paymentData: paymentData, depositData: depositData });
                }
                else {
                    let isCheckInDay = time_1.default.serverMoment.isSame(time_1.default.serverMomentInPattern(response.data.checkIn, 'DD-MM-YYYY'), 'day') ? true : false;
                    res.status(200);
                    res.render('pms-booking-view', { country_name: country_name, guest_details: guest_details, locationmasters: masters, country: country, created_by: created_by, check_in_details: check_in_details, check_out_details: check_out_details, user_uuid: user_uuid, ic_number: ic_number, identification_doc_url: ic_url, identification_type: identification_type, room_types: room_types, output: response.data, isCheckInDay: isCheckInDay, paymentData: paymentData, depositData: depositData });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsRouter.route('/users/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_result = yield masters_1.default.getHotelDetails();
            let hotel_id = req.query.hotel_id;
            ;
            res.status(200);
            res.render('userscreation', { hotel_id: hotel_id });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let password = req.body.password;
            let hotel_id = req.body.hotel_name;
            let new_password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
            let email = req.body.email;
            let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            let newUser = {
                user_id: req.body.user_id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: email.toLowerCase(),
                username: req.body.user_name,
                password: new_password,
                hotel_name: req.body.hotel_name,
                roles: req.body.roles,
                status: req.body.status,
                created_on: currentMoment,
                updated_on: currentMoment,
                last_access: ''
            };
            var postbody = JSON.stringify({ params: newUser });
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('first_name', 'Please enter the first name').notEmpty();
            req.checkBody('last_name', 'Please enter the last name').notEmpty();
            req.checkBody('email', 'Please enter the email id').notEmpty();
            req.checkBody('password', 'Please enter the password').notEmpty();
            req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('userscreation', { errors: errors, inputs: newUser, hotel_id: hotel_id });
                }
                else {
                    APIClient_1.default.send('/user-manager/user-create', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/pms/users/list?hotel_id=" + hotel_id);
                        }
                        else {
                            res.status(400)
                                .render('userscreation', api_result);
                        }
                    });
                }
            });
        }));
        PmsRouter.route('/users/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_result = yield masters_1.default.getHotelDetails();
            let hotel_id = req.query.hotel_id;
            let hotel_array = [];
            let respond;
            yield UserCollection
                .find({ _hotel_name: hotel_id }, { "sort": { "_id": -1 } })
                .then(document => {
                respond = {
                    success: true,
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
            });
            hotel_result.data.forEach(function (value, index) {
                hotel_array[value._hotel_id] = value._nida_stay_name;
            });
            respond.data.forEach(function (value, index) {
                if (value._hotel_name) {
                    value.hotel_name = hotel_array[value._hotel_name];
                }
            });
            res.status(200);
            res.render('hotellistview', { output: respond, hotel_id: hotel_id });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let respond;
            let output;
            let val = req.body.val;
            let name = req.body.first_name;
            let username = req.body.username;
            let hotel_name = req.body.hotel_name;
            let status = req.body.status;
            let inputs = { "first_name": name, "username": username, "status": status };
            let input_array = [];
            input_array['_hotel_name'] = hotel_id;
            if (name) {
                input_array["_first_name"] = { $regex: name, $options: "si" };
            }
            if (username) {
                input_array["_username"] = { $regex: username, $options: "si" };
            }
            if (status) {
                input_array["_status"] = status;
            }
            let condition = Object.assign({}, input_array);
            let postbody = JSON.stringify({ params: condition });
            APIClient_1.default.send('/user-manager/user-list', postbody, function (api_result) {
                if (api_result.success) {
                    res.status(200)
                        .render('hotellistview', { output: api_result, inputs: inputs });
                }
                else {
                    res.status(400)
                        .render('hotellistview', { output: api_result, inputs: inputs });
                }
            });
        }));
        PmsRouter.route('/users/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let query = { user_id: req.params.id };
            let postbody = JSON.stringify({ params: query });
            const errorobj = {};
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('hotelusersedit', { errors: errors });
                }
                else {
                    request_1.default.post('/user-manager/get-user-details', {}, query).then(response => {
                        if (response.success) {
                            res.status(200)
                                .render('hotelusersedit', { output: response.data[0] });
                        }
                        else {
                            res.status(200)
                                .render('hotelusersedit', { output: response.data[0] });
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let hotel_id = req.body.hotel_name;
            let respond;
            let email = req.body.email;
            let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            let editUser = {
                id: id,
                user_id: req.body.user_id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                username: req.body.user_name,
                password: req.body.pass_hidden,
                hotel_name: req.body.hotel_name,
                roles: req.body.roles,
                status: req.body.status,
                created_on: req.body.created_on,
                updated_on: currentMoment,
                last_access: req.body.last_access
            };
            let Postvalues = {
                _id: id,
                _user_id: req.body.user_id,
                _first_name: req.body.first_name,
                _last_name: req.body.last_name,
                _email: email.toLowerCase(),
                _username: req.body.user_name,
                _password: req.body.pass_hidden,
                _hotel_name: req.body.hotel_name,
                _roles: req.body.roles,
                _status: req.body.status,
                _created_on: req.body.created_on,
                _updated_on: currentMoment,
                _last_access: req.body.last_access
            };
            let postbody = JSON.stringify({ params: editUser });
            const errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('first_name', 'Please enter the first name').notEmpty();
            req.checkBody('last_name', 'Please enter the last name').notEmpty();
            req.checkBody('email', 'Please enter the email id').notEmpty();
            req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('hotelusersedit', { errors: errors, output: Postvalues });
                }
                else {
                    APIClient_1.default.send('/user-manager/user-update', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/pms/users/list?hotel_id=" + hotel_id);
                        }
                        else {
                            res.status(400)
                                .render('hotelusersedit', api_result);
                        }
                    });
                }
            });
        }));
        PmsRouter.route('/tax')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let respond;
            let input_array = [];
            let condition = Object.assign({}, input_array);
            yield TaxCollection
                .find({ _tax_level: "Hotel", _hotel_id: hotel_id }, { "sort": { "_id": -1 } })
                .then(document => {
                respond = {
                    success: true,
                    data: document,
                    user: req.session.user
                };
            })
                .catch(error => {
                res.status(404);
            });
            res.status(200);
            res.render('pms_tax', { output: respond, hotel_id: hotel_id });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let respond;
            let output;
            let tax_name = req.body.tax_name;
            let country = req.body.country;
            let type = req.body.type;
            let status = req.body.status;
            let city = req.body.city;
            let input_array = [];
            let inputs = { "tax_name": tax_name, "country": country, "type": type, "status": status, "city": city };
            if (tax_name) {
                input_array["_name"] = { $regex: tax_name, $options: "si" };
            }
            if (country) {
                input_array["_country"] = country;
            }
            if (type) {
                input_array["_type"] = type;
            }
            if (status) {
                input_array["_status"] = status;
            }
            if (city) {
                input_array["_city"] = city;
            }
            input_array['_tax_level'] = 'Hotel';
            input_array['_hotel_id'] = hotel_id;
            let condition = Object.assign({}, input_array);
            let postbody = JSON.stringify({ params: condition });
            APIClient_1.default.send('/admin-manager/tax-list', postbody, function (api_result) {
                if (api_result.success) {
                    res.status(200)
                        .render('pms_tax', { output: api_result, inputs: inputs });
                }
                else {
                    res.status(400)
                        .render('pms_tax', { output: api_result, inputs: inputs });
                }
            });
        }));
        PmsRouter.route('/tax/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            res.status(200);
            res.render('pms_taxcreation', { hotel_id: hotel_id });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let newTax = {
                name: req.body.tax_name,
                country: req.body.country,
                tax_level: "Hotel",
                hotel_id: req.body.hotel_id,
                city: req.body.city,
                type: req.body.type,
                tax_value: req.body.tax_value,
                status: req.body.status,
                applicable_level: req.body.applicable_level,
                calculation_type: req.body.calculation_type,
                based_on: req.body.based_on,
                add_on: req.body.add_on,
                created_on: Date.now()
            };
            let requestBody = req.body;
            let respond;
            let hotel_id = req.body.hotel_id;
            var postbody = JSON.stringify({ params: newTax });
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('tax_name', 'Please enter the tax name').notEmpty();
            req.checkBody('country', 'Please select the country').notEmpty();
            req.checkBody('city', 'Please select the city').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('taxcreation', { errors: errors, output: requestBody });
                }
                else {
                    APIClient_1.default.send('/admin-manager/tax-create', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/pms/tax?hotel_id=" + hotel_id);
                        }
                        else {
                            res.status(400)
                                .render('pms_taxcreation', api_result);
                        }
                    });
                }
            });
        }));
        PmsRouter.route('/tax/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let query = { tax_id: req.params.id };
            let postbody = JSON.stringify({ params: query });
            const errorobj = {};
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('taxedit', { errors: errors });
                }
                else {
                    APIClient_1.default.send('/admin-manager/get-tax-details', postbody, function (api_result) {
                        if (api_result.success) {
                            console.log(api_result.data[0]);
                            res.status(200)
                                .render('pms_taxedit', { output: api_result.data[0] });
                        }
                        else {
                            res.status(400)
                                .render('pms_taxedit', { output: api_result.data[0] });
                        }
                    });
                }
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let respond;
            let editTax = {
                id: id,
                tax_id: req.body.tax_id,
                tax_level: "Hotel",
                hotel_id: req.body.hotel_id,
                name: req.body.tax_name,
                country: req.body.country,
                city: req.body.city,
                type: req.body.type,
                tax_value: req.body.tax_value,
                status: req.body.status,
                created_on: req.body.created_on,
                applicable_level: req.body.applicable_level,
                calculation_type: req.body.calculation_type,
                based_on: req.body.based_on,
                add_on: req.body.add_on,
            };
            let PostValues = {
                _id: id,
                _tax_id: req.body.tax_id,
                _name: req.body.tax_name,
                _country: req.body.country,
                _city: req.body.city,
                _type: req.body.type,
                _tax_value: req.body.tax_value,
                _status: req.body.status,
                _created_on: req.body.created_on,
                _applicable_level: req.body.applicable_level,
                _calculation_type: req.body.calculation_type,
                _based_on: req.body.based_on,
                _add_on: req.body.add_on,
            };
            let postbody = JSON.stringify({ params: editTax });
            let hotel_id = req.body.hotel_id;
            const errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('tax_name', 'Please enter the tax name').notEmpty();
            req.checkBody('country', 'Please select the country').notEmpty();
            req.checkBody('type', 'Please select the type').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('taxedit', { errors: errors, output: PostValues });
                }
                else {
                    APIClient_1.default.send('/admin-manager/tax-update', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/pms/tax?hotel_id=" + hotel_id);
                        }
                        else {
                            res.status(400)
                                .render('pms_taxedit', api_result);
                        }
                    });
                }
            });
        }));
        PmsRouter.route('/front-desk')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let dashboardStats;
            let roles = req.session.user._roles;
            if (in_array(9, roles)) {
                res.status(200);
                res.redirect('/users/profile');
            }
            else {
                request_1.default.get('/report-manager/dashboard-stats', {
                    hotel_uuid: hotel_id
                })
                    .then(response => {
                    res.status(200);
                    dashboardStats = response.data;
                })
                    .catch(error => {
                    console.log('Error: ', error.message);
                    res.status(400);
                });
                request_1.default.get('/inventory/front-desk', {
                    hotel_uuid: hotel_id,
                    start_date: '12-08-2017'
                }).then(response => {
                    if (response.success) {
                        res.status(200);
                        res.render('front-desk-dashboard', {
                            output: dashboardStats,
                            hotel_id: hotel_id
                        });
                    }
                    else {
                        res.status(200);
                        res.render('front-desk-dashboard', { hotel_id: hotel_id });
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
            }
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsRouter.route('/front-desk/dashboard')
            .get((req, res) => {
            let hotelUuid = req.query.hotel_uuid;
            request_1.default.get('/report-manager/dashboard-stats', {
                hotel_uuid: hotelUuid
            })
                .then(response => {
                console.log(response.data);
                res.status(200);
                res.render('frontdesk-dashboard', {
                    output: response.data,
                    hotel_uuid: hotelUuid
                });
            })
                .catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
            });
        });
        PmsRouter.route('/bookings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('pms-bookings');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsRouter.route('/walkin-reservation')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country = newLocation.data;
            let user_uuid = '';
            let respond;
            let isManager = "Yes";
            if (req.session.user) {
                user_uuid = req.session.user._user_id;
            }
            else {
                user_uuid = '';
            }
            res.status(200);
            res.render('walkin-reservation', { isManager: isManager, country: country, locationmasters: masters, hotel_id: hotel_id, user_uuid: user_uuid });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let user_uuid = '';
            if (req.session.user) {
                user_uuid = req.session.user._user_id;
            }
            else {
                user_uuid = '';
            }
            let masters = yield LocationMasters_1.default.getMasters();
            let responds;
            let isManager = "Yes";
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country_list = newLocation.data;
            let front_desk_name = req.session.user._first_name + ' ' + req.session.user._last_name;
            let manager_email;
            let payment_status;
            let deposit_value;
            let hotelDepositAmount;
            let room_type = req.body.room_type;
            let room_no = req.body.room_no;
            let breakfast_included = [];
            breakfast_included = req.body.breakfast_included;
            let room_price = req.body.room_price;
            let deposit = req.body.deposit ? req.body.deposit : "No";
            let total_room_price = req.body.total_room_price ? req.body.total_room_price : 0;
            let service_fee = req.body.service_fee ? req.body.service_fee : 0;
            let total_tax = req.body.total_tax ? req.body.total_tax : 0;
            let final_total_amount = req.body.final_total_amount ? req.body.final_total_amount : 0;
            let discountAmount = req.body.discountAmount ? req.body.discountAmount : 0;
            let priceAfterDiscount = req.body.priceAfterDiscount ? req.body.priceAfterDiscount : 0;
            if (priceAfterDiscount > 0) {
                priceAfterDiscount = priceAfterDiscount;
            }
            else {
                priceAfterDiscount = total_room_price;
            }
            let discount = req.body.discount ? req.body.discount : 0;
            let payment_type = req.body.payment_type;
            let paymentCurrency = req.body.paymentCurrency;
            let transactionReferrenceId = req.body.transaction_referrence_id;
            let amount_to_be_collected = req.body.amount_to_be_collected;
            if (req.body.status == 'ON_HOLD') {
                payment_status = 'ON_HOLD';
            }
            else {
                amount_to_be_collected = 0;
                payment_status = 'CONFIRMED';
            }
            let status = req.body.status;
            let tourismtax = req.body.tourismtax ? req.body.tourismtax : 0;
            let noofnights = req.body.noofnights ? req.body.noofnights : 1;
            let no_of_rooms = req.body.no_of_rooms ? req.body.no_of_rooms : 1;
            let guest_email = req.body.guest_email;
            let guest_first_name = req.body.guest_first_name;
            let guest_last_name = req.body.guest_last_name;
            let mobile_code = req.body.mobile_code;
            let guest_mobile_number = req.body.guest_mobile_number;
            let phone_code = req.body.phone_code;
            let guest_phone_number = req.body.guest_phone_number;
            let identification_type = req.body.identification_type;
            let identification_doc = req.body.ic_doc;
            let additional_identification = req.body.additional_identification;
            let additional_identification_number = req.body.additional_identification_number;
            let ic_number = req.body.ic_number;
            let guest_nationality = req.body.guest_nationality;
            let country = req.body.country;
            let state = req.body.state;
            let city = req.body.city;
            let address = req.body.guest_address;
            let address2 = req.body.guest_address_2;
            let postal_code = req.body.guest_postal_code;
            let gender = req.body.guest_gender;
            let booking_channel = req.body.booking_channel;
            let channel_name;
            if (booking_channel == 'OTA') {
                channel_name = req.body.channel_name;
            }
            else if (booking_channel == 'CORPORATE') {
                channel_name = req.body.corporate_name;
            }
            else if (booking_channel == 'AGENT') {
                channel_name = req.body.agent_name;
            }
            else {
                channel_name = '';
            }
            let guest_remarks = req.body.guest_remarks;
            let obid = req.body.obid;
            let no_of_child = req.body.child;
            let paid_in_ota = req.body.paid_in_ota ? req.body.paid_in_ota : '';
            let hotel_id = req.body.hotel_id;
            yield HotelCollection
                .findOne({ _hotel_id: hotel_id })
                .then(document => {
                hotelDepositAmount = document._deposit_amount;
            })
                .catch(error => { });
            deposit_value = parseInt(no_of_rooms) * hotelDepositAmount;
            let depositCollected;
            if (deposit == 'Yes') {
                depositCollected = deposit_value;
            }
            else {
                depositCollected = 0;
            }
            let tourismTaxIncluded;
            if (booking_channel == 'OTA' && amount_to_be_collected > 0) {
                tourismTaxIncluded = 'No';
            }
            else {
                tourismTaxIncluded = 'Yes';
            }
            let guest = {
                firstName: req.body.guest_first_name,
                lastName: req.body.guest_last_name,
                phoneNumber: req.body.guest_mobile_number,
                emailAddress: req.body.guest_email
            };
            let discountMarkup = {
                type: InventoryLaw.MarkupType.PERCENTAGE,
                value: 10
            };
            let rate_values = {
                check_in: req.body.check_in,
                check_out: req.body.check_out,
                discount: discount
            };
            let room_rate_array = new Array();
            yield request_1.default.post('/hotels-manager/manager/rates/sell/walk-in', { hotel_uuid: hotel_id }, rate_values).then(response => {
                response.data.rooms.forEach(function (value, index) {
                    if (booking_channel == 'OTA') {
                        value.costBreakdown.forEach(function (values, indexs) {
                            let totalRoomPrice = Number(priceAfterDiscount) / Number(no_of_rooms);
                            let costpernight = Number(totalRoomPrice) / Number(noofnights);
                            values.cost = costpernight;
                        });
                    }
                    if (value.costBreakdown.length > 0) {
                        room_rate_array[value.type] = value.costBreakdown;
                    }
                });
            }).catch(error => {
            });
            let rooms = new Array();
            let guest_details = { "firstName": req.body.guest_first_name, "lastName": req.body.guest_last_name, "phoneNumber": req.body.guest_mobile_number, "emailAddress": req.body.guest_email };
            if (room_type) {
                room_type.forEach(function (item, index) {
                    rooms.push({
                        roomNumber: room_no[index],
                        roomType: item,
                        roomPrice: room_price[index],
                        costBreakdown: room_rate_array[item],
                        guest: guest_details,
                        numberOfGuests: req.body.adults,
                        numberOfNights: noofnights,
                        breakfastIncluded: 'No',
                        checkIn: req.body.check_in,
                        checkOut: req.body.check_out
                    });
                });
            }
            let postvalues = {
                status: status,
                source: booking_channel,
                no_of_child: no_of_child,
                hotel_remark: guest_remarks,
                guest: JSON.stringify(guest),
                discount_markup: JSON.stringify(discountMarkup),
                rooms: JSON.stringify(rooms),
                user_uuid: req.body.user_uuid,
                bookedBy: req.body.user_uuid
            };
            let respond;
            yield RoomCollection
                .find({ _hotelId: hotel_id })
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
                    msg: "room is available"
                };
            });
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            if (discountAmount > 0) {
                let ContactDetails = core_1.default.app.get('mongoClient').get('contact_details');
                yield ContactDetails
                    .findOne({ _hotel_id: hotel_id })
                    .then(document => {
                    manager_email = document._ManagerContactDetails[0]._email;
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        msg: "room is available"
                    };
                });
            }
            req.checkBody('check_in', 'Please enter the check in date').notEmpty();
            req.checkBody('check_out', 'Please enter the check out date').notEmpty();
            req.checkBody('adults', 'Please enter the no of adults').notEmpty();
            req.checkBody('child', 'Please enter the no of child').notEmpty();
            req.checkBody('room_type', 'Please enter the room type').notEmpty();
            req.checkBody('guest_first_name', 'Please enter the guest first name').notEmpty();
            req.checkBody('guest_last_name', 'Please enter the guest last name').notEmpty();
            req.checkBody('ic_number', 'Please enter the IC Number').notEmpty();
            req.checkBody('guest_nationality', 'Please enter the nationality').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('walkin-reservation', { isManager: isManager, country: country_list, rooms: respond.data, locationmasters: masters, errors: errors, output: req.body, inputs: req.body });
                }
                else {
                    request_1.default.post('/inventory/booking/walk-in', {
                        hotel_uuid: hotel_id
                    }, postvalues).then(response => {
                        if (response.success) {
                            let bookinguuid = response.data.uuid;
                            let booking_reference_id = response.data.referenceId;
                            if (bookinguuid) {
                                let depositpostvalues = {
                                    bookinguuid: bookinguuid,
                                    hoteluuid: hotel_id,
                                    depositAmount: deposit_value,
                                    depositCollected: depositCollected
                                };
                                request_1.default.post('/payment-manager/payment/deposit', {}, depositpostvalues).then(response => {
                                    console.log(response);
                                }).catch(error => {
                                    console.log('Error: ', error.message);
                                });
                                let guestvalues = {
                                    salutation: "Mr",
                                    firstname: guest_first_name,
                                    lastname: guest_last_name,
                                    gender: req.body.gender,
                                    mobileno_stdcode: mobile_code,
                                    mobileno: guest_mobile_number,
                                    phoneno_stdcode: phone_code,
                                    phoneno: guest_phone_number,
                                    email: guest_email,
                                    identification_type: identification_type,
                                    identification_doc: identification_doc,
                                    additional_identification: additional_identification,
                                    additional_identification_number: additional_identification_number,
                                    ic_number: ic_number,
                                    nationality: guest_nationality,
                                    country: country,
                                    state: state,
                                    city: city,
                                    address: address,
                                    address2: address2,
                                    postal_code: postal_code,
                                    reason_to_stay: guest_remarks,
                                    booking_id: bookinguuid,
                                    guest_id: " ",
                                    company_information: req.body.add_company_details,
                                    company_name: req.body.company_name,
                                    company_address: req.body.company_address,
                                    company_taxid: req.body.company_taxid,
                                    company_telephone: req.body.company_telephone,
                                    company_fax: req.body.company_fax,
                                };
                                request_1.default.post('/pms-manager/guest-info-update', {}, guestvalues).then(response => {
                                    console.log(response);
                                }).catch(error => {
                                    console.log(error);
                                });
                                let new_payment_type;
                                let paymentvalues = {
                                    "bookinguuid": bookinguuid,
                                    "hoteluuid": hotel_id,
                                    "user_uuid": user_uuid,
                                    "paymentReferrenceId": obid,
                                    "transactionReferrenceId": transactionReferrenceId,
                                    "booking_channel": booking_channel,
                                    "channel_name": channel_name,
                                    "totalRoomPrice": parseFloat(total_room_price).toFixed(2),
                                    "discountType": "PERCENTAGE",
                                    "discountValue": parseFloat(discount).toFixed(2),
                                    "discountAmount": parseFloat(discountAmount).toFixed(2),
                                    "priceAfterDiscount": parseFloat(priceAfterDiscount).toFixed(2),
                                    "serviceFee": parseFloat(service_fee).toFixed(2),
                                    "tax": parseFloat(total_tax).toFixed(2),
                                    "tourismTax": parseFloat(tourismtax).toFixed(2),
                                    "tourismTaxIncluded": tourismTaxIncluded,
                                    "depositAmount": deposit_value,
                                    "depositIncluded": deposit,
                                    "totalAmountPaid": parseFloat(final_total_amount).toFixed(2),
                                    "remainingAmount": amount_to_be_collected,
                                    "totalAmount": parseFloat(final_total_amount).toFixed(2),
                                    "paymentCurrency": paymentCurrency,
                                    "paymentType": payment_type,
                                    "paymentStatus": payment_status,
                                    "front_desk_name": front_desk_name,
                                    "booking_reference_id": booking_reference_id,
                                    "paid_in_ota": paid_in_ota
                                };
                                request_1.default.post('/payment-manager/payment/booking', {}, paymentvalues).then(response => {
                                    let redirect_url = response.redirectUrl;
                                    res.status(200);
                                    res.redirect(redirect_url);
                                }).catch(error => {
                                    console.log('Error: ', error.message);
                                    res.status(200);
                                    res.render('walkin-reservation', { rooms: respond.data, locationmasters: masters, inputs: postvalues, 'hotel_id': hotel_id });
                                });
                            }
                        }
                        else {
                            res.status(200);
                            res.render('walkin-reservation', { rooms: respond.data, locationmasters: masters, inputs: postvalues, 'hotel_id': hotel_id });
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }
            });
        }));
        PmsRouter.route('/tax')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let input_array = [];
            let condition = Object.assign({}, input_array);
            let userLogin = core_1.default.app.get('mongoClient').get('tax');
            yield userLogin
                .find(condition, { "sort": { "_id": -1 } })
                .then(document => {
                respond = {
                    success: true,
                    data: document,
                    user: req.session.user
                };
            })
                .catch(error => {
                res.status(404);
            });
            res.status(200);
            res.render('pms/hotel/tax', { output: respond });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let output;
            let tax_name = req.body.tax_name;
            let country = req.body.country;
            let type = req.body.type;
            let status = req.body.status;
            let city = req.body.city;
            let input_array = [];
            let inputs = { "tax_name": tax_name, "country": country, "type": type, "status": status, "city": city };
            if (tax_name) {
                input_array["_name"] = { $regex: tax_name, $options: "si" };
            }
            if (country) {
                input_array["_country"] = country;
            }
            if (type) {
                input_array["_type"] = type;
            }
            if (status) {
                input_array["_status"] = status;
            }
            if (city) {
                input_array["_city"] = city;
            }
            let condition = Object.assign({}, input_array);
            let postbody = JSON.stringify({ params: condition });
            APIClient_1.default.send('/pms-manager/tax-list', postbody, function (api_result) {
                if (api_result.success) {
                    res.status(200)
                        .render('pms/hotel/tax', { output: api_result, inputs: inputs });
                }
                else {
                    res.status(400)
                        .render('pms/hotel/tax', { output: api_result, inputs: inputs });
                }
            });
        }));
        PmsRouter.route('/tax/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('taxcreation');
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let newTax = {
                name: req.body.tax_name,
                country: req.body.country,
                city: req.body.city,
                type: req.body.type,
                tax_value: req.body.tax_value,
                status: req.body.status,
                applicable_level: req.body.applicable_level,
                calculation_type: req.body.calculation_type,
                based_on: req.body.based_on,
                add_on: req.body.add_on,
                created_on: Date.now()
            };
            let requestBody = req.body;
            let respond;
            var postbody = JSON.stringify({ params: newTax });
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('tax_name', 'Please enter the tax name').notEmpty();
            req.checkBody('country', 'Please select the country').notEmpty();
            req.checkBody('city', 'Please select the city').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('pms/hotel/taxcreation', { errors: errors, output: requestBody });
                }
                else {
                    APIClient_1.default.send('/pms-manager/tax-create', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/pms/hotel/tax");
                        }
                        else {
                            res.status(400)
                                .render('pms/hotel/taxcreation', api_result);
                        }
                    });
                }
            });
        }));
        PmsRouter.route('/tax/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let query = { tax_id: req.params.id };
            let postbody = JSON.stringify({ params: query });
            const errorobj = {};
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('pms/hotel/taxedit', { errors: errors });
                }
                else {
                    APIClient_1.default.send('/pms-manager/get-tax-details', postbody, function (api_result) {
                        if (api_result.success) {
                            console.log(api_result.data[0]);
                            res.status(200)
                                .render('pms/hotel/taxedit', { output: api_result.data[0] });
                        }
                        else {
                            res.status(400)
                                .render('pms/hotel/taxedit', { output: api_result.data[0] });
                        }
                    });
                }
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let respond;
            let editTax = {
                id: id,
                tax_id: req.body.tax_id,
                name: req.body.tax_name,
                country: req.body.country,
                city: req.body.city,
                type: req.body.type,
                tax_value: req.body.tax_value,
                status: req.body.status,
                created_on: req.body.created_on,
                applicable_level: req.body.applicable_level,
                calculation_type: req.body.calculation_type,
                based_on: req.body.based_on,
                add_on: req.body.add_on,
            };
            let PostValues = {
                _id: id,
                _tax_id: req.body.tax_id,
                _name: req.body.tax_name,
                _country: req.body.country,
                _city: req.body.city,
                _type: req.body.type,
                _tax_value: req.body.tax_value,
                _status: req.body.status,
                _created_on: req.body.created_on,
                _applicable_level: req.body.applicable_level,
                _calculation_type: req.body.calculation_type,
                _based_on: req.body.based_on,
                _add_on: req.body.add_on,
            };
            let postbody = JSON.stringify({ params: editTax });
            const errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('tax_name', 'Please enter the tax name').notEmpty();
            req.checkBody('country', 'Please select the country').notEmpty();
            req.checkBody('type', 'Please select the type').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('pms/hotel/taxedit', { errors: errors, output: PostValues });
                }
                else {
                    APIClient_1.default.send('/pms-manager/tax-update', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect("/pms/tax");
                        }
                        else {
                            res.status(400)
                                .render('pms/hotel/taxedit', api_result);
                        }
                    });
                }
            });
        }));
        PmsRouter.route('/shift/opening')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let user_array = [];
            let user_result = yield masters_1.default.getUserDetails();
            let openingBalance;
            let isOpen;
            let openedBy;
            let openedTime;
            let userid;
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            user_result.data.forEach(function (item, index) {
                user_array[item._user_id] = item._first_name + ' ' + item._last_name;
            });
            let CashierDetails = core_1.default.app.get('mongoClient').get('Cashier');
            yield CashierDetails
                .find({ hotelUuid: hotel_id })
                .then(document => {
                document.forEach(function (items, indexs) {
                    let shifts = items.shifts;
                    shifts.forEach(function (item, index) {
                        if (item.end == null) {
                            isOpen = "Yes";
                            openedBy = item.userUuid;
                            openedTime = item.begin;
                            openedBy = user_array[item.userUuid];
                        }
                    });
                });
            })
                .catch(error => {
            });
            request_1.default.get('/cashier/open', {
                hotel_uuid: hotel_id
            }).then(response => {
                console.log(response);
                if (response.data.openingBalance == null) {
                    openingBalance = 0;
                }
                else {
                    openingBalance = response.data.openingBalance;
                }
                res.status(200);
                res.render('shift_opening', { country_name: country_name, openedTime: openedTime, openedBy: openedBy, isOpen: isOpen, openingBalance: openingBalance, output: response.data, user_details: req.session.user, hotel_id: hotel_id });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('shift_opening', { errors: error.error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let top_up_float;
            if (req.body.top_up_float > 0) {
                top_up_float = req.body.top_up_float;
            }
            else {
                top_up_float = 0;
            }
            let postvalues = {
                user_uuid: req.body.user_uuid,
                top_up_float: Number(top_up_float)
            };
            request_1.default.post('/cashier/open', { hotel_uuid: hotel_id }, postvalues).then(response => {
                console.log(response);
                res.status(200);
                res.redirect("/pms/front-desk?hotel_id=" + hotel_id);
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('shift_opening', { errors: error.error.message });
            });
        }));
        PmsRouter.route('/shift/closing')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let paymentCurrency;
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                paymentCurrency = 'MYR';
                country_name = 'Malaysia';
            }
            else {
                paymentCurrency = 'THB';
                country_name = 'Thailand';
            }
            let logged_in_user_id = req.session.user._user_id;
            let total;
            let islogout;
            let user_array = [];
            let user_result = yield masters_1.default.getUserDetails();
            let shiftOpenedBy;
            user_result.data.forEach(function (item, index) {
                user_array[item._user_id] = item._first_name + ' ' + item._last_name;
            });
            request_1.default.get('/cashier/close', {
                hotel_uuid: hotel_id
            }).then(response => {
                console.log(response.data);
                let final_total;
                let cash_total = 0;
                let refund;
                let openingFloat;
                let walkintotal;
                let walkincash;
                let payAtHoteltotal;
                let payAtHotelcash;
                let depositCollected;
                let bookingRefund;
                let depositRefund;
                let credit_card_total;
                let pos_total;
                let tourismTax;
                let cityLedger_total;
                if (response.success) {
                    let shift_opened_by = response.data.userUuid;
                    shiftOpenedBy = user_array[shift_opened_by];
                    if (logged_in_user_id == shift_opened_by) {
                        islogout = 'Yes';
                    }
                    if (response.data.openingFloat > 0) {
                        openingFloat = parseFloat(response.data.openingFloat).toFixed(2);
                    }
                    else {
                        openingFloat = 0;
                    }
                    if (response.data.walkIn.total > 0) {
                        walkintotal = parseFloat(response.data.walkIn.total).toFixed(2);
                    }
                    else {
                        walkintotal = 0;
                    }
                    if (response.data.walkIn.cash > 0) {
                        walkincash = parseFloat(response.data.walkIn.cash).toFixed(2);
                    }
                    else {
                        walkincash = 0;
                    }
                    if (response.data.payAtHotel.total > 0) {
                        payAtHoteltotal = parseFloat(response.data.payAtHotel.total).toFixed(2);
                    }
                    else {
                        payAtHoteltotal = 0;
                    }
                    if (response.data.payAtHotel.cash > 0) {
                        payAtHotelcash = parseFloat(response.data.payAtHotel.cash).toFixed(2);
                    }
                    else {
                        payAtHotelcash = 0;
                    }
                    if (response.data.depositRefund > 0) {
                        depositRefund = parseFloat(response.data.depositRefund).toFixed(2);
                    }
                    else {
                        depositRefund = 0;
                    }
                    if (response.data.bookingRefund > 0) {
                        bookingRefund = parseFloat(response.data.bookingRefund).toFixed(2);
                    }
                    else {
                        bookingRefund = 0;
                    }
                    credit_card_total = Number(response.data.walkIn.creditCard) + Number(response.data.payAtHotel.creditCard);
                    pos_total = Number(response.data.walkIn.pos) + Number(response.data.payAtHotel.pos);
                    cityLedger_total = Number(response.data.walkIn.cityLedger) + Number(response.data.payAtHotel.cityLedger) + Number(response.data.depositCollected.cityLedger) + Number(response.data.tourismTax.cityLedger);
                    total = Number(openingFloat) + Number(walkintotal) + Number(payAtHoteltotal) + Number(response.data.depositCollected.total) + Number(response.data.tourismTax.total) - Number(depositRefund) - Number(bookingRefund);
                    cash_total = Number(openingFloat) + Number(walkincash) + Number(payAtHotelcash) + Number(response.data.depositCollected.cash) + Number(response.data.tourismTax.cash) - Number(depositRefund) - Number(bookingRefund);
                    res.status(200);
                    res.render('shift_closing', { country_name: country_name, paymentCurrency: paymentCurrency, pos_total: pos_total, cityLedger_total: cityLedger_total, credit_card_total: credit_card_total, shiftOpenedBy: shiftOpenedBy, islogout: islogout, cash_total: cash_total, total: total, output: response.data, user_details: req.session.user, message: response.data.message });
                }
                else {
                    res.status(200);
                    res.render('shift_closing', { country_name: country_name, paymentCurrency: paymentCurrency, shiftOpenedBy: shiftOpenedBy, islogout: islogout, output: response.data, user_details: req.session.user, errors: response.data.message });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('shift_closing', { errors: error.error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let miscellaneous = req.body.miscellaneous;
            let remarks = req.body.remarks;
            let aaa = [];
            if (miscellaneous) {
                miscellaneous.forEach(function (item, index) {
                    let item_value;
                    if (item > 0) {
                        item_value = item;
                    }
                    else {
                        item_value = 0;
                    }
                    aaa[index] = { amount: Number(item_value), reason: remarks[index] };
                });
            }
            let postvalues = {
                miscellaneous: JSON.stringify(aaa),
                withdrawal: req.body.withdrawal ? req.body.withdrawal : 0
            };
            request_1.default.post('/cashier/close', { hotel_uuid: hotel_id }, postvalues).then(response => {
                console.log(response);
                if (response.success) {
                    res.status(200);
                    res.redirect("/users/logout");
                }
                else {
                    res.status(200);
                    res.render('shift_closing', { output: response.data, user_details: req.session.user, errors: response.data.message });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('shift_closing', { errors: error.error.message });
            });
        }));
        PmsRouter.route('/night/audit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let user_array = [];
            let user_result = yield masters_1.default.getUserDetails();
            let tomorrow = time_1.default.serverMoment.add(1, 'day').format('DD-MM-YYYY HH:mm:ss');
            let nextDay = time_1.default.serverMomentInPattern(tomorrow, 'DD-MM-YYYY').toDate();
            let tomorrow_deposit_refund;
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            user_result.data.forEach(function (item, index) {
                user_array[item._user_id] = item._first_name + ' ' + item._last_name;
            });
            yield RoomReservationCollection
                .find({ hotelUuid: hotel_id, status: "OCCUPIED", checkOut: nextDay })
                .then(document => {
                if (document.length > 0) {
                    tomorrow_deposit_refund = document.length * 50;
                }
            })
                .catch(error => { });
            request_1.default.get('/cashier/night-audit', {
                hotel_uuid: hotel_id
            }).then(response => {
                let isShiftOpen = response.isShiftOpen;
                let lth = response.data.shifts.length;
                response.data.shifts.forEach(function (item, index) {
                    let miscellaneous = 0;
                    if (item.userUuid) {
                        item.userName = user_array[item.userUuid];
                    }
                    item.walkIn.creditCards = Number(item.walkIn.creditCard) + Number(item.payAtHotel.creditCard);
                    item.walkIn.cashs = Number(item.walkIn.cash) + Number(item.payAtHotel.cash);
                    item.walkIn.poss = Number(item.walkIn.pos) + Number(item.payAtHotel.pos);
                    item.walkIn.cityLedgers = Number(item.walkIn.cityLedger) + Number(item.payAtHotel.cityLedger);
                    item.walkIn.totals = Number(item.walkIn.total) + Number(item.payAtHotel.total);
                    if (item.depositCollected.creditCard >= 0) {
                        item.credit_card_total = Number(item.walkIn.creditCard) + Number(item.payAtHotel.creditCard) + Number(item.depositCollected.creditCard) + Number(item.tourismTax.creditCard);
                    }
                    else {
                        item.credit_card_total = Number(item.walkIn.creditCard) + Number(item.payAtHotel.creditCard);
                    }
                    if (item.depositCollected.pos) {
                        item.pos_total = Number(item.walkIn.pos) + Number(item.payAtHotel.pos) + Number(item.depositCollected.pos) + Number(item.tourismTax.pos);
                    }
                    else {
                        item.pos_total = Number(item.walkIn.pos) + Number(item.payAtHotel.pos);
                    }
                    item.cityLedger_total = Number(item.walkIn.cityLedger) + Number(item.payAtHotel.cityLedger) + Number(item.depositCollected.cityLedger) + Number(item.tourismTax.cityLedger);
                    if (item.depositCollected.pos) {
                        item.all_total = Number(item.openingFloat) + Number(item.walkIn.total) + Number(item.payAtHotel.total) + Number(item.depositCollected.total) + Number(item.tourismTax.total) - Number(item.depositRefund);
                    }
                    else {
                        item.all_total = Number(item.openingFloat) + Number(item.walkIn.total) + Number(item.payAtHotel.total) + Number(item.depositCollected.total) - Number(item.depositRefund);
                    }
                    if (item.miscellaneous.length > 0) {
                        item.miscellaneous.forEach(function (items, key) {
                            miscellaneous += Number(items.amount);
                        });
                        item.miscellaneous_total = miscellaneous;
                    }
                });
                let final = Number(lth) - 1;
                let final_closing = response.data.shifts[final].actualClosingBalance;
                res.status(200);
                res.render('night_audit', { country_name: country_name, tomorrow_deposit_refund: tomorrow_deposit_refund, isShiftOpen: isShiftOpen, final_closing: final_closing, output: response.data, user_details: req.session.user, hotel_id: hotel_id });
            }).catch(error => {
                res.status(400);
                res.render('night_audit', { errors: error.error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let withdrawal;
            if (req.body.withdrawal > 0) {
                withdrawal = req.body.withdrawal;
            }
            else {
                withdrawal = 0;
            }
            let postvalues = { withdrawal: Number(withdrawal) };
            request_1.default.post('/cashier/night-audit', { hotel_uuid: hotel_id }, postvalues).then(response => {
                console.log(response);
                if (response.success) {
                    res.status(200);
                    res.redirect('/pms/front-desk?hotel_id=' + hotel_id);
                }
                else {
                    res.status(200);
                    res.render('night_audit', { output: response.data, user_details: req.session.user, errors: response.data.message });
                }
            }).catch(error => {
                res.status(200);
                res.render('night_audit', { errors: error.error.message });
            });
        }));
        PmsRouter.route('/night/audit/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let input_array = [];
            if (hotel_id) {
                input_array["hotelUuid"] = hotel_id;
            }
            let condition = Object.assign({}, input_array);
            let postbody = { params: condition };
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            console.log("Deva");
            console.log(country_name);
            request_1.default.get('/pms-manager/get-night-audit-list', {
                hotel_uuid: hotel_id
            }).then(response => {
                res.status(200);
                res.render('night_audit_list', { country_name: country_name, output: response.data, hotel_id: hotel_id });
            }).catch(error => {
                res.status(400);
                res.render('night_audit_list', { errors: error.error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let start_date_from = req.body.start_date_from;
            let start_date_to = req.body.start_date_to;
            let end_date_from = req.body.end_date_from;
            let end_date_to = req.body.end_date_to;
            let status = req.body.status;
            let hotel_id = req.query.hotel_id;
            let input_array = [];
            let inputs = { "start_date_from": start_date_from, "start_date_to": start_date_to, "end_date_from": end_date_from, "end_date_to": end_date_to, "status": status };
            if (start_date_from) {
                input_array["start_date_from"] = time_1.default.serverMomentInPattern(start_date_from, 'DD-MM-YYYY').toDate();
            }
            if (start_date_to) {
                input_array["start_date_to"] = time_1.default.serverMomentInPattern(start_date_to, 'DD-MM-YYYY').toDate();
            }
            if (end_date_from) {
                input_array["end_date_from"] = time_1.default.serverMomentInPattern(end_date_from, 'DD-MM-YYYY').toDate();
            }
            if (end_date_to) {
                input_array["end_date_to"] = time_1.default.serverMomentInPattern(end_date_to, 'DD-MM-YYYY').toDate();
            }
            if (status) {
                input_array["status"] = status;
            }
            if (hotel_id) {
                input_array["hotelUuid"] = hotel_id;
            }
            let condition = Object.assign({}, input_array);
            let postbody = { params: condition };
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            request_1.default.post('/pms-manager/get-night-audit-list', {
                hotel_uuid: hotel_id
            }, postbody).then(response => {
                res.status(200);
                res.render('night_audit_list', { country_name: country_name, output: response.data, hotel_id: hotel_id, inputs: req.body });
            }).catch(error => {
                console.log(error.message);
                res.status(200);
                res.render('night_audit_list', { errors: error.error.message });
            });
        }));
        PmsRouter.route('/night/audit/details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let night_audit_uuid = req.query.night_audit_uuid;
            let user_array = [];
            let user_result = yield masters_1.default.getUserDetails();
            user_result.data.forEach(function (item, index) {
                user_array[item._user_id] = item._first_name + ' ' + item._last_name;
            });
            request_1.default.get('/pms-manager/get-night-audit-details', {
                hotel_uuid: hotel_id,
                night_audit_uuid: night_audit_uuid
            }).then(response => {
                let isShiftOpen = response.isShiftOpen;
                let lth = response.data.shifts.length;
                response.data.shifts.forEach(function (item, index) {
                    let miscellaneous = 0;
                    if (item.userUuid) {
                        item.userName = user_array[item.userUuid];
                    }
                    let walkinTotal = Number(item.walkIn.total) ? Number(item.walkIn.total) : 0;
                    let payatHotelTotal = Number(item.payAtHotel.total) ? Number(item.payAtHotel.total) : 0;
                    let tourismTaxTotal;
                    let tourismTaxCash;
                    let tourismTaxCreditCard;
                    let tourismTaxPos;
                    if (item.tourismTax) {
                        if (item.tourismTax.total) {
                            tourismTaxTotal = Number(item.tourismTax.total);
                        }
                        else {
                            tourismTaxTotal = 0;
                        }
                        if (item.tourismTax.cash) {
                            tourismTaxCash = Number(item.tourismTax.cash);
                        }
                        else {
                            tourismTaxCash = 0;
                        }
                        if (item.tourismTax.credirCard) {
                            tourismTaxCreditCard = Number(item.tourismTax.credirCard);
                        }
                        else {
                            tourismTaxCreditCard = 0;
                        }
                        if (item.tourismTax.pos) {
                            tourismTaxPos = Number(item.tourismTax.pos);
                        }
                        else {
                            tourismTaxPos = 0;
                        }
                    }
                    else {
                        tourismTaxTotal = 0;
                        tourismTaxCash = 0;
                        tourismTaxCreditCard = 0;
                        tourismTaxPos = 0;
                    }
                    let depositCollectedTotal = Number(item.depositCollected.total) ? Number(item.depositCollected.total) : 0;
                    let depositCollectedCreditCard = Number(item.depositCollected.creditCard) ? Number(item.depositCollected.creditCard) : 0;
                    let depositCollectedPos;
                    if (item.depositCollected > 0) {
                        depositCollectedPos = (item.depositCollected);
                    }
                    else {
                        if (item.depositCollected.pos > 0) {
                            depositCollectedPos = Number(item.depositCollected.pos);
                        }
                        else {
                            depositCollectedPos = 0;
                        }
                    }
                    item.credit_card_total = parseFloat(item.walkIn.creditCard) + parseFloat(item.payAtHotel.creditCard) + tourismTaxCreditCard + depositCollectedCreditCard;
                    item.all_total = parseFloat(item.openingFloat) + walkinTotal + payatHotelTotal + depositCollectedTotal + Number(tourismTaxTotal) - parseFloat(item.depositRefund);
                    item.pos_total = parseFloat(item.walkIn.pos) + parseFloat(item.payAtHotel.pos) + tourismTaxPos + depositCollectedPos;
                    if (item.miscellaneous.length > 0) {
                        item.miscellaneous.forEach(function (items, key) {
                            miscellaneous += parseFloat(items.amount);
                        });
                        item.miscellaneous_total = miscellaneous;
                    }
                });
                let final = parseFloat(lth) - 1;
                let final_closing = response.data.shifts[final].actualClosingBalance;
                res.status(200);
                res.render('night_audit_details', { output: response.data, hotel_id: hotel_id });
            }).catch(error => {
                res.status(400);
                res.render('night_audit_details', { errors: error.error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsRouter.route('/bookings/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            request_1.default.get('/pms-manager/get-booking-list', {
                hotel_id: hotel_id,
                start_date: startDate,
                end_date: endDate
            }).then(bookingList => {
                res.status(200);
                res.render('booking_list_view', {
                    output: bookingList.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('booking_list_view');
            });
        }));
        PmsRouter.route('/rooms/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let current_time = time_1.default.serverTime;
            let current_date = current_time.split(" ");
            ;
            request_1.default.get('/pms-manager/get-room-status', {
                hotel_id: hotel_id,
                start_date: current_date[0]
            }).then(response => {
                let output = response.data;
                res.status(200);
                res.render("rooms-list", { output: response });
            }).catch(error => {
                res.status(200);
                res.render("rooms-list");
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let check_in_from = req.body.check_in_from;
            let check_in_to = req.body.check_in_to;
            let check_out_from = req.body.check_out_from;
            let check_out_to = req.body.check_out_to;
            let status = req.body.status;
            let hotel_id = req.query.hotel_id;
            let reference_id = req.body.booking_reference_id;
            let input_array = [];
            if (hotel_id) {
                input_array["hotelUuid"] = hotel_id;
            }
            let inputs = { "check_in_from": check_in_from, "check_in_to": check_in_to, "check_out_from": check_out_from, "check_out_to": check_out_to, "booking_reference_id": reference_id, "status": status };
            if (check_in_to) {
                input_array["check_in_to"] = time_1.default.serverMomentInPattern(check_in_to, 'DD-MM-YYYY').toDate();
            }
            if (check_in_from) {
                input_array["check_in_from"] = time_1.default.serverMomentInPattern(check_in_from, 'DD-MM-YYYY').toDate();
            }
            if (check_out_from) {
                input_array["check_out_from"] = time_1.default.serverMomentInPattern(check_out_from, 'DD-MM-YYYY').toDate();
            }
            if (check_out_to) {
                input_array["check_out_to"] = time_1.default.serverMomentInPattern(check_out_to, 'DD-MM-YYYY').toDate();
            }
            if (status) {
                input_array["status"] = status;
            }
            if (reference_id) {
                let booking_uuid;
                yield BookingCollection
                    .findOne({ referenceId: reference_id })
                    .then(document => {
                    booking_uuid = document.uuid;
                    input_array["bookingUuid"] = booking_uuid;
                })
                    .catch(error => { });
            }
            if (hotel_id) {
                input_array["hotelUuid"] = hotel_id;
            }
            let condition = Object.assign({}, input_array);
            let postbody = { params: condition };
            console.log(postbody);
            request_1.default.post('/pms-manager/get-booking-list', {
                hotel_uuid: hotel_id
            }, postbody).then(response => {
                res.status(200);
                res.render('booking_list_view', { output: response.data, hotel_id: hotel_id, inputs: req.body });
            }).catch(error => {
                console.log(error.message);
                res.status(200);
                res.render('booking_list_view', { errors: error.error.message });
            });
        }));
        PmsRouter.route('/rooms/cleaning')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            request_1.default.get('/inventory/front-desk/room-cleaning', {
                hotel_uuid: hotel_id
            }).then(response => {
                console.log(response);
                let output = response.data;
                res.status(200);
                res.render("rooms-cleaning", { output: output, hotel_id: hotel_id });
            }).catch(error => {
                res.status(200);
                res.render("rooms-cleaning", { erros: error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsRouter.route('/maintenance/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let responds;
            let users_array = [];
            yield UserCollection
                .find({}, { "sort": { "_id": -1 } })
                .then(document => {
                document.forEach(function (value, index) {
                    users_array[value._user_id] = value._first_name + ' ' + value._last_name;
                });
            })
                .catch(error => {
                res.status(404);
            });
            request_1.default.get('/inventory/front-desk/maintenance', {
                hotel_uuid: hotel_id
            }).then(response => {
                console.log(response);
                let output = response.data;
                response.data.forEach(function (value, index) {
                    if (value.blockedBy) {
                        value.blockedByName = users_array[value.blockedBy];
                    }
                });
                res.status(200);
                res.render("rooms-block-list", { output: output, hotel_id: hotel_id });
            }).catch(error => {
                res.status(200);
                res.render("rooms-block-list", { erros: error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsRouter.route('/maintenance/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let room_types;
            let user_details = req.session.user;
            let created_on = time_1.default.serverTime;
            request_1.default.get('/room_manager/types', {
                hotel_id: hotel_id
            }).then(response => {
                room_types = response.data;
                res.status(200);
                res.render("rooms-block-create", { currenttime: created_on, user_details: user_details, hotel_id: hotel_id, room_types: room_types, test: "Deva" });
            }).catch(error => {
                console.log(error);
                res.status(200);
                res.render("rooms-block-create", { erros: error.message });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let user_details = req.session.user;
            let created_on = time_1.default.serverTime;
            let postvalues = {
                from_date: req.body.from_date,
                to_date: req.body.to_date,
                reason: req.body.reason,
                remark: req.body.remarks,
                user_id: req.session.user._user_id,
                room_numbers: JSON.stringify(req.body.room_numbers)
            };
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            let requestBody = req.body;
            req.checkBody('from_date', 'Please enter the from date').notEmpty();
            req.checkBody('to_date', 'Please enter the to date').notEmpty();
            req.checkBody('reason', 'Please enter the reason').notEmpty();
            req.checkBody('room_type', 'Please select the room type').notEmpty();
            req.checkBody('room_numbers', 'Please select the room number').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    let room_types;
                    request_1.default.get('/room_manager/types', {
                        hotel_id: hotel_id
                    }).then(response => {
                        room_types = response.data;
                        res.status(200);
                        res.render("rooms-block-create", { currenttime: created_on, user_details: user_details, errors: errors, requestBody: requestBody, hotel_id: hotel_id, room_types: room_types, test: "Deva" });
                    }).catch(error => {
                    });
                }
                else {
                    request_1.default.put('/inventory/front-desk/maintenance', {
                        hotel_uuid: hotel_id
                    }, postvalues).then(response => {
                        res.status(200);
                        res.redirect("/pms/maintenance/list?hotel_id=" + hotel_id);
                    }).catch(error => {
                        res.status(200);
                        res.render("rooms-block-create", { erros: error.message, inputs: postvalues });
                    });
                }
            });
        }));
        PmsRouter.route('/room-number-change')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let room_reservation_uuid = req.body.room_reservation_uuid;
            let new_room_number = req.body.new_room_number;
            let booking_uuid = req.body.booking_uuid;
            let no_of_guest = req.body.no_of_guest;
            let postvalues = {
                room_reservation_uuid: room_reservation_uuid,
                new_room_number: new_room_number,
                no_of_guest: no_of_guest
            };
            request_1.default.put('/inventory/booking/change-room', { hotel_uuid: hotel_id }, postvalues).then(response => {
                res.status(200);
                res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
            }).catch(error => {
                res.status(200);
                res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
            });
        }));
        PmsRouter.route('/pdf-generation')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            var fs = require('fs');
            var pdf = require('html-pdf');
            let booking_uuid = req.query.booking_uuid;
            let company_address;
            let tax_type;
            let tax_percentage;
            let room_price_after_tax;
            let price_after_discount = 0;
            let service_fee = 0;
            request_1.default.get('/pms-manager/get-booking-details', {
                bookinguuid: booking_uuid
            }).then(response => {
                if (response.data.booking.status != 'ON_HOLD' && response.data.booking.status != 'CANCELLED') {
                    room_price_after_tax = response.paymentData.room_price_before_tax;
                    if (response.hotel_details._country_id == '132') {
                        company_address = 'D-16-3A, Menara Mitraland, NO 13A, Jalan PJU 5/1, Kota Damansara PJU 5/1, 47810, Petaling Jaya, Selangor';
                        tax_type = 'GST';
                        tax_percentage = 6;
                    }
                    else {
                        company_address = '140/28 ITF Tower. 15th Floor. Si Lom, Khwaeng Suriya Wong, Khet Bang Rak, Krung Thep Maha Nakhon 10500. Thailand';
                        tax_type = 'VAT';
                        tax_percentage = 7;
                    }
                    let no_of_rooms = response.data.booking.roomReservations.length;
                    var template = fs.readFileSync("./views/tax-invoice-pdf.handlebars", "utf8");
                    var data = { room_price_after_tax: room_price_after_tax, tax_percentage: tax_percentage, tax_type: tax_type, company_address: company_address, guest_details: response.guest_details, audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData };
                    var compileTemplate = handlebars.compile(template);
                    var html = compileTemplate(data);
                    var options = { format: 'Letter' };
                    pdf.create(html).toBuffer(function (err, buffer) {
                        if (err)
                            return res.send(err);
                        res.type('pdf');
                        res.end(buffer, 'binary');
                    });
                }
                else {
                    let html = "";
                    var options = { format: 'Letter' };
                    pdf.create(html).toBuffer(function (err, buffer) {
                        if (err)
                            return res.send(err);
                        res.type('pdf');
                        res.end(buffer, 'binary');
                    });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
        }));
        return PmsRouter;
    }
}
exports.default = Pms;
