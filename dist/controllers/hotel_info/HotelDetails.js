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
const APIClient_1 = require("../../helpers/APIClient");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const FacilitiesManager_1 = require("./FacilitiesManager");
const FacilitiesAndServices_1 = require("./FacilitiesAndServices");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const roomdetails_1 = require("../rooms/roomdetails");
const identification_1 = require("../../helpers/identification");
const FileManager_1 = require("../../helpers/FileManager");
var ObjectId = require('mongodb').ObjectID;
const Html_Entities = require('html-entities').AllHtmlEntities;
class HotelDetailsController {
    static get routes() {
        let HotelDetailRouter = express.Router();
        HotelDetailRouter.route("/")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.render('hotel_listings');
        }));
        HotelDetailRouter.route("/:hotel_id/view")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let fieldMasters = yield FacilitiesManager_1.default.getAllMasters();
            let respond;
            if (req.params.hotel_id !== undefined) {
                let postbody = JSON.stringify({});
                APIClient_1.default.send('/hotel_manager/getHotelDetails/' + req.params.hotel_id, postbody, function (api_result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (api_result.success) {
                            let templateData = {};
                            if (api_result.data.length >= 1) {
                                api_result.data[0]._country_id = masters[api_result.data[0]._country_id].name;
                                api_result.data[0]._state_id = LocationMasters_1.default.getStateNameById(masters, api_result.data[0]._state_id);
                                api_result.data[0]._city_id = LocationMasters_1.default.getCityNameById(masters, api_result.data[0]._city_id);
                                api_result.data[0]._locality_id = LocationMasters_1.default.getLocalityNameById(masters, api_result.data[0]._locality_id);
                                api_result.data[0]._hotel_type = (api_result.data[0]._hotel_type === undefined ? "" : FacilitiesAndServices_1.default.findMastertext(fieldMasters, 'hotel_types', api_result.data[0]._hotel_type));
                                api_result.data[0]._status = (api_result.data[0]._status === undefined ? 'Inactive' : (api_result.data[0]._status == 1 ? "Active" : "Inactive"));
                                api_result.data[0]._code = (api_result.data[0]._code === undefined ? '' : api_result.data[0]._code);
                                api_result.data[0]._description = (api_result.data[0]._description === undefined ? '' : HotelDetailsController.htmlEntities.decode(api_result.data[0]._description));
                                api_result.data[0]._rating_snippet = (api_result.data[0]._rating_snippet === undefined ? '' : HotelDetailsController.htmlEntities.decode(api_result.data[0]._rating_snippet));
                                api_result.data[0]._rating_link = (api_result.data[0]._rating_link === undefined ? '' : HotelDetailsController.htmlEntities.decode(api_result.data[0]._rating_link));
                                api_result.data[0]._cutom_rating_image = (api_result.data[0]._cutom_rating_image === undefined ? '' : HotelDetailsController.htmlEntities.decode(api_result.data[0]._cutom_rating_image));
                                api_result.data[0]._cutom_rating_link = (api_result.data[0]._cutom_rating_link === undefined ? '' : HotelDetailsController.htmlEntities.decode(api_result.data[0]._cutom_rating_link));
                                api_result.data[0]._ota_username = (api_result.data[0]._ota_username === undefined ? '' : api_result.data[0]._ota_username);
                                api_result.data[0]._ota_password = (api_result.data[0]._ota_password === undefined ? '' : api_result.data[0]._ota_password);
                                api_result.data[0]._ota_hotel_code = (api_result.data[0]._ota_hotel_code === undefined ? '' : api_result.data[0]._ota_hotel_code);
                                api_result.data[0]._deposit_amount = (api_result.data[0]._deposit_amount === undefined ? '' : api_result.data[0]._deposit_amount);
                                if (api_result.data[0]._image_fids !== undefined) {
                                    if (api_result.data[0]._image_fids !== null) {
                                        let links = yield FileManager_1.default.getFiles(JSON.stringify(api_result.data[0]._image_fids));
                                        if (links.success) {
                                            let linksarr = new Array();
                                            links.data.forEach((link, key) => {
                                                linksarr.push({ link: link, mime: links.mime_types[key] });
                                            });
                                            api_result.data[0]._hotel_images = linksarr;
                                        }
                                    }
                                }
                                templateData = {
                                    success: true,
                                    message: api_result.message,
                                    data: api_result.data[0]
                                };
                            }
                            else {
                                templateData = {
                                    success: false,
                                    message: 'No Results found',
                                    data: {}
                                };
                            }
                            res.status(200)
                                .render('hotel_details_view', templateData);
                        }
                        else {
                            let templateData = {
                                success: false,
                                message: 'Hotel Details ID is Invalid',
                            };
                            res.status(400)
                                .render('hotel_details_view', templateData);
                        }
                    });
                }, 'GET');
            }
            else {
                respond = {
                    success: false,
                    message: "Hotel Details ID Required/Invalid"
                };
                res.status(200)
                    .render('hotel_details_view', respond);
            }
        }));
        HotelDetailRouter.route("/create")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            let masters = yield LocationMasters_1.default.getMasters();
            let fieldMasters = yield FacilitiesManager_1.default.getAllMasters();
            let presave_hotel_id = identification_1.default.generateUuid;
            res.render('hotel_details', { 'locationmasters': masters, fieldMasters: fieldMasters, presave_hotel_id: presave_hotel_id });
        }))
            .post(inputvalidator_1.default.HotelDetailsValidate('web'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            var newHotelDetails = {
                nida_stay_name: req.body.nidastayname,
                country_id: req.body.country,
                state_id: req.body.state,
                city_id: req.body.city,
                locality_id: req.body.locality,
                actual_hotel_name: req.body.actualHotelName,
                zipcode: req.body.zipcode,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                total_no_Of_rooms: req.body.noOfRooms,
                address_line1: req.body.addressline1,
                address_line2: req.body.addressline2,
                hotel_type: req.body.hotel_type,
                image_fids: roomdetails_1.default.convertImageStringsToArray(req.body.hotel_images),
                status: req.body.hotel_status,
                code: req.body.hotel_code,
                description: HotelDetailsController.htmlEntities.encode(req.body.hotel_description),
                rating_snippet: HotelDetailsController.htmlEntities.encode(req.body.rating_snippet),
                rating_link: HotelDetailsController.htmlEntities.encode(req.body.rating_link),
                custom_rating_image: HotelDetailsController.htmlEntities.encode(req.body.custom_rating_image),
                custom_rating_link: HotelDetailsController.htmlEntities.encode(req.body.custom_rating_link),
                ota_username: req.body.ota_username,
                ota_password: req.body.ota_password,
                ota_hotel_code: req.body.ota_hotel_code,
                deposit_amount: req.body.deposit_amount
            };
            let errorobj = {};
            if (req.query.id !== undefined) {
                newHotelDetails['hotel_id'] = req.query.id;
                var postbody = JSON.stringify(newHotelDetails);
                errorobj['hotel_id'] = req.query.id;
            }
            else {
                newHotelDetails['presave_hotel_id'] = req.body.presave_hotel_id;
                var postbody = JSON.stringify(newHotelDetails);
            }
            errorobj['requestBody'] = req.body;
            errorobj['locationmasters'] = yield LocationMasters_1.default.getMasters();
            errorobj['fieldMasters'] = yield FacilitiesManager_1.default.getAllMasters();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    res.render('hotel_details', errorobj);
                }
                else {
                    APIClient_1.default.send('/hotel_manager/saveHotelInfo', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/hotel_details/' + api_result.data._hotel_id + '/view');
                        }
                        else {
                            errorobj['success'] = false;
                            errorobj['message'] = api_result.message;
                            res.status(400)
                                .render('hotel_details', errorobj);
                        }
                    });
                }
            });
        }));
        HotelDetailRouter.route("/:hotel_id/edit")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let fieldMasters = yield FacilitiesManager_1.default.getAllMasters();
            let respond;
            if (req.params.hotel_id !== undefined) {
                let postbody = JSON.stringify({});
                APIClient_1.default.send('/hotel_manager/getHotelDetails/' + req.params.hotel_id, postbody, function (api_result) {
                    if (api_result.success) {
                        var newHotelDetails = {
                            nidastayname: api_result.data[0]._nida_stay_name,
                            country: api_result.data[0]._country_id,
                            state: api_result.data[0]._state_id,
                            city: api_result.data[0]._city_id,
                            locality: api_result.data[0]._locality_id,
                            actualHotelName: api_result.data[0]._actual_hotel_name,
                            zipcode: api_result.data[0]._zipcode,
                            latitude: api_result.data[0]._latitude,
                            longitude: api_result.data[0]._longitude,
                            noOfRooms: api_result.data[0]._total_no_Of_rooms,
                            addressline1: api_result.data[0]._address_line1,
                            addressline2: api_result.data[0]._address_line2,
                            hotel_type: (api_result.data[0]._hotel_type === undefined ? "" : api_result.data[0]._hotel_type),
                            hotel_images: (api_result.data[0]._image_fids === undefined ? "" : (api_result.data[0]._image_fids === null ? "" : JSON.stringify(api_result.data[0]._image_fids))),
                            hotel_status: (api_result.data[0]._status === undefined ? 2 : api_result.data[0]._status),
                            hotel_code: (api_result.data[0]._code === undefined ? "" : api_result.data[0]._code),
                            hotel_description: (api_result.data[0]._description === undefined ? "" : HotelDetailsController.htmlEntities.decode(api_result.data[0]._description)),
                            rating_snippet: (api_result.data[0]._rating_snippet === undefined ? "" : HotelDetailsController.htmlEntities.decode(api_result.data[0]._rating_snippet)),
                            rating_link: (api_result.data[0]._rating_link === undefined ? "" : HotelDetailsController.htmlEntities.decode(api_result.data[0]._rating_link)),
                            custom_rating_image: (api_result.data[0]._custom_rating_image === undefined ? "" : HotelDetailsController.htmlEntities.decode(api_result.data[0]._custom_rating_image)),
                            custom_rating_link: (api_result.data[0]._custom_rating_link === undefined ? "" : HotelDetailsController.htmlEntities.decode(api_result.data[0]._custom_rating_link)),
                            ota_username: (api_result.data[0]._ota_username === undefined ? '' : api_result.data[0]._ota_username),
                            ota_password: (api_result.data[0]._ota_password === undefined ? '' : api_result.data[0]._ota_password),
                            ota_hotel_code: (api_result.data[0]._ota_hotel_code === undefined ? '' : api_result.data[0]._ota_hotel_code),
                            deposit_amount: (api_result.data[0]._deposit_amount === undefined ? '' : api_result.data[0]._deposit_amount)
                        };
                        let templateData = {
                            success: true,
                            message: api_result.message,
                            requestBody: newHotelDetails,
                            locationmasters: masters,
                            fieldMasters: fieldMasters,
                            hotel_id: req.params.hotel_id,
                            presave_hotel_id: req.params.hotel_id
                        };
                        res.status(200)
                            .render('hotel_details', templateData);
                    }
                    else {
                        res.status(400)
                            .render('hotel_details', api_result);
                    }
                }, 'GET');
            }
            else {
                respond = {
                    success: false,
                    message: "Invalid Hotel_ID"
                };
                res.status(200)
                    .render('hotel_details', respond);
            }
        }));
        return HotelDetailRouter;
    }
}
HotelDetailsController.htmlEntities = new Html_Entities();
exports.default = HotelDetailsController;
