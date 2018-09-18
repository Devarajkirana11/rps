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
const Law = require("../../models/cashier/law");
const cashier_1 = require("../../models/cashier/cashier");
const time_1 = require("../../helpers/time");
const LogLaw = require("../../models/log/law");
const log_1 = require("../../models/log/log");
const moment = require('moment');
class CashierManager {
    static get routes() {
        let CashierRouter = express.Router();
        let cashierCollection = core_1.default.app.get('mongoClient').get('Cashier');
        cashierCollection.createIndex({ uuid: 1 }, { unique: true });
        let paymentCollection = core_1.default.app.get('mongoClient').get('payments');
        let depositCollection = core_1.default.app.get('mongoClient').get('deposit');
        let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let roomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
        let bookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let logCollection = core_1.default.app.get('mongoClient').get('Log');
        CashierRouter.route('/open')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let respond;
            yield cashierCollection
                .findOne({
                hotelUuid: hotelUuid,
                status: Law.CashierStatus.LATEST
            })
                .then(cashierDocument => {
                if (cashierDocument !== null) {
                    let latestCashier = cashier_1.Cashier.spawn(cashierDocument);
                    let openingBalance = 0;
                    if (latestCashier.hasNoShift) {
                        openingBalance = latestCashier.openingBalance;
                    }
                    else {
                        openingBalance = latestCashier.closingBalance;
                    }
                    res.status(200);
                    respond = {
                        success: true,
                        message: 'You are expected to have an opening balance of...',
                        data: {
                            openingBalance: openingBalance !== null ? openingBalance : 0
                        }
                    };
                }
                else {
                    res.status(200);
                    respond = {
                        success: true,
                        message: 'You are about to take over the first shift ever in the hotel, Woah!',
                        data: {
                            openingBalance: 0
                        }
                    };
                }
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let userUuid = req.body.user_uuid;
            let topUpFloat = Number(req.body.top_up_float);
            let respond;
            yield cashierCollection
                .findOne({
                hotelUuid: hotelUuid,
                status: Law.CashierStatus.LATEST
            })
                .then((cashierDocument) => __awaiter(this, void 0, void 0, function* () {
                if (cashierDocument === null) {
                    let newCashier = cashier_1.Cashier.create({
                        hotelUuid: hotelUuid,
                        openingBalance: 0
                    });
                    newCashier.takeOver(topUpFloat, userUuid);
                    yield cashierCollection.insert(newCashier.document);
                    let data = {
                        type: LogLaw.Type.SHIFT_OPENING,
                        by: userUuid,
                        payload: {
                            hotelUuid: hotelUuid,
                            topUpFloat: topUpFloat,
                            openingBalance: 0
                        }
                    };
                    let shiftOpeningLog = log_1.default.create(data);
                    let logCollection = core_1.default.app.get('mongoClient').get('Log');
                    logCollection.insert(shiftOpeningLog.document);
                    res.status(200);
                    respond = {
                        success: true,
                        message: 'The first shift ever has been opened in the hotel. Congratz!'
                    };
                }
                else {
                    let latestCashier = cashier_1.Cashier.spawn(cashierDocument);
                    if (latestCashier.hasNoOpenShift) {
                        latestCashier.takeOver(topUpFloat, userUuid);
                        yield cashierCollection.update({
                            uuid: latestCashier.uuid
                        }, latestCashier.document);
                        let data = {
                            type: LogLaw.Type.SHIFT_OPENING,
                            by: userUuid,
                            payload: {
                                hotelUuid: hotelUuid,
                                topUpFloat: topUpFloat,
                                openingBalance: latestCashier.openingBalance
                            }
                        };
                        let shiftOpeningLog = log_1.default.create(data);
                        let logCollection = core_1.default.app.get('mongoClient').get('Log');
                        logCollection.insert(shiftOpeningLog.document);
                        res.status(200);
                        respond = {
                            success: true,
                            message: 'You have taken over a new shift. Congratz!'
                        };
                    }
                    else {
                        res.status(400);
                        respond = {
                            success: false,
                            message: 'Not allowed to open a shift while there is an on-going shift'
                        };
                    }
                }
            }))
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        CashierRouter.route('/close')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let respond;
            yield cashierCollection
                .findOne({
                hotelUuid: hotelUuid,
                status: Law.CashierStatus.LATEST
            })
                .then((cashierDocument) => __awaiter(this, void 0, void 0, function* () {
                if (cashierDocument !== null) {
                    let latestCashier = cashier_1.Cashier.spawn(cashierDocument);
                    if (!latestCashier.hasNoOpenShift) {
                        let walkInCash = 0;
                        let walkInCreditCard = 0;
                        let walkInPos = 0;
                        let walkInCityLedger = 0;
                        let payAtHotelPos = 0;
                        let payAtHotelCash = 0;
                        let payAtHotelCityLedger = 0;
                        let payAtHotelCreditCard = 0;
                        let tourismCash = 0;
                        let tourismCreditCard = 0;
                        let tourismPos = 0;
                        let tourismCityLedger = 0;
                        let depositCollectedCash = 0;
                        let depositCollectedCreditCard = 0;
                        let depositCollectedPos = 0;
                        let depositCollectedCityLedger = 0;
                        let paymentDocuments = yield paymentCollection.find({
                            hoteluuid: hotelUuid,
                            "transactionDetails.0.paymentStatus": "CONFIRMED",
                            "transactionDetails.0.updatedOn": {
                                $gte: latestCashier.openShift.begin,
                                $lte: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                            }
                        });
                        for (let document of paymentDocuments) {
                            let payment = document;
                            if (payment.transactionDetails.length > 0) {
                                let transactionDetails = payment.transactionDetails[0];
                                if (payment.booking_channel == 'WALK_IN' || payment.booking_channel == 'OTA' || payment.booking_channel == 'WEB' || payment.booking_channel == 'CORPORATE' || payment.booking_channel == 'AGENT') {
                                    if (transactionDetails.paymentType == 'CASH') {
                                        walkInCash = walkInCash + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'CREDIT_CARD' || transactionDetails.paymentType == 'Paid Online') {
                                        walkInCreditCard = walkInCreditCard + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'POS' || transactionDetails.paymentType == 'BANK_TRANSFER') {
                                        walkInPos = walkInPos + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'CITY_LEDGER') {
                                        walkInCityLedger = walkInCityLedger + transactionDetails.Amount;
                                    }
                                }
                                else if (payment.booking_channel == 'WEB') {
                                    if (transactionDetails.paymentType == 'CASH') {
                                        payAtHotelCash = payAtHotelCash + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentStatus == 'CONFIRMED' && transactionDetails.paymentType == 'CREDIT_CARD') {
                                        payAtHotelCreditCard = payAtHotelCreditCard + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentStatus == 'CONFIRMED' && transactionDetails.paymentType == 'POS' || transactionDetails.paymentType == 'BANK_TRANSFER') {
                                        payAtHotelPos = payAtHotelPos + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentStatus == 'CONFIRMED' && transactionDetails.paymentType == 'CITY_LEDGER') {
                                        payAtHotelCityLedger = payAtHotelCityLedger + transactionDetails.Amount;
                                    }
                                }
                            }
                        }
                        let depositCollected = 0;
                        let depositRefund = 0;
                        let lossDamageFee = 0;
                        let depositDocuments = yield paymentCollection.find({
                            hoteluuid: hotelUuid,
                            "depositDetails.0.updatedOn": {
                                $gte: latestCashier.openShift.begin,
                                $lte: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                            }
                        });
                        for (let document of depositDocuments) {
                            let deposit = document.depositDetails[0];
                            if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CASH') {
                                depositCollectedCash = depositCollectedCash + deposit.depositCollected;
                            }
                            else if (deposit.depositCollectedDate >= latestCashier.openShift.begin && deposit.depositRefunded > 0 && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CASH') {
                                depositCollectedCash = depositCollectedCash + deposit.depositCollected;
                            }
                            else if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CREDIT_CARD' || deposit.paymentType == 'Paid Online') {
                                depositCollectedCreditCard = depositCollectedCreditCard + deposit.depositCollected;
                            }
                            else if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'POS' || deposit.paymentType == 'BANK_TRANSFER') {
                                depositCollectedPos = depositCollectedPos + deposit.depositCollected;
                            }
                            else if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CITY_LEDGER') {
                                depositCollectedCityLedger = depositCollectedCityLedger + deposit.depositCollected;
                            }
                            if (deposit.depositRefunded !== null && deposit.depositRefunded !== undefined) {
                                depositRefund = Number(depositRefund) + Number(deposit.depositRefunded);
                            }
                            if (deposit.lossDamageFee !== null && deposit.lossDamageFee !== undefined) {
                                lossDamageFee = Number(lossDamageFee) + Number(deposit.lossDamageFee);
                            }
                        }
                        let tourismDocuments = yield paymentCollection.find({
                            hoteluuid: hotelUuid,
                            "tourismtaxDetails.0.paymentStatus": "CONFIRMED",
                            "tourismtaxDetails.0.updatedOn": {
                                $gte: latestCashier.openShift.begin,
                                $lte: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                            }
                        });
                        for (let document of tourismDocuments) {
                            let tourism = document.tourismtaxDetails[0];
                            if (tourism.paymentType == 'CASH') {
                                tourismCash = Number(tourismCash) + Number(tourism.Amount);
                            }
                            else if (tourism.paymentType == 'CREDIT_CARD') {
                                tourismCreditCard = Number(tourismCreditCard) + Number(tourism.Amount);
                            }
                            else if (tourism.paymentType == 'BANK_TRANSFER' || tourism.paymentType == 'POS') {
                                tourismPos = Number(tourismPos) + Number(tourism.Amount);
                            }
                            else if (tourism.paymentType == 'CITY_LEDGER') {
                                tourismCityLedger = Number(tourismCityLedger) + Number(tourism.Amount);
                            }
                        }
                        res.status(200);
                        respond = {
                            success: true,
                            message: 'Ensure your closing balance is as exact as details below!',
                            data: {
                                userUuid: latestCashier.openShift.userUuid,
                                begin: latestCashier.openShift.begin,
                                end: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate(),
                                openingBalance: latestCashier.openShift.openingBalance,
                                topUpFloat: latestCashier.openShift.topUpFloat,
                                openingFloat: latestCashier.openShift.openingFloat,
                                walkIn: {
                                    cash: walkInCash,
                                    creditCard: walkInCreditCard,
                                    pos: walkInPos,
                                    cityLedger: walkInCityLedger,
                                    total: walkInCash + walkInCreditCard + walkInPos + walkInCityLedger
                                },
                                payAtHotel: {
                                    cash: payAtHotelCash,
                                    creditCard: payAtHotelCreditCard,
                                    pos: payAtHotelPos,
                                    cityLedger: payAtHotelCityLedger,
                                    total: payAtHotelCash + payAtHotelCreditCard + payAtHotelPos + payAtHotelCityLedger
                                },
                                tourismTax: {
                                    cash: tourismCash,
                                    creditCard: tourismCreditCard,
                                    pos: tourismPos,
                                    cityLedger: tourismCityLedger,
                                    total: Number(tourismCash) + Number(tourismCreditCard) + Number(tourismPos) + Number(tourismCityLedger)
                                },
                                depositCollected: {
                                    cash: depositCollectedCash,
                                    creditCard: depositCollectedCreditCard,
                                    pos: depositCollectedPos,
                                    cityLedger: depositCollectedCityLedger,
                                    total: Number(depositCollectedCash) + Number(depositCollectedCreditCard) + Number(depositCollectedPos) + Number(depositCollectedCityLedger)
                                },
                                depositRefund: Number(depositRefund),
                                lossDamageFee: lossDamageFee,
                                bookingRefund: Number('0')
                            }
                        };
                    }
                    else {
                        res.status(400);
                        respond = {
                            success: false,
                            message: 'Oops, found no open shift to close'
                        };
                    }
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: 'Not allowed to close a shift before being opened'
                    };
                }
            }))
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let userUuid = req.body.user_uuid;
            let miscellaneous = JSON.parse(req.body.miscellaneous);
            let withdrawal = req.body.withdrawal ? req.body.withdrawal : 0;
            let respond;
            yield cashierCollection
                .findOne({
                hotelUuid: hotelUuid,
                status: Law.CashierStatus.LATEST
            })
                .then((cashierDocument) => __awaiter(this, void 0, void 0, function* () {
                if (cashierDocument !== null) {
                    let latestCashier = cashier_1.Cashier.spawn(cashierDocument);
                    if (!latestCashier.hasNoOpenShift) {
                        let walkInCash = 0;
                        let walkInPos = 0;
                        let walkInCityLedger = 0;
                        let payAtHotelPos = 0;
                        let walkInCreditCard = 0;
                        let payAtHotelCash = 0;
                        let payAtHotelCreditCard = 0;
                        let payAtHotelCityLedger = 0;
                        let tourismCash = 0;
                        let tourismCreditCard = 0;
                        let tourismPos = 0;
                        let tourismCityLedger = 0;
                        let depositCollectedCash = 0;
                        let depositCollectedCreditCard = 0;
                        let depositCollectedPos = 0;
                        let depositCollectedCityLedger = 0;
                        let paymentDocuments = yield paymentCollection.find({
                            hoteluuid: hotelUuid,
                            "transactionDetails.0.paymentStatus": "CONFIRMED",
                            "transactionDetails.0.updatedOn": {
                                $gte: latestCashier.openShift.begin,
                                $lte: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                            }
                        });
                        for (let document of paymentDocuments) {
                            let payment = document;
                            if (payment.transactionDetails.length > 0) {
                                let transactionDetails = payment.transactionDetails[0];
                                if (payment.booking_channel == 'WALK_IN' || payment.booking_channel == 'OTA' || payment.booking_channel == 'WEB' || payment.booking_channel == 'CORPORATE' || payment.booking_channel == 'AGENT') {
                                    if (transactionDetails.paymentType == 'CASH') {
                                        walkInCash = walkInCash + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'CREDIT_CARD' || transactionDetails.paymentType == 'Paid Online') {
                                        walkInCreditCard = walkInCreditCard + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'POS' || transactionDetails.paymentType == 'BANK_TRANSFER') {
                                        walkInPos = walkInPos + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'CITY_LEDGER') {
                                        walkInCityLedger = walkInCityLedger + transactionDetails.Amount;
                                    }
                                }
                                else if (payment.booking_channel == 'WEB') {
                                    if (transactionDetails.paymentType == 'CASH') {
                                        payAtHotelCash = payAtHotelCash + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'CREDIT_CARD') {
                                        payAtHotelCreditCard = payAtHotelCreditCard + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'POS' || transactionDetails.paymentType == 'BANK_TRANSFER') {
                                        payAtHotelPos = payAtHotelPos + transactionDetails.Amount;
                                    }
                                    else if (transactionDetails.paymentType == 'CITY_LEDGER') {
                                        payAtHotelCityLedger = payAtHotelCityLedger + transactionDetails.Amount;
                                    }
                                }
                            }
                        }
                        let depositCollected = 0;
                        let depositRefund = 0;
                        let lossDamageFee = 0;
                        let depositDocuments = yield paymentCollection.find({
                            hoteluuid: hotelUuid,
                            "depositDetails.0.updatedOn": {
                                $gte: latestCashier.openShift.begin,
                                $lte: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                            }
                        });
                        for (let document of depositDocuments) {
                            let deposit = document.depositDetails[0];
                            if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CASH') {
                                console.log(document.bookinguuid);
                                depositCollectedCash = depositCollectedCash + deposit.depositCollected;
                            }
                            else if (deposit.depositCollectedDate >= latestCashier.openShift.begin && deposit.depositRefunded > 0 && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CASH') {
                                console.log(document.bookinguuid);
                                depositCollectedCash = depositCollectedCash + deposit.depositCollected;
                            }
                            else if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CREDIT_CARD' || deposit.paymentType == 'Paid Online') {
                                depositCollectedCreditCard = depositCollectedCreditCard + deposit.depositCollected;
                            }
                            else if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'POS' || deposit.paymentType == 'BANK_TRANSFER') {
                                depositCollectedPos = depositCollectedPos + deposit.depositCollected;
                            }
                            else if (!deposit.depositRefunded && deposit.paymentStatus == 'CONFIRMED' && deposit.paymentType == 'CITY_LEDGER') {
                                depositCollectedCityLedger = depositCollectedCityLedger + deposit.depositCollected;
                            }
                            if (deposit.depositRefunded !== null && deposit.depositRefunded !== undefined) {
                                depositRefund = Number(depositRefund) + Number(deposit.depositRefunded);
                            }
                            if (deposit.lossDamageFee !== null && deposit.lossDamageFee !== undefined) {
                                lossDamageFee = Number(lossDamageFee) + Number(deposit.lossDamageFee);
                            }
                        }
                        let tourismDocuments = yield paymentCollection.find({
                            hoteluuid: hotelUuid,
                            "tourismtaxDetails.0.paymentStatus": "CONFIRMED",
                            "tourismtaxDetails.0.updatedOn": {
                                $gte: latestCashier.openShift.begin,
                                $lte: time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate()
                            }
                        });
                        for (let document of tourismDocuments) {
                            let tourism = document.tourismtaxDetails[0];
                            if (tourism.paymentType == 'CASH') {
                                tourismCash = Number(tourismCash) + Number(tourism.Amount);
                            }
                            else if (tourism.paymentType == 'CREDIT_CARD') {
                                tourismCreditCard = Number(tourismCreditCard) + Number(tourism.Amount);
                            }
                            else if (tourism.paymentType == 'BANK_TRANSFER' || tourism.paymentType == 'POS') {
                                tourismPos = Number(tourismPos) + Number(tourism.Amount);
                            }
                            else if (tourism.paymentType == 'CITY_LEDGER') {
                                tourismCityLedger = Number(tourismCityLedger) + Number(tourism.Amount);
                            }
                        }
                        latestCashier.handOver({
                            walkIn: {
                                cash: Number(walkInCash),
                                creditCard: Number(walkInCreditCard),
                                pos: Number(walkInPos),
                                cityLedger: Number(walkInCityLedger),
                                total: Number(walkInCash) + Number(walkInCreditCard) + Number(walkInPos) + Number(walkInCityLedger)
                            },
                            payAtHotel: {
                                cash: Number(payAtHotelCash),
                                creditCard: Number(payAtHotelCreditCard),
                                pos: Number(payAtHotelPos),
                                cityLedger: Number(payAtHotelCityLedger),
                                total: Number(payAtHotelCash) + Number(payAtHotelCreditCard) + Number(payAtHotelPos) + Number(payAtHotelCityLedger)
                            },
                            tourismTax: {
                                cash: Number(tourismCash),
                                creditCard: Number(tourismCreditCard),
                                pos: Number(tourismPos),
                                cityLedger: Number(tourismCityLedger),
                                total: Number(tourismCash) + Number(tourismCreditCard) + Number(tourismPos) + Number(tourismCityLedger)
                            },
                            depositCollected: {
                                cash: Number(depositCollectedCash),
                                creditCard: Number(depositCollectedCreditCard),
                                pos: Number(depositCollectedPos),
                                cityLedger: Number(depositCollectedCityLedger),
                                total: Number(depositCollectedCash) + Number(depositCollectedCreditCard) + Number(depositCollectedPos) + Number(depositCollectedCityLedger)
                            },
                            depositRefund: Number(depositRefund),
                            withdrawal: Number(withdrawal),
                            lossDamageFee: Number(lossDamageFee),
                            bookingRefund: 0,
                            miscellaneous: miscellaneous
                        });
                        yield cashierCollection.update({
                            uuid: latestCashier.uuid
                        }, latestCashier.document);
                        let data = {
                            type: LogLaw.Type.SHIFT_CLOSING,
                            by: latestCashier.uuid,
                            payload: {
                                hotelUuid: hotelUuid,
                                walkIn: walkInCash,
                                payAtHotel: payAtHotelCash,
                                depositCollected: depositCollected,
                                depositRefund: depositRefund,
                                bookingRefund: 0,
                                miscellaneous: miscellaneous
                            }
                        };
                        let shiftClosingLog = log_1.default.create(data);
                        let logCollection = core_1.default.app.get('mongoClient').get('Log');
                        logCollection.insert(shiftClosingLog.document);
                        res.status(200);
                        respond = {
                            success: true,
                            message: 'You have closed your shift. Good Job!'
                        };
                    }
                    else {
                        res.status(400);
                        respond = {
                            success: false,
                            message: 'Oops, found no open shift to close'
                        };
                    }
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: 'Not allowed to close a shift before being opened'
                    };
                }
            }))
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        CashierRouter.route('/night-audit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let userUuid = req.body.user_uuid;
            let respond;
            yield cashierCollection
                .findOne({
                hotelUuid: hotelUuid,
                status: Law.CashierStatus.LATEST
            })
                .then((cashierDocument) => __awaiter(this, void 0, void 0, function* () {
                if (cashierDocument !== null) {
                    let latestCashier = cashier_1.Cashier.spawn(cashierDocument);
                    if (!latestCashier.hasNoShift) {
                        if (latestCashier.hasNoOpenShift) {
                            res.status(200);
                            respond = {
                                success: true,
                                isShiftOpen: latestCashier.hasNoOpenShift,
                                message: 'Here we go, boss!',
                                data: latestCashier.document
                            };
                        }
                        else {
                            res.status(400);
                            respond = {
                                success: false,
                                message: 'Not allowed to do night audit while a shift is open'
                            };
                        }
                    }
                    else {
                        res.status(400);
                        respond = {
                            success: false,
                            message: 'Not allowed to do night audit without any shift document'
                        };
                    }
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: 'Not allowed to do night audit without any cashier document'
                    };
                }
            }))
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let userUuid = req.body.user_uuid;
            let withdrawal = Number(req.body.withdrawal);
            let respond;
            yield cashierCollection
                .findOne({
                hotelUuid: hotelUuid,
                status: Law.CashierStatus.LATEST
            })
                .then((cashierDocument) => __awaiter(this, void 0, void 0, function* () {
                if (cashierDocument !== null) {
                    let latestCashier = cashier_1.Cashier.spawn(cashierDocument);
                    if (!latestCashier.hasNoShift) {
                        if (latestCashier.hasNoOpenShift) {
                            if (withdrawal <= latestCashier.closingBalance) {
                                let newOpeningBalance = latestCashier.close(withdrawal);
                                let newCashier = cashier_1.Cashier.create({
                                    hotelUuid: hotelUuid,
                                    openingBalance: newOpeningBalance
                                });
                                yield cashierCollection.update({
                                    uuid: latestCashier.uuid
                                }, latestCashier.document);
                                yield cashierCollection.insert(newCashier.document);
                                let data = {
                                    type: LogLaw.Type.NIGHT_AUDIT,
                                    by: userUuid,
                                    payload: {
                                        hotelUuid: hotelUuid,
                                        openingBalance: cashierDocument.openingBalance,
                                        status: cashierDocument.status,
                                        withdrawal: withdrawal
                                    }
                                };
                                let nightAuditLog = log_1.default.create(data);
                                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                                logCollection.insert(nightAuditLog.document);
                                res.status(200);
                                respond = {
                                    success: true,
                                    message: 'You have registered a night audit, boss!'
                                };
                            }
                            else {
                                res.status(400);
                                respond = {
                                    success: false,
                                    message: 'Not allowed to withdraw higher than closing balance'
                                };
                            }
                        }
                        else {
                            res.status(400);
                            respond = {
                                success: false,
                                message: 'Not allowed to do night audit while a shift is open'
                            };
                        }
                    }
                    else {
                        res.status(400);
                        respond = {
                            success: false,
                            message: 'Not allowed to do night audit without any shift document'
                        };
                    }
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: 'Not allowed to do night audit without any cashier document'
                    };
                }
            }))
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        return CashierRouter;
    }
}
exports.default = CashierManager;
