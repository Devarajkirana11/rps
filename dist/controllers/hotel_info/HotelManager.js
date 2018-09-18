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
const HotelDetails_1 = require("../../models/hotel_info/HotelDetails");
const ContactDetails_1 = require("../../models/hotel_info/ContactDetails");
const BankDetails_1 = require("../../models/hotel_info/BankDetails");
const app_1 = require("../../config/app");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const rate_1 = require("../../models/rates/rate");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const identification_1 = require("../../helpers/identification");
const CountryCodeValidator_1 = require("../../helpers/CountryCodeValidator");
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
var ObjectId = require('mongodb').ObjectID;
class HotelDetailsController {
    static get routes() {
        let HotelDetailRouter = express.Router();
        HotelDetailRouter.route('/getAllHotels')
            .post(function (req, res) {
            let respond;
            MongoClient.connect(app_1.environments[process.env.ENV].mongoDBUrl, function (err, db) {
                let UserSession = res.locals.user_details;
                let options = req.body;
                let columns = req.body.columns;
                let CustomizedQuery = {};
                columns.forEach(column => {
                    if ((column.name == "_country_id" || column.name == "_state_id" || column.name == "_city_id" || column.name == "_locality_id") && column.searchable == 'false') {
                        CustomizedQuery[column.name] = new RegExp('^' + column.search.value);
                    }
                });
                if (UserSession !== undefined) {
                    if (Object.keys(UserSession._roles).length) {
                        if (UserSession._roles['Admin'] === undefined && UserSession._hotel_name !== undefined && UserSession._hotel_name != "") {
                            CustomizedQuery['_hotel_id'] = UserSession._hotel_name;
                        }
                    }
                }
                if (Object.keys(CustomizedQuery).length)
                    options.customQuery = CustomizedQuery;
                options.caseInsensitiveSearch = true;
                new MongoDataTable(db).get('hotel_details', options, function (err, result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            res.status(500);
                            respond = {
                                success: false,
                                message: err.message,
                            };
                        }
                        res.status(200);
                        let masters = yield LocationMasters_1.default.getMasters();
                        Object.keys(result.data).forEach(key => {
                            result.data[key]['_country_id'] = LocationMasters_1.default.getCountryNameById(masters, result.data[key]['_country_id']);
                            result.data[key]['_state_id'] = LocationMasters_1.default.getStateNameById(masters, result.data[key]['_state_id']);
                            result.data[key]['_city_id'] = LocationMasters_1.default.getCityNameById(masters, result.data[key]['_city_id']);
                            result.data[key]['_locality_id'] = LocationMasters_1.default.getLocalityNameById(masters, result.data[key]['_locality_id']);
                            result.data[key]['_status'] = (result.data[key]['_status'] == 1 ? 'Active' : 'Inactive');
                        });
                        respond = {
                            success: true,
                            message: 'All Hotels have been fetched',
                            Tabledata: result
                        };
                        res.json(respond);
                    });
                });
            });
        });
        HotelDetailRouter.route('/saveHotelInfo')
            .post(inputvalidator_1.default.HotelDetailsValidate('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let duplicatecheck = false;
            let newHotelDetailsData = req.body;
            let newHotelDetails = HotelDetails_1.default.HotelDetailsCreate(newHotelDetailsData);
            let HotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            HotelDetailsCollection.createIndex({ _hotel_id: 1, _code: 1 }, { unique: true });
            let query = {};
            query["$or"] = new Array();
            query["$or"].push({ _nida_stay_name: newHotelDetails.nida_stay_name });
            if (newHotelDetails.code !== undefined && newHotelDetails.code != "") {
                query["$or"].push({ _code: newHotelDetails.code });
            }
            let inputstatement;
            if (req.body.hotel_id !== undefined) {
                yield HotelDetailsCollection.find(query)
                    .then(document => {
                    if (document.length > 0) {
                        if (document[0]._hotel_id != req.body.hotel_id) {
                            duplicatecheck = true;
                            res.status(400);
                            respond = { success: false, message: 'nidastayname: ' + newHotelDetails.nida_stay_name + ' or code: ' + newHotelDetails.code + ' already exists.' };
                        }
                        else {
                            inputstatement = HotelDetailsCollection.findOneAndUpdate({
                                _hotel_id: req.body.hotel_id
                            }, {
                                $set: newHotelDetails
                            });
                        }
                    }
                    else {
                        inputstatement = HotelDetailsCollection.findOneAndUpdate({
                            _hotel_id: req.body.hotel_id
                        }, {
                            $set: newHotelDetails
                        });
                    }
                }).catch(err => {
                    res.status(400);
                    respond = { success: false, message: err };
                });
            }
            else {
                if (newHotelDetailsData['presave_hotel_id'] === undefined)
                    newHotelDetails['hotel_id'] = identification_1.default.generateUuid;
                else
                    newHotelDetails['hotel_id'] = newHotelDetailsData['presave_hotel_id'];
                yield HotelDetailsCollection.find(query)
                    .then(document => {
                    if (document.length > 0) {
                        duplicatecheck = true;
                        res.status(400);
                        respond = { success: false, message: 'nidastayname: ' + newHotelDetails.nida_stay_name + ' or code: ' + newHotelDetails.code + ' already exists.' };
                    }
                    else {
                        inputstatement = HotelDetailsCollection.insert(newHotelDetails);
                    }
                }).catch(err => {
                    res.status(400);
                    respond = { success: false, message: err };
                });
            }
            if (duplicatecheck == false) {
                yield inputstatement.then((document) => __awaiter(this, void 0, void 0, function* () {
                    if (req.body.hotel_id == "" || req.body.hotel_id === undefined) {
                        let ratesCollection = core_1.default.app.get('mongoClient').get('rates');
                        let hotelid = document._hotel_id;
                        yield ratesCollection.insert(rate_1.default.create(hotelid)).catch(error => {
                            res.status(500);
                            respond = {
                                success: false,
                                message: error.message
                            };
                        });
                    }
                    res.status(200);
                    respond = {
                        success: true,
                        message: (req.body.hotel_id !== undefined ? `Hotel Details has been updated with id ${document._hotel_id}` : `New Hotel Details has been stored with id ${document._hotel_id}`),
                        data: document
                    };
                }))
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            res.json(respond);
        }));
        HotelDetailRouter.route('/getHotelDetails/:hotel_id')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.params.hotel_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.hotel_id)) {
                let result = yield this.getHotelByID(req.params.hotel_id);
                res.status(result.resStatus);
                res.json(result);
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Not a valid Hotel_id'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route('/:contact_id/getContactDetails')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.params.contact_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.contact_id)) {
                query = {
                    _contact_id: req.params.contact_id
                };
                let ContactDetailsCollection = core_1.default.app.get('mongoClient').get('contact_details');
                yield ContactDetailsCollection
                    .find(query)
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `We have collected the requested Contact Details`,
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(404);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(404);
                respond = {
                    success: false,
                    message: 'Not a valid Hotel_id'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route('/:bank_id/getBankDetails')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.params.bank_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.bank_id)) {
                query = {
                    _bank_id: req.params.bank_id
                };
                let ContactDetailsCollection = core_1.default.app.get('mongoClient').get('bank_details');
                yield ContactDetailsCollection
                    .find(query)
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `We have collected the requested Bank Details`,
                        data: document
                    };
                })
                    .catch(error => {
                    res.status(404);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Not a valid Hotel_id'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route('/saveHotelContactInfo')
            .post(inputvalidator_1.default.ContactDetailsValidate('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let newHotelDetailsData = req.body;
            let newContactDetails = ContactDetails_1.default.ContactDetailsCreate(newHotelDetailsData);
            let ContactDetailsCollection = core_1.default.app.get('mongoClient').get('contact_details');
            let inputstatement;
            if (req.body.contact_id !== undefined && inputvalidator_1.default.isValidUUID(req.body.contact_id)) {
                inputstatement = ContactDetailsCollection.findOneAndUpdate({
                    _contact_id: req.body.contact_id
                }, {
                    $set: newContactDetails
                });
            }
            else {
                newContactDetails['contact_id'] = identification_1.default.generateUuid;
                inputstatement = ContactDetailsCollection.insert(newContactDetails);
            }
            yield inputstatement
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: (req.body.contactDetails_id !== undefined ? `Contact Details has been updated with id ${document._contact_id}` : `Contact Details has been stored with id ${document._contact_id}`),
                    data: document
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
        HotelDetailRouter.route('/saveBankInfo')
            .post(inputvalidator_1.default.BankDetailsValidate('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let newBankLegalData = req.body;
            let newBankLegalDetails = BankDetails_1.default.BankLegalCreate(newBankLegalData);
            let BankDetailsCollection = core_1.default.app.get('mongoClient').get('bank_details');
            let inputstatement;
            if (req.body.bank_id !== undefined && inputvalidator_1.default.isValidUUID(req.body.bank_id)) {
                inputstatement = BankDetailsCollection.findOneAndUpdate({
                    _bank_id: req.body.bank_id
                }, {
                    $set: newBankLegalDetails
                });
            }
            else {
                newBankLegalDetails['bank_id'] = identification_1.default.generateUuid;
                inputstatement = BankDetailsCollection.insert(newBankLegalDetails);
            }
            yield inputstatement
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'Bank Details has been stored with id ' + document._id,
                    data: document
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
        HotelDetailRouter.route("/:hotel_id/findHotelById")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.params.hotel_id !== undefined) {
                query = {
                    _hotel_id: req.params.hotel_id
                };
                let HotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
                yield HotelDetailsCollection
                    .count(query)
                    .then(cnt => {
                    if (cnt > 0) {
                        respond = {
                            success: true,
                            message: `hotel ID exists`,
                        };
                    }
                    else {
                        respond = {
                            success: false,
                            message: `hotel ID doesn't exists`,
                        };
                    }
                    res.status(200);
                })
                    .catch(error => {
                    res.status(404);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Invalid Hotel_id'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route("/:contact_id/findContactDetailsById")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.params.contact_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.contact_id)) {
                query = {
                    _contact_id: req.params.contact_id
                };
                let ContactDetailsCollection = core_1.default.app.get('mongoClient').get('contact_details');
                yield ContactDetailsCollection
                    .find(query)
                    .then(document => {
                    respond = {
                        success: true,
                        message: `We have collected contact details information`,
                        data: document
                    };
                    res.status(200);
                })
                    .catch(error => {
                    res.status(404);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Invalid Contact Details ID'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route("/:hotel_id/findContactDetailsByHid")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.params.hotel_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.hotel_id)) {
                query = {
                    _hotel_id: req.params.hotel_id
                };
                let ContactDetailsCollection = core_1.default.app.get('mongoClient').get('contact_details');
                yield ContactDetailsCollection
                    .find(query, { _id: 0, "_FrontDeskContactDetails._landline_stdcode": 1, "_FrontDeskContactDetails._landline_number": 1 })
                    .then(document => {
                    if (document.length > 0) {
                        document = document[0];
                    }
                    else {
                        document = {};
                    }
                    respond = {
                        success: true,
                        message: `We have collected contact details information`,
                        data: document
                    };
                    res.status(200);
                })
                    .catch(error => {
                    res.status(404);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Invalid Contact Details ID'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route("/getHotelAddress")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.query.hotel_id !== undefined && inputvalidator_1.default.isValidUUID(req.query.hotel_id)) {
                query = {
                    _hotel_id: req.query.hotel_id
                };
                let HotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
                yield HotelDetailsCollection
                    .find(query).then(document => {
                    res.status(200);
                    let stdcode;
                    let countrycode = CountryCodeValidator_1.default.getPhoneValidations();
                    Object.keys(countrycode).forEach(key => {
                        if (key == "landline") {
                            Object.keys(countrycode[key]).forEach(subkey => {
                                if (countrycode[key][subkey]['country_id'] == Number(document[0]._country_id)) {
                                    stdcode = countrycode[key][subkey]['stdcode'];
                                }
                            });
                        }
                    });
                    respond = {
                        success: true,
                        message: `We have fetched Hotel Details`,
                        data: document,
                        stdcode: stdcode
                    };
                })
                    .catch(error => {
                    res.status(404);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Invalid Hotel_id'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route("/getHotelByName")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.query.hotel_name !== undefined && req.query.hotel_name != "") {
                query = {
                    _nida_stay_name: new RegExp(req.query.hotel_name + '*', 'i')
                };
                if (req.query.city_id !== undefined && req.query.city_id != "") {
                    query['_city_id'] = req.query.city_id;
                }
                let HotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
                yield HotelDetailsCollection
                    .find(query, { _nida_stay_name: 1, _hotel_id: 1 }).then(documents => {
                    res.status(200);
                    let resArr = new Array();
                    if (documents.length > 0) {
                        documents.forEach(item => {
                            resArr.push({ label: item._nida_stay_name, value: item._hotel_id });
                        });
                    }
                    respond = {
                        success: true,
                        message: `We have fetched Hotel Details`,
                        data: resArr,
                    };
                })
                    .catch(error => {
                    res.status(400);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'Invalid Hotel_id'
                };
            }
            res.json(respond);
        }));
        HotelDetailRouter.route("/getAllHotelsToFrontend")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let respond;
            let HotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            yield HotelDetailsCollection
                .find({ _status: "1" }, { _nida_stay_name: 1, _hotel_id: 1, _country_id: 1, _state_id: 1, _city_id: 1, _locality_id: 1, _status: 1, _image_fids: 1 }).then(hotels => {
                console.log(hotels);
                res.status(200);
                if (hotels.length > 0) {
                    Object.keys(hotels).forEach(key => {
                        hotels[key]['countryID'] = hotels[key]['_country_id'];
                        hotels[key]['_country_id'] = LocationMasters_1.default.getCountryNameById(masters, hotels[key]['_country_id']);
                        hotels[key]['_state_id'] = LocationMasters_1.default.getStateNameById(masters, hotels[key]['_state_id']);
                        hotels[key]['_city_id'] = LocationMasters_1.default.getCityNameById(masters, hotels[key]['_city_id']);
                        hotels[key]['_locality_id'] = LocationMasters_1.default.getLocalityNameById(masters, hotels[key]['_locality_id']);
                        hotels[key]['_status'] = (hotels[key]['_status'] == 1 ? 'Active' : 'Inactive');
                    });
                }
                respond = {
                    success: true,
                    message: `We have fetched Hotel Details`,
                    data: hotels,
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        HotelDetailRouter.route("/uploadHotelImage")
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let fids = JSON.parse(req.body.fids);
            let hotel_id = req.body.hotel_id;
            let HotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            return yield HotelDetailsCollection.update({
                _hotel_id: hotel_id
            }, {
                $addToSet: { _image_fids: { $each: fids } }
            }).then(result => {
                respond = {
                    success: true,
                    message: `We have fetched Hotel Details`,
                };
                return res.status(200).json(respond);
            }).catch(err => {
                respond = {
                    success: false,
                    message: err.message
                };
                return res.status(400).json(respond);
            });
        }));
        HotelDetailRouter.route('/ghtd')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let type = req.query.type;
            let cstring = req.query.cstring;
            let query = {};
            if (type !== undefined && cstring !== undefined) {
                if (type == 1) {
                    let queryString = req.query.cstring.split('country-');
                    let country_id = LocationMasters_1.default.getCountryIdByName(masters, queryString[1].replace(/-/g, ' '));
                    if (country_id == 0) {
                        return res.status(400).json({ success: false, msg: 'Not a valid country, please check the country letters' });
                    }
                    else {
                        query['id'] = country_id;
                    }
                }
                else if (type == 2) {
                    let queryString = req.query.cstring.split('city-');
                    let city_id = LocationMasters_1.default.getCityIdByName(masters, queryString[1].replace(/-/g, ' '));
                    if (city_id == 0) {
                        return res.status(400).json({ success: false, msg: 'Not a valid city, please check the city letters' });
                    }
                    else {
                        query['id'] = city_id;
                    }
                }
                this.getHotelsByType(type, query['id'])
                    .then(hdata => {
                    if (hdata.success) {
                        res.status(200).json(hdata);
                    }
                }, err => {
                    res.status(400).json(err);
                })
                    .catch(err => {
                    res.status(400).json(err);
                });
            }
            else {
                res.status(400).json({ success: false, msg: 'Invalid data' });
            }
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            if (req.body.ids !== undefined) {
                yield hotelCollection.find({ _hotel_id: { $in: req.body.ids } }, { _nida_stay_name: 1, _hotel_id: 1, _latitude: 1, _longitude: 1, _image_fids: 1 })
                    .then(documents => {
                    if (documents.length > 0) {
                        res.status(200).json({ success: true, data: documents });
                    }
                    else {
                        res.status(400).json({ success: false, data: documents, msg: 'No results found!' });
                    }
                }).catch(err => {
                    res.status(400).json({ success: false, msg: err.message });
                });
            }
            else {
                res.status(400).json({ success: false, msg: 'Invalid data' });
            }
        }));
        return HotelDetailRouter;
    }
    static getHotelsByType(type, id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let hotelCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            let query = { '_status': "1" };
            if (type == 1) {
                query['_country_id'] = id;
            }
            else if (type == 2) {
                query['_city_id'] = id;
            }
            console.log('hotel query', query);
            yield hotelCollection.find(query, { _nida_stay_name: 1, _hotel_id: 1, _latitude: 1, _longitude: 1, _image_fids: 1 })
                .then(documents => {
                if (documents.length > 0) {
                    resolve({ success: true, data: documents });
                }
                else {
                    reject({ success: false, data: documents, msg: 'No results found!' });
                }
            }).catch(err => {
                reject({ success: false, msg: err.message });
            });
        }));
    }
}
HotelDetailsController.getHotelByID = (hotel_id) => __awaiter(this, void 0, void 0, function* () {
    let query = {};
    let hotelCollection = core_1.default.app.get('mongoClient').get('hotel_details');
    query = {
        _hotel_id: hotel_id
    };
    return yield hotelCollection
        .find(query)
        .then(document => {
        return {
            resStatus: 200,
            success: true,
            message: `We have collected the requested Hotel Details`,
            data: document
        };
    })
        .catch(error => {
        return {
            resStatus: 400,
            success: false,
            message: error.message
        };
    });
});
HotelDetailsController.getHotelSublinks = (hid) => __awaiter(this, void 0, void 0, function* () {
    let respond = {};
    let CDCollection = core_1.default.app.get('mongoClient').get('contact_details');
    let BDCollection = core_1.default.app.get('mongoClient').get('bank_details');
    let FSCollection = core_1.default.app.get('mongoClient').get('facilities_services');
    let RateCollection = core_1.default.app.get('mongoClient').get('rates');
    let FlexiCollection = core_1.default.app.get('mongoClient').get('flexi');
    yield CDCollection
        .find({
        _hotel_id: hid
    }).then(data => {
        if (data.length > 0) {
            respond['contact_details'] = data[0]._contact_id;
        }
        else {
            respond['contact_details'] = false;
        }
    }).catch(err => {
    });
    yield BDCollection
        .find({
        _hotel_id: hid
    }).then(data => {
        if (data.length > 0) {
            respond['bank_details'] = data[0]._bank_id;
        }
        else {
            respond['bank_details'] = false;
        }
    }).catch(err => {
    });
    yield FSCollection
        .find({
        _hotel_id: hid
    }).then(data => {
        if (data.length > 0) {
            respond['facilities_services'] = data[0]._facility_id;
        }
        else {
            respond['facilities_services'] = false;
        }
    }).catch(err => {
    });
    yield RateCollection
        .find({
        _hotelId: hid
    }).then(data => {
        if (data.length > 0) {
            respond['rates'] = true;
        }
        else {
            respond['rates'] = false;
        }
    }).catch(err => {
    });
    yield FlexiCollection
        .find({
        _hotel_id: hid
    }).then(data => {
        if (data.length > 0) {
            respond['flexi'] = data[0]._flexi_id;
        }
        else {
            respond['flexi'] = false;
        }
    }).catch(err => {
    });
    return respond;
});
exports.default = HotelDetailsController;
