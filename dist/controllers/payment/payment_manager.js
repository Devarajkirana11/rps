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
const express = require("express");
const LogLaw = require("../../models/log/law");
const payment_1 = require("../../models/payment/payment");
const deposit_1 = require("../../models/payment/deposit");
const core_1 = require("../../core");
const request_1 = require("../../helpers/request");
const email_1 = require("../../helpers/email");
const log_1 = require("../../models/log/log");
const time_1 = require("../../helpers/time");
var paypal = require('paypal-rest-sdk');
var config = app_1.environments[process.env.ENV].paypal;
var crypto = require('crypto');
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
paypal.configure(config.api);
class PaymentManager {
    static get routes() {
        let paymentRouter = express.Router();
        let hotelDetails = core_1.default.app.get('mongoClient').get('hotel_details');
        let PaymentCollection = core_1.default.app.get('mongoClient').get('payments');
        let logCollection = core_1.default.app.get('mongoClient').get('Log');
        let depositCollection = core_1.default.app.get('mongoClient').get('deposit');
        let BookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let RoomCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let AuditTrailCollection = core_1.default.app.get('mongoClient').get('AuditTrail');
        let CashierCollection = core_1.default.app.get('mongoClient').get('Cashier');
        let UserCollection = core_1.default.app.get('mongoClient').get('users');
        paymentRouter.route('/payment-gateway-connectivity')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let TransactionType = 'SALE';
            let PymtMethod = 'ANY';
            let ServiceID;
            let MerchantName;
            let MerchantReturnURL;
            let MerchantCallBackURL;
            let Password;
            let PostURL;
            let CurrencyCode = req.query.Currency;
            if (CurrencyCode == 'MYR') {
                ServiceID = app_1.environments[process.env.ENV].EGHL_MALAYSIA.ServiceID;
                Password = app_1.environments[process.env.ENV].EGHL_MALAYSIA.Password;
                MerchantName = app_1.environments[process.env.ENV].EGHL_MALAYSIA.MerchantName;
                MerchantReturnURL = app_1.environments[process.env.ENV].EGHL_MALAYSIA.MerchantReturnURL;
                MerchantCallBackURL = app_1.environments[process.env.ENV].EGHL_MALAYSIA.MerchantCallBackURL;
                PostURL = app_1.environments[process.env.ENV].EGHL_MALAYSIA.PostURL;
            }
            else {
                ServiceID = app_1.environments[process.env.ENV].EGHL_THAILAND.ServiceID;
                Password = app_1.environments[process.env.ENV].EGHL_THAILAND.Password;
                MerchantName = app_1.environments[process.env.ENV].EGHL_THAILAND.MerchantName;
                MerchantReturnURL = app_1.environments[process.env.ENV].EGHL_THAILAND.MerchantReturnURL;
                MerchantCallBackURL = app_1.environments[process.env.ENV].EGHL_THAILAND.MerchantCallBackURL;
                PostURL = app_1.environments[process.env.ENV].EGHL_THAILAND.PostURL;
            }
            let PaymentID = req.query.PaymentId;
            let OrderNumber = req.query.OrderNumber;
            let PaymentDesc = 'Online Payment';
            let Amount = Number(req.query.Amount).toFixed(2);
            let CustIP = req.query.CustIP ? req.query.CustIP : '192.168.2.35';
            let CustName = req.query.CustName ? req.query.CustName : "HOTEL NIDA";
            let CustEmail = req.query.CustEmail ? req.query.CustEmail : "info@hotelnida.com";
            let CustPhone = req.query.CustPhone ? req.query.CustPhone : "9876543210";
            let MerchantTermsURL = "https://hotelnida.com/terms-and-conditions";
            let LanguageCode = 'en';
            let PageTimeout = '780';
            let HashValue = Password + ServiceID + PaymentID + MerchantReturnURL + MerchantCallBackURL + Amount + CurrencyCode + CustIP + PageTimeout;
            let hash_update = crypto.createHash('sha256').update(HashValue).digest("hex");
            let postValues = {
                TransactionType: TransactionType,
                PymtMethod: PymtMethod,
                ServiceID: ServiceID,
                PaymentID: PaymentID,
                OrderNumber: OrderNumber,
                PaymentDesc: PaymentDesc,
                MerchantName: MerchantName,
                MerchantReturnURL: MerchantReturnURL,
                MerchantCallBackURL: MerchantCallBackURL,
                Amount: Number(Amount).toFixed(2),
                CurrencyCode: CurrencyCode,
                CustIP: CustIP,
                CustName: CustName,
                CustEmail: CustEmail,
                CustPhone: CustPhone,
                HashValue: hash_update,
                MerchantTermsURL: MerchantTermsURL,
                LanguageCode: LanguageCode,
                PageTimeout: PageTimeout,
                PostURL: PostURL
            };
            res.status(200);
            res.render('payment-gateway-form', { output: postValues });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        paymentRouter.route('/transaction-success')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let TxnStatus = req.query.TxnStatus;
            let PaymentID = req.query.PaymentID;
            let bookinguuid;
            yield PaymentCollection
                .findOne({
                paymentReferrenceId: String(PaymentID)
            })
                .then(document => {
                bookinguuid = document.bookinguuid;
            })
                .catch(error => { console.log(error.message); });
            if (bookinguuid && TxnStatus == 1) {
                RoomCollection
                    .update({ bookingUuid: bookinguuid }, { $set: { status: "CANCELLED" } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
                BookingCollection
                    .update({ uuid: bookinguuid }, { $set: { status: "CANCELLED" } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
                res.status(200);
                res.redirect('/payment-manager/cancel');
            }
            else {
                res.status(200);
                res.redirect('/payment-manager/cancel');
            }
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let booking_source;
            let payment_status;
            let payment_type;
            let bookinguuid;
            let update_condition;
            let tourismTax;
            let hoteluuid;
            let depositCollected;
            let source = [];
            let PaymentID = req.body.PaymentID;
            let TxnStatus = req.body.TxnStatus;
            let OrderNumber = req.body.OrderNumber;
            let Amount = req.body.Amount;
            let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            if (TxnStatus == 0) {
                yield PaymentCollection
                    .findOne({
                    paymentReferrenceId: String(PaymentID)
                })
                    .then(document => {
                    booking_source = document.booking_channel;
                    bookinguuid = document.bookinguuid;
                    hoteluuid = document.hoteluuid;
                    payment_status = document.paymentStatus;
                    payment_type = document.paymentType;
                    tourismTax = document.tourismTax;
                    depositCollected = document.depositDetails[0].depositCollected;
                })
                    .catch(error => { console.log(error.message); });
                if (booking_source == 'WEB' && payment_status == 'ON_HOLD') {
                    if (tourismTax > 0) {
                        source.push('TOURISM TAX');
                        update_condition = { "paymentType": "CREDIT_CARD", "tourismtaxDetails.0.paymentType": "CREDIT_CARD", "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "tourismtaxDetails.0.updatedOn": currentMoment, "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                    else {
                        update_condition = { "paymentType": "CREDIT_CARD", "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                    source.push('BOOKING PRICE');
                    if (depositCollected > 0) {
                        source.push('DEPOSIT');
                    }
                }
                else if (booking_source == 'WALK_IN' && payment_status == 'ON_HOLD') {
                    if (tourismTax > 0) {
                        source.push('TOURISM TAX');
                        update_condition = { "paymentType": "CREDIT_CARD", "depositDetails.0.paymentType": "CREDIT_CARD", "depositDetails.0.paymentStatus": "CONFIRMED", "depositDetails.0.updatedOn": currentMoment, "tourismtaxDetails.0.paymentType": "CREDIT_CARD", "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "tourismtaxDetails.0.updatedOn": currentMoment, "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                    else {
                        update_condition = { "paymentType": "CREDIT_CARD", "depositDetails.0.paymentType": "CREDIT_CARD", "depositDetails.0.paymentStatus": "CONFIRMED", "depositDetails.0.updatedOn": currentMoment, "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                    source.push('BOOKING PRICE');
                    if (depositCollected > 0) {
                        source.push('DEPOSIT');
                    }
                }
                else if (booking_source == 'WEB' && payment_status == 'CONFIRMED') {
                    source.push('DEPOSIT');
                    update_condition = { "depositDetails.0.paymentType": "CREDIT_CARD", "depositDetails.0.paymentStatus": "CONFIRMED", "depositDetails.0.updatedOn": currentMoment };
                }
                else {
                    source.push('BOOKING PRICE');
                    update_condition = { "paymentType": "CREDIT_CARD", "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                }
                yield PaymentCollection
                    .findOneAndUpdate({
                    paymentReferrenceId: PaymentID
                }, {
                    $set: update_condition
                })
                    .then(document => {
                    let bookinguuid = document.bookinguuid;
                    let hotel_id = document.hoteluuid;
                    let booking_channel = document.booking_channel;
                    let url;
                    if (booking_channel == 'WALK_IN' || booking_channel == 'OTA') {
                        url = "/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + bookinguuid;
                    }
                    else {
                        url = "/search/booking-view?booking_uuid=" + bookinguuid;
                    }
                    if (bookinguuid) {
                        request_1.default.get('/pms-manager/get-booking-details', {
                            bookinguuid: bookinguuid
                        }).then(response => {
                            if (response.success) {
                                let no_of_rooms = response.data.booking.roomReservations.length;
                                if (booking_channel != 'OTA') {
                                    email_1.default.send({
                                        from: 'info@hotelnida.com',
                                        to: response.data.booking.guest.emailAddress,
                                        subject: 'Booking Confirmation',
                                        category: ['Booking Confirmation'],
                                        body: 'Booking Confirmed',
                                        template: 'booking_confirmation',
                                        templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                                    });
                                }
                            }
                        }).catch(error => {
                            console.log('Error: ', error.message);
                        });
                        let inputvalues = { booking_uuid: document.bookinguuid };
                        request_1.default.put('/inventory/booking/payment', {}, inputvalues).then(response => {
                            res.status(200);
                            res.redirect(url);
                        }).catch(error => {
                            console.log('Error: ', error.message);
                            res.send("Failed");
                        });
                    }
                })
                    .catch(error => {
                    res.status(500);
                });
            }
            else {
                RoomCollection
                    .update({ bookingUuid: bookinguuid }, { $set: { status: "CANCELLED" } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
                BookingCollection
                    .update({ uuid: bookinguuid }, { $set: { status: "CANCELLED" } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { });
                res.status(200);
                res.redirect('/payment-manager/cancel');
            }
        }));
        paymentRouter.route('/transaction-verification')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            respond = "OK";
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let PaymentID = req.body.PaymentID;
            let TxnStatus = req.body.TxnStatus;
            if (TxnStatus == 0) {
                respond = "OK";
            }
            else {
                respond = "FAILED";
            }
            res.status(200);
            res.json(respond);
        }));
        paymentRouter.route('/transaction-approval')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        paymentRouter.route('/transaction-unapproval')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        paymentRouter.route('/get-audit-details')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let user_details_Array = [];
            yield UserCollection
                .find()
                .then(document => {
                document.forEach(function (value, index) {
                    user_details_Array[value._user_id] = value._first_name + ' ' + value._last_name;
                });
            })
                .catch(error => { });
            MongoClient.connect(app_1.environments[process.env.ENV].mongoDBUrl, function (err, db) {
                let UserSession = res.locals.user_details;
                let options = req.body;
                let columns = req.body.columns;
                let CustomizedQuery = {};
                columns.forEach(column => {
                    if (column.name == "pic" && column.search.value != "" && column.searchable == 'false') {
                        CustomizedQuery[column.name] = column.search.value;
                    }
                    else if (column.name == "transactionDate" && column.search.value != "" && column.searchable == 'false') {
                        let begin = time_1.default.serverMomentInPattern(column.search.value, "DD-MM-YYYY");
                        begin.set({
                            'hour': 0,
                            'minute': 0,
                            'second': 0,
                            'millisecond': 0
                        });
                        let end = time_1.default.serverMomentInPattern(column.search.value, "DD-MM-YYYY");
                        end.set({
                            'hour': 23,
                            'minute': 59,
                            'second': 59,
                            'millisecond': 999
                        });
                        CustomizedQuery[column.name] = {};
                        CustomizedQuery[column.name]["$lte"] = end.toDate();
                        CustomizedQuery[column.name]["$gte"] = begin.toDate();
                    }
                });
                CustomizedQuery['hoteluuid'] = req.query.hoteluuid;
                let hotel_id = req.query.hoteluuid;
                let country_name;
                if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                    country_name = 'Malaysia';
                }
                else {
                    country_name = 'Thailand';
                }
                if (Object.keys(CustomizedQuery).length)
                    options.customQuery = CustomizedQuery;
                options.caseInsensitiveSearch = true;
                new MongoDataTable(db).get('AuditTrail', options, function (err, result) {
                    if (err) {
                        res.status(500);
                        respond = {
                            success: false,
                            message: err.message,
                        };
                    }
                    Object.keys(result.data).forEach(key => {
                        result.data[key]['transactionDate'] = time_1.default.countryFormatGivenDateWithTime(result.data[key]['transactionDate'], country_name);
                        let pic = result.data[key]['pic'];
                        let sic = result.data[key]['shiftIncharge'];
                        result.data[key]['pic'] = user_details_Array[pic];
                        result.data[key]['shiftIncharge'] = user_details_Array[sic];
                    });
                    res.status(200);
                    respond = {
                        success: true,
                        message: 'All Details have been fetched',
                        Tabledata: result
                    };
                    res.json(respond);
                });
            });
        }));
        paymentRouter.route('/update-audit-trail')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let bookinguuid = req.body.bookinguuid;
            let collectionType = req.body.collectionType;
            let paymentMethod = req.body.paymentMethod;
            let pic = req.body.pic;
            let bookingSource = req.body.bookingSource;
            let amount = req.body.amount;
            let hoteluuid = req.body.hoteluuid;
            let source = req.body.source;
            let booking_referenceId = req.body.booking_referenceId;
            let shiftInchrge;
            let nightauditDate;
            yield CashierCollection
                .find({ hotelUuid: hoteluuid })
                .then(document => {
                document.forEach(function (item, index) {
                    let shifts = item.shifts;
                    nightauditDate = item.begin;
                    shifts.forEach(function (item, index) {
                        if (item.status == 'OPEN') {
                            shiftInchrge = item.userUuid;
                        }
                    });
                });
            })
                .catch(error => { });
            let document = {
                transactionId: Math.floor(10000000 + Math.random() * 90000000),
                transactionDate: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate(),
                hoteluuid: hoteluuid,
                bookinguuid: bookinguuid,
                bookingId: booking_referenceId,
                collectionType: collectionType,
                transactedItems: source,
                paymentMethod: paymentMethod,
                pic: pic,
                bookingSource: bookingSource,
                amount: Number(amount),
                shiftIncharge: shiftInchrge,
                nightauditDate: time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(nightauditDate), 'DD-MM-YYYY').toDate()
            };
            yield AuditTrailCollection
                .insert(document)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: "Success"
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
        paymentRouter.route('/booking/email-trigger')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let booking_uuid = req.body.booking_uuid;
            let email_id = req.body.email;
            let hotel_id = req.body.hotel_id;
            let paymentData;
            let guestData;
            let depositData;
            let respond;
            let hotel_details;
            yield hotelDetails
                .findOne({ _hotel_id: hotel_id })
                .then(document => {
                hotel_details = document;
            })
                .catch(error => {
            });
            yield request_1.default.get('/pms-manager/guest-info-update', {
                booking_id: booking_uuid
            }).then(response => {
                guestData = response.data;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            request_1.default.get('/pms-manager/get-booking-details', {
                bookinguuid: booking_uuid
            }).then(response => {
                let no_of_rooms = response.data.booking.roomReservations.length;
                email_1.default.send({
                    from: 'info@hotelnida.com',
                    to: email_id,
                    subject: 'Booking Confirmation',
                    body: 'Booking Confirmed',
                    template: 'booking_confirmation',
                    templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                });
                res.status(200);
                respond = {
                    success: true,
                    message: "Success",
                };
                res.json(respond);
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                respond = {
                    success: false,
                    message: error.message,
                };
                res.json(respond);
            });
        }));
        paymentRouter.route('/payment/booking')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let bookinguuid = req.query.bookinguuid;
            let userUuid = req.body.userUuid;
            yield PaymentCollection
                .findOne({ bookinguuid: bookinguuid })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: "Success",
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
                respond = {
                    msg: "Failed",
                    success: false,
                    data: ""
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let paymentCurrency;
            let userUuid = req.body.user_uuid;
            let paymentType = req.body.paymentType;
            let bookinguuid = req.body.bookinguuid;
            let totalAmount = req.body.totalAmount ? parseFloat(req.body.totalAmount).toFixed(1) : 0;
            let currency = req.body.currency;
            let booking_channel = req.body.booking_channel;
            let discountValue = req.body.discountValue ? parseFloat(req.body.discountValue).toFixed(2) : 0;
            let discountAmount = req.body.discountAmount ? parseFloat(req.body.discountAmount).toFixed(2) : 0;
            let front_desk_name = req.body.front_desk_name;
            let booking_reference_id = req.body.booking_reference_id ? req.body.booking_reference_id : bookinguuid;
            let hotel_id = req.body.hoteluuid;
            let no_of_child = req.body.no_of_child;
            let payment_type = req.body.paymentType ? req.body.paymentType : '';
            let payment_status = req.body.paymentStatus ? req.body.paymentStatus : '';
            let tourismtax = req.body.tourismTax ? req.body.tourismTax : '';
            let tourismTaxIncluded = req.body.tourismTaxIncluded ? req.body.tourismTaxIncluded : '';
            let remainingAmount = req.body.remainingAmount ? req.body.remainingAmount : req.body.totalAmountPaid;
            let depositAmount = req.body.depositAmount ? req.body.depositAmount : 0;
            let depositIncluded = req.body.depositIncluded ? req.body.depositIncluded : 'No';
            let hotel_details;
            let depositCollected;
            let main_total;
            let transactionDetails = [];
            let tourismtaxDetails = [];
            let depositDetails = [];
            let manual_updated_on = req.body.manual_updated_on ? req.body.manual_updated_on : undefined;
            if (depositIncluded == 'Yes') {
                depositCollected = depositAmount;
            }
            else {
                depositCollected = 0;
            }
            main_total = Number(req.body.totalAmountPaid) - Number(tourismtax);
            if (tourismtax > 0) {
                let ttd = {
                    "referenceId": "",
                    "Amount": tourismtax,
                    "paymentType": payment_type,
                    "paymentStatus": payment_status,
                    "createdOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate(),
                    "updatedOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                };
                tourismtaxDetails.push(ttd);
            }
            let dpd = {
                "referenceId": "",
                "depositAmount": depositAmount,
                "depositCollected": depositCollected,
                "lossDamageFee": "",
                "depositRefunded": "",
                "lossDamageFeeCollected": "",
                "paymentType": payment_type,
                "paymentStatus": payment_status,
                "createdOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate(),
                "updatedOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
            };
            depositDetails.push(dpd);
            let tnd;
            let MainpaymentType;
            let MainpaymentStatus;
            if (req.body.paid_in_ota == 'on') {
                MainpaymentStatus = 'CONFIRMED';
                MainpaymentType = 'Paid Online';
                tourismTaxIncluded = 'No';
                tnd = {
                    "referenceId": "",
                    "Amount": main_total,
                    "Type": "MAIN",
                    "paymentType": "Paid Online",
                    "paymentStatus": "CONFIRMED",
                    "createdOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate(),
                    "updatedOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                };
            }
            else {
                MainpaymentStatus = req.body.paymentStatus;
                MainpaymentType = req.body.paymentType;
                tnd = {
                    "referenceId": "",
                    "Amount": main_total,
                    "Type": "MAIN",
                    "paymentType": payment_type,
                    "paymentStatus": payment_status,
                    "createdOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate(),
                    "updatedOn": time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                };
            }
            transactionDetails.push(tnd);
            if (req.body.paymentCurrency) {
                paymentCurrency = req.body.paymentCurrency;
            }
            else {
                paymentCurrency = currency;
            }
            let totalRoomPrice = req.body.totalRoomPrice ? parseFloat(req.body.totalRoomPrice).toFixed(1) : 0;
            let totalAmountPaid = req.body.totalAmountPaid ? parseFloat(req.body.totalAmountPaid).toFixed(1) : 0;
            let tourismTax = req.body.tourismTax ? parseFloat(req.body.tourismTax).toFixed(2) : 0;
            let tax = req.body.tax ? parseFloat(req.body.tax).toFixed(1) : 0;
            let serviceFee = req.body.serviceFee ? parseFloat(req.body.serviceFee).toFixed(1) : 0;
            let priceAfterDiscount = req.body.priceAfterDiscount ? parseFloat(req.body.priceAfterDiscount).toFixed(1) : 0;
            let paymentDetailsData = {
                bookinguuid: req.body.bookinguuid,
                hoteluuid: req.body.hoteluuid,
                paymentReferrenceId: req.body.paymentReferrenceId,
                transactionReferrenceId: req.body.transactionReferrenceId,
                booking_channel: req.body.booking_channel ? req.body.booking_channel : 'WEB',
                channel_name: req.body.channel_name ? req.body.channel_name : '',
                totalRoomPrice: Number(totalRoomPrice),
                discountType: req.body.discountType,
                discountValue: Number(discountValue),
                discountAmount: Number(discountAmount),
                priceAfterDiscount: Number(priceAfterDiscount),
                serviceFee: Number(serviceFee),
                tax: Number(tax),
                tourismTax: Number(tourismTax),
                tourismTaxIncluded: tourismTaxIncluded,
                depositAmount: Number(depositAmount),
                depositIncluded: depositIncluded,
                totalAmountPaid: Number(totalAmountPaid),
                remainingAmount: Number(remainingAmount),
                totalAmount: Number(totalAmount),
                transactionDetails: transactionDetails,
                depositDetails: depositDetails,
                tourismtaxDetails: tourismtaxDetails,
                paymentCurrency: paymentCurrency,
                paymentType: MainpaymentType,
                paymentStatus: MainpaymentStatus,
                manual_updated_on: manual_updated_on
            };
            let newPayment = payment_1.default.paymentCreate(paymentDetailsData);
            yield PaymentCollection
                .insert(newPayment.document)
                .then(document => {
                let data = {
                    type: LogLaw.Type.PAYMENT,
                    by: userUuid,
                    payload: {
                        bookingUuid: paymentDetailsData.bookinguuid,
                        hoteluuid: paymentDetailsData.hoteluuid,
                        paymentReferrenceId: paymentDetailsData.paymentReferrenceId,
                        transactionReferrenceId: paymentDetailsData.transactionReferrenceId,
                        booking_channel: paymentDetailsData.booking_channel,
                        totalRoomPrice: paymentDetailsData.totalRoomPrice,
                        discountType: paymentDetailsData.discountType,
                        discountValue: paymentDetailsData.discountType,
                        discountAmount: paymentDetailsData.discountAmount,
                        priceAfterDiscount: paymentDetailsData.priceAfterDiscount,
                        serviceFee: paymentDetailsData.serviceFee,
                        tax: paymentDetailsData.tax,
                        tourismTax: paymentDetailsData.tourismTax,
                        totalAmountPaid: paymentDetailsData.totalAmountPaid,
                        totalAmount: paymentDetailsData.totalAmount,
                        paymentCurrency: paymentDetailsData.paymentCurrency,
                        paymentType: paymentDetailsData.paymentType,
                        paymentStatus: paymentDetailsData.paymentStatus
                    }
                };
                let paymentLog = log_1.default.create(data);
                logCollection.insert(paymentLog.document);
                if (paymentType == 'CREDIT_CARD') {
                    let paymentID = Math.floor(10000000 + Math.random() * 90000000);
                    if (req.body.recordCreationType != 'import') {
                        PaymentCollection
                            .update({
                            bookinguuid: bookinguuid
                        }, {
                            $set: { paymentReferrenceId: String(paymentID) }
                        })
                            .then((document) => __awaiter(this, void 0, void 0, function* () {
                            console.log(document);
                        }))
                            .catch(error => {
                            console.log(error);
                            res.status(500);
                        });
                    }
                    let redirectUrl;
                    redirectUrl = "/payment-manager/payment-gateway-connectivity?PaymentId=" + paymentID + "&OrderNumber=" + booking_reference_id + "&Amount=" + totalAmount + "&Currency=" + paymentCurrency;
                    console.log(redirectUrl);
                    res.status(200);
                    res.json({
                        success: true,
                        payment_type: "CREDIT_CARD",
                        message: "Success",
                        redirectUrl: redirectUrl
                    });
                }
                else if (paymentType == 'CASH') {
                    request_1.default.get('/pms-manager/get-booking-details', {
                        bookinguuid: bookinguuid
                    }).then(response => {
                        if (response.success) {
                            let no_of_rooms = response.data.booking.roomReservations.length;
                            let status = response.data.booking.status;
                            if (status != 'ON_HOLD') {
                                if (req.body.recordCreationType != 'import') {
                                    email_1.default.send({
                                        from: 'info@hotelnida.com',
                                        to: response.data.booking.guest.emailAddress,
                                        subject: 'Booking Confirmation',
                                        body: 'Booking Confirmed',
                                        category: ['Booking Confirmation'],
                                        template: 'booking_confirmation',
                                        templateObject: { category: "Booking Confirmation", hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                                    });
                                }
                                if (status == 'OCCUPIED') {
                                    if (req.body.recordCreationType != 'import') {
                                        email_1.default.send({
                                            from: 'info@hotelnida.com',
                                            to: response.data.booking.guest.emailAddress,
                                            subject: 'Check in Confirmation',
                                            body: 'Check in Confirmation',
                                            category: ['Check in Confirmation'],
                                            template: 'check_in_confirmation',
                                            templateObject: { category: "Check in Confirmation", hotel_details: response.hotel_details, depositData: response.depositData, guest_name: response.data.booking.guest.firstName, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                                        });
                                    }
                                }
                                if (discountAmount > 0) {
                                }
                            }
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                    let url;
                    res.status(200);
                    if (booking_channel == 'WALK_IN' || booking_channel == 'OTA' || booking_channel == 'CORPORATE' || booking_channel == 'AGENT') {
                        url = "/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + bookinguuid;
                    }
                    else {
                        url = "/search/booking-view?booking_uuid=" + bookinguuid;
                    }
                    res.json({
                        success: true,
                        payment_type: "CASH",
                        redirectUrl: url,
                        message: "New Booking Created Successfully",
                        data: document
                    });
                }
            })
                .catch(error => {
                res.status(500);
                res.json({
                    success: false,
                    message: error.message
                });
            });
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.query.uuid;
            let userUuid = req.body.user_uuid;
            let respond;
            let transactionDetails = req.body.transactionDetails;
            transactionDetails.forEach(function (value, index) {
                value.createdOn = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                value.updatedOn = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            });
            let tourismtaxDetails = req.body.tourismtaxDetails;
            tourismtaxDetails.forEach(function (value, index) {
                if (value.createdOn) {
                    value.createdOn = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                }
                if (value.updatedOn) {
                    value.updatedOn = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                }
            });
            let depositDetails = req.body.depositDetails;
            depositDetails.forEach(function (value, index) {
                value.createdOn = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                value.updatedOn = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            });
            yield PaymentCollection
                .findOne({
                uuid: uuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let updateData = {
                    bookinguuid: req.body.bookinguuid,
                    hoteluuid: req.body.hoteluuid,
                    paymentReferrenceId: req.body.paymentReferrenceId,
                    transactionReferrenceId: req.body.transactionReferrenceId,
                    booking_channel: req.body.booking_channel,
                    channel_name: req.body.channel_name,
                    totalRoomPrice: parseFloat(req.body.totalRoomPrice),
                    discountType: req.body.discountType,
                    discountValue: parseFloat(req.body.discountValue),
                    discountAmount: parseFloat(req.body.discountAmount),
                    priceAfterDiscount: parseFloat(req.body.priceAfterDiscount),
                    serviceFee: parseFloat(req.body.serviceFee),
                    tax: parseFloat(req.body.tax),
                    tourismTax: req.body.tourismTax ? parseFloat(req.body.tourismTax) : 0,
                    tourismTaxIncluded: req.body.tourismTaxIncluded ? req.body.tourismTaxIncluded : "No",
                    depositAmount: req.body.depositAmount ? parseFloat(req.body.depositAmount) : 0,
                    depositIncluded: req.body.depositIncluded ? req.body.depositIncluded : "No",
                    totalAmountPaid: req.body.totalAmountPaid ? parseFloat(req.body.totalAmountPaid) : 0,
                    remainingAmount: req.body.remainingAmount ? parseFloat(req.body.remainingAmount) : 0,
                    totalAmount: parseFloat(req.body.totalAmount),
                    refundAmount: parseFloat(req.body.refundAmount),
                    cancellationFee: parseFloat(req.body.cancellationFee),
                    modificationFee: parseFloat(req.body.modificationFee),
                    transactionDetails: transactionDetails,
                    depositDetails: depositDetails,
                    tourismtaxDetails: tourismtaxDetails,
                    paymentCurrency: req.body.paymentCurrency,
                    paymentType: req.body.paymentType,
                    paymentStatus: req.body.paymentStatus
                };
                let data = {
                    type: LogLaw.Type.PAYMENT,
                    by: userUuid,
                    payload: {
                        bookingUuid: updateData.bookinguuid,
                        hoteluuid: updateData.hoteluuid,
                        paymentReferrenceId: updateData.paymentReferrenceId,
                        totalRoomPrice: updateData.totalRoomPrice,
                        discountType: updateData.discountType,
                        discountValue: updateData.discountType,
                        discountAmount: updateData.discountAmount,
                        priceAfterDiscount: updateData.priceAfterDiscount,
                        serviceFee: updateData.serviceFee,
                        tax: updateData.tax,
                        tourismTax: updateData.tourismTax,
                        totalAmountPaid: updateData.totalAmountPaid,
                        totalAmount: updateData.totalAmount,
                        paymentCurrency: updateData.paymentCurrency,
                        paymentType: updateData.paymentType,
                        paymentStatus: updateData.paymentStatus
                    }
                };
                let paymentLog = log_1.default.create(data);
                logCollection.insert(paymentLog.document);
                let spawnedPayment = payment_1.default.spawn(document);
                spawnedPayment.updatePayment(updateData);
                yield PaymentCollection.update({
                    uuid: spawnedPayment.uuid
                }, spawnedPayment.document);
                res.status(200);
                respond = {
                    msg: "Returning the updated document",
                    success: true,
                    data: spawnedPayment.document
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    msg: "Failed",
                    success: false,
                    data: ""
                };
            });
            res.json(respond);
        }));
        paymentRouter.route('/payment/deposit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let bookinguuid = req.query.bookinguuid;
            let userUuid = req.body.user_uuid;
            yield depositCollection
                .findOne({ bookinguuid: bookinguuid })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: "Success",
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
                respond = {
                    msg: "Failed",
                    success: false,
                    data: ""
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let userUuid = req.body.user_uuid;
            let depositDetailsData = {
                bookinguuid: req.body.bookinguuid,
                hoteluuid: req.body.hoteluuid,
                depositAmount: parseFloat(req.body.depositAmount),
                depositCollected: parseFloat(req.body.depositCollected),
            };
            let newDeposit = deposit_1.default.CreateDepositDocument(depositDetailsData);
            yield depositCollection
                .insert(newDeposit.document)
                .then(document => {
                let data = {
                    type: LogLaw.Type.PAYMENT_DEPOSIT,
                    by: userUuid,
                    payload: {
                        bookingUuid: depositDetailsData.bookinguuid,
                        hoteluuid: depositDetailsData.hoteluuid,
                        depositAmount: depositDetailsData.depositAmount,
                        depositCollected: depositDetailsData.depositCollected
                    }
                };
                let depositLog = log_1.default.create(data);
                logCollection.insert(depositLog.document);
                res.status(200);
                respond = {
                    success: true,
                    message: "New Deposit Created Successfully",
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
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let uuid = req.query.uuid;
            let userUuid = req.body.user_uuid;
            let respond;
            yield depositCollection
                .findOne({
                uuid: uuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let updateData = {
                    bookinguuid: req.body.bookinguuid,
                    hoteluuid: req.body.hoteluuid,
                    depositCollected: req.body.depositCollected,
                    lossDamageFee: parseFloat(req.body.lossDamageFee),
                    depositRefunded: parseFloat(req.body.depositRefunded),
                    lossDamageFeeCollected: parseFloat(req.body.lossDamageFeeCollected)
                };
                let data = {
                    type: LogLaw.Type.PAYMENT_DEPOSIT,
                    by: userUuid,
                    payload: {
                        bookingUuid: updateData.bookinguuid,
                        hoteluuid: updateData.hoteluuid,
                        depositCollected: updateData.depositCollected,
                        lossDamageFee: updateData.lossDamageFee,
                        depositRefunded: updateData.depositRefunded,
                        lossDamageFeeCollected: updateData.lossDamageFeeCollected
                    }
                };
                let depositLog = log_1.default.create(data);
                logCollection.insert(depositLog.document);
                let spawnedDeposit = deposit_1.default.spawn(document);
                spawnedDeposit.updateDeposit(updateData);
                yield depositCollection.update({
                    uuid: spawnedDeposit.uuid
                }, spawnedDeposit.document);
                res.status(200);
                respond = {
                    msg: "Returning the updated deposit document",
                    success: true,
                    data: spawnedDeposit.document
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    msg: "Failed",
                    success: false,
                    data: ""
                };
            });
            res.json(respond);
        }));
        paymentRouter.route('/success')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            let paymentId = req.query.paymentId;
            let payerId = { 'payer_id': req.query.PayerID };
            paypal.payment.execute(paymentId, payerId, function (error, payment) {
                if (error) {
                    console.error(error);
                }
                else {
                    if (payment.state === 'approved') {
                        let booking_source;
                        let payment_status;
                        let payment_type;
                        let update_condition;
                        let tourismTax;
                        PaymentCollection
                            .findOne({
                            paymentReferrenceId: paymentId
                        })
                            .then((document) => __awaiter(this, void 0, void 0, function* () {
                            booking_source = document.booking_channel;
                            payment_status = document.paymentStatus;
                            payment_type = document.paymentType;
                            tourismTax = document.tourismTax;
                        }))
                            .catch(error => { });
                        if (booking_source == 'WEB' && payment_status == 'ON_HOLD') {
                            if (tourismTax > 0) {
                                update_condition = { "tourismtaxDetails.0.paymentType": "CREDIT_CARD", "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "tourismtaxDetails.0.updatedOn": currentMoment, "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                            }
                            else {
                                update_condition = { "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                            }
                        }
                        else if (booking_source == 'WALK_IN' && payment_status == 'ON_HOLD') {
                            if (tourismTax > 0) {
                                update_condition = { "depositDetails.0.paymentType": "CREDIT_CARD", "depositDetails.0.paymentStatus": "CONFIRMED", "depositDetails.0.updatedOn": currentMoment, "tourismtaxDetails.0.paymentType": "CREDIT_CARD", "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "tourismtaxDetails.0.updatedOn": currentMoment, "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                            }
                            else {
                                update_condition = { "depositDetails.0.paymentType": "CREDIT_CARD", "depositDetails.0.paymentStatus": "CONFIRMED", "depositDetails.0.updatedOn": currentMoment, "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                            }
                        }
                        else if (booking_source == 'WEB' && payment_status == 'CONFIRMED') {
                            update_condition = { "depositDetails.0.paymentType": "CREDIT_CARD", "depositDetails.0.paymentStatus": "CONFIRMED", "depositDetails.0.updatedOn": currentMoment };
                        }
                        else {
                            update_condition = { "transactionDetails.0.paymentType": "CREDIT_CARD", "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                        }
                        PaymentCollection
                            .findOneAndUpdate({
                            paymentReferrenceId: paymentId
                        }, {
                            $set: update_condition
                        })
                            .then((document) => __awaiter(this, void 0, void 0, function* () {
                            let bookinguuid = document.bookinguuid;
                            let hotel_id = document.hoteluuid;
                            let booking_channel = document.booking_channel;
                            let url;
                            if (booking_channel == 'WALK_IN' || booking_channel == 'OTA') {
                                url = "/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + bookinguuid;
                            }
                            else {
                                url = "/search/booking-view?booking_uuid=" + bookinguuid;
                            }
                            if (bookinguuid) {
                                request_1.default.get('/pms-manager/get-booking-details', {
                                    bookinguuid: bookinguuid
                                }).then(response => {
                                    if (response.success) {
                                        let no_of_rooms = response.data.booking.roomReservations.length;
                                        email_1.default.send({
                                            from: 'info@hotelnida.com',
                                            to: response.data.booking.guest.emailAddress,
                                            subject: 'Booking Confirmation',
                                            category: ['Booking Confirmation'],
                                            body: 'Booking Confirmed',
                                            template: 'booking_confirmation',
                                            templateObject: { category: "Booking Confirmation", hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                                        });
                                    }
                                }).catch(error => {
                                    console.log('Error: ', error.message);
                                });
                                let inputvalues = { booking_uuid: document.bookinguuid };
                                request_1.default.put('/inventory/booking/payment', {}, inputvalues).then(response => {
                                    if (response.success) {
                                        res.status(200);
                                        res.redirect(url);
                                    }
                                    else {
                                        res.status(200);
                                        res.redirect(url);
                                    }
                                }).catch(error => {
                                    console.log('Error: ', error.message);
                                    res.send("Failed");
                                });
                            }
                        }))
                            .catch(error => {
                            res.status(500);
                        });
                    }
                    else {
                        res.send('payment not successful');
                    }
                }
            });
        }));
        paymentRouter.route('/cancel')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render("booking-cancel", { layout: "homeLayout", class: "inner-page" });
        }));
        paymentRouter.route('/paycash')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            let bookinguuid = req.body.bookinguuid;
            PaymentCollection
                .update({
                bookinguuid: bookinguuid
            }, {
                $set: {
                    "transactionDetails.0.updatedOn": currentMoment,
                    paymentType: "CASH",
                    remainingAmount: 0,
                    paymentStatus: "CONFIRMED",
                    updatedOn: currentMoment
                }
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                res.status(200);
            }))
                .catch(error => {
                res.status(500);
            });
            let inputvalues = { booking_uuid: bookinguuid };
            request_1.default.put('/inventory/booking/payment', {}, inputvalues).then(response => {
                res.status(200);
                res.redirect("/pms/booking-details?booking_uuid=" + bookinguuid);
            }).catch(error => {
                res.status(500);
                res.redirect("/pms/booking-details?booking_uuid=" + bookinguuid);
            });
        }));
        paymentRouter.route('/booking-confirm-action')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let booking_uuid = req.body.booking_uuid;
            let payment_type = req.body.payment_type;
            let total_amount = req.body.amount_to_be_collected;
            let check_in = req.body.check_in;
            let paymentCurrency = req.body.paymentCurrency;
            let tourismTax = req.body.tourismTax;
            let deposit = req.body.deposit;
            let depositAmount = req.body.pay_deposit_amount;
            let tourismtax_to_be_collected = req.body.tourismtax_to_be_collected;
            let amount_to_be_collected = req.body.amount_to_be_collected;
            let depositCollected;
            let booking_status;
            let updateObjct;
            let today = time_1.default.formatGivenDate(time_1.default.serverMoment);
            let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            let checkInDate = time_1.default.serverMomentInPattern(check_in, 'DD-MM-YYYY').toDate();
            console.log("Deva");
            console.log(currentMoment);
            console.log(checkInDate);
            if (checkInDate <= currentMoment) {
                booking_status = 'CHECK_IN';
            }
            else {
                booking_status = 'CONFIRMED';
            }
            if (deposit == 'YES') {
                depositCollected = depositAmount;
            }
            else {
                depositCollected = 0;
            }
            if (amount_to_be_collected > 0) {
                if (tourismtax_to_be_collected > 0) {
                    if (depositCollected > 0) {
                        updateObjct = {
                            "depositDetails.0.depositCollected": Number(depositCollected),
                            "depositDetails.0.updatedOn": currentMoment,
                            "depositDetails.0.paymentType": payment_type,
                            "depositDetails.0.paymentStatus": "CONFIRMED",
                            "tourismtaxDetails.0.Amount": Number(tourismtax_to_be_collected),
                            "tourismtaxDetails.0.updatedOn": currentMoment,
                            "tourismtaxDetails.0.paymentType": payment_type,
                            "tourismtaxDetails.0.paymentStatus": "CONFIRMED"
                        };
                    }
                    else {
                        updateObjct = {
                            "tourismtaxDetails.0.Amount": Number(tourismtax_to_be_collected),
                            "tourismtaxDetails.0.updatedOn": currentMoment,
                            "tourismtaxDetails.0.paymentType": payment_type,
                            "tourismtaxDetails.0.paymentStatus": "CONFIRMED"
                        };
                    }
                }
                else {
                    if (depositCollected > 0) {
                        updateObjct = {
                            "depositDetails.0.depositCollected": Number(depositCollected),
                            "depositDetails.0.updatedOn": currentMoment,
                            "depositDetails.0.paymentType": payment_type,
                            "depositDetails.0.paymentStatus": "CONFIRMED"
                        };
                    }
                }
                depositCollection
                    .update({ bookinguuid: booking_uuid }, { $set: { depositCollected: Number(depositCollected), updatedOn: currentMoment } })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                PaymentCollection
                    .update({ bookinguuid: booking_uuid }, { $set: updateObjct })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
            }
            BookingCollection
                .update({ uuid: booking_uuid }, { $set: { status: booking_status } })
                .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                .catch(error => { res.status(500); });
            RoomCollection
                .update({ bookingUuid: booking_uuid }, { $set: { status: booking_status } }, { multi: true })
                .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                .catch(error => { res.status(500); });
            res.status(200);
            res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
        }));
        paymentRouter.route('/pay-at-hotel')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let booking_uuid = req.body.booking_uuid;
            let payment_type = req.body.payment_type;
            let total_amount = req.body.amount_to_be_collected;
            let booking_source = req.body.booking_source;
            let paymentCurrency = req.body.paymentCurrency;
            let tourismTax = req.body.tourismTax;
            let paid_in_ota = req.body.paid_in_ota;
            let deposit = req.body.deposit;
            let depositAmount = req.body.pay_deposit_amount;
            let booking_referenceId = req.body.booking_referenceId;
            let main_transaction_type;
            let booking_status;
            let useruuid = '';
            if (req.session.user) {
                useruuid = req.session.user._user_id;
            }
            else {
                useruuid = '';
            }
            let check_in = req.body.check_in;
            let transaction_referrence_id = req.body.transaction_referrence_id;
            let today = time_1.default.formatGivenDate(time_1.default.serverMoment);
            let source = [];
            if (deposit == 'YES') {
                depositAmount = depositAmount;
            }
            else {
                depositAmount = 0;
            }
            if (check_in <= today) {
                booking_status = 'CHECK_IN';
            }
            else {
                booking_status = 'CONFIRMED';
            }
            if (payment_type == 'CASH') {
                if (paid_in_ota == 'on') {
                    main_transaction_type = 'Paid Online';
                }
                else {
                    main_transaction_type = 'CASH';
                    source.push('BOOKING PRICE');
                }
                BookingCollection
                    .update({ uuid: booking_uuid }, { $set: { status: booking_status } })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                RoomCollection
                    .update({ bookingUuid: booking_uuid }, { $set: { status: booking_status } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                let payment_update;
                if (deposit == 'YES') {
                    if (tourismTax > 0) {
                        payment_update = { "depositDetails.0.depositCollected": Number(depositAmount), "depositDetails.0.depositCollectedDate": currentMoment, "depositDetails.0.updatedOn": currentMoment, "depositDetails.0.paymentType": "CASH", "depositDetails.0.paymentStatus": "CONFIRMED", "tourismtaxDetails.0.updatedOn": currentMoment, "tourismtaxDetails.0.paymentType": "CASH", "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                        source.push('TOURISM TAX');
                    }
                    else {
                        payment_update = { "depositDetails.0.depositCollected": Number(depositAmount), "depositDetails.0.depositCollectedDate": currentMoment, "depositDetails.0.updatedOn": currentMoment, "depositDetails.0.paymentType": "CASH", "depositDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                    depositCollection
                        .update({ bookinguuid: booking_uuid }, { $set: { depositCollected: Number(depositAmount), updatedOn: currentMoment } })
                        .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                        .catch(error => { res.status(500); });
                    source.push('DEPOSIT COLLECTED');
                }
                else {
                    if (tourismTax > 0) {
                        payment_update = { "tourismtaxDetails.0.updatedOn": currentMoment, "tourismtaxDetails.0.paymentType": "CASH", "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                        source.push('TOURISM TAX');
                    }
                    else {
                        payment_update = { "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                }
                PaymentCollection
                    .update({ bookinguuid: booking_uuid }, { $set: payment_update })
                    .then((document) => __awaiter(this, void 0, void 0, function* () {
                    let totalAmountPaid;
                    let paymentReferrenceId;
                    let transactionReferrenceId;
                    let booking_channel;
                    let totalRoomPrice;
                    let discountType;
                    let discountValue;
                    let discountAmount;
                    let priceAfterDiscount;
                    let serviceFee;
                    let tax;
                    let tourismTax;
                    let totalAmount;
                    let paymentCurrency;
                    let hoteluuid;
                    let paymentType;
                    let paymentStatus;
                    yield PaymentCollection.find({ bookinguuid: booking_uuid })
                        .then(paymentdetails => {
                        for (let details of paymentdetails) {
                            hoteluuid = details.hoteluuid;
                            paymentReferrenceId = details.paymentReferrenceId;
                            transactionReferrenceId = details.transactionReferrenceId;
                            booking_channel = details.booking_channel;
                            totalRoomPrice = details.totalRoomPrice;
                            discountType = details.discountType;
                            discountValue = details.discountValue;
                            discountAmount = details.discountAmount;
                            priceAfterDiscount = details.priceAfterDiscount;
                            serviceFee = details.serviceFee;
                            tax = details.tax;
                            tourismTax = details.tourismTax;
                            totalAmountPaid = details.totalAmountPaid;
                            totalAmount = details.totalAmount;
                            paymentCurrency = details.paymentCurrency;
                            paymentType = details.paymentType;
                            paymentStatus = details.paymentStatus;
                        }
                    });
                    let data = {
                        type: LogLaw.Type.PAYMENT,
                        by: useruuid,
                        payload: {
                            bookingUuid: booking_uuid,
                            hoteluuid: hoteluuid,
                            paymentReferrenceId: paymentReferrenceId,
                            transactionReferrenceId: transactionReferrenceId,
                            booking_channel: booking_channel,
                            totalRoomPrice: totalRoomPrice,
                            discountType: discountType,
                            discountValue: discountValue,
                            discountAmount: discountAmount,
                            priceAfterDiscount: priceAfterDiscount,
                            serviceFee: serviceFee,
                            tax: tax,
                            tourismTax: tourismTax,
                            totalAmountPaid: totalAmountPaid,
                            totalAmount: totalAmount,
                            paymentCurrency: paymentCurrency,
                            paymentType: paymentType,
                            paymentStatus: paymentStatus
                        }
                    };
                    let paymentLog = log_1.default.create(data);
                    logCollection.insert(paymentLog.document);
                }))
                    .catch(error => { res.status(500); });
                let postvalues = {
                    transaction_id: Math.random(),
                    hoteluuid: hotel_id,
                    bookinguuid: booking_uuid,
                    booking_referenceId: booking_referenceId,
                    collectionType: 'CREDIT',
                    paymentMethod: 'CASH',
                    pic: req.session.user._user_id,
                    source: source,
                    bookingSource: booking_source,
                    amount: total_amount,
                    shiftInchrge: "",
                    nightauditDate: "",
                };
                yield request_1.default.post('/payment-manager/update-audit-trail', {}, postvalues).then(response => {
                    console.log("success");
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                request_1.default.get('/pms-manager/get-booking-details', {
                    bookinguuid: booking_uuid
                }).then(response => {
                    if (response.success) {
                        let no_of_rooms = response.data.booking.roomReservations.length;
                        if (booking_source != 'OTA') {
                            email_1.default.send({
                                from: 'info@hotelnida.com',
                                to: response.data.booking.guest.emailAddress,
                                subject: 'Booking Confirmation',
                                category: ['Booking Confirmation'],
                                body: 'Booking Confirmed',
                                template: 'booking_confirmation',
                                templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                            });
                        }
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                res.status(200);
                res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
            }
            else if (payment_type == 'POS' || payment_type == 'BANK_TRANSFER' || payment_type == 'CITY_LEDGER') {
                if (paid_in_ota == 'on') {
                    main_transaction_type = 'Paid Online';
                }
                else {
                    main_transaction_type = payment_type;
                    source.push('BOOKING PRICE');
                }
                let transaction_referrence_id = req.body.transaction_referrence_id;
                BookingCollection
                    .update({ uuid: booking_uuid }, { $set: { status: booking_status } })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                RoomCollection
                    .update({ bookingUuid: booking_uuid }, { $set: { status: booking_status } }, { multi: true })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { res.status(500); });
                let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
                let payment_update;
                if (deposit == 'YES') {
                    if (tourismTax > 0) {
                        payment_update = { transactionReferrenceId: transaction_referrence_id, "depositDetails.0.depositCollected": Number(depositAmount), "depositDetails.0.depositCollectedDate": currentMoment, "depositDetails.0.updatedOn": currentMoment, "depositDetails.0.paymentType": payment_type, "depositDetails.0.paymentStatus": "CONFIRMED", "tourismtaxDetails.0.updatedOn": currentMoment, "tourismtaxDetails.0.paymentType": payment_type, "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                        source.push('TOURISM_TAX');
                    }
                    else {
                        payment_update = { transactionReferrenceId: transaction_referrence_id, "depositDetails.0.depositCollected": Number(depositAmount), "depositDetails.0.depositCollectedDate": currentMoment, "depositDetails.0.updatedOn": currentMoment, "depositDetails.0.paymentType": payment_type, "depositDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                    depositCollection
                        .update({ bookinguuid: booking_uuid }, { $set: { depositCollected: Number(depositAmount), updatedOn: currentMoment } })
                        .then((document) => __awaiter(this, void 0, void 0, function* () {
                    }))
                        .catch(error => { res.status(500); });
                    source.push('DEPOSIT COLLECTED');
                }
                else {
                    if (tourismTax > 0) {
                        payment_update = { transactionReferrenceId: transaction_referrence_id, "tourismtaxDetails.0.updatedOn": currentMoment, "tourismtaxDetails.0.paymentType": payment_type, "tourismtaxDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                        source.push('TOURISM TAX');
                    }
                    else {
                        payment_update = { transactionReferrenceId: transaction_referrence_id, "transactionDetails.0.paymentType": main_transaction_type, "transactionDetails.0.paymentStatus": "CONFIRMED", "transactionDetails.0.updatedOn": currentMoment, remainingAmount: 0, paymentType: main_transaction_type, paymentStatus: "CONFIRMED", updatedOn: currentMoment };
                    }
                }
                PaymentCollection
                    .update({ bookinguuid: booking_uuid }, { $set: payment_update })
                    .then((document) => __awaiter(this, void 0, void 0, function* () {
                    let totalAmountPaid;
                    let paymentReferrenceId;
                    let transactionReferrenceId;
                    let booking_channel;
                    let totalRoomPrice;
                    let discountType;
                    let discountValue;
                    let discountAmount;
                    let priceAfterDiscount;
                    let serviceFee;
                    let tax;
                    let tourismTax;
                    let totalAmount;
                    let paymentCurrency;
                    let hoteluuid;
                    let paymentType;
                    let paymentStatus;
                    yield PaymentCollection.find({ bookinguuid: booking_uuid })
                        .then(paymentdetails => {
                        for (let details of paymentdetails) {
                            hoteluuid = details.hoteluuid;
                            paymentReferrenceId = details.paymentReferrenceId;
                            transactionReferrenceId = details.transactionReferrenceId;
                            booking_channel = details.booking_channel;
                            totalRoomPrice = details.totalRoomPrice;
                            discountType = details.discountType;
                            discountValue = details.discountValue;
                            discountAmount = details.discountAmount;
                            priceAfterDiscount = details.priceAfterDiscount;
                            serviceFee = details.serviceFee;
                            tax = details.tax;
                            tourismTax = details.tourismTax;
                            totalAmountPaid = details.totalAmountPaid;
                            totalAmount = details.totalAmount;
                            paymentCurrency = details.paymentCurrency;
                            paymentType = details.paymentType;
                            paymentStatus = details.paymentStatus;
                        }
                    });
                    let data = {
                        type: LogLaw.Type.PAYMENT,
                        by: useruuid,
                        payload: {
                            bookingUuid: booking_uuid,
                            hoteluuid: hoteluuid,
                            paymentReferrenceId: paymentReferrenceId,
                            transactionReferrenceId: transactionReferrenceId,
                            booking_channel: booking_channel,
                            totalRoomPrice: totalRoomPrice,
                            discountType: discountType,
                            discountValue: discountValue,
                            discountAmount: discountAmount,
                            priceAfterDiscount: priceAfterDiscount,
                            serviceFee: serviceFee,
                            tax: tax,
                            tourismTax: tourismTax,
                            totalAmountPaid: totalAmountPaid,
                            totalAmount: totalAmount,
                            paymentCurrency: paymentCurrency,
                            paymentType: paymentType,
                            paymentStatus: paymentStatus
                        }
                    };
                    let paymentLog = log_1.default.create(data);
                    logCollection.insert(paymentLog.document);
                }))
                    .catch(error => { res.status(500); });
                let postvalues = {
                    transaction_id: Math.random(),
                    hoteluuid: hotel_id,
                    bookinguuid: booking_uuid,
                    booking_referenceId: booking_referenceId,
                    collectionType: 'CREDIT',
                    paymentMethod: payment_type,
                    pic: req.session.user._user_id,
                    source: source,
                    bookingSource: booking_source,
                    amount: total_amount,
                    shiftInchrge: "",
                    nightauditDate: "",
                };
                yield request_1.default.post('/payment-manager/update-audit-trail', {}, postvalues).then(response => {
                    console.log("success");
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                request_1.default.get('/pms-manager/get-booking-details', {
                    bookinguuid: booking_uuid
                }).then(response => {
                    if (response.success) {
                        let no_of_rooms = response.data.booking.roomReservations.length;
                        if (booking_source != 'OTA') {
                            email_1.default.send({
                                from: 'info@hotelnida.com',
                                to: response.data.booking.guest.emailAddress,
                                subject: 'Booking Confirmation',
                                category: ['Booking Confirmation'],
                                body: 'Booking Confirmed',
                                template: 'booking_confirmation',
                                templateObject: { category: "Booking Confirmation", audit_details: response.audit_details, contact_details: response.contact_details, hotel_details: response.hotel_details, no_of_rooms: no_of_rooms, output: response.data, paymentData: response.paymentData }
                            });
                        }
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                res.status(200);
                res.redirect("/pms/booking-details?hotel_id=" + hotel_id + "&booking_uuid=" + booking_uuid);
            }
            else {
                let paymentID = Math.floor(10000000 + Math.random() * 90000000);
                let depositCollected;
                if (paid_in_ota == 'on') {
                    main_transaction_type = 'Paid Online';
                }
                else {
                    main_transaction_type = 'CREDIT_CARD';
                }
                if (deposit == 'YES') {
                    depositCollected = depositAmount;
                }
                else {
                    depositCollected = 0;
                }
                yield PaymentCollection
                    .update({
                    bookinguuid: booking_uuid
                }, {
                    $set: { paymentReferrenceId: String(paymentID), "depositDetails.0.depositCollected": Number(depositCollected) }
                })
                    .then((document) => __awaiter(this, void 0, void 0, function* () { }))
                    .catch(error => { console.log(error); });
                res.status(200);
                res.redirect("/payment-manager/payment-gateway-connectivity?PaymentId=" + paymentID + "&OrderNumber=" + booking_referenceId + "&Amount=" + total_amount + "&Currency=" + paymentCurrency);
            }
        }));
        return paymentRouter;
    }
}
exports.default = PaymentManager;
