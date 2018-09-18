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
const request_1 = require("../../helpers/request");
const RoomManager_1 = require("../rooms/RoomManager");
const FacilitiesAndServices_1 = require("../hotel_info/FacilitiesAndServices");
const time_1 = require("../../helpers/time");
const express = require("express");
class Rates {
    static get routes() {
        let RatesRouter = express.Router();
        RatesRouter.route('/rates/list-view')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let Master = yield RoomManager_1.default.getAllMasters();
            let postbody = JSON.stringify({});
            let hotelId = req.query.hotel_id;
            request_1.default.get('/hotels-manager/manager/rates/cost', {
                hotel_id: hotelId
            }).then(api_result => {
                if (api_result.success) {
                    Object.keys(api_result.data.list).forEach((key) => __awaiter(this, void 0, void 0, function* () {
                        if (api_result.data.list[key].type != 'Default') {
                            api_result.data.list[key].name = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', api_result.data.list[key].type);
                        }
                    }));
                    res.status(200);
                    res.render('rateslistview', { output: api_result.data.list, hotel_id: hotelId });
                }
                else {
                    res.status(200);
                    res.render('rateslistview', { output: api_result, hotel_id: hotelId });
                }
            }).catch(error => {
                res.status(200);
                res.render('rateslistview', { errors: error.message, hotel_id: hotelId });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        RatesRouter.route('/rates/detail-view')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let postbody = JSON.stringify({});
            request_1.default.get('/hotels-manager/manager/rates/cost/default', {
                hotel_id: hotel_id
            }).then(api_result => {
                if (api_result.success) {
                    if (api_result.data) {
                        let inputvalues = {
                            cost_rate: parseFloat(api_result.data.defaultCostRate),
                            cost_currency: api_result.data.defaultCostCurrency,
                            day_wise_cost: api_result.data.defaultDayWiseCost,
                            date_wise_cost: api_result.data.defaultDateWiseCost,
                            day_wise_string: JSON.stringify(api_result.data.defaultDayWiseCost),
                            date_wise_string: JSON.stringify(api_result.data.defaultDateWiseCost)
                        };
                        res.status(200);
                        res.render('ratesdetailview', { output: inputvalues, hotel_id: hotel_id });
                    }
                    else {
                        res.status(200);
                        res.render('ratesdetailview', { output: api_result.data, hotel_id: hotel_id });
                    }
                }
                else {
                    res.status(200);
                    res.render('ratesdetailview', { output: api_result.data, hotel_id: hotel_id });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('ratesdetailview', { errors: error.message, hotel_id: hotel_id });
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let currency;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                currency = 'MYR';
            }
            else {
                currency = 'THB';
            }
            if (req.body.update_type == 1) {
                let cost = parseFloat(req.body.cost_rate);
                req.body.day_wise_cost = { "monday": cost, "tuesday": cost, "wednesday": cost, "thursday": cost, "friday": cost, "saturday": cost, "sunday": cost };
                req.body.date_wise_cost = JSON.stringify({ "dates": ["12-02-2017", "13-02-2017"], "cost": cost });
            }
            else if (req.body.update_type == 2) {
                if (req.body.day_wise_cost) {
                    req.body.day_wise_cost = req.body.day_wise_cost;
                }
                else {
                    req.body.day_wise_cost = {};
                }
                let arr = req.body.day_values;
                let cost = parseFloat(req.body.cost);
                let day_wise_values = JSON.parse(req.body.day_wise_cost);
                arr.forEach(function (product, index) { day_wise_values[product] = cost; });
                req.body.day_wise_cost = day_wise_values;
                req.body.date_wise_cost = JSON.stringify({ "dates": ["02-02-2017"], "cost": 120 });
            }
            else if (req.body.update_type == 3) {
                req.body.date_wise_cost = '{"dates":' + JSON.stringify(req.body.dates) + ',"cost":' + parseFloat(req.body.cost) + '}';
                let day_wise_values = JSON.parse(req.body.day_wise_cost);
                req.body.day_wise_cost = day_wise_values;
            }
            else {
            }
            let body = {
                cost_rate: parseFloat(req.body.cost_rate),
                cost_currency: currency,
                day_wise_cost: JSON.stringify(req.body.day_wise_cost),
                date_wise_cost: req.body.date_wise_cost
            };
            request_1.default.put('/hotels-manager/manager/rates/cost/default', {
                hotel_id: hotel_id
            }, body).then(api_result => {
                if (api_result.success) {
                    let inputvalues = {
                        cost_rate: parseFloat(api_result.data.defaultCostRate),
                        cost_currency: api_result.data.defaultCostCurrency,
                        day_wise_cost: api_result.data.defaultDayWiseCost,
                        date_wise_cost: api_result.data.defaultDateWiseCost,
                        day_wise_string: JSON.stringify(api_result.data.defaultDayWiseCost),
                        date_wise_string: JSON.stringify(api_result.data.defaultDateWiseCost)
                    };
                    res.status(200);
                    res.render('ratesdetailview', { output: inputvalues, hotel_id: hotel_id });
                }
                else {
                    res.status(200);
                    res.render('ratesdetailview', { hotel_id: hotel_id });
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
        }));
        RatesRouter.route('/rates/markup')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let postbody = '';
            let currency;
            let hotel_id = req.query.hotel_id;
            let room_type = req.query.room_type;
            let inputvalues = { hotel_id: hotel_id, room_type: room_type };
            let Master = yield RoomManager_1.default.getAllMasters();
            let room_type_name = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', room_type);
            ;
            if (hotel_id == 'e7017613-42db-4748-a00a-21b3b41ca661') {
                currency = 'MYR';
            }
            else {
                currency = 'THB';
            }
            request_1.default.get('/hotels-manager/manager/rates/cost/markup', {
                hotel_uuid: hotel_id,
                room_type: room_type
            }).then(response => {
                let others = {
                    cost_rate: parseFloat(response.others._defaultCostRate),
                    day_wise_values: response.others._defaultDayWiseCost,
                    room_type_name: room_type_name,
                    date_wise_values: JSON.stringify(response.others._defaultDateWiseCost)
                };
                res.status(200);
                res.render('ratesmarkupview', { inputs: inputvalues, output: response.data, others: others, currency: currency });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('ratesmarkupview');
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.hotel_id;
            let room_type = req.body.room_type;
            let postvalues = {
                type: parseInt(req.body.markup_type),
                coating: parseInt(req.body.incremental_type),
                value: parseInt(req.body.markup_value)
            };
            let inputvalues = { hotel_id: hotel_id, room_type: room_type };
            let postbody = JSON.stringify(postvalues);
            let Master = yield RoomManager_1.default.getAllMasters();
            let room_type_name = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', room_type);
            request_1.default.put('/hotels-manager/manager/rates/cost/markup', {
                hotel_id: hotel_id,
                room_type: room_type
            }, {
                markup: postbody
            }).then(response => {
                if (response.success) {
                    request_1.default.get('/hotels-manager/manager/rates/cost/markup', {
                        hotel_id: hotel_id,
                        room_type: room_type
                    }).then(api_result => {
                        let others = {
                            cost_rate: parseFloat(api_result.others._defaultCostRate),
                            day_wise_values: api_result.others._defaultDayWiseCost,
                            room_type_name: room_type_name,
                            date_wise_values: JSON.stringify(api_result.others._defaultDateWiseCost)
                        };
                        res.status(200);
                        res.redirect('/hotels/rates/list-view?hotel_id=' + hotel_id);
                    }).catch(error => {
                        console.log('Error: ', error.message);
                        res.status(200);
                        res.redirect('/hotels/rates/list-view?hotel_id=' + hotel_id);
                    });
                }
                else {
                    res.status(200);
                    res.redirect('/hotels/rates/list-view?hotel_id=' + hotel_id);
                }
            }).catch(error => {
                console.log('Error: ', error.message);
            });
        }));
        RatesRouter.route('/rates/sell/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let postbody = JSON.stringify({});
            request_1.default.get('/hotels-manager/manager/rates/sell/plan', { hotel_id: hotel_id }).then(api_result => {
                console.log(api_result);
                res.status(200);
                res.render('sellrateslistview', { output: api_result.data, hotel_id: hotel_id });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('sellrateslistview');
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        RatesRouter.route('/rates/sell/create')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            res.status(200);
            res.render('sellratescreation', { hotel_id: hotel_id });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.body.id;
            let conditions = [];
            let advance_booking_period = req.body.advance_booking_period;
            let min_stay = req.body.min_stay;
            let type = req.body.type;
            let coating = req.body.coating;
            let value = req.body.value;
            let markup = { "type": parseFloat(req.body.default_type), "coating": parseFloat(req.body.default_coating), "value": parseFloat(req.body.default_value) };
            if (advance_booking_period) {
                advance_booking_period.forEach(function (item, index) {
                    conditions[index] = { "minimumStay": min_stay[index], "advanceBookingPeriod": item, "cancellationPolicyId": "123", "markup": { "type": parseFloat(type[index]), "coating": parseFloat(coating[index]), "value": parseFloat(value[index]) } };
                });
            }
            let inputvalues = {
                name: req.body.name,
                start_date: req.body.startDate,
                end_date: req.body.endDate,
                cancellation_policy_id: req.body.cancellation_policy,
                markup: JSON.stringify(markup),
                channels: JSON.stringify(req.body.channels),
                conditions: JSON.stringify(conditions)
            };
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('name', 'Please enter the markup plan name').notEmpty();
            req.checkBody('startDate', 'Please enter the Start Date').notEmpty();
            req.checkBody('endDate', 'Please enter the End Date').notEmpty();
            req.checkBody('default_type', 'Please select the markup type').notEmpty();
            req.checkBody('default_coating', 'Please select the coating type').notEmpty();
            req.checkBody('default_value', 'Please enter the value').notEmpty();
            console.log(inputvalues);
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('sellratescreation', { errors: errors, output: req.body });
                }
                else {
                    request_1.default.post('/hotels-manager/manager/rates/sell/plan', {
                        hotel_id: hotel_id
                    }, inputvalues).then(response => {
                        if (response.success) {
                            res.status(200);
                            res.redirect('/hotels/rates/sell/list?hotel_id=' + hotel_id);
                        }
                        else {
                            res.status(200);
                            res.render('sellratescreation', { errors: response.message, output: req.body });
                        }
                    }).catch(error => {
                        res.status(200);
                        res.render('sellratescreation', { errors: error.message, output: req.body });
                    });
                }
            });
        }));
        RatesRouter.route('/rates/sell/:id/edit')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.params.id;
            let key_value = req.query.key_value;
            let ratescollection = core_1.default.app.get('mongoClient').get('rates');
            yield ratescollection
                .find({
                _hotelId: hotel_id
            })
                .then(document => {
                console.log(document[0]._sellRatePlans[key_value]);
                res.status(200);
                res.render('sellratesedit', { output: document[0]._sellRatePlans[key_value], hotel_id: hotel_id, key_value: key_value });
            })
                .catch(error => {
                res.status(500);
                res.redirect('/hotels/rates/sell/list');
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.params.id;
            let key_value = req.query.key_value;
            let conditions = [];
            let advance_booking_period = req.body.advance_booking_period;
            let min_stay = req.body.min_stay;
            let type = req.body.type;
            let coating = req.body.coating;
            let value = req.body.value;
            let markup = { "type": parseFloat(req.body.default_type), "coating": parseFloat(req.body.default_coating), "value": parseFloat(req.body.default_value) };
            if (advance_booking_period) {
                advance_booking_period.forEach(function (item, index) {
                    conditions[index] = { "minimumStay": min_stay[index], "advanceBookingPeriod": item, "cancellationPolicyId": "123", "markup": { "type": parseFloat(type[index]), "coating": parseFloat(coating[index]), "value": parseFloat(value[index]) } };
                });
            }
            let inputvalues = {
                name: req.body.name,
                start_date: req.body.startDate,
                end_date: req.body.endDate,
                cancellation_policy_id: req.body.cancellation_policy,
                markup: JSON.stringify(markup),
                channels: JSON.stringify(req.body.channels),
                conditions: JSON.stringify(conditions)
            };
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('name', 'Please enter the markup plan name').notEmpty();
            req.checkBody('startDate', 'Please enter the Start Date').notEmpty();
            req.checkBody('endDate', 'Please enter the End Date').notEmpty();
            req.checkBody('default_type', 'Please select the markup type').notEmpty();
            req.checkBody('default_coating', 'Please select the coating type').notEmpty();
            req.checkBody('default_value', 'Please enter the value').notEmpty();
            req.body.startDate = time_1.default.serverMomentInPattern(req.body.startDate, 'DD-MM-YYYY').toDate();
            req.body.endDate = time_1.default.serverMomentInPattern(req.body.endDate, 'DD-MM-YYYY').toDate();
            req.body.markup = markup;
            req.body.cancellationPolicyId = req.body.cancellation_policy;
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('sellratesedit', { errors: errors, hotel_id: hotel_id, output: req.body, key_value: key_value });
                }
                else {
                    request_1.default.put('/hotels-manager/manager/rates/sell/plan', {
                        hotel_id: hotel_id
                    }, inputvalues).then(response => {
                        if (response.success) {
                            console.log(response);
                            res.status(200);
                            res.redirect('/hotels/rates/sell/list?hotel_id=' + hotel_id);
                        }
                        else {
                            console.log(response);
                            res.status(200);
                            res.render('sellratesedit', { message: response.message, hotel_id: hotel_id, output: req.body, key_value: key_value });
                        }
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                }
            });
        }));
        return RatesRouter;
    }
}
exports.default = Rates;
