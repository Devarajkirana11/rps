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
const CountryCodeValidator_1 = require("../../helpers/CountryCodeValidator");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
var ObjectId = require('mongodb').ObjectID;
class ContactDetailsController {
    static get routes() {
        let ContactDetailRouter = express.Router();
        CountryCodeValidator_1.default.CCvalidate();
        ContactDetailRouter.route("/:contact_id/view")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let respond;
            if (req.params.contact_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.contact_id)) {
                let postbody = JSON.stringify({});
                APIClient_1.default.send('/hotel_manager/' + req.params.contact_id + '/getContactDetails', postbody, function (api_result) {
                    if (api_result.success && api_result.data.length > 0) {
                        Object.keys(api_result.data[0]._OwnerContactDetails).forEach(key => {
                            api_result.data[0]._OwnerContactDetails[key]._country = LocationMasters_1.default.getCountryNameById(masters, api_result.data[0]._OwnerContactDetails[key]._country);
                            api_result.data[0]._OwnerContactDetails[key]._state = LocationMasters_1.default.getStateNameById(masters, api_result.data[0]._OwnerContactDetails[key]._state);
                            api_result.data[0]._OwnerContactDetails[key]._city = LocationMasters_1.default.getCityNameById(masters, api_result.data[0]._OwnerContactDetails[key]._city);
                        });
                        let templateData = {
                            success: true,
                            message: api_result.message,
                            data: api_result.data[0]
                        };
                        res.status(200)
                            .render('contact_details_view', templateData);
                    }
                    else {
                        let templateData = {
                            success: false,
                            message: 'Contact Details ID is Invalid',
                            data: {}
                        };
                        res.status(400)
                            .render('contact_details_view', templateData);
                    }
                }, 'GET');
            }
            else {
                respond = {
                    success: false,
                    message: "Contact Details ID Required/Invalid"
                };
                res.status(400)
                    .render('contact_details_view', respond);
            }
        }));
        ContactDetailRouter.route("/create")
            .get(inputvalidator_1.default.checkQueryHidValid('contact_details'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            if (req.query.hid !== undefined && inputvalidator_1.default.isValidUUID(req.query.hid)) {
                let postbody = JSON.stringify({ hotel_id: req.query.hid });
                APIClient_1.default.send('/hotel_manager/' + req.query.hid + '/findHotelById', postbody, function (api_result) {
                    if (api_result.success) {
                        res.status(200)
                            .render('contact_details', { locationmasters: masters, stdcodes: CountryCodeValidator_1.default.getPhoneValidations(), formstatus: true, hotel_id: req.query.hid });
                    }
                    else {
                        api_result['formstatus'] = false;
                        res.status(400)
                            .render('contact_details', api_result);
                    }
                }, 'GET');
            }
            else {
                res.status(400)
                    .render('contact_details', { stdcodes: CountryCodeValidator_1.default.getPhoneValidations(), success: false, message: 'Hotel ID is Required/Invalid' });
            }
        }))
            .post(inputvalidator_1.default.ContactDetailsValidate('web'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            errorobj['stdcodes'] = CountryCodeValidator_1.default.getPhoneValidations();
            errorobj['formstatus'] = true;
            errorobj['locationmasters'] = yield LocationMasters_1.default.getMasters();
            var ownercount = req.body.ownercount;
            var managercount = req.body.managercount;
            var frontdeskcount = req.body.frontdeskcount;
            var financecount = req.body.financecount;
            var ownerArray = new Array();
            var managerArray = new Array();
            var frontdeskArray = new Array();
            var financeArray = new Array();
            for (var i = 1; i <= ownercount; i++) {
                var newOwnerContactDetails = {
                    username: req.body['username_' + i],
                    contactname: req.body['contactname_' + i],
                    contactemail: req.body['contactemail_' + i],
                    countrycodel: req.body['countrycodel_' + i],
                    contactnumberl: req.body['contactnumberl_' + i],
                    countrycodem: req.body['countrycodem_' + i],
                    contactnumberm: req.body['contactnumberm_' + i],
                    country: req.body['country_' + i],
                    city: req.body['city_' + i],
                    address_line1: req.body['addressline1_' + i],
                    address_line2: req.body['addressline2_' + i],
                    state: req.body['state_' + i],
                    zipcode: req.body['zipcode_' + i]
                };
                ownerArray.push(newOwnerContactDetails);
            }
            for (var j = 1; j <= managercount; j++) {
                let newManagerDetails = {
                    firstname: req.body['hmcdfirstname_' + j],
                    lastname: req.body['hmcdlastname_' + j],
                    landline_stdcode: req.body['hmcdlandlinenumber_stdcode_' + j],
                    landline_number: req.body['hmcdlandlinenumber_' + j],
                    mobileno_stdcode: req.body['hmcdmobilenumber_stdcode_' + j],
                    mobileno: req.body['hmcdmobilenumber_' + j],
                    email: req.body['hmcdemail_' + j]
                };
                managerArray.push(newManagerDetails);
            }
            for (var m = 1; m <= frontdeskcount; m++) {
                let newFrontDeskDetails = {
                    firstname: req.body['fdcdfirstname_' + m],
                    lastname: req.body['fdcdlastname_' + m],
                    landline_stdcode: req.body['fdcdlandlinenumber_stdcode_' + m],
                    landline_number: req.body['fdcdlandlinenumber_' + m],
                    mobileno_stdcode: req.body['fdcdmobilenumber_stdcode_' + m],
                    mobileno: req.body['fdcdmobilenumber_' + m],
                    email: req.body['fdcdemail_' + m]
                };
                frontdeskArray.push(newFrontDeskDetails);
            }
            for (var n = 1; n <= financecount; n++) {
                let newFinanceDetails = {
                    firstname: req.body['fncdfirstname_' + n],
                    lastname: req.body['fncdlastname_' + n],
                    landline_stdcode: req.body['fncdlandlinenumber_stdcode_' + n],
                    landline_number: req.body['fdcdlandlinenumber_' + n],
                    mobileno_stdcode: req.body['fncdmobilenumber_stdcode_' + n],
                    mobileno: req.body['fncdmobilenumber_' + n],
                    email: req.body['fncdemail_' + n]
                };
                financeArray.push(newFinanceDetails);
            }
            let newContactDetails = {
                hotel_id: req.body.hotel_id,
                OwnerContactDetails: ownerArray,
                ManagerContactDetails: managerArray,
                FrontDeskContactDetails: frontdeskArray,
                FinanceContactDetails: financeArray,
                FrontDeskSameAsFinance: req.body.fdfnsame
            };
            if (req.query.contact_id !== undefined) {
                newContactDetails['contact_id'] = req.query.contact_id;
                var postbody = JSON.stringify(newContactDetails);
                errorobj['contact_id'] = req.query.contact_id;
            }
            else {
                var postbody = JSON.stringify(newContactDetails);
            }
            var countarray = {};
            countarray['ownercount'] = ownercount;
            countarray['managercount'] = managercount;
            countarray['frondeskcount'] = frontdeskcount;
            countarray['financecount'] = financecount;
            errorobj['counts'] = countarray;
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    errorobj['acutalerrors'] = errors;
                    res.render('contact_details', errorobj);
                }
                else {
                    APIClient_1.default.send('/hotel_manager/saveHotelContactInfo', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/contact_details/' + api_result.data._contact_id + '/view');
                        }
                        else {
                            console.log(api_result.message);
                            errorobj['success'] = api_result.success;
                            errorobj['message'] = api_result.message;
                            res.status(400)
                                .render('contact_details', errorobj);
                        }
                    });
                }
            });
        }));
        ContactDetailRouter.route("/:contact_id/edit")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            if (req.params.contact_id !== undefined && inputvalidator_1.default.isValidUUID(req.params.contact_id)) {
                let postbody = JSON.stringify({});
                APIClient_1.default.send('/hotel_manager/' + req.params.contact_id + '/findContactDetailsById', postbody, function (api_result) {
                    if (api_result.success) {
                        let templateData = {};
                        if (api_result.data.length >= 1) {
                            var ownercount = api_result.data[0]._OwnerContactDetails.length;
                            var managercount = api_result.data[0]._ManagerContactDetails.length;
                            var frontdeskcount = api_result.data[0]._FrontDeskContactDetails.length;
                            var financecount = api_result.data[0]._FinanceContactDetails.length;
                            var requestBody = {};
                            requestBody['fdfnsame'] = api_result.data[0]._FrontDeskSameAsFinance;
                            for (var oi = 0; oi < ownercount; oi++) {
                                let ownerDetails = api_result.data[0]._OwnerContactDetails[oi];
                                let i = oi + 1;
                                requestBody['username_' + i] = ownerDetails._username;
                                requestBody['contactname_' + i] = ownerDetails._contactname;
                                requestBody['contactemail_' + i] = ownerDetails._contactemail;
                                requestBody['countrycodel_' + i] = ownerDetails._countrycodel;
                                requestBody['contactnumberl_' + i] = ownerDetails._contactnumberl;
                                requestBody['countrycodem_' + i] = ownerDetails._countrycodem;
                                requestBody['contactnumberm_' + i] = ownerDetails._contactnumberm;
                                requestBody['country_' + i] = ownerDetails._country;
                                requestBody['city_' + i] = ownerDetails._city;
                                requestBody['addressline1_' + i] = ownerDetails._address_line1;
                                requestBody['addressline2_' + i] = ownerDetails._address_line2;
                                requestBody['state_' + i] = ownerDetails._state;
                                requestBody['zipcode_' + i] = ownerDetails._zipcode;
                            }
                            for (var hi = 0; hi < Number(managercount); hi++) {
                                let ManagerDetails = api_result.data[0]._ManagerContactDetails[hi];
                                let i = hi + 1;
                                requestBody['hmcdfirstname_' + i] = ManagerDetails._firstname;
                                requestBody['hmcdlastname_' + i] = ManagerDetails._lastname;
                                requestBody['hmcdemail_' + i] = ManagerDetails._email;
                                requestBody['hmcdlandlinenumber_stdcode_' + i] = ManagerDetails._landline_stdcode;
                                requestBody['hmcdlandlinenumber_' + i] = ManagerDetails._landline_number;
                                requestBody['hmcdmobilenumber_stdcode_' + i] = ManagerDetails._mobileno_stdcode;
                                requestBody['hmcdmobilenumber_' + i] = ManagerDetails._mobileno;
                            }
                            for (var fdi = 0; fdi < frontdeskcount; fdi++) {
                                let FrontDeskDetails = api_result.data[0]._FrontDeskContactDetails[fdi];
                                let i = fdi + 1;
                                requestBody['fdcdfirstname_' + i] = FrontDeskDetails._firstname;
                                requestBody['fdcdlastname_' + i] = FrontDeskDetails._lastname;
                                requestBody['fdcdemail_' + i] = FrontDeskDetails._email;
                                requestBody['fdcdlandlinenumber_stdcode_' + i] = FrontDeskDetails._landline_stdcode;
                                requestBody['fdcdlandlinenumber_' + i] = FrontDeskDetails._landline_number;
                                requestBody['fdcdmobilenumber_stdcode_' + i] = FrontDeskDetails._mobileno_stdcode;
                                requestBody['fdcdmobilenumber_' + i] = FrontDeskDetails._mobileno;
                            }
                            for (var fni = 0; fni < financecount; fni++) {
                                let FinanceDetails = api_result.data[0]._FinanceContactDetails[fni];
                                let i = fni + 1;
                                requestBody['fncdfirstname_' + i] = FinanceDetails._firstname;
                                requestBody['fncdlastname_' + i] = FinanceDetails._lastname;
                                requestBody['fncdemail_' + i] = FinanceDetails._email;
                                requestBody['fncdlandlinenumber_stdcode_' + i] = FinanceDetails._landline_stdcode;
                                requestBody['fncdlandlinenumber_' + i] = FinanceDetails._landline_number;
                                requestBody['fncdmobilenumber_stdcode_' + i] = FinanceDetails._mobileno_stdcode;
                                requestBody['fncdmobilenumber_' + i] = FinanceDetails._mobileno;
                            }
                            var countarray = {};
                            countarray['ownercount'] = ownercount;
                            countarray['managercount'] = managercount;
                            countarray['frondeskcount'] = frontdeskcount;
                            countarray['financecount'] = financecount;
                            templateData = {
                                success: true,
                                message: api_result.message,
                                requestBody: requestBody,
                                counts: countarray,
                                stdcodes: CountryCodeValidator_1.default.getPhoneValidations(),
                                formstatus: true,
                                hotel_id: api_result.data[0]._hotel_id,
                                locationmasters: masters,
                                contact_id: api_result.data[0]._contact_id
                            };
                        }
                        else {
                            templateData = {
                                success: false,
                                message: 'No Results found',
                                requestBody: {},
                                formstatus: false,
                            };
                        }
                        res.status(200)
                            .render('contact_details', templateData);
                    }
                    else {
                        api_result['formstatus'] = false;
                        res.status(400)
                            .render('contact_details', api_result);
                    }
                }, 'GET');
            }
            else {
                res.status(400)
                    .render('contact_details', { stdcodes: CountryCodeValidator_1.default.getPhoneValidations(), success: false, message: 'ID is Required/Invalid' });
            }
        }));
        return ContactDetailRouter;
    }
}
exports.default = ContactDetailsController;
