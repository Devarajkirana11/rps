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
const core_1 = require("../core");
const express = require("express");
var async = require('async');
var ObjectId = require('mongodb').ObjectID;
class LocationMastersManager {
    static get routes() {
        let LocationRouter = express.Router();
        LocationRouter.route('/getLocationMasters')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            res.status(200)
                .json({ success: true, masters: yield this.getMasters() });
        }));
        LocationRouter.route('/getStatesByCountry')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let masters = yield this.getMasters();
            Object.keys(masters).forEach(key => {
                if (key == req.body.inputval) {
                    respond = masters[key]['states'];
                }
            });
            res.status(200)
                .json({ success: true, data: respond });
        }));
        LocationRouter.route('/getCitiesByState')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let masters = yield this.getMasters();
            Object.keys(masters).forEach(key => {
                Object.keys(masters[key]['states']).forEach(skey => {
                    if (skey == req.body.inputval) {
                        respond = masters[key]['states'][skey]['cities'];
                    }
                });
            });
            res.status(200)
                .json({ success: true, data: respond });
        }));
        LocationRouter.route('/getLocalitiesByCity')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let masters = yield this.getMasters();
            Object.keys(masters).forEach(key => {
                Object.keys(masters[key]['states']).forEach(skey => {
                    Object.keys(masters[key]['states'][skey]['cities']).forEach(ckey => {
                        if (ckey == req.body.inputval) {
                            respond = masters[key]['states'][skey]['cities'][ckey]['localities'];
                        }
                    });
                });
            });
            res.status(200)
                .json({ success: true, data: respond });
        }));
        LocationRouter.route('/getAllCountries')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let countries = yield this.getAllCountries();
            res.status(200).json({ success: true, data: countries });
        }));
        LocationRouter.route('/getAllCities')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let cities = yield this.getAllCities();
            res.status(200).json({ success: true, data: cities });
        }));
        LocationRouter.route('/getAllLocalities')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let localities = yield this.getAllLocalities();
            res.status(200).json({ success: true, data: localities });
        }));
        return LocationRouter;
    }
    static getCountryNameById(masters, country_id) {
        let respond;
        Object.keys(masters).forEach(key => {
            if (key == country_id) {
                respond = masters[key]['name'];
            }
        });
        return respond;
    }
    static getStateNameById(masters, state_id) {
        let respond;
        Object.keys(masters).forEach(key => {
            Object.keys(masters[key]['states']).forEach(skey => {
                if (skey == state_id) {
                    respond = masters[key]['states'][skey]['name'];
                }
            });
        });
        return respond;
    }
    static getCityNameById(masters, city_id) {
        let respond;
        Object.keys(masters).forEach(key => {
            Object.keys(masters[key]['states']).forEach(skey => {
                Object.keys(masters[key]['states'][skey]['cities']).forEach(ckey => {
                    if (ckey == city_id) {
                        respond = masters[key]['states'][skey]['cities'][ckey]['name'];
                    }
                });
            });
        });
        return respond;
    }
    static getLocalityNameById(masters, locality_id) {
        let respond;
        Object.keys(masters).forEach(key => {
            Object.keys(masters[key]['states']).forEach(skey => {
                Object.keys(masters[key]['states'][skey]['cities']).forEach(ckey => {
                    Object.keys(masters[key]['states'][skey]['cities'][ckey]['localities']).forEach(lkey => {
                        if (lkey == locality_id) {
                            respond = masters[key]['states'][skey]['cities'][ckey]['localities'][lkey]['name'];
                        }
                    });
                });
            });
        });
        return respond;
    }
    static getCountryIdByName(masters, country_name) {
        let respond = 0;
        Object.keys(masters).forEach(key => {
            if (masters[key]['name'].toLowerCase() == country_name.toLowerCase()) {
                respond = key;
            }
        });
        return respond;
    }
    static getCityIdByName(masters, city_name) {
        let respond = 0;
        Object.keys(masters).forEach(key => {
            Object.keys(masters[key]['states']).forEach(skey => {
                Object.keys(masters[key]['states'][skey]['cities']).forEach(ckey => {
                    if (masters[key]['states'][skey]['cities'][ckey]['name'].toLowerCase() == city_name.toLowerCase()) {
                        respond = ckey;
                    }
                });
            });
        });
        return respond;
    }
}
LocationMastersManager.getAllCountries = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let respond = new Array();
        let masters = yield LocationMastersManager.getMasters();
        Object.keys(masters).forEach(key => {
            respond.push({ value: key, text: masters[key]['name'] });
        });
        return respond;
    });
};
LocationMastersManager.getAllCities = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let masters = yield LocationMastersManager.getMasters();
        let respond = new Array();
        Object.keys(masters).forEach(key => {
            Object.keys(masters[key]['states']).forEach(skey => {
                Object.keys(masters[key]['states'][skey]['cities']).forEach(ckey => {
                    respond.push({ value: ckey, text: masters[key]['states'][skey]['cities'][ckey]['name'] });
                });
            });
        });
        return respond;
    });
};
LocationMastersManager.getAllLocalities = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let masters = yield LocationMastersManager.getMasters();
        let respond = new Array();
        Object.keys(masters).forEach(key => {
            Object.keys(masters[key]['states']).forEach(skey => {
                Object.keys(masters[key]['states'][skey]['cities']).forEach(ckey => {
                    Object.keys(masters[key]['states'][skey]['cities'][ckey]['localities']).forEach(lkey => {
                        respond.push({ value: lkey, text: masters[key]['states'][skey]['cities'][ckey]['localities'][lkey]['name'] });
                    });
                });
            });
        });
        return respond;
    });
};
LocationMastersManager.getNewLocation = function getNewLocation() {
    return __awaiter(this, void 0, void 0, function* () {
        let respond;
        let CountryDetails = core_1.default.app.get('mongoClient').get('Country');
        yield CountryDetails
            .find({})
            .then(document => {
            respond = {
                success: true,
                msg: "success",
                data: document
            };
        })
            .catch(error => {
            respond = {
                success: false,
                msg: "Country not available"
            };
        });
        return respond;
    });
};
LocationMastersManager.getMasters = function getMasters() {
    return __awaiter(this, void 0, void 0, function* () {
        let respond;
        let hotelCollection = core_1.default.app.get('mongoClient').get('location_masters');
        let locations = yield hotelCollection.find()
            .then(document => {
            return respond = {
                success: true,
                message: `We have collected the requested location Details`,
                data: document
            };
        })
            .catch(error => {
            return respond = {
                success: false,
                message: error.message,
                data: []
            };
        });
        if (!locations.success) {
            return new Array();
        }
        else {
            if (locations.data.length) {
                delete locations.data[0]._id;
                return locations.data[0];
            }
            else {
                return new Array();
            }
        }
    });
};
exports.default = LocationMastersManager;
