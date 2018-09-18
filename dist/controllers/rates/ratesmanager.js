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
const LogLaw = require("../../models/log/law");
const RateLaw = require("../../models/rates/law");
const core_1 = require("../../core");
const inventory_manager_1 = require("../inventory/inventory_manager");
const log_1 = require("../../models/log/log");
const rate_1 = require("../../models/rates/rate");
const request_1 = require("../../helpers/request");
const time_1 = require("../../helpers/time");
var ObjectId = require('mongodb').ObjectID;
class RatesManager {
    static get routes() {
        let RatesManagerRouter = express.Router();
        let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
        let ratesCollection = core_1.default.app.get('mongoClient').get('rates');
        ratesCollection.createIndex({ _hotelId: 1 }, { unique: true });
        RatesManagerRouter.route('/manager/rates/cost').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = yield rate_1.default.spawn(document);
                yield roomCollection
                    .find({
                    _hotelId: hotelId
                })
                    .then((roomList) => __awaiter(this, void 0, void 0, function* () {
                    let typeList = yield roomList.map(room => room._type).filter((value, index, self) => self.findIndex(element => element._type === value._type) === index);
                    let data = Array();
                    data.push({
                        type: 'Default',
                        name: 'Default',
                        occupancy: 'NONE',
                        rate: spawnedRate.defaultConfiguration.defaultCostRate,
                        configured: spawnedRate.isConfigured,
                        status: spawnedRate.isActive
                    });
                    yield Promise.all(typeList.map((type) => __awaiter(this, void 0, void 0, function* () {
                        yield roomCollection.findOne({ '_type._type': type._type }).then((room) => __awaiter(this, void 0, void 0, function* () {
                            let roomTypeMarkup = spawnedRate.getRoomType(type._type);
                            let rate = spawnedRate.defaultConfiguration.defaultCostRate;
                            let calculatedRate;
                            if (roomTypeMarkup.configured) {
                                calculatedRate = yield RatesManager.calculateMarkup(rate, roomTypeMarkup.markup);
                                console.log('rate: ', rate);
                                console.log('roomTypeMarkup.markup: ', roomTypeMarkup.markup);
                                console.log('calculatedRate: ', calculatedRate);
                            }
                            data.push({
                                type: type._type,
                                name: room._type._name,
                                occupancy: room._type._no_of_guest_stay,
                                rate: calculatedRate,
                                configured: roomTypeMarkup.configured,
                                status: roomTypeMarkup.active
                            });
                        }));
                    })));
                    res.status(200);
                    respond = {
                        success: true,
                        message: `Found the rates registered for hotel id ${hotelId}`,
                        data: {
                            costCurrency: spawnedRate.defaultConfiguration.defaultCostCurrency,
                            list: data
                        }
                    };
                }));
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
        RatesManagerRouter.route('/manager/rates/cost/default')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                res.status(200);
                let spawnedRate = yield rate_1.default.spawn(document);
                if (spawnedRate.isConfigured) {
                    respond = {
                        success: true,
                        message: `Found the default configuration for hotel id ${hotelId}`,
                        data: spawnedRate.defaultConfiguration
                    };
                }
                else {
                    respond = {
                        success: true,
                        message: `Default configuration has not been set for hotel id ${hotelId}`
                    };
                }
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let costRate = Number(req.body.cost_rate);
            let costCurrency = req.body.cost_currency;
            let dayWiseCost = JSON.parse(req.body.day_wise_cost);
            let dateWiseCost = JSON.parse(req.body.date_wise_cost);
            let userUuid = req.body.user_uuid;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                let utcDates = new Array();
                for (let date of dateWiseCost.dates) {
                    yield utcDates.push(time_1.default.serverMomentInPattern(date, 'DD-MM-YYYY').toDate());
                }
                dateWiseCost.dates = utcDates;
                let defaultConfiguration = {
                    defaultCostRate: costRate,
                    defaultCurrency: costCurrency,
                    defaultDayWiseCost: dayWiseCost,
                    defaultDateWiseCost: dateWiseCost
                };
                console.log('defaultConfiguration: ', defaultConfiguration);
                return spawnedRate.configureDefault(defaultConfiguration);
            }))
                .then((rate) => __awaiter(this, void 0, void 0, function* () {
                console.log('IN RATE');
                yield ratesCollection.update({
                    _hotelId: hotelId
                }, rate);
                let data = {
                    type: LogLaw.Type.DEFAULT_RATES,
                    by: userUuid,
                    payload: {
                        hotelId: rate.hotel_id,
                        costRate: rate.cost_rate,
                        costCurrency: rate.cost_currency,
                        dayWiseCost: rate.day_wise_cost,
                        dateWiseCost: rate.date_wise_cost
                    }
                };
                let defaultLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(defaultLog.document);
                let spawnedRate = yield rate_1.default.spawn(rate);
                request_1.default.get('/ota-manager/bulk-rate-update', { hotel_id: hotelId }).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                res.status(200);
                respond = {
                    success: true,
                    message: `Default configuration has been updated for hotel id ${hotelId}`,
                    data: spawnedRate.defaultConfiguration
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
        RatesManagerRouter.route('/manager/rates/cost/markup')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let roomType = req.query.room_type;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                let roomTypeMarkup = spawnedRate.getRoomType(roomType);
                if (roomTypeMarkup.configured === true) {
                    let data = yield RatesManager.getRoomTypeCost(spawnedRate, roomType);
                    res.status(200);
                    respond = {
                        success: true,
                        message: `Found the ${roomType} configuration for hotel id ${hotelUuid}`,
                        data: data,
                        others: document
                    };
                }
                else {
                    respond = {
                        success: true,
                        message: `${roomType} markup has not been set for hotel id ${hotelUuid}`,
                        others: document
                    };
                }
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let roomType = req.query.room_type;
            let markup = JSON.parse(req.body.markup);
            let userUuid = req.body.user_uuid;
            console.log('markup: ', markup);
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                if (spawnedRate.isConfigured) {
                    let success = spawnedRate.configureRoomTypeMarkup(roomType, markup);
                    if (success) {
                        yield ratesCollection.update({
                            _hotelId: hotelId
                        }, spawnedRate);
                        let data = {
                            type: LogLaw.Type.MARKUP_RATES,
                            by: userUuid,
                            payload: {
                                hotelId: document.hotel_id,
                                roomType: document.room_type,
                                markup: document.markup
                            }
                        };
                        request_1.default.get('/ota-manager/bulk-rate-update', { hotel_id: hotelId }).then(response => {
                            console.log(response);
                        }).catch(error => {
                            console.log('Error: ', error.message);
                        });
                        let markupLog = log_1.default.create(data);
                        let logCollection = core_1.default.app.get('mongoClient').get('Log');
                        logCollection.insert(markupLog.document);
                        respond = {
                            success: true,
                            message: `${roomType} configuration has been updated for hotel id ${hotelId}`
                        };
                    }
                    else {
                        respond = {
                            success: true,
                            message: `Could not find the ${roomType} configuration for hotel id ${hotelId}`
                        };
                    }
                }
                else {
                    respond = {
                        success: true,
                        message: `Default configuration has not been set yet for hotel id ${hotelId}`
                    };
                }
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
        RatesManagerRouter.route('/manager/rates/sell/plan')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let userUuid = req.body.user_uuid;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = yield rate_1.default.spawn(document);
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning all sell rate plans for hotel id ${hotelId}`,
                    data: spawnedRate.sellPlanPayload,
                    default_rate: document._defaultCostRate
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
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let userUuid = req.body.user_uuid;
            let name = req.body.name;
            let startDate = req.body.start_date;
            let endDate = req.body.end_date;
            let cancellationPolicyId = req.body.cancellation_policy_id;
            let markup = JSON.parse(req.body.markup);
            let channels = JSON.parse(req.body.channels);
            let conditions = JSON.parse(req.body.conditions);
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                if (spawnedRate.isConfigured) {
                    if (spawnedRate.isPlanNameValid(name)) {
                        if (!spawnedRate.hasChannelConflicts(startDate, endDate, channels)) {
                            if (spawnedRate.isConditionValid(conditions)) {
                                yield spawnedRate.configureSellRatePlan(name, startDate, endDate, cancellationPolicyId, markup, channels, conditions);
                                yield ratesCollection.update({
                                    _hotelId: hotelId
                                }, spawnedRate);
                                request_1.default.get('/ota-manager/bulk-rate-update', { hotel_id: hotelId }).then(response => {
                                    console.log(response);
                                }).catch(error => {
                                    console.log('Error: ', error.message);
                                });
                                respond = {
                                    success: true,
                                    message: `New sell rate plan has been added to hotel id ${hotelId}`
                                };
                            }
                            else {
                                respond = {
                                    success: false,
                                    message: `Found an invalid condition settings`
                                };
                            }
                        }
                        else {
                            respond = {
                                success: false,
                                message: `Found an existing channel plan during ${startDate} to ${endDate}`
                            };
                        }
                    }
                    else {
                        respond = {
                            success: false,
                            message: `Found an existing channel name for hotel id ${hotelId}`
                        };
                    }
                }
                else {
                    respond = {
                        success: false,
                        message: `Default configuration has not been set yet for hotel id ${hotelId}`
                    };
                }
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let name = req.body.name;
            let startDate = req.body.start_date;
            let endDate = req.body.end_date;
            let cancellationPolicyId = req.body.cancellation_policy_id;
            let markup = JSON.parse(req.body.markup);
            let channels = JSON.parse(req.body.channels);
            let conditions = JSON.parse(req.body.conditions);
            let userUuid = req.body.user_uuid;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                if (spawnedRate.isConfigured) {
                    let sellRatePlan = spawnedRate.sliceSellRatePlan(name);
                    if (sellRatePlan !== undefined) {
                        if (!spawnedRate.hasChannelConflicts(startDate, endDate, channels)) {
                            if (spawnedRate.isConditionValid(conditions)) {
                                yield spawnedRate.configureSellRatePlan(name, startDate, endDate, cancellationPolicyId, markup, channels, conditions);
                                yield ratesCollection.update({
                                    _hotelId: hotelId
                                }, spawnedRate);
                                let data = {
                                    type: LogLaw.Type.RATES_PLAN,
                                    by: userUuid,
                                    payload: {
                                        name: document.name,
                                        startDate: document.startDate,
                                        endDate: document.endDate,
                                        cancellationPolicyId: document.cancellationPolicyId,
                                        markup: document.markup,
                                        channels: document.channels,
                                        conditions: document.conditions
                                    }
                                };
                                respond = {
                                    success: true,
                                    message: `Sell rate plan has been updated to hotel id ${hotelId}`
                                };
                            }
                            else {
                                respond = {
                                    success: false,
                                    message: `Found an invalid condition settings`
                                };
                            }
                        }
                        else {
                            respond = {
                                success: false,
                                message: `Found an existing channel plan during ${startDate} to ${endDate}`
                            };
                        }
                    }
                    else {
                        respond = {
                            success: false,
                            message: `We could not locate any sell rate plan named ${name}`
                        };
                    }
                }
                else {
                    respond = {
                        success: false,
                        message: `Default configuration has not been set yet for hotel id ${hotelId}`
                    };
                }
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
        RatesManagerRouter.get('/manager/rates/sell/plan/channel', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.query.hotel_id;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = yield rate_1.default.spawn(document);
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning all sell rate channels during ${startDate} to ${endDate}`,
                    data: spawnedRate.getConfiguredChannelsByDate(startDate, endDate)
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
        RatesManagerRouter.put('/manager/rates/sell/plan/activation', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelId = req.body.hotel_id;
            let sellRateName = req.body.sell_rate_name;
            let activation = req.body.activation;
            let respond;
            yield ratesCollection
                .findOne({
                _hotelId: hotelId
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = yield rate_1.default.spawn(document);
                if (activation === 'true') {
                    spawnedRate.activateSellRatePlan(sellRateName);
                }
                else {
                    spawnedRate.deactivateSellRatePlan(sellRateName);
                }
                return yield ratesCollection.update({
                    _hotelId: hotelId
                }, spawnedRate);
            }))
                .then(success => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Sell rate plan ${sellRateName} activation has been updated`
                };
            })
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        RatesManagerRouter.route('/manager/rates/sell/walk-in').post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let discount = req.body.discount;
            let checkIn = req.body.check_in;
            let checkOut = req.body.check_out;
            let respond;
            let country_code;
            let tourismTax;
            let tax;
            let serviceFee;
            let postvalues = { ajaxid: 19, hotel_uuid: hotelUuid };
            request_1.default.post('/search/ajax', {}, postvalues).then(response => {
                country_code = response.data._country_id;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield ratesCollection
                .findOne({
                _hotelId: hotelUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                let sellRatePlans = spawnedRate.sellRatePlans;
                let roomTypeMarkups = spawnedRate.roomTypeMarkups;
                let webSellRatePlans = sellRatePlans.filter(plan => plan.active == true && plan.channels.indexOf(RateLaw.Channel.WALK_IN) >= 0);
                if (webSellRatePlans.length > 0) {
                    let checkInMoment = time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY');
                    let checkOutMoment = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY');
                    let numberOfNights = checkOutMoment.diff(checkInMoment, 'days');
                    let roomsData = new Array();
                    for (let markup of roomTypeMarkups) {
                        if (markup.configured === true) {
                            let data = yield RatesManager.getRoomTypeCost(spawnedRate, markup.roomType);
                            let currentDay = time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY');
                            let totalRoomCost = 0;
                            let averageRoomCost = 0;
                            let costBreakdown = new Array();
                            for (let index = 0; index < numberOfNights; index++) {
                                for (let plan of webSellRatePlans) {
                                    let startDateMoment = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(plan.startDate), 'DD-MM-YYYY');
                                    let endDateMoment = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(plan.endDate), 'DD-MM-YYYY');
                                    if (currentDay.isSameOrAfter(startDateMoment, 'day') && currentDay.isSameOrBefore(endDateMoment, 'day')) {
                                        let sellRatePlanConditions = plan.conditions;
                                        let minimumStay = 1;
                                        let selectedMarkup = plan.markup;
                                        for (let condition of sellRatePlanConditions) {
                                            if (condition.minimumStay > minimumStay && condition.minimumStay <= numberOfNights) {
                                                minimumStay = condition.minimumStay;
                                                selectedMarkup = condition.markup;
                                            }
                                        }
                                        let dayOfWeek = currentDay.format('dddd');
                                        let roomCost = data.dayWiseCost[`${dayOfWeek.toLowerCase()}`];
                                        for (let range of data.dateWiseCost) {
                                            let hasFoundACost = false;
                                            range.dates.forEach(e => {
                                                if (currentDay.isSame(time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(e), 'DD-MM-YYYY'), 'day')) {
                                                    hasFoundACost = true;
                                                }
                                            });
                                            if (hasFoundACost) {
                                                roomCost = range.cost;
                                            }
                                        }
                                        let todayRoomCost = yield RatesManager.calculateMarkup(roomCost, selectedMarkup);
                                        let finalRoomCost = todayRoomCost;
                                        if (discount > 0) {
                                            let rate_discount = todayRoomCost * (discount / 100);
                                            finalRoomCost = Number(todayRoomCost) - Number(rate_discount);
                                        }
                                        else {
                                            finalRoomCost = todayRoomCost;
                                        }
                                        costBreakdown.push({
                                            date: time_1.default.serverMomentInPattern(currentDay, 'DD-MM-YYYY').toDate(),
                                            cost: finalRoomCost
                                        });
                                        totalRoomCost += todayRoomCost;
                                        break;
                                    }
                                }
                                currentDay.add(1, 'day');
                            }
                            averageRoomCost = totalRoomCost / numberOfNights;
                            let doc = yield roomCollection.findOne({ '_type._type': markup.roomType });
                            let roomOccupancy = doc._type._no_of_guest_stay;
                            roomsData.push({
                                type: markup.roomType,
                                occupancy: roomOccupancy,
                                costBreakdown: costBreakdown,
                                availability: yield inventory_manager_1.default.getAvailableRooms(hotelUuid, markup.roomType, checkIn, checkOut),
                                averageCost: averageRoomCost,
                                totalCost: totalRoomCost
                            });
                        }
                    }
                    if (country_code == "217") {
                        tourismTax = 0;
                        tax = 7;
                        serviceFee = 10;
                    }
                    else {
                        tourismTax = 10;
                        tax = 6;
                        serviceFee = 10;
                    }
                    res.status(200);
                    respond = {
                        success: true,
                        message: `Requested room rates have been collected`,
                        data: {
                            tourismTax: tourismTax * numberOfNights,
                            serviceFee: serviceFee,
                            tax: tax,
                            rooms: roomsData
                        }
                    };
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: "We couldn't locate any active walk-in sell rate plan"
                    };
                }
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
        RatesManagerRouter.route('/manager/rates/sell/web').post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let checkIn = req.body.check_in;
            let checkOut = req.body.check_out;
            let userUuid = req.body.user_uuid;
            let respond;
            let country_code;
            let tourismTax;
            let tax;
            let serviceFee;
            let postvalues = { ajaxid: 19, hotel_uuid: hotelUuid };
            request_1.default.post('/search/ajax', {}, postvalues).then(response => {
                country_code = response.data._country_id;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            yield ratesCollection
                .findOne({
                _hotelId: hotelUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let spawnedRate = rate_1.default.spawn(document);
                let sellRatePlans = spawnedRate.sellRatePlans;
                let roomTypeMarkups = spawnedRate.roomTypeMarkups;
                let webSellRatePlans = sellRatePlans.filter(plan => plan.active == true && plan.channels.indexOf(RateLaw.Channel.WEB) >= 0);
                if (webSellRatePlans.length > 0) {
                    let checkInMoment = time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY');
                    let checkOutMoment = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY');
                    let numberOfNights = checkOutMoment.diff(checkInMoment, 'days');
                    let roomsData = new Array();
                    for (let markup of roomTypeMarkups) {
                        if (markup.configured === true) {
                            let data = yield RatesManager.getRoomTypeCost(spawnedRate, markup.roomType);
                            let currentDay = time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY');
                            let totalRoomCost = 0;
                            let averageRoomCost = 0;
                            let costBreakdown = new Array();
                            for (let index = 0; index < numberOfNights; index++) {
                                for (let plan of webSellRatePlans) {
                                    let startDateMoment = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(plan.startDate), 'DD-MM-YYYY');
                                    let endDateMoment = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(plan.endDate), 'DD-MM-YYYY');
                                    if (currentDay.isSameOrAfter(startDateMoment, 'day') && currentDay.isSameOrBefore(endDateMoment, 'day')) {
                                        let sellRatePlanConditions = plan.conditions;
                                        let minimumStay = 1;
                                        let selectedMarkup = plan.markup;
                                        for (let condition of sellRatePlanConditions) {
                                            if (condition.minimumStay > minimumStay && condition.minimumStay <= numberOfNights) {
                                                minimumStay = condition.minimumStay;
                                                selectedMarkup = condition.markup;
                                            }
                                        }
                                        let dayOfWeek = currentDay.format('dddd');
                                        let roomCost = data.dayWiseCost[`${dayOfWeek.toLowerCase()}`];
                                        for (let range of data.dateWiseCost) {
                                            let hasFoundACost = false;
                                            range.dates.forEach(e => {
                                                if (currentDay.isSame(time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(e), 'DD-MM-YYYY'), 'day')) {
                                                    hasFoundACost = true;
                                                }
                                            });
                                            if (hasFoundACost) {
                                                roomCost = range.cost;
                                            }
                                        }
                                        let todayRoomCost = yield RatesManager.calculateMarkup(roomCost, selectedMarkup);
                                        let dates = currentDay.format('DD-MM-YYYY');
                                        costBreakdown.push({
                                            date: time_1.default.serverMomentInPattern(dates, 'DD-MM-YYYY').toDate(),
                                            cost: todayRoomCost
                                        });
                                        totalRoomCost += todayRoomCost;
                                        break;
                                    }
                                }
                                currentDay.add(1, 'day');
                            }
                            averageRoomCost = totalRoomCost / numberOfNights;
                            let doc = yield roomCollection.findOne({ '_type._type': markup.roomType });
                            let roomOccupancy = doc._type._no_of_guest_stay;
                            roomsData.push({
                                type: markup.roomType,
                                occupancy: roomOccupancy,
                                costBreakdown: costBreakdown,
                                availability: yield inventory_manager_1.default.getAvailableRooms(hotelUuid, markup.roomType, checkIn, checkOut),
                                averageCost: averageRoomCost,
                                totalCost: totalRoomCost
                            });
                        }
                    }
                    if (country_code == "217") {
                        tourismTax = 0;
                        tax = 7;
                        serviceFee = 10;
                    }
                    else {
                        tourismTax = 10;
                        tax = 6;
                        serviceFee = 10;
                    }
                    res.status(200);
                    respond = {
                        success: true,
                        message: `Requested room rates have been collected`,
                        data: {
                            tourismTax: tourismTax * numberOfNights,
                            serviceFee: serviceFee,
                            tax: tax,
                            rooms: roomsData
                        }
                    };
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: "We couldn't locate any active web sell rate plan"
                    };
                }
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
        return RatesManagerRouter;
    }
    static getRoomTypeCost(rate, roomType) {
        return __awaiter(this, void 0, void 0, function* () {
            let roomTypeMarkup = rate.getRoomType(roomType);
            let markup = roomTypeMarkup.markup;
            let defaultRate = rate.defaultConfiguration.defaultCostRate;
            let defaultDayWiseCost = rate.defaultDayWiseCost;
            let defaultDateWiseCost = rate.defaultDateWiseCost.map(x => Object.assign({}, x));
            let finalRoomTypeRate = yield RatesManager.calculateMarkup(defaultDayWiseCost.monday, markup);
            let finalDayWiseCost = {
                monday: yield RatesManager.calculateMarkup(defaultDayWiseCost.monday, markup),
                tuesday: yield RatesManager.calculateMarkup(defaultDayWiseCost.tuesday, markup),
                wednesday: yield RatesManager.calculateMarkup(defaultDayWiseCost.wednesday, markup),
                thursday: yield RatesManager.calculateMarkup(defaultDayWiseCost.thursday, markup),
                friday: yield RatesManager.calculateMarkup(defaultDayWiseCost.friday, markup),
                saturday: yield RatesManager.calculateMarkup(defaultDayWiseCost.saturday, markup),
                sunday: yield RatesManager.calculateMarkup(defaultDayWiseCost.sunday, markup)
            };
            for (let dateWiseCost of defaultDateWiseCost) {
                dateWiseCost.cost = yield RatesManager.calculateMarkup(dateWiseCost.cost, markup);
            }
            return {
                roomTypeMarkup: markup,
                defaultRate: defaultRate,
                roomTypeRate: finalRoomTypeRate,
                dayWiseCost: finalDayWiseCost,
                dateWiseCost: defaultDateWiseCost
            };
        });
    }
    static calculateMarkup(rate, markup) {
        let finalRate = rate;
        switch (markup.type) {
            case RateLaw.MarkupType.PERCENTAGE:
                finalRate = finalRate * 100;
                if (markup.coating === RateLaw.MarkupCoating.POSITIVE) {
                    finalRate = Number(finalRate) + Number(finalRate) / 100 * Number(markup.value);
                }
                else if (markup.coating === RateLaw.MarkupCoating.NEGATIVE) {
                    finalRate = Number(finalRate) - Number(finalRate) / 100 * Number(markup.value);
                }
                finalRate = finalRate / 100;
                break;
            case RateLaw.MarkupType.FLAT:
                if (markup.coating === RateLaw.MarkupCoating.POSITIVE) {
                    console.log(finalRate + ' | ' + markup.value);
                    finalRate = Number(finalRate) + Number(markup.value);
                    console.log(finalRate);
                }
                else if (markup.coating === RateLaw.MarkupCoating.NEGATIVE) {
                    finalRate = Number(finalRate) - Number(markup.value);
                }
                break;
            default:
                finalRate = 0;
        }
        return finalRate;
    }
}
exports.default = RatesManager;
