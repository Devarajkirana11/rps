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
const seo_1 = require("../../models/seo/seo");
const app_1 = require("../../config/app");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const identification_1 = require("../../helpers/identification");
const request_1 = require("../../helpers/request");
const FileManager_1 = require("../../helpers/FileManager");
const Html_Entities = require('html-entities').AllHtmlEntities;
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
class SeoManager {
    static get routes() {
        let SeoManagerRouter = express.Router();
        let SeoCollection = core_1.default.app.get('mongoClient').get('seo_details');
        SeoManagerRouter.route('/getAllSeoContents')
            .post(function (req, res) {
            let respond;
            MongoClient.connect(app_1.environments[process.env.ENV].mongoDBUrl, function (err, db) {
                let UserSession = res.locals.user_details;
                let options = req.body;
                let columns = req.body.columns;
                let CustomizedQuery = {};
                columns.forEach(column => {
                    if ((column.name == "_country_id" || column.name == "_state_id" || column.name == "_city_id") && column.searchable == 'false') {
                        CustomizedQuery[column.name] = new RegExp('^' + column.search.value);
                    }
                });
                if (Object.keys(CustomizedQuery).length)
                    options.customQuery = CustomizedQuery;
                options.caseInsensitiveSearch = true;
                new MongoDataTable(db).get('seo_details', options, function (err, result) {
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
                            result.data[key]['_state_id'] = (result.data[key]['_state_id'] != 'all' ? LocationMasters_1.default.getStateNameById(masters, result.data[key]['_state_id']) : '-');
                            result.data[key]['_city_id'] = (result.data[key]['_city_id'] != "all" ? LocationMasters_1.default.getCityNameById(masters, result.data[key]['_city_id']) : '-');
                            result.data[key]['_status'] = (result.data[key]['_status'] == 1 ? 'Active' : 'Inactive');
                            result.data[key]['_seo_type'] = (result.data[key]['_seo_type'] == 1 ? 'Country' : (result.data[key]['_seo_type'] == 2 ? 'City' : 'Hotel'));
                        });
                        respond = {
                            success: true,
                            message: 'All SEO details have been fetched',
                            Tabledata: result
                        };
                        res.json(respond);
                    });
                });
            });
        });
        SeoManagerRouter.route('/SaveSeoInfo')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let duplicatecheck = false;
            let newSeoDetailsData = req.body;
            let newSeoDetails = seo_1.default.create(newSeoDetailsData);
            let query = {};
            query["$and"] = new Array();
            query["$and"].push({ _country_id: newSeoDetails.country_id });
            query["$and"].push({ _state_id: newSeoDetails.state_id });
            query["$and"].push({ _city_id: newSeoDetails.city_id });
            if (newSeoDetails.hotel_id != "") {
                query["$and"].push({ _hotel_id: newSeoDetails.hotel_id });
            }
            console.log(query);
            let inputstatement;
            if (req.body.seo_id !== undefined) {
                yield SeoCollection.find(query)
                    .then(document => {
                    if (document.length > 0) {
                        if (document[0]._seo_id != req.body.seo_id) {
                            duplicatecheck = true;
                            res.status(400);
                            respond = { success: false, message: 'country, state and city combination already exists.' };
                        }
                        else {
                            inputstatement = SeoCollection.findOneAndUpdate({
                                _seo_id: req.body.seo_id
                            }, {
                                $set: newSeoDetails
                            });
                        }
                    }
                    else {
                        inputstatement = SeoCollection.findOneAndUpdate({
                            _seo_id: req.body.seo_id
                        }, {
                            $set: newSeoDetails
                        });
                    }
                }).catch(err => {
                    res.status(400);
                    respond = { success: false, message: err };
                });
            }
            else {
                newSeoDetails['seo_id'] = identification_1.default.generateUuid;
                yield SeoCollection.find(query)
                    .then(document => {
                    if (document.length > 0) {
                        duplicatecheck = true;
                        res.status(400);
                        respond = { success: false, message: 'While new entry, country, state and city combination already exists.' };
                    }
                    else {
                        inputstatement = SeoCollection.insert(newSeoDetails);
                    }
                }).catch(err => {
                    res.status(400);
                    respond = { success: false, message: err };
                });
            }
            if (duplicatecheck == false) {
                yield inputstatement.then((document) => __awaiter(this, void 0, void 0, function* () {
                    res.status(200);
                    respond = {
                        success: true,
                        message: (req.body.seo_id !== undefined ? `SEO Details has been updated with id ${document._seo_id}` : `New SEO Details has been stored with id ${document._seo_id}`),
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
        SeoManagerRouter.route('/getSeoContent')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let seo_type = req.query.type;
            let query = {};
            if (req.query.country !== undefined) {
                let country_id = LocationMasters_1.default.getCountryIdByName(masters, req.query.country.replace(/-/g, ' '));
                if (country_id == 0) {
                    return res.status(400).json({ success: false, msg: 'Not a valid country, please check the country letters' });
                }
                else {
                    query['_country_id'] = country_id;
                    query['_seo_type'] = "1";
                }
            }
            else if (req.query.city !== undefined) {
                let city_id = LocationMasters_1.default.getCityIdByName(masters, req.query.city.replace(/-/g, ' '));
                if (city_id == 0) {
                    return res.status(400).json({ success: false, msg: 'Not a valid city, please check the city letters' });
                }
                else {
                    query['_city_id'] = city_id;
                    query['_seo_type'] = "2";
                }
            }
            else if (req.query.hotel !== undefined) {
                yield SeoManager.getHotelByName(req.query.hotel.replace(/-/g, ' '))
                    .then(result => {
                    if (result.success) {
                        if (result.data.length > 0) {
                            query['_hotel_id'] = result.data[0]['value'];
                        }
                        else {
                            return res.status(400).json({ success: false, msg: 'Not results found for this hotel ' + req.query.hotel });
                        }
                    }
                    else {
                        return res.status(400).json({ success: false, msg: 'Not a valid hotel, gethotel result failed' });
                    }
                }, err => {
                    return res.status(400).json({ success: false, msg: 'Not a valid hotel, please check the hotel name' });
                })
                    .catch(err => {
                    return res.status(400).json({ success: false, msg: err.message });
                });
            }
            else if (req.query.seo_id !== undefined) {
                query['_seo_id'] = req.query.seo_id;
            }
            yield SeoCollection.find(query)
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                if (document.length > 0) {
                    if (document[0]._image_fids !== undefined) {
                        if (document[0]._image_fids !== null) {
                            let links = yield FileManager_1.default.getFiles(JSON.stringify(document[0]._image_fids));
                            if (links.success) {
                                let linksarr = new Array();
                                links.data.forEach((link, key) => {
                                    linksarr.push({ link: link, mime: links.mime_types[key] });
                                });
                                document[0]._images = linksarr[0];
                                if (query['_seo_type'] == "1") {
                                    document[0]._name = LocationMasters_1.default.getCountryNameById(masters, document[0]._country_id);
                                }
                                else if (query['_seo_type'] == "2") {
                                    document[0]._name = LocationMasters_1.default.getCityNameById(masters, document[0]._city_id);
                                }
                            }
                        }
                    }
                    document[0]['_description'] = SeoManager.htmlEntities.decode(document[0]['_description']);
                    return res.status(200).json({ success: true, message: 'successfully retrived the seo details', data: document[0] });
                }
                else {
                    return res.status(200).json({ success: false, message: 'Invalid input details' });
                }
            })).catch(err => {
                return res.status(400).json({ success: false, message: err });
            });
        }));
        SeoManagerRouter.route('/locality')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let type = req.query.type;
            let cstring = req.query.cstring;
            let query = { '_status': "1" };
            if (type !== undefined && cstring !== undefined) {
                if (type == 1) {
                    let queryString = req.query.cstring.split('country-');
                    let country_id = LocationMasters_1.default.getCountryIdByName(masters, queryString[1].replace(/-/g, ' '));
                    if (country_id == 0) {
                        return res.status(400).json({ success: false, msg: 'Not a valid country, please check the country letters' });
                    }
                    else {
                        query['_country_id'] = country_id;
                        query['_seo_type'] = "3";
                    }
                }
                else if (type == 2) {
                    let queryString = req.query.cstring.split('city-');
                    let city_id = LocationMasters_1.default.getCityIdByName(masters, queryString[1].replace(/-/g, ' '));
                    if (city_id == 0) {
                        return res.status(400).json({ success: false, msg: 'Not a valid city, please check the city letters' });
                    }
                    else {
                        query['_city_id'] = city_id;
                        query['_seo_type'] = "3";
                    }
                }
                yield SeoCollection.find(query)
                    .then((documents) => __awaiter(this, void 0, void 0, function* () {
                    if (documents.length > 0) {
                        documents.forEach((doc, index) => {
                            if (type == 1) {
                            }
                        });
                        return res.status(200).json({ success: true, message: 'successfully retrived the seo details', data: documents });
                    }
                    else {
                        return res.status(200).json({ success: false, message: 'No Results.' });
                    }
                })).catch(err => {
                    return res.status(400).json({ success: false, message: err.message });
                });
            }
            else {
                res.status(400).json({ success: false, msg: 'Invalid data' });
            }
        }));
        return SeoManagerRouter;
    }
    static getHotelByName(hotel_name) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield request_1.default.get('/hotel_manager/getHotelByName', { hotel_name: hotel_name })
                .then(response => {
                if (response.success) {
                    resolve(response);
                }
            }).catch(error => {
                reject(false);
            });
        }));
    }
    static checkEnityExists(type, id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let SeoCollection = core_1.default.app.get('mongoClient').get('seo_details');
            let query = {};
            if (type == 1) {
                query['_country_id'] = id;
                query['_seo_type'] = "1";
            }
            else if (type == 2) {
                query['_city_id'] = id;
                query['_seo_type'] = "2";
            }
            yield SeoCollection.find(query)
                .then(document => {
                if (document.length > 0) {
                    resolve(true);
                }
                else {
                    reject(false);
                }
            }).catch(err => {
                reject(false);
            });
        }));
    }
}
SeoManager.htmlEntities = new Html_Entities();
exports.default = SeoManager;
