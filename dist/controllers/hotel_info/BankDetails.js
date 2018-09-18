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
const FileManager_1 = require("../../helpers/FileManager");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
var ObjectId = require('mongodb').ObjectID;
class ContactDetailsController {
    static get routes() {
        let BankDetailRouter = express.Router();
        BankDetailRouter.route("/:bank_id/view")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let respond;
            if (req.params.bank_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.bank_id)) {
                let postbody = JSON.stringify({});
                APIClient_1.default.send('/hotel_manager/' + req.params.bank_id + '/getBankDetails', postbody, function (api_result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (api_result.success && api_result.data.length >= 1) {
                            api_result.data[0]._bankdetails[0]._bankaddress._country = LocationMasters_1.default.getCountryNameById(masters, api_result.data[0]._bankdetails[0]._bankaddress._country);
                            api_result.data[0]._bankdetails[0]._bankaddress._state = LocationMasters_1.default.getStateNameById(masters, api_result.data[0]._bankdetails[0]._bankaddress._state);
                            api_result.data[0]._bankdetails[0]._bankaddress._city = LocationMasters_1.default.getCityNameById(masters, api_result.data[0]._bankdetails[0]._bankaddress._city);
                            api_result.data[0]._bankdetails[0]._accountholderaddress._country = LocationMasters_1.default.getCountryNameById(masters, api_result.data[0]._bankdetails[0]._accountholderaddress._country);
                            api_result.data[0]._bankdetails[0]._accountholderaddress._state = LocationMasters_1.default.getStateNameById(masters, api_result.data[0]._bankdetails[0]._accountholderaddress._state);
                            api_result.data[0]._bankdetails[0]._accountholderaddress._city = LocationMasters_1.default.getCityNameById(masters, api_result.data[0]._bankdetails[0]._accountholderaddress._city);
                            api_result.data[0]._legaldetails[0]._registeredofficeaddress._country = LocationMasters_1.default.getCountryNameById(masters, api_result.data[0]._legaldetails[0]._registeredofficeaddress._country);
                            api_result.data[0]._legaldetails[0]._registeredofficeaddress._state = LocationMasters_1.default.getStateNameById(masters, api_result.data[0]._legaldetails[0]._registeredofficeaddress._state);
                            api_result.data[0]._legaldetails[0]._registeredofficeaddress._city = LocationMasters_1.default.getCityNameById(masters, api_result.data[0]._legaldetails[0]._registeredofficeaddress._city);
                            let links = yield FileManager_1.default.getFiles(api_result.data[0]._legaldetails[0]._legaldocument_fid);
                            if (links.success) {
                                api_result.data[0]._legaldetails[0]._legaldocument_fid = links.data;
                                let templateData = {
                                    success: true,
                                    message: api_result.message,
                                    data: api_result.data[0],
                                    locationmasters: LocationMasters_1.default.getMasters()
                                };
                                res.status(200)
                                    .render('bank_details_view', templateData);
                            }
                            else {
                                let templateData = {
                                    success: true,
                                    message: api_result.message,
                                    data: api_result.data[0],
                                    locationmasters: LocationMasters_1.default.getMasters()
                                };
                                res.status(200)
                                    .render('bank_details_view', templateData);
                            }
                        }
                        else {
                            let templateData = {
                                success: false,
                                message: 'Bank Details ID is Invalid',
                                locationmasters: LocationMasters_1.default.getMasters()
                            };
                            res.status(400)
                                .render('bank_details_view', templateData);
                        }
                    });
                }, 'GET');
            }
            else {
                respond = {
                    success: false,
                    message: "Bank Details ID Required/Invalid"
                };
                res.status(400)
                    .render('bank_details_view', respond);
            }
        }));
        BankDetailRouter.route("/create")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            if (req.query.hid !== undefined && inputvalidator_1.default.isValidUUID(req.query.hid)) {
                let postbody = JSON.stringify({});
                APIClient_1.default.send('/hotel_manager/' + req.query.hid + '/findHotelById', postbody, function (api_result) {
                    if (api_result.success) {
                        res.status(200)
                            .render('bank_details', { locationmasters: masters, formstatus: true, requestBody: { hotel_id: req.query.hid } });
                    }
                    else {
                        api_result['formstatus'] = false;
                        res.status(400)
                            .render('bank_details', api_result);
                    }
                }, 'GET');
            }
            else {
                res.status(400)
                    .render('bank_details', { success: false, message: 'Hotel ID is Required/Invalid' });
            }
        }))
            .post(inputvalidator_1.default.BankDetailsValidate('web'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let newBankAddressDetails = {
                address_line1: req.body.address_line1,
                address_line2: req.body.address_line2,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                zipcode: req.body.zipcode
            };
            let newAccountAddressDetails = {
                address_line1: req.body.ACCaddress_line1,
                address_line2: req.body.ACCaddress_line2,
                country: req.body.ACCcountry,
                state: req.body.ACCstate,
                city: req.body.ACCcity,
                zipcode: req.body.ACCzipcode
            };
            let newLegalAddressDetails = {
                address_line1: req.body.Laddress_line1,
                address_line2: req.body.Laddress_line2,
                country: req.body.Lcountry,
                state: req.body.Lstate,
                city: req.body.Lcity,
                zipcode: req.body.Lzipcode
            };
            let newBankDetails = {
                bankname: req.body.bankname,
                bankaddress: newBankAddressDetails,
                bankbranch: req.body.bankbranch,
                bankaccountnumber: req.body.bankaccountnumber,
                bankcode: req.body.bankcode,
                bankswiftcode: req.body.bankswiftcode,
                accountholderfirstname: req.body.accountholderfirstname,
                accountholderlastname: req.body.accountholderlastname,
                accountholderaddress: newAccountAddressDetails,
                accountSameAsHotelAddress: req.body.accountSameAsHotelAddress
            };
            let newLegalDetails = {
                servicetaxtype: req.body.servicetaxtype,
                servicetaxno: req.body.servicetaxno,
                registeredofficeaddress: newLegalAddressDetails,
                certificatetype: req.body.certificatetype,
                certificateno: req.body.certificateno,
                legaldocument_fid: req.body.legaldocument,
                legalSameAsHotelAddress: req.body.legalSameAsHotelAddress
            };
            let newBankLegalDetails = {
                hotel_id: req.body.hotel_id,
                bankdetails: [newBankDetails],
                legaldetails: [newLegalDetails],
            };
            const errorobj = {};
            if (req.query.bank_id !== undefined) {
                newBankLegalDetails['bank_id'] = req.query.bank_id;
                var postbody = JSON.stringify(newBankLegalDetails);
                errorobj['bank_id'] = req.query.bank_id;
            }
            else {
                var postbody = JSON.stringify(newBankLegalDetails);
            }
            errorobj['requestBody'] = req.body;
            errorobj['locationmasters'] = yield LocationMasters_1.default.getMasters();
            errorobj['formstatus'] = true;
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    errorobj['errorExists'] = true;
                    res.render('bank_details', errorobj);
                }
                else {
                    APIClient_1.default.send('/hotel_manager/saveBankInfo', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/bank_details/' + api_result.data._bank_id + '/view');
                        }
                        else {
                            errorobj['success'] = api_result.success;
                            errorobj['message'] = api_result.message;
                            res.status(400)
                                .render('bank_details', errorobj);
                        }
                    });
                }
            });
        }));
        BankDetailRouter.route("/:bank_id/edit")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let respond;
            if (req.params.bank_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.bank_id)) {
                let postbody = JSON.stringify({});
                let templateData = {
                    locationmasters: masters,
                    bank_id: req.params.bank_id,
                    formstatus: true
                };
                APIClient_1.default.send('/hotel_manager/' + req.params.bank_id + '/getBankDetails', postbody, function (api_result) {
                    if (api_result.success) {
                        try {
                            var newBankDetails = {
                                bankname: api_result.data[0]._bankdetails[0]._bankname,
                                bankbranch: api_result.data[0]._bankdetails[0]._bankbranch,
                                bankaccountnumber: api_result.data[0]._bankdetails[0]._bankaccountnumber,
                                bankcode: api_result.data[0]._bankdetails[0]._bankcode,
                                bankswiftcode: api_result.data[0]._bankdetails[0]._bankswiftcode,
                                accountholderfirstname: api_result.data[0]._bankdetails[0]._accountholderfirstname,
                                accountholderlastname: api_result.data[0]._bankdetails[0]._accountholderlastname,
                                accountholdercity: api_result.data[0]._bankdetails[0]._accountholdercity,
                                address_line1: api_result.data[0]._bankdetails[0]._bankaddress._address_line1,
                                address_line2: api_result.data[0]._bankdetails[0]._bankaddress._address_line2,
                                country: api_result.data[0]._bankdetails[0]._bankaddress._country,
                                state: api_result.data[0]._bankdetails[0]._bankaddress._state,
                                city: api_result.data[0]._bankdetails[0]._bankaddress._city,
                                zipcode: api_result.data[0]._bankdetails[0]._bankaddress._zipcode,
                                ACCaddress_line1: api_result.data[0]._bankdetails[0]._accountholderaddress._address_line1,
                                ACCaddress_line2: api_result.data[0]._bankdetails[0]._accountholderaddress._address_line2,
                                ACCcountry: api_result.data[0]._bankdetails[0]._accountholderaddress._country,
                                ACCstate: api_result.data[0]._bankdetails[0]._accountholderaddress._state,
                                ACCcity: api_result.data[0]._bankdetails[0]._accountholderaddress._city,
                                ACCzipcode: api_result.data[0]._bankdetails[0]._accountholderaddress._zipcode,
                                accountSameAsHotelAddress: api_result.data[0]._bankdetails[0]._accountSameAsHotelAddress,
                                servicetaxtype: api_result.data[0]._legaldetails[0]._servicetaxtype,
                                servicetaxno: api_result.data[0]._legaldetails[0]._servicetaxno,
                                certificatetype: api_result.data[0]._legaldetails[0]._certificatetype,
                                certificateno: api_result.data[0]._legaldetails[0]._certificateno,
                                legaldocument: api_result.data[0]._legaldetails[0]._legaldocument_fid,
                                Laddress_line1: api_result.data[0]._legaldetails[0]._registeredofficeaddress._address_line1,
                                Laddress_line2: api_result.data[0]._legaldetails[0]._registeredofficeaddress._address_line2,
                                Lcountry: api_result.data[0]._legaldetails[0]._registeredofficeaddress._country,
                                Lstate: api_result.data[0]._legaldetails[0]._registeredofficeaddress._state,
                                Lcity: api_result.data[0]._legaldetails[0]._registeredofficeaddress._city,
                                Lzipcode: api_result.data[0]._legaldetails[0]._registeredofficeaddress._zipcode,
                                legalSameAsHotelAddress: api_result.data[0]._legaldetails[0]._legalSameAsHotelAddress,
                                hotel_id: api_result.data[0]._hotel_id
                            };
                            templateData = Object.assign({
                                success: true,
                                message: api_result.message,
                                requestBody: newBankDetails,
                            }, templateData);
                        }
                        catch (e) {
                            templateData = Object.assign({
                                success: false,
                                message: e,
                                requestBody: newBankDetails,
                            }, templateData);
                        }
                        res.status(200)
                            .render('bank_details', templateData);
                    }
                    else {
                        res.status(400)
                            .render('bank_details', api_result);
                    }
                }, 'GET');
            }
            else {
                respond = {
                    success: false,
                    message: "Invalid Bank Details ID"
                };
                res.status(200)
                    .render('bank_details', respond);
            }
        }));
        return BankDetailRouter;
    }
}
exports.default = ContactDetailsController;
