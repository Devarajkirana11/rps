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
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const identification_1 = require("../../helpers/identification");
const guest_booking_1 = require("../../models/guest_booking/guest_booking");
const request_1 = require("../../helpers/request");
const time_1 = require("../../helpers/time");
const admin_1 = require("../admin/admin");
const FileManager_1 = require("../../helpers/FileManager");
const shared_hotels_1 = require("../../models/guest_booking/shared_hotels");
const time_2 = require("../../helpers/time");
const request_2 = require("../../helpers/request");
const log_1 = require("../../models/log/log");
const LogLaw = require("../../models/log/law");
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
class FrontEndController {
    static get routes() {
        let FrontEndRouter = express.Router();
        FrontEndRouter.route('/')
            .post(inputvalidator_1.default.GuestBookingValidate, function (req, res) {
            return __awaiter(this, void 0, void 0, function* () {
                let respond;
                let payment_type;
                let hotel_id = req.body.hotel_id;
                let number_of_guests = parseInt(req.body.totalAdults) + parseInt(req.body.totalkids);
                let eachRoomTypePrice = req.body.eachRoomTypePrice;
                let guest = {
                    firstName: req.body.firstname,
                    lastName: req.body.lastname,
                    phoneNumber: req.body.mobileno_stdcode + req.body.mobileno,
                    emailAddress: req.body.email,
                };
                let room_rate_array = new Array();
                let rate_date_range = {
                    check_in: time_1.default.formatGivenDate(req.body.check_in),
                    check_out: time_1.default.formatGivenDate(req.body.check_out),
                };
                yield request_2.default.post('/hotels-manager/manager/rates/sell/web', { hotel_uuid: hotel_id }, rate_date_range)
                    .then(response => {
                    response.data.rooms.forEach(function (value, index) {
                        if (value.costBreakdown.length > 0) {
                            room_rate_array[value.type] = value.costBreakdown;
                        }
                    });
                }).catch(error => {
                    console.log(error);
                });
                let collectedRoomTypes = new Array();
                req.body.roomTypesSelected.forEach(roomtype => {
                    eachRoomTypePrice.forEach(roomObj => {
                        if (roomObj.type == roomtype) {
                            collectedRoomTypes.push({ roomType: roomtype, no_of_rooms: roomObj.no_of_rooms });
                        }
                    });
                });
                let referred_by = null;
                let bookingCommission = null;
                if (req.session.referred_by && req.session.user === undefined) {
                    console.log('scenario 3');
                    referred_by = req.session.referred_by;
                    yield FrontEndController.commissionCalc(req.body.totalPriceWithoutTax, req.body.currencyCode)
                        .then(data => {
                        bookingCommission = data;
                    })
                        .catch(err => {
                        console.log(err);
                    });
                }
                else if (req.session.user && req.session.referred_by === undefined) {
                    console.log('scenario 1,2&5');
                    referred_by = req.session.user._user_id;
                    yield FrontEndController.commissionCalc(req.body.totalPriceWithoutTax, req.body.currencyCode)
                        .then(data => {
                        bookingCommission = data;
                    })
                        .catch(err => {
                        console.log(err);
                    });
                }
                else if (req.session.user && req.session.referred_by) {
                    console.log('scenario 4');
                    referred_by = req.session.referred_by;
                    yield FrontEndController.commissionCalc(req.body.totalPriceWithoutTax, req.body.currencyCode)
                        .then(data => {
                        bookingCommission = data;
                    })
                        .catch(err => {
                        console.log(err);
                    });
                }
                let user_uuid = '';
                if (req.session.user) {
                    user_uuid = req.session.user._user_id;
                }
                else {
                    user_uuid = '';
                }
                console.log('USERUUID', user_uuid);
                let inputvalues = {
                    status: "ON_HOLD",
                    number_of_guests: number_of_guests,
                    room_types: JSON.stringify(collectedRoomTypes),
                    check_in: time_1.default.formatGivenDate(req.body.check_in),
                    check_out: time_1.default.formatGivenDate(req.body.check_out),
                    guest: JSON.stringify(guest),
                    referred_by: referred_by,
                    bookingCommission: JSON.stringify(bookingCommission),
                    eachRoomTypePrice: JSON.stringify(eachRoomTypePrice),
                    dailyRates: JSON.stringify(room_rate_array),
                    user_uuid: user_uuid,
                    no_of_child: Number(req.body.totalkids)
                };
                if (req.body.paynow === true) {
                    payment_type = 'CREDIT_CARD';
                }
                else if (req.body.paynow === false) {
                    payment_type = 'CASH';
                }
                ;
                request_1.default.post('/inventory/booking/web', { hotel_uuid: req.body.hotel_id }, inputvalues)
                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (result.success) {
                        let newGuestBookingData = req.body;
                        newGuestBookingData['booking_id'] = result.data.uuid;
                        newGuestBookingData['guest_id'] = identification_1.default.generateUuid;
                        let newGuestBookingDetails = guest_booking_1.default.GuestBookingCreate(newGuestBookingData);
                        let newGuestBookingCollection = core_1.default.app.get('mongoClient').get('guest_booking_info');
                        let inputstatement;
                        inputstatement = newGuestBookingCollection.insert(newGuestBookingDetails);
                        yield inputstatement
                            .then(document => {
                            let depositAmount = 0;
                            if (req.body.deposit_amount) {
                                depositAmount = Number(req.body.totalRooms) * Number(req.body.deposit_amount);
                            }
                            request_1.default.post('/payment-manager/payment/deposit', {}, {
                                bookinguuid: result.data.uuid,
                                hoteluuid: req.body.hotel_id,
                                depositAmount: depositAmount,
                                depositCollected: 0
                            }).then(depositresponse => {
                                request_1.default.post('/payment-manager/payment/booking', null, {
                                    "bookinguuid": result.data.uuid,
                                    "paymentReferrenceId": "",
                                    "totalRoomPrice": req.body.totalPriceWithoutTax,
                                    "discountType": "FLAT",
                                    "discountValue": 0,
                                    "discountAmount": 0,
                                    "priceAfterDiscount": req.body.totalPriceWithoutTax,
                                    "serviceFee": req.body.ServiceFee,
                                    "tax": req.body.totalTax,
                                    "tourismTax": req.body.tourismTax,
                                    "totalAmountPaid": req.body.totalPriceWithTax,
                                    "totalAmount": req.body.totalPriceWithTax,
                                    "paymentType": payment_type,
                                    "paymentStatus": "ON_HOLD",
                                    "currency": req.body.currencyCode,
                                    "tourismTaxIncluded": (req.body.tourismTax > 0 ? 'Yes' : 'No'),
                                    "depositAmount": depositAmount,
                                    "depositIncluded": 'No',
                                    "remainingAmount": req.body.totalPriceWithTax,
                                    "hoteluuid": hotel_id,
                                    "booking_channel": "WEB",
                                }).then(payresult => {
                                    if (payresult.success) {
                                        FrontEndController.RegisterUserOnBooking(guest)
                                            .then(result => {
                                            return res.status(200).json(payresult);
                                        }).catch(err => {
                                            return res.status(200).json({ success: false, message: "Guest User Registration Failed!" });
                                        });
                                    }
                                    else {
                                        return res.status(400).json({
                                            success: false,
                                            message: "Payment method " + payresult.message
                                        });
                                    }
                                }).catch(error => {
                                    return res.status(400).json({
                                        success: false,
                                        message: "Payment Method " + error.message
                                    });
                                });
                            }).catch(error => {
                                return res.status(400).json({
                                    success: false,
                                    message: "Deposit Method " + error.message
                                });
                            });
                        })
                            .catch(error => {
                            return res.status(400).json({
                                success: false,
                                message: "Guest Booking " + error.message
                            });
                        });
                    }
                    else {
                        return res.status(400).json({
                            success: false,
                            message: "Inventory " + result.message
                        });
                    }
                })).catch(error => {
                    return res.status(400).json({
                        success: false,
                        message: "Inventory " + error.message
                    });
                });
            });
        });
        FrontEndRouter.route('/:email/getAllBookings')
            .post(function (req, res) {
            return __awaiter(this, void 0, void 0, function* () {
                let respond;
                MongoClient.connect(app_1.environments[process.env.ENV].mongoDBUrl, function (err, db) {
                    let options = req.body;
                    let columns = req.body.columns;
                    let rowlength = req.body.length;
                    let CustomizedQuery = {};
                    let reservationQuery = {};
                    if (req.body.columns !== undefined) {
                        let columns = req.body.columns;
                        columns.forEach(column => {
                            if (column.name == "checkIn" && column.searchable == "false" && column.search.value != "") {
                                let inputvalue = JSON.parse(column.search.value);
                                let date;
                                date = time_2.default.serverMomentInPattern(inputvalue.date, "YYYY-MM-DD");
                                date.set({ 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0 });
                                if (inputvalue.type == 'checkIn') {
                                    reservationQuery['checkIn'] = {};
                                    reservationQuery['checkIn']["$gte"] = date.toDate();
                                }
                                else if (inputvalue.type == 'all') {
                                    reservationQuery = {};
                                }
                            }
                            else if (column.name == "checkOut" && column.searchable == "false" && column.search.value != "") {
                                let inputvalue = JSON.parse(column.search.value);
                                let date;
                                date = time_2.default.serverMomentInPattern(inputvalue.date, "YYYY-MM-DD");
                                date.set({ 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 0 });
                                if (inputvalue.type == 'checkOut') {
                                    reservationQuery['checkOut'] = {};
                                    reservationQuery['checkOut']["$lte"] = date.toDate();
                                }
                            }
                        });
                    }
                    console.log(reservationQuery);
                    let NewArr = new Array();
                    NewArr.push({ 'referred_by': req.session.user._user_id });
                    NewArr.push({ 'guest.emailAddress': (req.params.email !== null && req.params.email !== undefined ? req.params.email : '') });
                    CustomizedQuery['$or'] = NewArr;
                    options.customQuery = CustomizedQuery;
                    options.caseInsensitiveSearch = true;
                    new MongoDataTable(db).get('Booking', options, function (err, result) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                res.status(500);
                                respond = {
                                    success: false,
                                    message: err.message,
                                };
                            }
                            let newData = new Array();
                            let finalData = new Array();
                            let bookingUuids = new Array();
                            if (result.data !== undefined) {
                                result.data.forEach(booking => {
                                    let bookingRow = booking;
                                    bookingUuids.push(booking.uuid);
                                    newData.push(bookingRow);
                                });
                            }
                            let bookingCollection = core_1.default.app.get('mongoClient').get('booking');
                            yield bookingCollection
                                .find(CustomizedQuery)
                                .then(bookings => {
                                if (bookings.length > 0) {
                                    result.recordsTotal = bookings.length;
                                    result.recordsFiltered = result.recordsTotal;
                                }
                            });
                            let filteredLength = 0;
                            let reservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
                            yield reservationCollection
                                .find(reservationQuery)
                                .then(reservations => {
                                if (reservations.length) {
                                    reservations.forEach(reservation => {
                                        newData.forEach((booking, index) => {
                                            if (booking.uuid == reservation.bookingUuid) {
                                                filteredLength++;
                                                let newRow = {};
                                                newRow['ShortBookingId'] = booking.referenceId;
                                                newRow['BookingtStatus'] = booking.status;
                                                newRow['checkIn'] = time_2.default.formatGivenDate(reservation.checkIn);
                                                newRow['checkOut'] = time_2.default.formatGivenDate(reservation.checkOut);
                                                newRow['bookingUuid'] = booking.uuid;
                                                newRow['uuid'] = booking.uuid;
                                                newRow['status'] = booking.status;
                                                newRow['referenceId'] = booking.referenceId;
                                                newRow['totalAmount'] = 0;
                                                if (booking.status != 'ON_HOLD' && booking.status != 'CANCELLED') {
                                                    newRow['invoiceurl'] = '<a class="btn btn-success" target="_blank" href="/pms/pdf-generation?booking_uuid=' + booking.uuid + '">Invoice</a>';
                                                }
                                                else {
                                                    newRow['invoiceurl'] = '';
                                                }
                                                finalData.push(newRow);
                                            }
                                        });
                                    });
                                }
                            })
                                .catch(err => {
                                console.log(err);
                            });
                            let paymentCollection = core_1.default.app.get('mongoClient').get('payments');
                            yield paymentCollection
                                .find({ bookinguuid: { $in: bookingUuids } })
                                .then(payments => {
                                if (payments.length) {
                                    payments.forEach(payment => {
                                        finalData.forEach((booking, index) => {
                                            if (payment.bookinguuid == booking.uuid) {
                                                finalData[index]['totalAmount'] = parseFloat(payment.totalAmount).toFixed(2);
                                            }
                                        });
                                    });
                                }
                            })
                                .catch(err => {
                                console.log(err);
                            });
                            result.recordsTotal = result.recordsFiltered;
                            result.data = finalData;
                            res.status(200);
                            respond = {
                                success: true,
                                message: 'All Bookings have been fetched',
                                Tabledata: result
                            };
                            res.json(respond);
                        });
                    });
                });
            });
        });
        FrontEndRouter
            .route('/country')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let countriesCollection = core_1.default.app.get('mongoClient').get('Country');
            let respond;
            yield countriesCollection
                .find()
                .then((countries) => __awaiter(this, void 0, void 0, function* () {
                countries.map(e => {
                    delete e['_id'];
                    delete e['code'];
                    delete e['iso'];
                    delete e['currency'];
                    delete e['states'];
                });
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning all countries`,
                    data: countries
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        FrontEndRouter
            .route('/country/code')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let countriesCollection = core_1.default.app.get('mongoClient').get('Country');
            let countryName = req.query.country_name;
            let respond;
            yield countriesCollection
                .findOne({
                name: countryName
            })
                .then((country) => __awaiter(this, void 0, void 0, function* () {
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning country code`,
                    data: {
                        code: country.code
                    }
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        FrontEndRouter.route('/getHotelLandmarks')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let HotelLandmarks = core_1.default.app.get('mongoClient').get('hotel_landmarks');
            let respond;
            let landmark_array = [];
            let hotelLandmarks;
            yield HotelLandmarks.aggregate([
                {
                    $lookup: {
                        from: 'nearby_landmarks',
                        localField: '_landmark_id',
                        foreignField: '_landmark_id',
                        as: 'landmarkdetails'
                    }
                },
                {
                    $match: { "_hotel_id": hotel_id, "landmarkdetails._category": { $nin: ["Essentials", "Airports", "ATM/Banks", "Supermarkets", "Public Transportation", "Medical", "Emergency"] } }
                }
            ])
                .then((landmarks) => __awaiter(this, void 0, void 0, function* () {
                let fids = [];
                Object.keys(landmarks).forEach(key => {
                    landmarks[key].landmarkdetails = landmarks[key].landmarkdetails[0];
                    if (landmarks[key].landmarkdetails._landmark_images != "") {
                        if (landmarks[key].landmarkdetails._landmark_images.constructor === String) {
                            fids = fids.concat(admin_1.default.convertImageStringsToArray(landmarks[key].landmarkdetails._landmark_images));
                        }
                        else if (landmarks[key].landmarkdetails._landmark_images.constructor === Array) {
                            fids = fids.concat(landmarks[key].landmarkdetails._landmark_images);
                        }
                    }
                });
                let links = yield FileManager_1.default.getFiles(JSON.stringify(fids), 'small');
                if (links.success) {
                    for (var index = 0; index < links.data.length; index++) {
                        for (var i = 0; i < landmarks.length; i++) {
                            if (landmarks[i].landmarkdetails._landmark_images.indexOf(links.fids[index]) >= 0) {
                                landmarks[i].landmarkdetails._landmark_images = links.data[index];
                                break;
                            }
                        }
                    }
                }
                let temp_arr = new Array();
                landmarks.forEach(landmark => {
                    if (temp_arr.indexOf(landmark.landmarkdetails._category) < 0) {
                        temp_arr.push(landmark.landmarkdetails._category);
                    }
                });
                let final_arr = {};
                temp_arr.forEach(tempCat => {
                    final_arr[tempCat] = new Array();
                    landmarks.forEach(landmark => {
                        if (tempCat == landmark.landmarkdetails._category) {
                            final_arr[tempCat].push(landmark);
                        }
                    });
                });
                return res.status(200).json({ success: true, data: final_arr });
            }))
                .catch(error => {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            });
        }));
        FrontEndRouter.route('/refer-earn/share-hotel')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let referraldata = {
                type: LogLaw.Type.REFERRALS,
                by: req.body.params.user_id,
                payload: {
                    refer_type: req.body.params.share_type,
                    hotel_id: req.body.params.hotel_id,
                }
            };
            let referralLog = log_1.default.create(referraldata);
            let logCollections = core_1.default.app.get('mongoClient').get('Log');
            logCollections.insert(referralLog.document);
            let respond;
            let sharedhotelDetailsData = req.body.params;
            let newSharedHotel = shared_hotels_1.default.create(sharedhotelDetailsData);
            let SharedHotelsDetailsCoolection = core_1.default.app.get('mongoClient').get('shared_hotels');
            yield SharedHotelsDetailsCoolection
                .insert(newSharedHotel)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `success`
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
        FrontEndRouter.route('/getConvertionRates')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            request_2.default.ext_get('http://dev.ezplor.com/admin/structure/taxonomy/manage/currency/rate', {})
                .then(Currencyrates => {
                res.status(200).json({ success: true, rates: Currencyrates });
            })
                .catch(err => {
                res.status(200).json({ success: true, message: err });
            });
        }));
        FrontEndRouter.route('/getEssentials')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let HotelLandmarks = core_1.default.app.get('mongoClient').get('hotel_landmarks');
            let respond;
            let landmark_array = [];
            let hotelLandmarks;
            yield HotelLandmarks.aggregate([
                {
                    $lookup: {
                        from: 'nearby_landmarks',
                        localField: '_landmark_id',
                        foreignField: '_landmark_id',
                        as: 'landmarkdetails'
                    }
                },
                {
                    $match: { "_hotel_id": hotel_id, "landmarkdetails._category": { $in: ["Airports", "ATM/Banks", "Supermarkets", "Public Transportation", "Medical"] } }
                }
            ])
                .then(landmarks => {
                Object.keys(landmarks).forEach(key => {
                    landmarks[key].landmarkdetails = landmarks[key].landmarkdetails[0];
                });
                let temp_arr = new Array();
                landmarks.forEach(landmark => {
                    if (temp_arr.indexOf(landmark.landmarkdetails._category) < 0) {
                        temp_arr.push(landmark.landmarkdetails._category);
                    }
                });
                let final_arr = {};
                temp_arr.forEach(tempCat => {
                    final_arr[tempCat] = new Array();
                    landmarks.forEach(landmark => {
                        if (tempCat == landmark.landmarkdetails._category) {
                            final_arr[tempCat].push(landmark);
                        }
                    });
                });
                return res.status(200).json({ success: true, data: final_arr });
            })
                .catch(error => {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            });
        }));
        return FrontEndRouter;
    }
    static RegisterUserOnBooking(userinfo) {
        return new Promise(function (resolve, reject) {
            let newUser = {
                first_name: userinfo.firstName,
                last_name: userinfo.lastName,
                email: userinfo.emailAddress,
                username: userinfo.emailAddress,
                password: '',
                roles: ["9"],
                status: 'Inactive',
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: ''
            };
            request_1.default.get('/user-manager/' + userinfo.emailAddress + '/get_user_by_email', { type: 'validation' })
                .then(response => {
                if (response.success && response.data.length > 0) {
                    resolve(true);
                }
                else {
                    request_1.default.post('/user-manager/user-register', {}, { params: newUser })
                        .then(api_result => {
                        if (api_result.success) {
                            resolve(true);
                        }
                        else {
                            reject(false);
                        }
                    })
                        .catch(err => {
                        reject(false);
                    });
                }
            }).catch(error => {
                reject(false);
            });
        });
    }
    static commissionCalc(totalPriceWithoutTax, currencyCode) {
        return new Promise(function (resolve, reject) {
            const exchange_rates = { MYR: 4.05, THB: 32.50 };
            let exchange_rate = 0;
            request_2.default.ext_get('http://dev.ezplor.com/admin/structure/taxonomy/manage/currency/rate', {})
                .then(Currencyrates => {
                if (Currencyrates.constructor === Array) {
                    if (Currencyrates.length > 0) {
                        Currencyrates.forEach(rate => {
                            if (rate.field_currency_code == currencyCode) {
                                exchange_rate = rate.field_currency_rate;
                            }
                        });
                        if (exchange_rate == 0) {
                            exchange_rate = exchange_rates[currencyCode];
                        }
                    }
                    else {
                        reject({ success: false, message: 'Currency rate array length is zero' });
                    }
                    if (exchange_rate != 0) {
                        let totalWithoutTax = Number(totalPriceWithoutTax);
                        let commPerc = 7;
                        let bookingCommission = {
                            total_payment: totalWithoutTax,
                            commission_perc: commPerc,
                            commission_amount: (Number(totalWithoutTax) * Number(commPerc)) / 100,
                            exchange_rate: exchange_rate,
                        };
                        bookingCommission['commission_amount_usd'] = Number(bookingCommission.commission_amount) / Number(bookingCommission.exchange_rate);
                        resolve(bookingCommission);
                    }
                    else {
                        reject({ success: false, message: 'Could not match exchange rate by country code' });
                    }
                }
                else {
                    reject({ success: false, message: 'currenty rate API result is not an array' });
                }
            })
                .catch(err => {
                reject({ success: false, message: err });
            });
        });
    }
    static cleanArray(actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }
}
exports.default = FrontEndController;
