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
const FacilitiesManager_1 = require("./FacilitiesManager");
const FacilitiesAndServices_1 = require("../../middlewares/validation/FacilitiesAndServices");
const FileManager_1 = require("../../helpers/FileManager");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const Entities = require('html-entities').AllHtmlEntities;
var ObjectId = require('mongodb').ObjectID;
class FacilitiesAndServicesController {
    static findMastertext(master, collection, value, checkbox = false, returntype = 'text') {
        let respond = null;
        let respondArray = new Array();
        if (master[collection] !== undefined && value !== null && value !== undefined) {
            Object.keys(master[collection]).forEach(subkey => {
                let masterIndexValue = master[collection][subkey]['value'];
                let masterIndexText = master[collection][subkey]['text'];
                if (FacilitiesAndServices_1.default.isArray(value)) {
                    Object.keys(value).forEach(valuekey => {
                        if (checkbox == true) {
                            if (masterIndexValue == value[valuekey]['_parent_id']) {
                                if (returntype == 'text')
                                    respondArray.push(masterIndexText);
                                else
                                    respondArray.push(masterIndexValue);
                            }
                        }
                        else {
                            if (masterIndexValue == value[valuekey]) {
                                respondArray.push(masterIndexText);
                            }
                        }
                    });
                }
                else {
                    if (masterIndexValue.toString() == value.toString()) {
                        respond = masterIndexText;
                    }
                }
            });
        }
        if (value !== null && value !== undefined) {
            if (FacilitiesAndServices_1.default.isArray(value))
                return respondArray;
            else
                return respond;
        }
        else {
            return respond;
        }
    }
    static get routes() {
        let FacilitiesAndServicesRouter = express.Router();
        FacilitiesAndServicesRouter.route('/:facility_id/view')
            .get(FacilitiesAndServices_1.default.FacilitiesAndServicesFind("web"), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let Masters = yield FacilitiesManager_1.default.getAllMasters();
            let postbody = JSON.stringify({});
            APIClient_1.default.send('/facilities_services_manager/' + req.params.facility_id + '/findFacilitiesAndServices', postbody, function (api_result) {
                if (api_result.success && api_result.data.length >= 1) {
                    try {
                        var checkboxtextArr;
                        api_result.data[0]._hotel_checks._check_in._from = FacilitiesAndServicesController.findMastertext(Masters, 'hotel_checks', api_result.data[0]._hotel_checks._check_in._from);
                        api_result.data[0]._hotel_checks._check_in._to = FacilitiesAndServicesController.findMastertext(Masters, 'hotel_checks', api_result.data[0]._hotel_checks._check_in._to);
                        api_result.data[0]._hotel_checks._check_out._from = FacilitiesAndServicesController.findMastertext(Masters, 'hotel_checks', api_result.data[0]._hotel_checks._check_out._from);
                        api_result.data[0]._hotel_checks._check_out._to = FacilitiesAndServicesController.findMastertext(Masters, 'hotel_checks', api_result.data[0]._hotel_checks._check_out._to);
                        api_result.data[0]._internet._internet_to_guests = FacilitiesAndServicesController.findMastertext(Masters, 'availability', api_result.data[0]._internet._internet_to_guests);
                        api_result.data[0]._internet._connection_type = FacilitiesAndServicesController.findMastertext(Masters, 'internetconnectiontypes', api_result.data[0]._internet._connection_type);
                        checkboxtextArr = FacilitiesAndServicesController.findMastertext(Masters, 'internet_locations', api_result.data[0]._internet._connection_location, true);
                        api_result.data[0]._internet._connection_location = FacilitiesAndServicesController.buildCheckboxDetailView(Masters, 'internet_locations', checkboxtextArr, '_internet', api_result, '_connection_location');
                        api_result.data[0]._parking._parking_to_guests.parking = FacilitiesAndServicesController.findMastertext(Masters, 'availability', api_result.data[0]._parking._parking_to_guests.parking);
                        api_result.data[0]._parking._parking_to_guests.parking_security = FacilitiesAndServicesController.findMastertext(Masters, 'security_types', api_result.data[0]._parking._parking_to_guests.parking_security);
                        api_result.data[0]._parking._parking_to_guests.parking_boarding = FacilitiesAndServicesController.findMastertext(Masters, 'boarding_types', api_result.data[0]._parking._parking_to_guests.parking_boarding);
                        api_result.data[0]._pets_allowed = FacilitiesAndServicesController.findMastertext(Masters, 'pets_allowed', api_result.data[0]._pets_allowed);
                        checkboxtextArr = FacilitiesAndServicesController.findMastertext(Masters, 'parking_types', api_result.data[0]._parking._parking_facilities, true);
                        api_result.data[0]._parking._parking_facilities = FacilitiesAndServicesController.buildCheckboxDetailView(Masters, 'parking_types', checkboxtextArr, '_parking', api_result, '_parking_facilities');
                        api_result.data[0]._parking._parking_guests_reservation = FacilitiesAndServicesController.findMastertext(Masters, 'reservation', api_result.data[0]._parking._parking_guests_reservation);
                        api_result.data[0]._languages_spoken = FacilitiesAndServicesController.findMastertext(Masters, 'languages_spoken', api_result.data[0]._languages_spoken);
                        var ArrayFields = new Array('activities', 'food_drink', 'pool_spa', 'transportation', 'frontdesk_services', 'common_areas', 'entertainment_family_services', 'cleaning_services', 'business_facilities', 'miscellaneous');
                        Object.keys(ArrayFields).forEach(key => {
                            let collection = ArrayFields[key];
                            var checkboxtextArr = FacilitiesAndServicesController.findMastertext(Masters, collection, api_result.data[0]['_' + collection], true);
                            api_result.data[0]['_' + ArrayFields[key]] = FacilitiesAndServicesController.buildCheckboxDetailView(Masters, collection, checkboxtextArr, '_' + collection, api_result, null);
                        });
                    }
                    catch (e) {
                        res.status(200)
                            .render('facilities_services_view', { success: false, message: e });
                    }
                    let templateData = {
                        success: true,
                        message: api_result.message,
                        data: api_result.data[0]
                    };
                    res.status(200)
                        .render('facilities_services_view', templateData);
                }
                else {
                    let templateData = {
                        success: false,
                        message: 'Facilities Service ID is Invalid',
                    };
                    res.status(400)
                        .render('facilities_services_view', templateData);
                }
            }, 'GET');
        }));
        FacilitiesAndServicesRouter.route("/create")
            .get(inputvalidator_1.default.checkQueryHidValid('facilities_services'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            let requestparams = yield FacilitiesManager_1.default.getAllMasters();
            requestparams['requestBody'] = { hotel_id: req.query.hid };
            requestparams['formstatus'] = true;
            res.render('facilities_services', requestparams);
        }))
            .post(FacilitiesAndServices_1.default.FacilitiesAndServicesValidate('web'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let ArrayFields = new Array({ field: 'FA', fieldobj: 'activities' }, { field: 'FD', fieldobj: 'food_drink' }, { field: 'PS', fieldobj: 'pool_spa' }, { field: 'TP', fieldobj: 'transportation' }, { field: 'FDS', fieldobj: 'frontdesk_services' }, { field: 'CA', fieldobj: 'common_areas' }, { field: 'EFS', fieldobj: 'entertainment_family_services' }, { field: 'CS', fieldobj: 'cleaning_services' }, { field: 'BF', fieldobj: 'business_facilities' }, { field: 'MSC', fieldobj: 'miscellaneous' }, { field: 'FOF', fieldobj: 'facilitiesOfcharge' });
            var newFacilitiesAndServicesDetails = {
                check_timings: {
                    check_in: { from: req.body.check_in_from, to: req.body.check_in_to },
                    check_out: { from: req.body.check_out_from, to: req.body.check_out_to }
                },
                internet: { internet_to_guests: req.body.internet_to_guest,
                    connection_type: req.body.internet_connection_type,
                    connection_location: FacilitiesAndServicesController.buildCheckboxObject('IL', req.body.IL, req)
                },
                parking: { parking_to_guests: {
                        parking: req.body.parking_to_guest,
                        parking_security: req.body.parking_security_types,
                        parking_boarding: req.body.parking_boarding_types
                    },
                    parking_guest_reservation: req.body.parking_reservation_to_guest,
                    parking_facilities: FacilitiesAndServicesController.buildCheckboxObject('PT', req.body.PT, req)
                },
                pets_allowed: req.body.pets_allowed_dropdown,
                languages_spoken: req.body.languages_spoken_staff
            };
            Object.keys(ArrayFields).forEach(key => {
                newFacilitiesAndServicesDetails[ArrayFields[key]['fieldobj']] = FacilitiesAndServicesController.buildCheckboxObject(ArrayFields[key]['field'], req.body[ArrayFields[key]['field']], req);
            });
            newFacilitiesAndServicesDetails['hotel_id'] = req.body.hotel_id;
            let errorobj = yield FacilitiesManager_1.default.getAllMasters();
            errorobj['requestBody'] = req.body;
            if (req.query.facility_id !== undefined) {
                newFacilitiesAndServicesDetails['facility_id'] = req.query.facility_id;
                var postbody = JSON.stringify(newFacilitiesAndServicesDetails);
                errorobj['facility_id'] = req.query.facility_id;
            }
            else {
                var postbody = JSON.stringify(newFacilitiesAndServicesDetails);
            }
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    errorobj['formstatus'] = true;
                    errorobj['formErrorExists'] = true;
                    res.render('facilities_services', errorobj);
                }
                else {
                    APIClient_1.default.send('/facilities_services_manager/createFacilitiesAndServices', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/facilities_services/' + api_result.data._facility_id + '/view');
                        }
                        else {
                            errorobj['success'] = api_result.success;
                            errorobj['message'] = api_result.message;
                            res.status(400)
                                .render('facilities_services', errorobj);
                        }
                    });
                }
            });
        }));
        FacilitiesAndServicesRouter.route("/:facility_id/edit")
            .get(FacilitiesAndServices_1.default.FacilitiesAndServicesFind("web"), (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            let Masters = yield FacilitiesManager_1.default.getAllMasters();
            let template = Masters;
            let requestBody = {};
            let postbody = JSON.stringify({});
            APIClient_1.default.send('/facilities_services_manager/' + req.params.facility_id + '/findFacilitiesAndServices', postbody, function (api_result) {
                if (api_result.success && api_result.data.length >= 1) {
                    requestBody['hotel_id'] = api_result.data[0]._hotel_id;
                    requestBody['check_in_from'] = api_result.data[0]._hotel_checks._check_in._from;
                    requestBody['check_in_to'] = api_result.data[0]._hotel_checks._check_in._to;
                    requestBody['check_out_from'] = api_result.data[0]._hotel_checks._check_out._from;
                    requestBody['check_out_to'] = api_result.data[0]._hotel_checks._check_out._to;
                    requestBody['internet_to_guest'] = api_result.data[0]._internet._internet_to_guests;
                    requestBody['internet_connection_type'] = api_result.data[0]._internet._connection_type;
                    requestBody['IL'] = FacilitiesAndServicesController.findMastertext(Masters, 'internet_locations', api_result.data[0]._internet._connection_location, true, 'value');
                    requestBody['parking_to_guest'] = api_result.data[0]._parking._parking_to_guests.parking;
                    if (req.body.parking_to_guest == "No") {
                    }
                    else {
                        requestBody['parking_security_types'] = api_result.data[0]._parking._parking_to_guests.parking_security;
                        requestBody['parking_boarding_types'] = api_result.data[0]._parking._parking_to_guests.parking_boarding;
                    }
                    requestBody['pets_allowed_dropdown'] = api_result.data[0]._pets_allowed;
                    requestBody['PT'] = FacilitiesAndServicesController.findMastertext(Masters, 'parking_types', api_result.data[0]._parking._parking_facilities, true, 'value');
                    requestBody['parking_reservation_to_guest'] = api_result.data[0]._parking._parking_guests_reservation;
                    requestBody['languages_spoken_staff'] = api_result.data[0]._languages_spoken;
                    let ArrayFields = new Array({ field: 'FA', fieldobj: 'activities' }, { field: 'FD', fieldobj: 'food_drink' }, { field: 'PS', fieldobj: 'pool_spa' }, { field: 'TP', fieldobj: 'transportation' }, { field: 'FDS', fieldobj: 'frontdesk_services' }, { field: 'CA', fieldobj: 'common_areas' }, { field: 'EFS', fieldobj: 'entertainment_family_services' }, { field: 'CS', fieldobj: 'cleaning_services' }, { field: 'BF', fieldobj: 'business_facilities' }, { field: 'MSC', fieldobj: 'miscellaneous' });
                    Object.keys(ArrayFields).forEach(key => {
                        let collection, field;
                        collection = ArrayFields[key]['fieldobj'];
                        field = ArrayFields[key]['field'];
                        requestBody[ArrayFields[key]['field']] = FacilitiesAndServicesController.findMastertext(Masters, collection, api_result.data[0]['_' + ArrayFields[key]['fieldobj']], true, 'value');
                        requestBody = FacilitiesAndServicesController.buildCheckboxEditView(Masters, collection, '_' + collection, null, requestBody, api_result, field);
                    });
                    requestBody = FacilitiesAndServicesController.buildCheckboxEditView(Masters, 'internet_locations', '_internet', '_connection_location', requestBody, api_result, 'IL');
                    requestBody = FacilitiesAndServicesController.buildCheckboxEditView(Masters, 'parking_types', '_parking', '_parking_facilities', requestBody, api_result, 'PT');
                    template['success'] = true,
                        template['message'] = api_result.message,
                        template['formstatus'] = true;
                    template['requestBody'] = requestBody;
                    template['facility_id'] = req.params.facility_id;
                    res.status(200)
                        .render('facilities_services', template);
                }
                else {
                    let templateData = {
                        success: false,
                        message: 'Facilities Service ID is Invalid',
                    };
                    res.status(400)
                        .render('facilities_services', templateData);
                }
            }, 'GET');
        }));
        return FacilitiesAndServicesRouter;
    }
    static buildCheckboxObject(salt, checkboxarray, req) {
        var outputarray = new Array();
        if (checkboxarray !== undefined) {
            Object.keys(checkboxarray).forEach(key => {
                let imagesArray = new Array();
                let imagefield = req.body['image_' + salt + '_' + checkboxarray[key]];
                let dropdownfield = req.body['dropdown_' + salt + '_' + checkboxarray[key]];
                let description = req.body['desc_' + salt + '_' + checkboxarray[key]];
                dropdownfield = (dropdownfield === undefined) ? "" : dropdownfield;
                if (imagefield) {
                    imagefield = JSON.parse(imagefield);
                    for (let key in imagefield) {
                        imagesArray.push(imagefield[key]);
                    }
                }
                let fieldataObj = { parent_id: checkboxarray[key],
                    image_fids: imagesArray,
                    dropdown: dropdownfield
                };
                if (description) {
                    fieldataObj['description'] = description;
                }
                outputarray.push(fieldataObj);
            });
        }
        return outputarray;
    }
    static buildCheckboxEditView(Masters, collection, fieldobj, fieldobj2 = null, requestBody, api_result, field) {
        if (Masters[collection]) {
            Object.keys(Masters[collection]).forEach(subkey => {
                let dropdownCollection = Masters[collection][subkey]['dropdownExists'];
                let imageExists = Masters[collection][subkey]['imageExists'];
                let checkboxvalues = (fieldobj2 == null ? api_result.data[0][fieldobj] : api_result.data[0][fieldobj][fieldobj2]);
                if (checkboxvalues !== undefined) {
                    Object.keys(checkboxvalues).forEach(VA => {
                        if (dropdownCollection != null) {
                            if (checkboxvalues[VA]["_dropdown"] != null && checkboxvalues[VA]["_dropdown"] != undefined) {
                                let dropdownvalue = checkboxvalues[VA]["_dropdown"];
                                requestBody['dropdown_' + field + '_' + checkboxvalues[VA]["_parent_id"]] = dropdownvalue;
                            }
                        }
                        if (imageExists) {
                            if (checkboxvalues[VA]["_image_fids"].length > 0) {
                                let imageArray = checkboxvalues[VA]["_image_fids"];
                                requestBody['image_' + field + '_' + checkboxvalues[VA]["_parent_id"]] = imageArray;
                            }
                        }
                    });
                }
            });
        }
        return requestBody;
    }
    static buildCheckboxDetailView(Masters, collection, checkboxtextArr, field, api_result, field2) {
        let checkboxArr = new Array();
        Object.keys(checkboxtextArr).forEach((subkey) => __awaiter(this, void 0, void 0, function* () {
            let imagelinks = null;
            let subdropdowntext = null;
            let imageArray = (field2 === null ? api_result.data[0][field][subkey]['_image_fids'] : api_result.data[0][field][field2][subkey]['_image_fids']);
            let subdropdownvalue = (field2 === null ? api_result.data[0][field][subkey]['_dropdown'] : api_result.data[0][field][field2][subkey]['_image_fids']);
            if (Masters[collection]) {
                Object.keys(Masters[collection]).forEach(trikey => {
                    let dropdownCollection = Masters[collection][trikey]['dropdownExists'];
                    let imageExists = Masters[collection][trikey]['imageExists'];
                    let masterText = Masters[collection][trikey]['text'];
                    if (dropdownCollection != null && checkboxtextArr[subkey] == masterText) {
                        if (subdropdownvalue != "") {
                            subdropdowntext = FacilitiesAndServicesController.findMastertext(Masters, dropdownCollection, subdropdownvalue, false);
                        }
                    }
                });
            }
            if (imageArray.length > 0) {
                imagelinks = yield FileManager_1.default.getFiles(JSON.stringify(imageArray))
                    .then(data => {
                    return data;
                }).catch(err => {
                    console.log(err);
                    return err;
                });
            }
            let dataObj = { checkbox: checkboxtextArr[subkey], images: imagelinks, subdropdown: subdropdowntext };
            checkboxArr.push(dataObj);
        }));
        return checkboxArr;
    }
}
exports.default = FacilitiesAndServicesController;
