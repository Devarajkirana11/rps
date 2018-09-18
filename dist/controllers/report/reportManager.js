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
const app_1 = require("../../config/app");
const express = require("express");
const LogLaw = require("../../models/log/law");
const InventoryLaw = require("../../models/inventory/law");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const log_1 = require("../../models/log/log");
const past_nidacash_report_1 = require("../../models/nidacash_report/past_nidacash_report");
const future_nidacash_report_1 = require("../../models/nidacash_report/future_nidacash_report");
const time_1 = require("../../helpers/time");
const moment = require('moment');
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
class ReportManager {
    static get routes() {
        let DailySalesRouter = express.Router();
        let logCollection = core_1.default.app.get('mongoClient').get('Log');
        let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let hotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
        let paymentsCollection = core_1.default.app.get('mongoClient').get('payments');
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        let bookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let MasterDetails = core_1.default.app.get('mongoClient').get('masters');
        let sharedHotelsCollection = core_1.default.app.get('mongoClient').get('shared_hotels');
        let ratesCollection = core_1.default.app.get('mongoClient').get('rates');
        let roomsCollection = core_1.default.app.get('mongoClient').get('rooms');
        DailySalesRouter.route('/manager/daily-sales')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let country_name;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
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
            let booking_source = req.query.booking_source;
            let booking_channel = req.query.booking_channel;
            let payment_type = req.query.payment_type;
            let bookingUuid;
            if (reference_id) {
                let RoomDetails = core_1.default.app.get('mongoClient').get('Booking');
                yield RoomDetails
                    .findOne({ referenceId: reference_id })
                    .then(document => {
                    bookingUuid = document.uuid;
                })
                    .catch(error => { });
            }
            let testData = new Array();
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
            let paymentsDocument = yield paymentsCollection.aggregate([
                {
                    $match: {
                        hoteluuid: hotel_id,
                        updatedOn: {
                            $gte: begin.toDate(),
                            $lte: end.toDate()
                        },
                        totalAmount: { $ne: NaN }
                    }
                },
                {
                    $group: {
                        _id: {
                            bookingChannel: "$booking_channel",
                            paymentType: "$paymentType",
                            channel_name: "$channel_name"
                        },
                        totalAmount: { $sum: "$totalAmount" }
                    }
                }
            ]);
            let uniqueBookingChannel = ['OTA', 'WALK_IN', 'WEB'];
            let summaryPayment = new Array();
            let paymentTable = {
                WALK_IN: {},
                OTA: [],
                WEB: {}
            };
            for (let channel of uniqueBookingChannel) {
                switch (channel) {
                    case 'WALK_IN': {
                        let filteredDocuments = paymentsDocument.filter(e => e._id.bookingChannel === 'WALK_IN');
                        for (let payment of filteredDocuments) {
                            if (payment._id.paymentType === 'CASH') {
                                paymentTable.WALK_IN['cash'] = payment.totalAmount;
                            }
                            if (payment._id.paymentType === 'CREDIT_CARD') {
                                paymentTable.WALK_IN['credit_card'] = payment.totalAmount;
                            }
                            if (payment._id.paymentType === 'POS') {
                                paymentTable.WALK_IN['pos'] = payment.totalAmount;
                            }
                        }
                        break;
                    }
                    case 'OTA': {
                        let filteredDocuments = paymentsDocument.filter(e => e._id.bookingChannel === 'OTA');
                        for (let payment of filteredDocuments) {
                            if (payment._id.paymentType === 'CASH') {
                                paymentTable.OTA.push({
                                    bookingChannel: payment._id.bookingChannel,
                                    paymentType: payment._id.paymentType,
                                    channel_name: payment._id.channel_name,
                                    totalAmount: payment.totalAmount
                                });
                            }
                            if (payment._id.paymentType === 'CREDIT_CARD') {
                                paymentTable.OTA.push({
                                    bookingChannel: payment._id.bookingChannel,
                                    paymentType: payment._id.paymentType,
                                    channel_name: payment._id.channel_name,
                                    totalAmount: payment.totalAmount
                                });
                            }
                            if (payment._id.paymentType === 'POS') {
                                paymentTable.OTA.push({
                                    bookingChannel: payment._id.bookingChannel,
                                    paymentType: payment._id.paymentType,
                                    channel_name: payment._id.channel_name,
                                    totalAmount: payment.totalAmount
                                });
                            }
                            if (payment._id.paymentType === 'Pay At Hotel') {
                                paymentTable.OTA.push({
                                    bookingChannel: payment._id.bookingChannel,
                                    paymentType: payment._id.paymentType,
                                    channel_name: payment._id.channel_name,
                                    totalAmount: payment.totalAmount
                                });
                            }
                        }
                        break;
                    }
                    case 'WEB': {
                        let filteredDocuments = paymentsDocument.filter(e => e._id.bookingChannel === 'WEB');
                        for (let payment of filteredDocuments) {
                            if (payment._id.paymentType === 'CASH') {
                                paymentTable.WEB['cash'] = payment.totalAmount;
                            }
                            if (payment._id.paymentType === 'CREDIT_CARD') {
                                paymentTable.WEB['credit_card'] = payment.totalAmount;
                            }
                            if (payment._id.paymentType === 'POS') {
                                paymentTable.WEB['pos'] = payment.totalAmount;
                            }
                        }
                        break;
                    }
                }
            }
            var salespaymentCondition = {
                hoteluuid: hotel_id,
                updatedOn: {
                    $gte: begin.toDate(),
                    $lte: end.toDate()
                },
                paymentStatus: "CONFIRMED",
            };
            if (bookingUuid !== undefined) {
                salespaymentCondition['bookinguuid'] = bookingUuid;
            }
            if (booking_source !== undefined) {
                salespaymentCondition['booking_channel'] = booking_source;
            }
            if (booking_channel !== undefined) {
                salespaymentCondition['channel_name'] = booking_channel;
            }
            if (payment_type !== undefined) {
                salespaymentCondition['paymentType'] = payment_type;
            }
            paymentsCollection.find(salespaymentCondition).then((Payments) => __awaiter(this, void 0, void 0, function* () {
                for (let payment of Payments) {
                    let cost = log_1.default.spawn(payment);
                    let uuid = payment.uuid;
                    let bookinguuid = payment.bookinguuid;
                    let booking_channel = payment.booking_channel;
                    let channel_name = payment.channel_name;
                    let totalRoomPrice = payment.totalRoomPrice;
                    let discountType = payment.discountType;
                    let discountAmount = payment.discountAmount;
                    let priceAfterDiscount = payment.priceAfterDiscount;
                    let serviceFee = payment.serviceFee;
                    let tax = payment.tax;
                    let tourismTax = payment.tourismTax;
                    let totalAmountPaid = payment.totalAmountPaid;
                    let totalAmount = payment.totalAmount;
                    let paymentType = payment.paymentType;
                    let updatedOn = time_1.default.countryFormatGivenDateWithTime(payment.updatedOn, country_name);
                    let paymentStatus = payment.paymentStatus;
                    let balance = payment.totalAmount - payment.totalAmountPaid;
                    let depositcollected = payment.depositDetails;
                    let roomNumber;
                    let referenceId;
                    let time;
                    let checkIn;
                    let checkOut;
                    let numberOfRooms;
                    let numberOfNights;
                    let numberOfGuests;
                    let guest;
                    let userInformation;
                    let BookingStatus;
                    let paymentLog = yield logCollection.findOne({
                        type: LogLaw.Type.PAYMENT,
                        "payload.bookingUuid": bookinguuid,
                        "payload.paymentStatus": "CONFIRMED"
                    });
                    if (paymentLog) {
                        userInformation = yield usersCollection.findOne({
                            _user_id: paymentLog.by
                        });
                    }
                    var salesdateCondition = {
                        type: LogLaw.Type.BOOKING_CREATE,
                        "payload.bookingUuid": bookinguuid
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
                            numberOfRooms = booking.payload.numberOfRooms;
                            numberOfNights = booking.payload.numberOfNights;
                            numberOfGuests = booking.payload.numberOfGuests;
                            guest = booking.payload.guest;
                            roomNumber = booking.payload.roomReservations[0].roomNumber;
                        }
                    });
                    if (time === undefined) {
                        continue;
                    }
                    yield bookingCollection.find({
                        status: { $ne: InventoryLaw.BookingStatus.CANCELLED },
                        uuid: bookinguuid
                    }).then((reference) => __awaiter(this, void 0, void 0, function* () {
                        for (let ref of reference) {
                            let refer = log_1.default.spawn(ref);
                            referenceId = ref.referenceId;
                            BookingStatus = ref.status;
                        }
                    }));
                    if (referenceId === undefined) {
                        continue;
                    }
                    let user_firstname = "";
                    if (userInformation) {
                        user_firstname = userInformation._first_name;
                    }
                    if (depositcollected !== undefined) {
                        if (user_firstname === "" && paymentType === "Paid Online" && tourismTax === 0 && depositcollected[0].depositCollected === 0) {
                            user_firstname = channel_name;
                        }
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
                    result.push([
                        user_firstname,
                        time_1.default.formatGivenDate(updatedOn),
                        time,
                        booking_channel,
                        channel_name,
                        guest.firstName + ' ' + guest.lastName,
                        referenceId,
                        numberOfGuests,
                        numberOfRooms,
                        roomNumber,
                        totalRoomPrice.toFixed(2),
                        discountAmount.toFixed(2),
                        priceAfterDiscount.toFixed(2),
                        tax.toFixed(2),
                        serviceFee.toFixed(2),
                        tourismTax.toFixed(2),
                        totalAmount.toFixed(2),
                        totalAmountPaid.toFixed(2),
                        balance,
                        checkIn,
                        checkOut,
                        paymentType,
                        paymentStatus,
                        BookingStatus
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared daily sales as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/daily-salesfd')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let day = req.body.day;
            let respond;
            let result = new Array();
            let startDate = req.body.start_date;
            let endDate = req.body.end_date;
            let options = req.body.options;
            let responds;
            let booking_array = [];
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
            let paymentsDocument = yield paymentsCollection.aggregate([
                {
                    $match: {
                        hoteluuid: hotel_id,
                        $and: [
                            { updatedOn: { $gte: begin.toDate() } },
                            { updatedOn: { $lte: end.toDate() } }
                        ],
                        totalAmount: { $ne: NaN }
                    }
                },
                {
                    $group: {
                        _id: {
                            paymentType: "$paymentType"
                        },
                        totalAmount: { $sum: "$totalAmount" }
                    }
                }
            ]);
            let summaryPayment = new Array();
            for (let payment of paymentsDocument) {
                if (payment._id.paymentType == 'CREDIT_CARD') {
                    summaryPayment.push({
                        type: 'Payment Gateaway',
                        totalAmount: payment.totalAmount
                    });
                }
                else if (payment._id.paymentType == 'CASH' && payment._id.paymentType == 'Pay At Hotel') {
                    summaryPayment.push({
                        type: 'CASH',
                        totalAmount: payment.totalAmount
                    });
                }
                else if (payment._id.paymentType == 'Paid Online') {
                    summaryPayment.push({
                        type: 'Payment from OTA',
                        totalAmount: payment.totalAmount
                    });
                }
                else if (payment._id.paymentType == 'POS') {
                    summaryPayment.push({
                        type: 'POS',
                        totalAmount: payment.totalAmount
                    });
                }
                else if (payment._id.paymentType == null) {
                }
            }
            let bookingDetails = core_1.default.app.get('mongoClient').get('Booking');
            yield bookingDetails
                .find({}, { "sort": { "_id": -1 } })
                .then(document => {
                responds = {
                    success: true,
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
            });
            let CustomizedQuery = {};
            CustomizedQuery["type"] = LogLaw.Type.PAYMENT;
            CustomizedQuery["moment"] = {};
            CustomizedQuery["moment"]["$gte"] = begin.toDate();
            CustomizedQuery["moment"]["$lte"] = end.toDate();
            CustomizedQuery["payload.hoteluuid"] = hotel_id;
            CustomizedQuery["payload.paymentStatus"] = "CONFIRMED";
            if (Object.keys(CustomizedQuery).length) {
                options.customQuery = CustomizedQuery;
            }
            options.caseInsensitiveSearch = true;
            MongoClient.connect(app_1.environments[process.env.ENV].mongoDBUrl, function (err, db) {
                new MongoDataTable(db).get('Log', options, function (err, PaymentsObj) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let Payments = PaymentsObj.data;
                        for (let payment of Payments) {
                            if (payment.payload !== undefined) {
                                let cost = log_1.default.spawn(payment);
                                let booking_channel = cost.payload.booking_channel;
                                let bookingUuid = cost.payload.bookingUuid;
                                let totalRoomPrice = cost.payload.totalRoomPrice;
                                let tax = cost.payload.tax;
                                let tourismTax = cost.payload.tourismTax;
                                let serviceFee = cost.payload.serviceFee;
                                let discountAmount = cost.payload.discountAmount;
                                let priceAfterDiscount = cost.payload.priceAfterDiscount;
                                let totalAmount = cost.payload.totalAmount;
                                let paymentType = cost.payload.paymentType;
                                let roomNumber;
                                let by;
                                let checkIn;
                                let checkOut;
                                let numberOfRooms;
                                let numberOfNights;
                                let numberOfGuests;
                                let guest;
                                responds.data.forEach(function (value, index) {
                                    booking_array[value.uuid] = value.referenceId;
                                });
                                result.push({
                                    by: cost.by,
                                    time: time_1.default.formatGivenDateWithTime(payment.moment),
                                    reference_id: booking_array[bookingUuid],
                                    guest: guest,
                                    bookingUuid: bookingUuid,
                                    numberOfGuests: numberOfGuests,
                                    numberOfRooms: numberOfRooms,
                                    roomNumber: roomNumber,
                                    checkIn: checkIn,
                                    checkOut: checkOut,
                                    totalRoomPrice: totalRoomPrice,
                                    discountAmount: discountAmount,
                                    priceAfterDiscount: priceAfterDiscount,
                                    tax: tax,
                                    serviceFee: serviceFee,
                                    tourismTax: tourismTax,
                                    totalAmount: totalAmount,
                                    paymentType: paymentType,
                                    booking_channel: booking_channel
                                });
                            }
                        }
                        let byArray = new Array();
                        let bookingUuids = new Array();
                        result.forEach(res => {
                            byArray.push(res.by);
                            bookingUuids.push(res.bookingUuid);
                        });
                        yield paymentsCollection
                            .find({ _booking_uuid: { $in: bookingUuids } })
                            .then(payments => {
                            if (payments.length) {
                                payments.forEach(payment => {
                                    result.forEach((res, index) => {
                                        if (result[index]['bookingUuid'] == payment.bookingUuid) {
                                            result[index]['updatedOn'] = time_1.default.formatGivenDate(payment.updatedOn);
                                        }
                                    });
                                });
                            }
                        });
                        yield usersCollection
                            .find({ _user_id: { $in: byArray } })
                            .then(users => {
                            if (users.length) {
                                users.forEach(user => {
                                    result.forEach((res, index) => {
                                        if (result[index]['by'] == user._user_id) {
                                            result[index]['by'] = user._first_name;
                                        }
                                    });
                                });
                            }
                        });
                        yield logCollection
                            .find({
                            type: LogLaw.Type.BOOKING_CREATE,
                            "payload.bookingUuid": { $in: bookingUuids }
                        }).then(rooms => {
                            if (rooms.length > 0) {
                                for (let reserve of rooms) {
                                    let booking = log_1.default.spawn(reserve);
                                    result.forEach((res, index) => {
                                        if (result[index]['bookingUuid'] == booking.payload.bookingUuid) {
                                            result[index]['checkIn'] = time_1.default.formatGivenDate(booking.payload.checkIn);
                                            result[index]['checkOut'] = time_1.default.formatGivenDate(booking.payload.checkOut);
                                            result[index]['numberOfRooms'] = booking.payload.numberOfRooms;
                                            result[index]['numberOfNights'] = booking.payload.numberOfNights;
                                            result[index]['numberOfGuests'] = booking.payload.numberOfGuests;
                                            result[index]['guest'] = booking.payload.guest.firstName;
                                            result[index]['roomNumber'] = booking.payload.roomReservations[0].roomNumber;
                                            result[index]['reference_id'] = booking_array[booking.payload.bookingUuid];
                                        }
                                    });
                                }
                            }
                        });
                        PaymentsObj.data = result;
                        let output_data = {
                            paymentsObj: PaymentsObj,
                            overallPayments: paymentsDocument
                        };
                        res.status(200);
                        respond = {
                            success: true,
                            message: `Prepared daily sales as requested`,
                            data: output_data
                        };
                        res.json(respond);
                    });
                });
            });
        }));
        DailySalesRouter.route('/manager/dashboard-stats')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let today = time_1.default.serverMoment.format("DD-MM-YYYY");
            let onHoldDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                status: InventoryLaw.RoomStatus.ON_HOLD,
                checkOut: today
            });
            let checkInDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                status: InventoryLaw.RoomStatus.CHECK_IN,
                checkIn: today
            });
            let checkOutDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                status: InventoryLaw.RoomStatus.CHECK_OUT,
                checkOut: today
            });
            let occupiedDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                status: InventoryLaw.RoomStatus.OCCUPIED,
            });
            let vacatedDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                status: InventoryLaw.RoomStatus.VACATED,
                checkOut: {
                    $gte: today
                }
            });
            let hotelDocument = yield hotelDetailsCollection.findOne({
                _hotel_id: hotelUuid
            });
            let totalNoOfRooms = hotelDocument['_total_no_Of_rooms'];
            let reservedDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $lte: today
                },
                checkOut: {
                    $gt: today
                }
            });
            reservedDocuments = reservedDocuments.filter(e => e.status == InventoryLaw.RoomStatus.CHECK_IN || e.status == InventoryLaw.RoomStatus.OCCUPIED);
            res.status(200);
            let respond = {
                success: true,
                message: `Prepared dashboard stats as requested`,
                data: {
                    onHold: onHoldDocuments.length,
                    checkIn: checkInDocuments.length,
                    checkOut: checkOutDocuments.length,
                    occupied: occupiedDocuments.length,
                    vacated: vacatedDocuments.length,
                    available: Number(totalNoOfRooms) - reservedDocuments.length
                }
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/dashboard-revenue')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let stackedChartRevenueArray = new Array();
            let pieChartRevenueArray = new Array();
            yield paymentsCollection.find({
                hoteluuid: hotelUuid
            }, {
                _id: 0,
                booking_channel: 1,
                bookedOn: 1,
                totalAmount: 1
            })
                .then((revenueDocuments) => __awaiter(this, void 0, void 0, function* () {
                let walkinRevenueDocuments = yield revenueDocuments.filter(e => e.booking_channel == 'WALK_IN');
                let webRevenueDocuments = yield revenueDocuments.filter(e => e.booking_channel == 'WEB');
                let stackedChartwalkinArray = new Array();
                for (let walkinRevenue of walkinRevenueDocuments) {
                    yield stackedChartwalkinArray.push({
                        x: Date.parse(walkinRevenue.bookedOn),
                        y: walkinRevenue.totalAmount
                    });
                }
                stackedChartRevenueArray.push({
                    key: 'WALK_IN',
                    values: stackedChartwalkinArray
                });
                let stackedChartwebArray = new Array();
                for (let webRevenue of webRevenueDocuments) {
                    yield stackedChartwebArray.push({
                        x: Date.parse(webRevenue.bookedOn),
                        y: webRevenue.totalAmount
                    });
                }
                stackedChartRevenueArray.push({
                    key: 'WEB',
                    values: stackedChartwebArray
                });
                let totalWalkInRevenue = 0;
                for (let i = 0; i < walkinRevenueDocuments.length; i++) {
                    totalWalkInRevenue = totalWalkInRevenue + (isNaN(walkinRevenueDocuments[i].totalAmount) ? 0 : walkinRevenueDocuments[i].totalAmount);
                }
                let pieChartWalkinObj = {
                    label: 'WALK IN',
                    value: totalWalkInRevenue
                };
                let totalWebRevenue = 0;
                for (let i = 0; i < webRevenueDocuments.length; i++) {
                    totalWebRevenue = totalWebRevenue + (isNaN(webRevenueDocuments[i].totalAmount) ? 0 : webRevenueDocuments[i].totalAmount);
                }
                let pieChartWebObj = {
                    label: 'WEB',
                    value: totalWebRevenue
                };
                pieChartRevenueArray.push(pieChartWalkinObj, pieChartWebObj);
            }))
                .catch(error => {
                res.status(404);
                let respond = {
                    success: true,
                    message: error.message
                };
            });
            res.status(200);
            let respond = {
                success: true,
                message: 'Prepard revenue document as requested',
                data: {
                    stackedChartRevenueArray,
                    pieChartRevenueArray
                }
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/dashboard-occupancy')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let numberOfDays = 30;
            let totalRoomsDocument = yield hotelDetailsCollection.findOne({
                _hotel_id: hotelUuid
            }, {
                _id: 0,
                _total_no_Of_rooms: 1
            });
            let occupancyArray = new Array();
            let today = time_1.default.serverMoment;
            let current = today.subtract(15, 'days');
            let occupancyDocuments = new Array();
            for (let i = 0; i < numberOfDays + 1; i++) {
                let collectedData = yield roomReservationCollection.find({
                    hotelUuid: hotelUuid,
                    checkIn: { $lte: current.format('DD-MM-YYYY') },
                    checkOut: { $gt: current.format('DD-MM-YYYY') }
                });
                let occupiedRooms = 0;
                yield collectedData.map(e => occupiedRooms = occupiedRooms + 1);
                yield occupancyDocuments.push({
                    date: Date.parse(current),
                    roomsSold: occupiedRooms,
                    totalRooms: Number(totalRoomsDocument._total_no_Of_rooms)
                });
                current.add(1, 'days');
            }
            occupancyArray.push({
                key: 'Occupancy',
                values: occupancyDocuments
            });
            let respond = {
                success: true,
                message: 'Prepared occupancy document as requested',
                data: occupancyArray
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/check-in')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let country_name;
            if (hotelUuid == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country = newLocation.data;
            let respond;
            let checkIn_from = time_1.default.serverMoment.startOf('day').toDate();
            let checkIn_to = time_1.default.serverMoment.endOf('day').toDate();
            let reference_id = req.query.reference_id;
            let checkin_from = req.query.checkIn_from;
            let checkin_to = req.query.checkIn_to;
            let result = new Array();
            let bookingUuid;
            if (reference_id) {
                let RoomDetails = core_1.default.app.get('mongoClient').get('Booking');
                yield RoomDetails
                    .findOne({ referenceId: reference_id })
                    .then(document => {
                    bookingUuid = document.uuid;
                })
                    .catch(error => { });
            }
            var reservationCondition = {
                hotelUuid: hotelUuid,
                $and: [
                    { status: { $eq: InventoryLaw.BookingStatus.ON_HOLD } },
                    { status: { $eq: InventoryLaw.BookingStatus.CONFIRMED } },
                    { status: { $eq: InventoryLaw.BookingStatus.CHECK_IN } },
                    { status: { $eq: InventoryLaw.BookingStatus.NO_SHOW } }
                ]
            };
            if (bookingUuid !== undefined) {
                reservationCondition['bookingUuid'] = bookingUuid;
            }
            roomReservationCollection.find({
                hotelUuid: hotelUuid,
                $and: [
                    { checkIn: { $gte: checkIn_from } },
                    { checkIn: { $lte: checkIn_to } },
                    { status: { $ne: InventoryLaw.RoomStatus.OCCUPIED } },
                    { status: { $ne: InventoryLaw.RoomStatus.VACATED } },
                    { status: { $ne: InventoryLaw.RoomStatus.CHECK_OUT } },
                    { status: { $ne: InventoryLaw.RoomStatus.CANCELLED } }
                ]
            }).then((rooms) => __awaiter(this, void 0, void 0, function* () {
                for (let reserve of rooms) {
                    let booking = log_1.default.spawn(reserve);
                    let bookingUuid = reserve.bookingUuid;
                    let guest = reserve.guest;
                    let numberOfGuests = reserve.numberOfGuests;
                    let checkIn = time_1.default.formatGivenDate(reserve.checkIn);
                    let checkOut = time_1.default.formatGivenDate(reserve.checkOut);
                    let roomNumber = reserve.roomNumber;
                    let status = reserve.status;
                    let reference_id;
                    yield bookingCollection.find({
                        status: { $ne: InventoryLaw.BookingStatus.CANCELLED },
                        uuid: bookingUuid
                    }).then((reference) => __awaiter(this, void 0, void 0, function* () {
                        for (let ref of reference) {
                            let refer = log_1.default.spawn(ref);
                            reference_id = ref.referenceId;
                        }
                    }));
                    var roomreservationCondition = {
                        hotelUuid: hotelUuid,
                        $and: [
                            { status: { $eq: InventoryLaw.BookingStatus.ON_HOLD } },
                            { status: { $eq: InventoryLaw.BookingStatus.CONFIRMED } },
                            { status: { $eq: InventoryLaw.BookingStatus.CHECK_IN } },
                            { status: { $eq: InventoryLaw.BookingStatus.NO_SHOW } }
                        ]
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
                    if (checkin_from !== undefined && checkin_to !== undefined) {
                        roomreservationCondition['checkIn'] = { $gte: new Date(checkin_from), $lte: new Date(checkin_to) };
                    }
                    else if (checkin_from !== undefined) {
                        roomreservationCondition['checkIn'] = { $gte: new Date(checkin_from) };
                    }
                    else if (checkin_to !== undefined) {
                        roomreservationCondition['checkIn'] = { $lte: new Date(checkin_to) };
                    }
                    result.push([
                        '<a href="/pms/booking-details?booking_uuid=' + bookingUuid + '&hotel_id=' + hotelUuid + '" >' + reference_id + '</a>',
                        guest.firstName + ' ' + guest.lastName,
                        numberOfGuests,
                        checkIn,
                        checkOut,
                        roomNumber,
                        status,
                        bookingUuid,
                        hotelUuid
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared checkin booking report as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/check-out')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let country_name;
            if (hotelUuid == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country = newLocation.data;
            let respond;
            let checkIn_from = time_1.default.serverMoment.startOf('day').toDate();
            let checkIn_to = time_1.default.serverMoment.endOf('day').toDate();
            let reference_id = req.query.reference_id;
            let checkin_from = req.query.checkIn_from;
            let checkin_to = req.query.checkIn_to;
            let result = new Array();
            let bookingUuid;
            if (reference_id) {
                let RoomDetails = core_1.default.app.get('mongoClient').get('Booking');
                yield RoomDetails
                    .findOne({ referenceId: reference_id })
                    .then(document => {
                    bookingUuid = document.uuid;
                })
                    .catch(error => { });
            }
            var reservationCondition = {
                hotelUuid: hotelUuid,
                $and: [
                    { status: { $eq: InventoryLaw.BookingStatus.ON_HOLD } },
                    { status: { $eq: InventoryLaw.BookingStatus.CONFIRMED } },
                    { status: { $eq: InventoryLaw.BookingStatus.CHECK_IN } },
                    { status: { $eq: InventoryLaw.BookingStatus.NO_SHOW } }
                ]
            };
            if (bookingUuid !== undefined) {
                reservationCondition['bookingUuid'] = bookingUuid;
            }
            roomReservationCollection.find({
                hotelUuid: hotelUuid,
                $and: [
                    { checkOut: { $gte: checkIn_from } },
                    { checkOut: { $lte: checkIn_to } },
                    { status: { $ne: InventoryLaw.RoomStatus.OCCUPIED } },
                    { status: { $ne: InventoryLaw.RoomStatus.CHECK_IN } },
                    { status: { $ne: InventoryLaw.RoomStatus.ON_HOLD } },
                    { status: { $ne: InventoryLaw.RoomStatus.NO_SHOW } },
                    { status: { $ne: InventoryLaw.RoomStatus.CONFIRMED } },
                    { status: { $ne: InventoryLaw.RoomStatus.CANCELLED } }
                ]
            }).then((rooms) => __awaiter(this, void 0, void 0, function* () {
                for (let reserve of rooms) {
                    let booking = log_1.default.spawn(reserve);
                    let bookingUuid = reserve.bookingUuid;
                    let guest = reserve.guest;
                    let numberOfGuests = reserve.numberOfGuests;
                    let checkIn = time_1.default.formatGivenDate(reserve.checkIn);
                    let checkOut = time_1.default.formatGivenDate(reserve.checkOut);
                    let roomNumber = reserve.roomNumber;
                    let status = reserve.status;
                    let reference_id;
                    yield bookingCollection.find({
                        status: { $ne: InventoryLaw.BookingStatus.CANCELLED },
                        uuid: bookingUuid
                    }).then((reference) => __awaiter(this, void 0, void 0, function* () {
                        for (let ref of reference) {
                            let refer = log_1.default.spawn(ref);
                            reference_id = ref.referenceId;
                        }
                    }));
                    var roomreservationCondition = {
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
                    if (checkin_from !== undefined && checkin_to !== undefined) {
                        roomreservationCondition['payload.checkIn'] = { $gte: new Date(checkin_from), $lte: new Date(checkin_to) };
                    }
                    else if (checkin_from !== undefined) {
                        roomreservationCondition['payload.checkIn'] = { $gte: new Date(checkin_from) };
                    }
                    else if (checkin_to !== undefined) {
                        roomreservationCondition['payload.checkIn'] = { $lte: new Date(checkin_to) };
                    }
                    result.push([
                        '<a href="/pms/booking-details?booking_uuid=' + bookingUuid + '&hotel_id=' + hotelUuid + '" >' + reference_id + '</a>',
                        guest.firstName + ' ' + guest.lastName,
                        numberOfGuests,
                        checkIn,
                        checkOut,
                        roomNumber,
                        status,
                        bookingUuid,
                        hotelUuid
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared checkout booking report as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/booking-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let respond;
            let result = new Array();
            roomReservationCollection.find({
                hotelUuid: hotelUuid,
            }).then((checkIn) => __awaiter(this, void 0, void 0, function* () {
                for (let occupied of checkIn) {
                    let stay = log_1.default.spawn(occupied);
                    let guest = occupied.guest;
                    let numberOfGuests = occupied.numberOfGuests;
                    let checkIn = occupied.checkIn;
                    let checkOut = occupied.checkOut;
                    let status = occupied.status;
                    let bookingUuid = occupied.bookingUuid;
                    let by;
                    let totalRoomPrice;
                    let discountAmount;
                    let priceAfterDiscount;
                    let tax;
                    let serviceFee;
                    let totalAmount;
                    let tourismTax;
                    let paymentType;
                    let booking_channel;
                    let referenceId;
                    let numberOfRooms;
                    yield paymentsCollection.find({
                        hoteluuid: hotelUuid,
                        bookinguuid: bookingUuid
                    }).then((Payments) => __awaiter(this, void 0, void 0, function* () {
                        for (let payment of Payments) {
                            let pay = log_1.default.spawn(payment);
                            totalRoomPrice = payment.totalRoomPrice;
                            discountAmount = payment.discountAmount;
                            priceAfterDiscount = payment.priceAfterDiscount;
                            tax = payment.tax;
                            serviceFee = payment.serviceFee;
                            tourismTax = payment.tourismTax;
                            totalAmount = payment.totalAmount;
                            paymentType = payment.paymentType;
                            booking_channel = payment.booking_channel;
                            let userInformation = yield usersCollection.findOne({
                                _user_id: occupied.by
                            });
                        }
                    }));
                    yield bookingCollection.find({
                        uuid: bookingUuid
                    }).then((reference) => __awaiter(this, void 0, void 0, function* () {
                        for (let ref of reference) {
                            let refer = log_1.default.spawn(ref);
                            referenceId = ref.referenceId;
                        }
                    }));
                    yield logCollection.find({
                        type: LogLaw.Type.BOOKING_CREATE,
                        "payload.bookingUuid": bookingUuid,
                    }).then(rooms => {
                        for (let reserve of rooms) {
                            let booking = log_1.default.spawn(reserve);
                            numberOfRooms = reserve.payload.numberOfRooms;
                        }
                    });
                    result.push({
                        referenceId: referenceId,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfRooms: numberOfRooms,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        booking_channel: booking_channel,
                        status: status,
                        totalRoomPrice: totalRoomPrice,
                        discountAmount: discountAmount,
                        priceAfterDiscount: priceAfterDiscount,
                        tax: tax,
                        serviceFee: serviceFee,
                        tourismTax: tourismTax,
                        totalAmount: totalAmount,
                        paymentType: paymentType,
                        hotel_id: hotelUuid,
                        bookingUuid: bookingUuid
                    });
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
        DailySalesRouter.route('/manager/stay-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let respond;
            let today = time_1.default.serverMoment.toDate();
            let result = new Array();
            let room_type_array;
            let room_types = [];
            let country_name;
            if (hotelUuid == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            let masters = yield LocationMasters_1.default.getMasters();
            let newLocation = yield LocationMasters_1.default.getNewLocation();
            let country = newLocation.data;
            roomReservationCollection.find({
                hotelUuid: hotelUuid,
                status: InventoryLaw.RoomStatus.OCCUPIED,
            }, { "sort": { "_id": -1 } }).then((checkIn) => __awaiter(this, void 0, void 0, function* () {
                for (let occupied of checkIn) {
                    let stay = log_1.default.spawn(occupied);
                    let guest = occupied.guest;
                    let numberOfGuests = occupied.numberOfGuests;
                    let checkIn = time_1.default.formatGivenDate(occupied.checkIn);
                    let checkOut = time_1.default.formatGivenDate(occupied.checkOut);
                    let status = occupied.status;
                    let bookingUuid = occupied.bookingUuid;
                    let roomType = occupied.roomType;
                    let roomNumber = occupied.roomNumber;
                    let phoneNumber = occupied.guest;
                    let email = occupied.guest;
                    let time;
                    let by;
                    let totalRoomPrice;
                    let discountAmount;
                    let priceAfterDiscount;
                    let tax;
                    let serviceFee;
                    let totalAmount;
                    let tourismTax;
                    let paymentType;
                    let channel_name;
                    let booking_channel;
                    let reference_id;
                    let numberOfRooms;
                    let totalAmountPaid;
                    yield paymentsCollection.find({
                        hoteluuid: hotelUuid,
                        bookinguuid: bookingUuid
                    }).then((Payments) => __awaiter(this, void 0, void 0, function* () {
                        for (let payment of Payments) {
                            let pay = log_1.default.spawn(payment);
                            totalRoomPrice = payment.totalRoomPrice;
                            discountAmount = payment.discountAmount;
                            priceAfterDiscount = payment.priceAfterDiscount;
                            tax = payment.tax;
                            serviceFee = payment.serviceFee;
                            tourismTax = payment.tourismTax;
                            totalAmount = payment.totalAmount;
                            paymentType = payment.paymentType;
                            channel_name = payment.channel_name;
                            booking_channel = payment.booking_channel;
                            totalAmount = payment.totalAmount;
                            totalAmountPaid = payment.totalAmountPaid;
                            let userInformation = yield usersCollection.findOne({
                                _user_id: occupied.by
                            });
                        }
                    }));
                    yield bookingCollection.find({
                        uuid: bookingUuid
                    }).then((reference) => __awaiter(this, void 0, void 0, function* () {
                        for (let ref of reference) {
                            let refer = log_1.default.spawn(ref);
                            reference_id = ref.referenceId;
                        }
                    }));
                    yield logCollection.find({
                        type: LogLaw.Type.BOOKING_CREATE,
                        "payload.bookingUuid": bookingUuid,
                    }).then(rooms => {
                        for (let reserve of rooms) {
                            let booking = log_1.default.spawn(reserve);
                            numberOfRooms = reserve.payload.numberOfRooms;
                        }
                    });
                    yield logCollection.find({
                        type: LogLaw.Type.CHECK_IN,
                        "payload.bookingUuid": bookingUuid,
                        "payload._hotelId": hotelUuid,
                    }).then((rooms) => __awaiter(this, void 0, void 0, function* () {
                        for (let reserve of rooms) {
                            let booking = log_1.default.spawn(reserve);
                            time = time_1.default.countryFormatGivenDateWithTime(booking.moment, country_name);
                        }
                    }));
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
                    if (booking_channel === "WALK_IN") {
                        channel_name = "WALK_IN";
                    }
                    else if (booking_channel === "WEB") {
                        channel_name = "WEB";
                    }
                    else if (booking_channel === "OTA") {
                        channel_name = channel_name;
                    }
                    result.push([
                        '<a href="/pms/booking-details?booking_uuid=' + bookingUuid + '&hotel_id=' + hotelUuid + '" >' + reference_id + '</a>',
                        roomNumber,
                        room_types[roomType],
                        guest.firstName + ' ' + guest.lastName,
                        guest.phoneNumber,
                        guest.emailAddress,
                        numberOfGuests,
                        checkIn,
                        checkOut,
                        booking_channel,
                        channel_name,
                        totalAmount,
                        totalAmountPaid,
                        totalAmount - totalAmountPaid,
                        paymentType,
                        status,
                        hotelUuid,
                        bookingUuid,
                        roomType,
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared stay report as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/total-earnings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let respond;
            let result = new Array();
            bookingCollection.find({
                hotelId: hotelUuid,
                status: InventoryLaw.BookingStatus.VACATED,
                "bookingCommission.commission_amount": { $gte: 0 }
            }).then((earn) => __awaiter(this, void 0, void 0, function* () {
                for (let refer of earn) {
                    let earnings = log_1.default.spawn(refer);
                    let bookingUuid = refer.uuid;
                    let referenceId = refer.referenceId;
                    let guest = refer.guest;
                    let referred_by = refer.referred_by;
                    let bookingCommission = refer.bookingCommission;
                    let commission_amountusd = refer.bookingCommission.commission_amount_usd;
                    let status = refer.status;
                    let userInformation = yield usersCollection.findOne({
                        _user_id: refer.referred_by
                    });
                    result.push([
                        referenceId,
                        userInformation._first_name,
                        guest.firstName,
                        bookingCommission.commission_perc,
                        parseFloat(commission_amountusd).toFixed(2),
                        status,
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared total earnings as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/upcoming-earnings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let respond;
            let result = new Array();
            bookingCollection.find({
                hotelId: hotelUuid,
                $or: [
                    { status: InventoryLaw.BookingStatus.CHECK_IN },
                    { status: InventoryLaw.BookingStatus.OCCUPIED },
                    { status: InventoryLaw.BookingStatus.CONFIRMED },
                ],
                "bookingCommission.commission_amount": { $gte: 0 }
            }).then((earn) => __awaiter(this, void 0, void 0, function* () {
                for (let refer of earn) {
                    let earnings = log_1.default.spawn(refer);
                    let bookingUuid = refer.uuid;
                    let referenceId = refer.referenceId;
                    let guest = refer.guest;
                    let referred_by = refer.referred_by;
                    let bookingCommission = refer.bookingCommission;
                    let status = refer.status;
                    let commission_amountusd = refer.bookingCommission.commission_amount_usd;
                    let userInformation = yield usersCollection.findOne({
                        _user_id: refer.referred_by
                    });
                    result.push([
                        referenceId,
                        userInformation._first_name,
                        guest.firstName,
                        bookingCommission.commission_perc,
                        parseFloat(commission_amountusd).toFixed(2),
                        status,
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared upcoming earnings as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/revenue-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            let country_name;
            if (hotelUuid == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                country_name = 'Malaysia';
            }
            else {
                country_name = 'Thailand';
            }
            let respond;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            let begin = time_1.default.serverMomentInPattern(startDate, "DD-MM-YYYY");
            begin.set({
                'hour': 0,
                'minute': 0,
                'second': 0,
                'millisecond': 0
            });
            let end = time_1.default.serverMomentInPattern(endDate, 'DD-MM-YYYY');
            end.set({
                'hour': 23,
                'minute': 59,
                'second': 59,
                'millisecond': 999
            });
            let reference_id = req.query.reference_id;
            let checkin_from = req.query.checkin_from;
            let checkin_to = req.query.checkin_to;
            let booking_from = req.query.booking_from;
            let booking_to = req.query.booking_to;
            let booking_source = req.query.booking_source;
            let ota_channel = req.query.booking_channel;
            let payment_type = req.query.payment_type;
            let result = new Array();
            let room_type_array;
            let room_types = [];
            let bookingUuid;
            if (reference_id) {
                let RoomDetails = core_1.default.app.get('mongoClient').get('Booking');
                yield RoomDetails
                    .findOne({ referenceId: reference_id })
                    .then(document => {
                    bookingUuid = document.uuid;
                })
                    .catch(error => { });
            }
            var reservationCondition = {
                hotelUuid: hotelUuid,
                $and: [
                    { "costBreakdown.date": { $gte: begin.toDate() } },
                    { "costBreakdown.date": { $lte: end.toDate() } },
                    { status: { $ne: InventoryLaw.BookingStatus.ON_HOLD } },
                    { status: { $ne: InventoryLaw.BookingStatus.CANCELLED } }
                ]
            };
            if (bookingUuid !== undefined) {
                reservationCondition['bookingUuid'] = bookingUuid;
            }
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
            if (checkin_from !== undefined && checkin_to !== undefined) {
                reservationCondition['checkIn'] = { $gte: new Date(checkin_from), $lte: new Date(checkin_to) };
            }
            else if (checkin_from !== undefined) {
                reservationCondition['checkIn'] = { $gte: new Date(checkin_from) };
            }
            else if (checkin_to !== undefined) {
                reservationCondition['checkIn'] = { $lte: new Date(checkin_to) };
            }
            roomReservationCollection.find(reservationCondition, { "sort": { "_id": -1 } }).then((revenueDocuments) => __awaiter(this, void 0, void 0, function* () {
                let result = new Array();
                for (let occupied of revenueDocuments) {
                    for (let cost of occupied.costBreakdown) {
                        if (cost.date >= begin.toDate() && cost.date <= end.toDate()) {
                            let stay = log_1.default.spawn(occupied);
                            let guest = occupied.guest;
                            let numberOfGuests = occupied.numberOfGuests;
                            let checkIn = time_1.default.formatGivenDate(occupied.checkIn);
                            let checkOut = time_1.default.formatGivenDate(occupied.checkOut);
                            let checkInDate = time_1.default.serverMomentInPattern(occupied.checkIn, "YYYY-MM-DD HH:mm:ss");
                            let checkOutDate = time_1.default.serverMomentInPattern(occupied.checkOut, "YYYY-MM-DD HH:mm:ss");
                            let status = occupied.status;
                            let bookingUuid = occupied.bookingUuid;
                            let roomUuid = occupied.roomUuid;
                            let roomType = occupied.roomType;
                            let roomNumber = occupied.roomNumber;
                            let phoneNumber = occupied.guest;
                            let email = occupied.guest;
                            let uuid = occupied.uuid;
                            let numberOfNights = occupied.numberOfNights;
                            let numberOfRooms;
                            let time;
                            let checkInTime;
                            let paymentStatus;
                            let by;
                            let totalRoomPrice;
                            let discountAmount;
                            let updatedOn;
                            let discountValue;
                            let priceAfterDiscount;
                            let discountType;
                            let tax;
                            let totalAmount;
                            let tourismTax;
                            let paymentType;
                            let channel_name;
                            let booking_channel;
                            let referenceId;
                            let totalroomNights;
                            let serviceFee;
                            let gst;
                            let OtaRefId;
                            let totalAmountPaid;
                            let bookedOn;
                            var paymentCondition = {
                                hoteluuid: hotelUuid,
                                bookinguuid: bookingUuid
                            };
                            if (payment_type !== undefined) {
                                paymentCondition['paymentType'] = payment_type;
                            }
                            if (booking_source !== undefined) {
                                paymentCondition['booking_channel'] = booking_source;
                            }
                            if (ota_channel !== undefined) {
                                paymentCondition['channel_name'] = ota_channel;
                            }
                            if (booking_from !== undefined) {
                                booking_from = time_1.default.serverMomentInPattern(booking_from, "DD-MM-YYYY");
                                booking_from.set({
                                    'hour': 0,
                                    'minute': 0,
                                    'second': 0,
                                    'millisecond': 0
                                });
                            }
                            if (booking_to !== undefined) {
                                booking_to = time_1.default.serverMomentInPattern(booking_to, "DD-MM-YYYY");
                                booking_to.set({
                                    'hour': 0,
                                    'minute': 0,
                                    'second': 0,
                                    'millisecond': 0
                                });
                            }
                            if (booking_from !== undefined && booking_to !== undefined) {
                                paymentCondition['bookedOn'] = { $gte: new Date(booking_from), $lte: new Date(booking_to) };
                            }
                            else if (booking_from !== undefined) {
                                paymentCondition['bookedOn'] = { $gte: new Date(booking_from) };
                            }
                            else if (booking_to !== undefined) {
                                paymentCondition['bookedOn'] = { $lte: new Date(booking_to) };
                            }
                            yield paymentsCollection.find(paymentCondition).then((Payments) => __awaiter(this, void 0, void 0, function* () {
                                for (let payment of Payments) {
                                    totalRoomPrice = payment.totalRoomPrice;
                                    discountAmount = payment.discountAmount;
                                    priceAfterDiscount = payment.priceAfterDiscount;
                                    tax = payment.tax;
                                    serviceFee = payment.serviceFee;
                                    totalroomNights = Number(numberOfNights) * Number(numberOfRooms);
                                    tourismTax = payment.tourismTax;
                                    totalAmount = payment.totalAmount;
                                    paymentType = payment.paymentType;
                                    paymentStatus = payment.paymentStatus;
                                    channel_name = payment.channel_name;
                                    booking_channel = payment.booking_channel;
                                    totalAmount = payment.totalAmount;
                                    totalAmountPaid = payment.totalAmountPaid;
                                    discountType = payment.discountType;
                                    discountValue = payment.discountValue;
                                    serviceFee = payment.serviceFee;
                                    gst = payment.tax;
                                    updatedOn = time_1.default.countryFormatGivenDateWithTime(payment.updatedOn, country_name);
                                    bookedOn = time_1.default.countryFormatGivenDateWithTime(payment.bookedOn, country_name);
                                    OtaRefId = payment.paymentReferrenceId;
                                }
                            }));
                            if (totalRoomPrice === undefined) {
                                continue;
                            }
                            yield bookingCollection.find({
                                uuid: bookingUuid
                            }).then((reference) => __awaiter(this, void 0, void 0, function* () {
                                for (let ref of reference) {
                                    let refer = log_1.default.spawn(ref);
                                    referenceId = ref.referenceId;
                                }
                            }));
                            yield logCollection.find({
                                type: LogLaw.Type.BOOKING_CREATE,
                                "payload.bookingUuid": bookingUuid,
                            }).then(rooms => {
                                for (let reserve of rooms) {
                                    let booking = log_1.default.spawn(reserve);
                                    time = time_1.default.countryFormatGivenDateWithTime(booking.moment, country_name);
                                    numberOfRooms = reserve.payload.numberOfRooms;
                                }
                            });
                            var logCondition = {
                                type: LogLaw.Type.CHECK_IN,
                                "payload.bookingUuid": bookingUuid,
                                "payload.hotelUuid": hotelUuid,
                            };
                            yield logCollection.find(logCondition).then((rooms) => __awaiter(this, void 0, void 0, function* () {
                                for (let reserve of rooms) {
                                    let booking = log_1.default.spawn(reserve);
                                    checkInTime = time_1.default.countryFormatGivenDateWithTime(booking.moment, country_name);
                                }
                            }));
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
                            if (booking_channel === "WALK_IN") {
                                channel_name = "WALK_IN";
                            }
                            else if (booking_channel === "WEB") {
                                channel_name = "WEB";
                            }
                            else if (booking_channel === "OTA") {
                                channel_name = channel_name;
                            }
                            let roomprice = cost.cost;
                            let servicefeeperc = 10;
                            serviceFee = roomprice * servicefeeperc;
                            serviceFee = serviceFee / 100;
                            let roomprice_withserfee = roomprice + serviceFee;
                            let gstperc;
                            if (hotelUuid == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                                gstperc = 6;
                            }
                            else {
                                gstperc = 7;
                            }
                            gst = roomprice_withserfee * gstperc;
                            gst = gst / 100;
                            let guest_nationality;
                            let GuestDetails = core_1.default.app.get('mongoClient').get('guest_booking_info');
                            yield GuestDetails
                                .findOne({ _booking_id: bookingUuid })
                                .then(document => {
                                guest_nationality = document._nationality;
                            })
                                .catch(error => { });
                            result.push([
                                time_1.default.formatGivenDate(cost.date),
                                bookedOn,
                                booking_channel,
                                channel_name,
                                guest.firstName + ' ' + guest.lastName,
                                guest_nationality,
                                referenceId,
                                uuid,
                                cost.cost.toFixed(2),
                                serviceFee.toFixed(2),
                                gst.toFixed(2),
                                numberOfGuests,
                                room_types[roomType],
                                roomNumber,
                                OtaRefId,
                                checkIn,
                                checkOut,
                                paymentType,
                                updatedOn,
                                paymentStatus,
                            ]);
                        }
                    }
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared revenue report as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/nida-cash')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let result = new Array();
            let hotelUuidArr = new Array();
            let nidaCashArr = new Array();
            let upcomingEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { hotelUuid: "$hotelId" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            for (let hotel of upcomingEarningsDocuments) {
                hotelUuidArr.push(hotel._id.hotelUuid);
            }
            let totalEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { hotelUuid: "$hotelId" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            let totalBookingsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { hotelUuid: "$hotelId" },
                        totalBookings: { $sum: 1 }
                    }
                }
            ]);
            let totalOverallBookingDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                    }
                },
                {
                    $group: {
                        _id: { hotelUuid: "$hotelId" },
                        totalOverallBookings: { $sum: 1 }
                    }
                }
            ]);
            let linkOpenDocuments = yield sharedHotelsCollection.aggregate([
                {
                    $group: {
                        _id: { hotelUuid: "$_hotel_id" },
                        linkOpen: { $sum: "$_link_opens" }
                    }
                }
            ]);
            let hotelDocuments = yield hotelDetailsCollection.find();
            for (let hotel of hotelDocuments) {
                let upcomingEarning = upcomingEarningsDocuments.find(e => hotel._hotel_id === e._id.hotelUuid);
                let totalEarning = totalEarningsDocuments.find(e => hotel._hotel_id === e._id.hotelUuid);
                let totalBooking = totalBookingsDocuments.find(e => hotel._hotel_id === e._id.hotelUuid);
                let linkOpened = linkOpenDocuments.find(e => hotel._hotel_id === e._id.hotelUuid);
                let totalOverall = totalOverallBookingDocuments.find(e => hotel._hotel_id === e._id.hotelUuid);
                if (upcomingEarning === undefined) {
                    upcomingEarning = {};
                    upcomingEarning['commission'] = 0;
                }
                if (totalEarning === undefined) {
                    totalEarning = {};
                    totalEarning['commission'] = 0;
                }
                if (totalBooking === undefined) {
                    totalBooking = {};
                    totalBooking['totalBookings'] = 0;
                }
                if (linkOpened === undefined) {
                    linkOpened = {};
                    linkOpened['linkOpen'] = 0;
                }
                if (totalOverall === undefined) {
                    totalOverall = {};
                    totalOverall['totalOverallBookings'] = 0;
                }
                result.push([
                    hotel._nida_stay_name,
                    parseFloat(upcomingEarning.commission).toFixed(2),
                    parseFloat(totalEarning.commission).toFixed(2),
                    totalBooking.totalBookings,
                    linkOpened.linkOpen,
                    totalOverall.totalOverallBookings
                ]);
            }
            res.status(200);
            respond = {
                success: true,
                message: `Prepared nida cash hq level as requested`,
                data: result
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/user-performance')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let result = new Array();
            let nidaCashArr = new Array();
            let userUuidArr = new Array();
            let upcomingEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            for (let user of upcomingEarningsDocuments) {
                userUuidArr.push(user._id.userUuid);
            }
            let totalEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            let totalBookingsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        totalBookings: { $sum: 1 }
                    }
                }
            ]);
            let totalOverallBookingDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        totalOverallBookings: { $sum: 1 }
                    }
                }
            ]);
            let linkOpenDocuments = yield sharedHotelsCollection.aggregate([
                {
                    $group: {
                        _id: { userUuid: "$_user_id" },
                        linkOpen: { $sum: "$_link_opens" }
                    }
                }
            ]);
            let userDocuments = yield usersCollection.find({
                _status: "Active",
                _roles: "9"
            });
            for (let user of userDocuments) {
                let upcomingEarning = upcomingEarningsDocuments.find(e => user._user_id === e._id.userUuid);
                let totalEarning = totalEarningsDocuments.find(e => user._user_id === e._id.userUuid);
                let totalBooking = totalBookingsDocuments.find(e => user._user_id === e._id.userUuid);
                let linkOpened = linkOpenDocuments.find(e => user._user_id === e._id.userUuid);
                let totalOverall = totalOverallBookingDocuments.find(e => user._user_id === e._id.userUuid);
                if (upcomingEarning === undefined) {
                    upcomingEarning = {};
                    upcomingEarning['commission'] = 0;
                }
                if (totalEarning === undefined) {
                    totalEarning = {};
                    totalEarning['commission'] = 0;
                }
                if (totalBooking === undefined) {
                    totalBooking = {};
                    totalBooking['totalBookings'] = 0;
                }
                if (linkOpened === undefined) {
                    linkOpened = {};
                    linkOpened['linkOpen'] = 0;
                }
                if (totalOverall === undefined) {
                    totalOverall = {};
                    totalOverall['totalOverallBookings'] = 0;
                }
                if (userDocuments === undefined) {
                    continue;
                }
                result.push([
                    user._first_name,
                    user._email,
                    parseFloat(upcomingEarning.commission).toFixed(2),
                    parseFloat(totalEarning.commission).toFixed(2),
                    totalBooking.totalBookings,
                    linkOpened.linkOpen,
                    totalOverall.totalOverallBookings
                ]);
            }
            res.status(200);
            respond = {
                success: true,
                message: `Prepared user performance hq level as requested`,
                data: result
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/user-performance-hotel')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let result = new Array();
            let hotelUuid = req.query.hotel_id;
            let nidaCashArr = new Array();
            let userUuidArr = new Array();
            let hotelUuidArr = new Array();
            let upcomingEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        hotelId: hotelUuid,
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            for (let user of upcomingEarningsDocuments) {
                userUuidArr.push(user._id.userUuid);
            }
            let totalEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        hotelId: hotelUuid,
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            let totalBookingsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        hotelId: hotelUuid,
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        totalBookings: { $sum: 1 }
                    }
                }
            ]);
            let totalOverallBookingDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        hotelId: hotelUuid,
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        totalOverallBookings: { $sum: 1 }
                    }
                }
            ]);
            let linkOpenDocuments = yield sharedHotelsCollection.aggregate([
                {
                    $group: {
                        _id: { userUuid: "$_user_id" },
                        linkOpen: { $sum: 1 }
                    }
                }
            ]);
            let userDocuments = yield usersCollection.find({
                _status: "Active",
                _roles: "9"
            });
            for (let user of userDocuments) {
                let upcomingEarning = upcomingEarningsDocuments.find(e => user._user_id === e._id.userUuid);
                let totalEarning = totalEarningsDocuments.find(e => user._user_id === e._id.userUuid);
                let totalBooking = totalBookingsDocuments.find(e => user._user_id === e._id.userUuid);
                let linkOpened = linkOpenDocuments.find(e => user._user_id === e._id.userUuid);
                let totalOverall = totalOverallBookingDocuments.find(e => user._user_id === e._id.userUuid);
                if (upcomingEarning === undefined) {
                    upcomingEarning = {};
                    upcomingEarning['commission'] = 0;
                }
                if (totalEarning === undefined) {
                    totalEarning = {};
                    totalEarning['commission'] = 0;
                }
                if (totalBooking === undefined) {
                    totalBooking = {};
                    totalBooking['totalBookings'] = 0;
                }
                if (linkOpened === undefined) {
                    linkOpened = {};
                    linkOpened['linkOpen'] = 0;
                }
                if (totalOverall === undefined) {
                    totalOverall = {};
                    totalOverall['totalOverallBookings'] = 0;
                }
                if (userDocuments === undefined) {
                    continue;
                }
                result.push([
                    user._first_name,
                    user._email,
                    parseFloat(upcomingEarning.commission).toFixed(2),
                    parseFloat(totalEarning.commission).toFixed(2),
                    totalBooking.totalBookings,
                    linkOpened.linkOpen,
                    totalOverall.totalOverallBookings
                ]);
            }
            res.status(200);
            respond = {
                success: true,
                message: `Prepared user performance hotel level as requested`,
                data: result
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/guest-history')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let result = new Array();
            let nidaCashArr = new Array();
            let userUuidArr = new Array();
            let upcomingEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            for (let user of upcomingEarningsDocuments) {
                userUuidArr.push(user._id.userUuid);
            }
            let totalEarningsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        commission: { $sum: "$bookingCommission.commission_amount_usd" }
                    }
                }
            ]);
            let totalBookingsDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        "bookingCommission.commission_amount_usd": { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        totalBookings: { $sum: 1 }
                    }
                }
            ]);
            let totalOverallBookingDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        status: {
                            $in: [
                                InventoryLaw.BookingStatus.CHECK_IN,
                                InventoryLaw.BookingStatus.OCCUPIED,
                                InventoryLaw.BookingStatus.CONFIRMED,
                                InventoryLaw.BookingStatus.VACATED,
                                InventoryLaw.BookingStatus.NO_SHOW
                            ]
                        },
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$bookedBy" },
                        totalOverallBookings: { $sum: 1 }
                    }
                }
            ]);
            let linkOpenDocuments = yield sharedHotelsCollection.aggregate([
                {
                    $match: {
                        _user_id: {
                            $in: userUuidArr
                        }
                    }
                },
                {
                    $group: {
                        _id: { userUuid: "$_user_id" },
                        linkOpen: { $sum: "$_link_opens" }
                    }
                }
            ]);
            let userDocuments = yield usersCollection.find({
                _status: "Active",
                _roles: "9"
            });
            for (let user of userDocuments) {
                let upcomingEarning = upcomingEarningsDocuments.find(e => user._user_id === e._id.userUuid);
                let totalEarning = totalEarningsDocuments.find(e => user._user_id === e._id.userUuid);
                let totalBooking = totalBookingsDocuments.find(e => user._user_id === e._id.userUuid);
                let linkOpened = linkOpenDocuments.find(e => user._user_id === e._id.userUuid);
                let totalOverall = totalOverallBookingDocuments.find(e => user._user_id === e._id.userUuid);
                if (upcomingEarning === undefined) {
                    upcomingEarning = {};
                    upcomingEarning['commission'] = 0;
                }
                if (totalEarning === undefined) {
                    totalEarning = {};
                    totalEarning['commission'] = 0;
                }
                if (totalBooking === undefined) {
                    totalBooking = {};
                    totalBooking['totalBookings'] = 0;
                }
                if (linkOpened === undefined) {
                    linkOpened = {};
                    linkOpened['linkOpen'] = 0;
                }
                if (totalOverall === undefined) {
                    totalOverall = {};
                    totalOverall['totalOverallBookings'] = 0;
                }
                if (userDocuments === undefined) {
                    continue;
                }
                result.push([
                    user._first_name,
                    user._email,
                    parseFloat(upcomingEarning.commission).toFixed(2),
                    parseFloat(totalEarning.commission).toFixed(2),
                    totalBooking.totalBookings,
                    linkOpened.linkOpen,
                    totalOverall.totalOverallBookings
                ]);
            }
            res.status(200);
            respond = {
                success: true,
                message: `Prepared user performance hq level as requested`,
                data: result
            };
            res.json(respond);
        }));
        DailySalesRouter.route('/manager/pastnidacashdata')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let today_start = time_1.default.serverMoment.subtract(1, 'days').startOf("day").format("x");
            let today_end = time_1.default.serverMoment.subtract(1, 'days').endOf("day").format("x");
            let userCollection = core_1.default.app.get('mongoClient').get('users');
            let userid;
            let total_signups;
            let referral_signups;
            let referrals;
            let referral_bookings = 0;
            let self_bookings = 0;
            let friends_bookings = 0;
            let total_bookings = 0;
            let referral_earnings = 0;
            let self_earnings = 0;
            let friends_earnings = 0;
            let total_earnings = 0;
            let booking_commission_referral;
            let booking_commission_self;
            let booking_commission_friends;
            let totalsignupsdoc = yield userCollection
                .find({
                _created_on: {
                    $gte: Number(today_start),
                    $lte: Number(today_end)
                }
            });
            total_signups = totalsignupsdoc.length;
            let referralsignupsdoc = yield userCollection
                .find({
                $and: [
                    { _created_on: { $gte: Number(today_start), } },
                    { _created_on: { $lte: Number(today_end) } }
                ],
                $or: [
                    { _referred_by: { $ne: null } },
                    { _referred_by: { $ne: undefined } }
                ]
            });
            referral_signups = referralsignupsdoc.length;
            let logCollection = core_1.default.app.get('mongoClient').get('Log');
            let today = time_1.default.serverMoment.subtract(1, 'days').toDate();
            let begin = time_1.default.serverMomentInPattern(today, "DD-MM-YYYY");
            begin.set({
                'hour': 0,
                'minute': 0,
                'second': 0,
                'millisecond': 0
            });
            let end = time_1.default.serverMomentInPattern(today, "DD-MM-YYYY");
            end.set({
                'hour': 23,
                'minute': 59,
                'second': 59,
                'millisecond': 999
            });
            let referralslogdoc = yield logCollection
                .find({
                type: LogLaw.Type.REFERRALS,
                $and: [
                    { moment: { $gte: begin.toDate(), } },
                    { moment: { $lte: end.toDate() } }
                ],
            });
            referrals = referralslogdoc.length;
            yield logCollection
                .find({
                type: LogLaw.Type.CHECK_OUT,
                $and: [
                    { moment: { $gte: begin.toDate(), } },
                    { moment: { $lte: end.toDate() } }
                ],
            }).then((todaycheckoutlogdoc) => __awaiter(this, void 0, void 0, function* () {
                for (let todaycheckout of todaycheckoutlogdoc) {
                    let bookingUuid = todaycheckout.payload.bookingUuid;
                    let referralbookingsdoc = yield bookingCollection
                        .find({
                        uuid: bookingUuid,
                        status: "VACATED",
                        referred_by: { $ne: null },
                        bookingCommission: { $ne: null },
                        $where: "this.bookedBy != this.referred_by"
                    });
                    for (let doc of referralbookingsdoc) {
                        booking_commission_referral = doc.bookingCommission.commission_amount_usd;
                        referral_earnings = referral_earnings + booking_commission_referral;
                        referral_bookings = referral_bookings + 1;
                    }
                }
            }));
            let bookedby;
            let guest_firstname;
            let guest_lastname;
            let user_firstname;
            let user_lastname;
            yield logCollection
                .find({
                type: LogLaw.Type.CHECK_OUT,
                $and: [
                    { moment: { $gte: begin.toDate(), } },
                    { moment: { $lte: end.toDate() } }
                ],
            }).then((todaycheckoutlogdoc) => __awaiter(this, void 0, void 0, function* () {
                for (let todaycheckout of todaycheckoutlogdoc) {
                    let bookingUuid = todaycheckout.payload.bookingUuid;
                    let selfbookingsdoc = yield bookingCollection
                        .find({
                        uuid: bookingUuid,
                        status: "VACATED",
                        referred_by: { $ne: null },
                        bookingCommission: { $ne: null },
                        $where: "this.bookedBy == this.referred_by"
                    });
                    for (let doc of selfbookingsdoc) {
                        bookedby = doc.bookedBy;
                        guest_firstname = doc.guest.firstName;
                        guest_lastname = doc.guest.lastName;
                        let userDocuments = yield usersCollection.find({
                            _user_id: bookedby
                        });
                        for (let user of userDocuments) {
                            user_firstname = user._first_name;
                            user_lastname = user._last_name;
                        }
                        if ((user_firstname.toUpperCase() === guest_firstname.toUpperCase()) && (user_lastname.toUpperCase() === guest_lastname.toUpperCase())) {
                            booking_commission_self = doc.bookingCommission.commission_amount_usd;
                            self_earnings = self_earnings + booking_commission_self;
                            self_bookings = self_bookings + 1;
                        }
                        else {
                            booking_commission_friends = doc.bookingCommission.commission_amount_usd;
                            friends_earnings = friends_earnings + booking_commission_friends;
                            friends_bookings = friends_bookings + 1;
                        }
                    }
                }
            }));
            total_bookings = referral_bookings + self_bookings + friends_bookings;
            total_earnings = referral_earnings + self_earnings + friends_earnings;
            let respond;
            let PastNidacash = {
                date: time_1.default.serverMoment.subtract(1, 'days').startOf('day').toDate(),
                signups: total_signups,
                signup_referrals: referral_signups,
                referrals: referrals,
                referral_bookings: referral_bookings,
                self_bookings: self_bookings,
                friends_bookings: friends_bookings,
                total_bookings: total_bookings,
                referral_earnings: referral_earnings,
                self_earnings: self_earnings,
                friends_earnings: friends_earnings,
                stay_earnings: total_earnings
            };
            let newPastNidacashData = past_nidacash_report_1.default.create(PastNidacash);
            let PastNidaCashCollection = core_1.default.app.get('mongoClient').get('past_nidacash');
            yield PastNidaCashCollection
                .insert(newPastNidacashData.document)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `New data has been created with id ${document._id}`
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
        DailySalesRouter.route('/manager/futurenidacashdata')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let referral_bookings = 0;
            let self_bookings = 0;
            let friends_bookings = 0;
            let total_bookings = 0;
            let referral_earnings = 0;
            let self_earnings = 0;
            let friends_earnings = 0;
            let total_earnings = 0;
            let booking_commission_referral;
            let booking_commission_self;
            let booking_commission_friends;
            let referralbookingsdoc = yield bookingCollection
                .find({
                $or: [
                    { status: InventoryLaw.BookingStatus.CHECK_IN },
                    { status: InventoryLaw.BookingStatus.OCCUPIED },
                    { status: InventoryLaw.BookingStatus.CONFIRMED }
                ],
                referred_by: { $ne: null },
                bookingCommission: { $ne: null },
                $where: "this.bookedBy != this.referred_by"
            });
            for (let doc of referralbookingsdoc) {
                booking_commission_referral = doc.bookingCommission.commission_amount_usd;
                referral_earnings = referral_earnings + booking_commission_referral;
                referral_bookings = referral_bookings + 1;
            }
            let bookedby;
            let guest_firstname;
            let guest_lastname;
            let user_firstname;
            let user_lastname;
            let selfbookingsdoc = yield bookingCollection
                .find({
                $or: [
                    { status: InventoryLaw.BookingStatus.CHECK_IN },
                    { status: InventoryLaw.BookingStatus.OCCUPIED },
                    { status: InventoryLaw.BookingStatus.CONFIRMED }
                ],
                referred_by: { $ne: null },
                bookingCommission: { $ne: null },
                $where: "this.bookedBy == this.referred_by"
            });
            for (let doc of selfbookingsdoc) {
                bookedby = doc.bookedBy;
                guest_firstname = doc.guest.firstName;
                guest_lastname = doc.guest.lastName;
                let userDocuments = yield usersCollection.find({
                    _user_id: bookedby
                });
                for (let user of userDocuments) {
                    user_firstname = user._first_name;
                    user_lastname = user._last_name;
                }
                if ((user_firstname.toUpperCase() === guest_firstname.toUpperCase()) && (user_lastname.toUpperCase() === guest_lastname.toUpperCase())) {
                    booking_commission_self = doc.bookingCommission.commission_amount_usd;
                    self_earnings = self_earnings + booking_commission_self;
                    self_bookings = self_bookings + 1;
                }
                else {
                    booking_commission_friends = doc.bookingCommission.commission_amount_usd;
                    friends_earnings = friends_earnings + booking_commission_friends;
                    friends_bookings = friends_bookings + 1;
                }
            }
            total_bookings = referral_bookings + self_bookings + friends_bookings;
            total_earnings = referral_earnings + self_earnings + friends_earnings;
            let respond;
            let FutureNidacash = {
                referral_bookings: referral_bookings,
                self_bookings: self_bookings,
                friends_bookings: friends_bookings,
                total_bookings: total_bookings,
                referral_earnings: referral_earnings,
                self_earnings: self_earnings,
                friends_earnings: friends_earnings,
                upcoming_earnings: total_earnings
            };
            let newFutureNidacashData = future_nidacash_report_1.default.create(FutureNidacash);
            let FutureNidaCashCollection = core_1.default.app.get('mongoClient').get('future_nidacash');
            yield FutureNidaCashCollection
                .insert(newFutureNidacashData.document)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `New data has been created with id ${document._id}`
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
        DailySalesRouter.route('/manager/past-nidacash')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let pastNidacashCollection = core_1.default.app.get('mongoClient').get('past_nidacash');
            let respond;
            let result = new Array();
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            let options = req.query.options;
            let responds;
            let overall_signups = 0;
            let overall_referrals = 0;
            let overall_signup_referrals = 0;
            let overall_referral_bookings = 0;
            let overall_self_bookings = 0;
            let overall_friends_bookings = 0;
            let overall_total_bookings = 0;
            let overall_referral_earnings = 0;
            let overall_self_earnings = 0;
            let overall_friends_earnings = 0;
            let overall_stay_earnings = 0;
            let total = new Array();
            let today = time_1.default.serverMoment.toDate();
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
            var Condition = {
                date: {
                    $gte: begin.toDate(),
                    $lte: end.toDate()
                },
            };
            pastNidacashCollection.find(Condition).then((Docs) => __awaiter(this, void 0, void 0, function* () {
                for (let doc of Docs) {
                    overall_signups = overall_signups + doc.signups;
                    overall_referrals = overall_referrals + doc.referrals;
                    overall_signup_referrals = overall_signup_referrals + doc.signup_referrals;
                    overall_referral_bookings = overall_referral_bookings + doc.referral_bookings;
                    overall_self_bookings = overall_self_bookings + doc.self_bookings;
                    overall_friends_bookings = overall_friends_bookings + doc.friends_bookings;
                    overall_total_bookings = overall_total_bookings + doc.total_bookings;
                    overall_referral_earnings = overall_referral_earnings + doc.referral_earnings;
                    overall_self_earnings = overall_self_earnings + doc.self_earnings;
                    overall_friends_earnings = overall_friends_earnings + doc.friends_earnings;
                    overall_stay_earnings = overall_stay_earnings + doc.stay_earnings;
                    result.push([
                        time_1.default.formatGivenDate(doc.date),
                        doc.signups,
                        doc.referrals,
                        doc.signup_referrals,
                        doc.referral_bookings,
                        doc.self_bookings,
                        doc.friends_bookings,
                        doc.total_bookings,
                        parseFloat(doc.referral_earnings).toFixed(2),
                        parseFloat(doc.self_earnings).toFixed(2),
                        parseFloat(doc.friends_earnings).toFixed(2),
                        parseFloat(doc.stay_earnings).toFixed(2)
                    ]);
                }
                yield total.push([
                    overall_signups,
                    overall_referrals,
                    overall_signup_referrals,
                    overall_referral_bookings,
                    overall_self_bookings,
                    overall_friends_bookings,
                    overall_total_bookings,
                    overall_referral_earnings.toFixed(2),
                    overall_self_earnings.toFixed(2),
                    overall_friends_earnings.toFixed(2),
                    overall_stay_earnings.toFixed(2)
                ]);
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared Past Nida cash data as requested`,
                    data: result,
                    footer: total
                };
                res.json(respond);
            }));
        }));
        DailySalesRouter.route('/manager/future-nidacash')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let futureNidacashCollection = core_1.default.app.get('mongoClient').get('future_nidacash');
            let respond;
            let result = new Array();
            futureNidacashCollection.find({}, { "sort": { "_id": -1 }, "limit": 1 })
                .then((Docs) => __awaiter(this, void 0, void 0, function* () {
                for (let doc of Docs) {
                    let date = time_1.default.formatGivenDate(doc.date);
                    result.push([
                        doc.referral_bookings,
                        doc.self_bookings,
                        doc.friends_bookings,
                        doc.total_bookings,
                        parseFloat(doc.referral_earnings).toFixed(2),
                        parseFloat(doc.self_earnings).toFixed(2),
                        parseFloat(doc.friends_earnings).toFixed(2),
                        parseFloat(doc.upcoming_earnings).toFixed(2)
                    ]);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Prepared Future Nida cash data as requested`,
                    data: result
                };
                res.json(respond);
            }));
        }));
        return DailySalesRouter;
    }
}
exports.default = ReportManager;
