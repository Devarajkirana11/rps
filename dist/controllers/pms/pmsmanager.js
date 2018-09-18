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
const identification_1 = require("../../helpers/identification");
const guest_booking_1 = require("../../models/guest_booking/guest_booking");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const pms_1 = require("../../models/pms/pms");
const time_1 = require("../../helpers/time");
const log_1 = require("../../models/log/log");
const request_1 = require("../../helpers/request");
const LogLaw = require("../../models/log/law");
const express = require("express");
var ObjectId = require('mongodb').ObjectID;
class PmsDetailsController {
    static get routes() {
        let PmsDetailRouter = express.Router();
        let logCollection = core_1.default.app.get('mongoClient').get('Log');
        let hotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
        let paymentsCollection = core_1.default.app.get('mongoClient').get('payments');
        let DepositCollection = core_1.default.app.get('mongoClient').get('deposit');
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        let MasterDetails = core_1.default.app.get('mongoClient').get('masters');
        let taxDetails = core_1.default.app.get('mongoClient').get('tax');
        let sharedHotelsCollection = core_1.default.app.get('mongoClient').get('shared_hotels');
        let guestCollection = core_1.default.app.get('mongoClient').get('guest_booking_info');
        let hotelCollection = core_1.default.app.get('mongoClient').get('hotel_details');
        let contactCollection = core_1.default.app.get('mongoClient').get('contact_details');
        let auditCollection = core_1.default.app.get('mongoClient').get('AuditTrail');
        let CashierCollection = core_1.default.app.get('mongoClient').get('Cashier');
        let RoomsCollection = core_1.default.app.get('mongoClient').get('rooms');
        let ReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let ActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
        let BookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        PmsDetailRouter.route('/tax-list')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let condition = req.body.params;
            yield taxDetails
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
        PmsDetailRouter.route('/tax-create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let taxDetailsData = req.body.params;
            let newUsers = pms_1.default.create(taxDetailsData);
            newUsers['tax_id'] = identification_1.default.generateUuid;
            yield taxDetails
                .insert(newUsers)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `New tax has been created with id ${document._id}`
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
        PmsDetailRouter.route('/tax-update')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let taxDetailsData = req.body.params;
            let taxdata = pms_1.default.create(taxDetailsData);
            let tax_id = req.body.params.tax_id;
            yield taxDetails
                .update({ _tax_id: tax_id }, taxdata)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Tax information updated Successfully`
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
        PmsDetailRouter.route('/get-tax-details')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let tax_id = req.body.params.tax_id;
            yield taxDetails
                .find({
                _tax_id: tax_id
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
        PmsDetailRouter.route('/guest-info-update')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let booking_id = req.query.booking_id;
            let respond;
            yield guestCollection
                .findOne({ _booking_id: booking_id })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    msg: "success",
                    data: document
                };
            })
                .catch(error => {
                res.status(500);
                respond = {
                    success: false,
                    msg: "Guest info not available"
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let newGuestBookingData = req.body;
            let newGuestBookingDetails = guest_booking_1.default.BookingCreate(newGuestBookingData);
            let respond;
            yield guestCollection
                .insert(newGuestBookingDetails)
                .then(document => {
                res.status(500);
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
                    message: error.message
                };
            });
            res.json(respond);
        }));
        PmsDetailRouter.route('/guest/info/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let first_name = req.body.first_name;
            let last_name = req.body.last_name;
            let email = req.body.email;
            let mobile_number = req.body.mobile_number;
            let hotel_id = req.body.hotel_id;
            let booking_uuid = req.body.booking_uuid;
            let ic_number = req.body.ic_number;
            let identification_type = req.body.identification_type;
            let additional_identification = req.body.additional_identification;
            let additional_identification_number = req.body.additional_identification_number;
            let country = req.body.country;
            let state = req.body.state;
            let city = req.body.city;
            let address = req.body.guest_address;
            let address2 = req.body.guest_address_2;
            let guest_postal_code = req.body.guest_postal_code;
            let natitonality = req.body.guest_nationality;
            let guest_gender = req.body.guest_gender;
            let guest_remarks = req.body.guest_remarks;
            let payment_status = req.body.payment_status;
            let payment_type = req.body.payment_type;
            let tourism_tax = req.body.tourism_tax;
            let totalAmountPaid = req.body.totalAmountPaid;
            let totalAmount = req.body.totalAmount;
            let no_of_rooms = req.body.no_of_rooms;
            let no_of_nights = req.body.no_of_nights;
            let booking_source = req.body.booking_source;
            let ic_doc = req.body.ic_doc;
            let company_name = req.body.company_name;
            let company_address = req.body.company_address;
            let company_taxid = req.body.company_taxid;
            let company_telephone = req.body.company_telephone;
            let company_fax = req.body.company_fax;
            let company_information = req.body.company_information;
            let tourismtaxDetails = [];
            let tourismTaxIncluded;
            let tourism_tax_value;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                tourism_tax_value = 10;
            }
            else {
                tourism_tax_value = 0;
            }
            if (payment_status == 'ON_HOLD') {
                if (natitonality == 'Malaysia') {
                    if (tourism_tax > 0) {
                        totalAmount = parseFloat(totalAmount) - parseFloat(tourism_tax);
                        totalAmountPaid = parseFloat(totalAmountPaid) - parseFloat(tourism_tax);
                        tourism_tax = parseFloat(tourism_tax) - parseFloat(tourism_tax);
                    }
                    else {
                        tourism_tax = 0;
                    }
                    tourismTaxIncluded = 'Yes';
                }
                else {
                    if (tourism_tax > 0) {
                        tourism_tax = tourism_tax;
                        if (additional_identification_number.length > 0 || additional_identification == 'on') {
                            totalAmount = parseFloat(totalAmount) - parseFloat(tourism_tax);
                            totalAmountPaid = parseFloat(totalAmountPaid) - parseFloat(tourism_tax);
                            tourism_tax = 0;
                        }
                    }
                    else {
                        if (additional_identification_number.length > 0 || additional_identification == 'on') {
                            tourism_tax = 0;
                        }
                        else {
                            tourism_tax = (parseFloat(no_of_nights) * parseFloat(no_of_rooms)) * tourism_tax_value;
                        }
                        totalAmount = parseFloat(totalAmount) + parseFloat(tourism_tax);
                        totalAmountPaid = parseFloat(totalAmountPaid) + parseFloat(tourism_tax);
                    }
                    let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                    let tdetails = {
                        referenceId: "",
                        Amount: tourism_tax,
                        paymentType: payment_type,
                        paymentStatus: "ON_HOLD",
                        createdOn: currentMoment,
                        updatedOn: currentMoment,
                    };
                    tourismtaxDetails.push(tdetails);
                    tourismTaxIncluded = 'No';
                }
                yield paymentsCollection
                    .update({ bookinguuid: booking_uuid }, {
                    $set: {
                        tourismTax: Number(tourism_tax),
                        totalAmountPaid: Number(totalAmountPaid),
                        totalAmount: Number(totalAmount),
                        tourismtaxDetails: tourismtaxDetails,
                        tourismTaxIncluded: tourismTaxIncluded
                    }
                }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
            }
            else if (payment_status == 'CONFIRMED' && booking_source == 'OTA') {
                if (natitonality == 'Malaysia') {
                    if (tourism_tax > 0) {
                        totalAmount = parseFloat(totalAmount) - parseFloat(tourism_tax);
                        totalAmountPaid = parseFloat(totalAmountPaid) - parseFloat(tourism_tax);
                        tourism_tax = parseFloat(tourism_tax) - parseFloat(tourism_tax);
                    }
                    else {
                        tourism_tax = 0;
                    }
                    tourismTaxIncluded = 'Yes';
                }
                else {
                    if (tourism_tax > 0) {
                        tourism_tax = tourism_tax;
                    }
                    else {
                        if (additional_identification_number.length > 0 || additional_identification == 'on') {
                            tourism_tax = 0;
                        }
                        else {
                            tourism_tax = (parseFloat(no_of_nights) * parseFloat(no_of_rooms)) * tourism_tax_value;
                        }
                        totalAmount = parseFloat(totalAmount) + parseFloat(tourism_tax);
                        totalAmountPaid = parseFloat(totalAmountPaid) + parseFloat(tourism_tax);
                    }
                    let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                    let tdetails = {
                        referenceId: "",
                        Amount: tourism_tax,
                        paymentType: payment_type,
                        paymentStatus: "ON_HOLD",
                        createdOn: currentMoment,
                        updatedOn: currentMoment,
                    };
                    tourismtaxDetails.push(tdetails);
                    tourismTaxIncluded = 'No';
                }
                yield paymentsCollection
                    .update({ bookinguuid: booking_uuid }, {
                    $set: {
                        tourismTax: Number(tourism_tax),
                        totalAmountPaid: Number(totalAmountPaid),
                        totalAmount: Number(totalAmount),
                        tourismtaxDetails: tourismtaxDetails,
                        tourismTaxIncluded: tourismTaxIncluded
                    }
                }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
            }
            yield guestCollection
                .update({ _booking_id: booking_uuid }, {
                $set: {
                    _ic_number: ic_number,
                    _identification_type: identification_type,
                    _country: country,
                    _state: state,
                    _city: city,
                    _postal_code: guest_postal_code,
                    _address: address,
                    _address2: address2,
                    _nationality: natitonality,
                    _gender: guest_gender,
                    _reason_to_stay: guest_remarks,
                    _additional_identification: additional_identification,
                    _additional_identification_number: additional_identification_number,
                    _identification_doc: ic_doc,
                    _company_information: company_information,
                    _company_name: company_name,
                    _company_address: company_address,
                    _company_taxid: company_taxid,
                    _company_telephone: company_telephone,
                    _company_fax: company_fax
                }
            }, { multi: true })
                .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                .catch(error => { res.status(500); });
            BookingCollection
                .findOneAndUpdate({
                uuid: booking_uuid
            }, {
                $set: {
                    guest: {
                        "firstName": first_name,
                        "lastName": last_name,
                        "phoneNumber": mobile_number,
                        "emailAddress": email
                    }
                }
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                res.status(200);
                res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
            })).catch(error => {
                res.status(200);
                res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
            });
        }));
        PmsDetailRouter.route('/get-night-audit-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let hotel_uuid = req.query.hotel_uuid;
            yield CashierCollection
                .find({ hotelUuid: hotel_uuid })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    msg: "success",
                    data: document
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    msg: "No data Found"
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let condition = req.body.params;
            let hotel_uuid = req.query.hotel_uuid;
            let condition_values = Object.create({});
            if (hotel_uuid) {
                condition_values.hotelUuid = hotel_uuid;
            }
            if (condition.status) {
                condition_values.status = condition.status;
            }
            if (condition.start_date_from && condition.start_date_to) {
                condition_values.begin = { $gte: new Date(condition.start_date_from), $lte: new Date(condition.start_date_to) };
            }
            else if (condition.start_date_from) {
                condition_values.begin = { $gte: new Date(condition.start_date_from) };
            }
            else if (condition.start_date_to) {
                condition_values.begin = { $lte: new Date(condition.start_date_to) };
            }
            if (condition.end_date_from && condition.end_date_to) {
                condition_values.end = { $gte: new Date(condition.end_date_from), $lte: new Date(condition.end_date_to) };
            }
            else if (condition.end_date_from) {
                condition_values.end = { $gte: new Date(condition.end_date_from) };
            }
            else if (condition.end_date_to) {
                condition_values.end = { $lte: new Date(condition.end_date_to) };
            }
            yield CashierCollection
                .find(condition_values, { "sort": { "_id": -1 } })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    msg: "success",
                    data: document
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    msg: "No data Found"
                };
            });
            res.json(respond);
        }));
        PmsDetailRouter.route('/get-night-audit-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let hotel_uuid = req.query.hotel_uuid;
            let night_audit_uuid = req.query.night_audit_uuid;
            yield CashierCollection
                .findOne({ hotelUuid: hotel_uuid, uuid: night_audit_uuid })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    msg: "success",
                    data: document
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    msg: "No data Found"
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        PmsDetailRouter.route('/get-room-status')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let today = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY').toDate();
            let tomorrow = time_1.default.serverMoment.add(1, 'day').format('DD-MM-YYYY HH:mm:ss');
            let nextDay = time_1.default.serverMomentInPattern(tomorrow, 'DD-MM-YYYY').toDate();
            let respond;
            let room_details = [];
            let bookingDetails = [];
            let activityDetails = [];
            let roomTypeArray = [];
            let bookingArray = [];
            yield BookingCollection
                .find()
                .then(document => {
                document.forEach(function (value, index) {
                    bookingArray[value.uuid] = value.referenceId;
                });
            })
                .catch(error => { });
            yield ActivityCollection
                .find({
                hotelUuid: hotel_id,
                blockingIssues: { $elemMatch: { "duration.startDate": { $lte: today }, "duration.endDate": { $gte: today } } }
            })
                .then(document => {
                document.forEach(function (value, index) {
                    activityDetails[value.roomNumber] = "Blocked";
                });
            })
                .catch(error => { });
            yield ReservationCollection
                .find({
                hotelUuid: hotel_id,
                checkIn: { $lte: today },
                checkOut: { $gte: nextDay }
            })
                .then(document => {
                document.forEach(function (value, index) {
                    bookingDetails[value.roomNumber] = value;
                    activityDetails[value.roomNumber] = value.status;
                    value.booking_id = bookingArray[value.bookingUuid];
                });
            })
                .catch(error => { });
            yield RoomsCollection
                .find({ _hotelId: hotel_id })
                .then(document => {
                document.forEach(function (value, index) {
                    let roomNumber = value._number;
                    let status;
                    if (activityDetails[roomNumber]) {
                        status = activityDetails[roomNumber];
                    }
                    else {
                        status = 'Available';
                    }
                    if (value._type._type > 0) {
                        roomTypeArray.push(value._type._type);
                    }
                    roomTypeArray = roomTypeArray.filter(function (elem, pos) {
                        return roomTypeArray.indexOf(elem) == pos;
                    });
                    room_details.push({
                        number: value._number,
                        roomType: value._type._type,
                        floorNumber: value._floorNumber,
                        status: status.toUpperCase(),
                        booking: bookingDetails[value._number]
                    });
                });
                res.status(200);
                respond = {
                    success: true,
                    msg: "success",
                    roomTypeArray: roomTypeArray,
                    data: room_details,
                };
            })
                .catch(error => {
                res.status(500);
                respond = {
                    success: false,
                    msg: "Rooms are not available"
                };
            });
            res.json(respond);
        }));
        PmsDetailRouter.route('/get-booking-details')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookinguuid = req.query.bookinguuid;
            let paymentData;
            let depositData;
            let booking_details;
            let hoteluuid;
            let hotel_details;
            let contact_details;
            let audit_details;
            let guest_details;
            let respond;
            yield auditCollection
                .find({ bookinguuid: bookinguuid })
                .then(document => {
                audit_details = document;
                audit_details.forEach(function (value, index) {
                    if (value.transactionDate) {
                        value.transactionDate = time_1.default.formatGivenDateWithTime(value.transactionDate);
                        value.amount = value.amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                });
            })
                .catch(error => {
                console.log('Error: ', error.message);
            });
            yield paymentsCollection
                .findOne({ bookinguuid: bookinguuid })
                .then(document => {
                document['prueDigitTotal'] = document.totalAmount;
                depositData = document.depositDetails[0];
                paymentData = document;
                hoteluuid = document.hoteluuid;
                document.room_price_before_tax = Number(document.priceAfterDiscount) + Number(document.serviceFee);
                document.totalAmountPaid = document.totalAmountPaid.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.totalAmount = document.totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.totalRoomPrice = document.totalRoomPrice.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.discountAmount = document.discountAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.priceAfterDiscount = document.priceAfterDiscount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.serviceFee = document.serviceFee.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.tax = document.tax.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.tourismTax = document.tourismTax.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            })
                .catch(error => {
                console.log('Error: ', error.message);
            });
            yield hotelCollection
                .findOne({ _hotel_id: hoteluuid })
                .then(document => {
                hotel_details = document;
                if (document._country_id == '132') {
                    hotel_details.company_name = 'DIGITAL STRENGTH SDN BHD';
                    hotel_details.registration_number = '1243262-U';
                    hotel_details.tax_number = '000009678848';
                }
                else if (document._country_id == '217') {
                    hotel_details.company_name = 'Nida Rooms (Co) Ltd';
                    hotel_details.registration_number = '0105559021694';
                    hotel_details.tax_number = '0105559021694';
                }
            })
                .catch(error => {
                console.log('Error: ', error.message);
            });
            yield guestCollection
                .findOne({ _booking_id: bookinguuid })
                .then(document => {
                guest_details = document;
            })
                .catch(error => {
                console.log('Error: ', error.message);
            });
            yield contactCollection
                .findOne({ _hotel_id: hoteluuid })
                .then(document => {
                contact_details = document;
            })
                .catch(error => {
                console.log('Error: ', error.message);
            });
            yield request_1.default.get('/inventory/booking/walk-in', { booking_uuid: bookinguuid }).then(response => {
                let no_of_rooms = response.data.booking.roomReservations.length;
                response.data.roomReservations[0].checkIn = time_1.default.formatGivenDate(response.data.roomReservations[0].checkIn);
                response.data.roomReservations[0].checkOut = time_1.default.formatGivenDate(response.data.roomReservations[0].checkOut);
                response.data.booking.bookedOn = time_1.default.formatGivenDateWithTime(response.data.booking.bookedOn);
                booking_details = response.data;
            }).catch(error => { });
            res.status(200);
            respond = {
                success: true,
                message: "success",
                data: booking_details,
                paymentData: paymentData,
                depositData: depositData,
                hotel_details: hotel_details,
                contact_details: contact_details,
                audit_details: audit_details,
                guest_details: guest_details
            };
            res.json(respond);
        }));
        PmsDetailRouter.route('/get-booking-list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let day = req.query.day;
            let respond;
            let result = new Array();
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            let options = req.query.options;
            let responds;
            let booking_array = [];
            let today = time_1.default.serverMoment.toDate();
            let reference_id = req.query.reference_id;
            let checkin_from = req.query.checkin_from;
            let checkin_to = req.query.checkin_to;
            let checkout_from = req.query.checkout_from;
            let checkout_to = req.query.checkout_to;
            let bookingUuid;
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country = newLocation.data;
            if (reference_id) {
                yield BookingCollection
                    .findOne({ referenceId: reference_id })
                    .then(document => {
                    bookingUuid = document.uuid;
                })
                    .catch(error => { });
            }
            let testData = new Array();
            let room_type_array;
            let room_types = [];
            let begin = time_1.default.serverMomentInPattern(startDate, "DD-MM-YYYY");
            begin.set({
                'hour': 0,
                'minute': 0,
                'second': 0,
                'millisecond': 0
            });
            let end = time_1.default.serverMomentInPattern(endDate, "DD-MM-YYYY");
            end.set({
                'hour': 23,
                'minute': 59,
                'second': 59,
                'millisecond': 999
            });
            var salespaymentCondition = {
                hotelId: hotel_id,
                bookedOn: {
                    $gte: begin.toDate(),
                    $lte: end.toDate()
                },
            };
            if (bookingUuid !== undefined) {
                salespaymentCondition['uuid'] = bookingUuid;
            }
            BookingCollection.find(salespaymentCondition).then((Payments) => __awaiter(this, void 0, void 0, function* () {
                for (let payment of Payments) {
                    let cost = log_1.default.spawn(payment);
                    let bookingUuid = payment.uuid;
                    let bookedOn = time_1.default.countryFormatGivenDateWithTime(payment.bookedOn, country_name);
                    let reference_id = payment.referenceId;
                    let status;
                    let roomType;
                    let booking_channel;
                    let channel_name;
                    let totalAmount;
                    let time;
                    let checkIn;
                    let checkOut;
                    let roomNumber;
                    let guest;
                    let OtaRefId;
                    let paymentLog = yield logCollection.findOne({
                        type: LogLaw.Type.PAYMENT,
                        "payload.bookingUuid": bookingUuid
                    });
                    let bookingLog = yield logCollection.findOne({
                        type: LogLaw.Type.BOOKING_CREATE,
                        "payload.bookingUuid": bookingUuid,
                    });
                    var salesdateCondition = {
                        type: LogLaw.Type.BOOKING_CREATE,
                        "payload.bookingUuid": bookingUuid
                    };
                    if (checkin_from !== undefined) {
                        checkin_from = time_1.default.serverMomentInPattern(checkin_from, "DD-MM-YYYY");
                        checkin_from.set({
                            'hour': 0,
                            'minute': 0,
                            'second': 0,
                            'millisecond': 0
                        });
                    }
                    if (checkin_to !== undefined) {
                        checkin_to = time_1.default.serverMomentInPattern(checkin_to, "DD-MM-YYYY");
                        checkin_to.set({
                            'hour': 0,
                            'minute': 0,
                            'second': 0,
                            'millisecond': 0
                        });
                    }
                    if (checkout_from !== undefined) {
                        checkout_from = time_1.default.serverMomentInPattern(checkout_from, "DD-MM-YYYY");
                        checkout_from.set({
                            'hour': 0,
                            'minute': 0,
                            'second': 0,
                            'millisecond': 0
                        });
                    }
                    if (checkout_to !== undefined) {
                        checkout_to = time_1.default.serverMomentInPattern(checkout_to, "DD-MM-YYYY");
                        checkout_to.set({
                            'hour': 0,
                            'minute': 0,
                            'second': 0,
                            'millisecond': 0
                        });
                    }
                    if (checkin_from !== undefined && checkin_to !== undefined) {
                        salesdateCondition['payload.checkIn'] = { $gte: checkin_from.toDate(), $lte: checkin_to.toDate() };
                    }
                    else if (checkin_from !== undefined) {
                        salesdateCondition['payload.checkIn'] = { $gte: new Date(checkin_from) };
                    }
                    else if (checkin_to !== undefined) {
                        salesdateCondition['payload.checkIn'] = { $lte: new Date(checkin_to) };
                    }
                    if (checkout_from !== undefined && checkout_to !== undefined) {
                        salesdateCondition['payload.checkOut'] = { $gte: new Date(checkout_from), $lte: new Date(checkout_to) };
                    }
                    else if (checkout_from !== undefined) {
                        salesdateCondition['payload.checkIn'] = { $gte: new Date(checkout_from) };
                    }
                    else if (checkout_to !== undefined) {
                        salesdateCondition['payload.checkIn'] = { $lte: new Date(checkout_to) };
                    }
                    yield logCollection.find(salesdateCondition).then(rooms => {
                        for (let reserve of rooms) {
                            let booking = log_1.default.spawn(reserve);
                            time = time_1.default.countryFormatGivenDateWithTime(booking.moment, country_name);
                            checkIn = time_1.default.formatGivenDate(booking.payload.checkIn);
                            checkOut = time_1.default.formatGivenDate(booking.payload.checkOut);
                            guest = booking.payload.guest;
                            roomNumber = booking.payload.roomReservations[0].roomNumber;
                        }
                    });
                    yield paymentsCollection.find({
                        hoteluuid: hotel_id,
                        bookinguuid: bookingUuid,
                    }).then(revenueDocuments => {
                        for (let occupied of revenueDocuments) {
                            let cost = log_1.default.spawn(occupied);
                            booking_channel = occupied.booking_channel;
                            channel_name = occupied.channel_name;
                            totalAmount = occupied.totalAmount;
                            OtaRefId = occupied.paymentReferrenceId;
                        }
                    });
                    yield ReservationCollection.find({
                        hotelUuid: hotel_id,
                        bookingUuid: bookingUuid,
                    }).then(revenueDocuments => {
                        for (let occupied of revenueDocuments) {
                            let cost = log_1.default.spawn(occupied);
                            roomType = occupied.roomType;
                            status = occupied.status;
                        }
                    });
                    if (time === undefined) {
                        continue;
                    }
                    if (booking_channel === "WALK_IN") {
                        channel_name = "WALK_IN";
                    }
                    else if (booking_channel === "WEB") {
                        channel_name = "WEB";
                    }
                    else if (booking_channel === "OTA") {
                        channel_name = channel_name;
                    }
                    let MasterDetails = core_1.default.app.get('mongoClient').get('masters');
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
                    result.push([
                        bookedOn,
                        '<a href="/pms/booking-details?booking_uuid=' + bookingUuid + '&hotel_id=' + hotel_id + '" >' + reference_id + '</a>',
                        checkIn,
                        checkOut,
                        guest.firstName + ' ' + guest.lastName,
                        booking_channel,
                        channel_name,
                        OtaRefId,
                        room_types[roomType],
                        roomNumber,
                        totalAmount,
                        status,
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared booking report as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        return PmsDetailRouter;
    }
}
exports.default = PmsDetailsController;
