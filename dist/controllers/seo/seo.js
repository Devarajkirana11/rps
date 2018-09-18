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
const FacilitiesManager_1 = require("../hotel_info/FacilitiesManager");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const roomdetails_1 = require("../rooms/roomdetails");
const request_1 = require("../../helpers/request");
const Html_Entities = require('html-entities').AllHtmlEntities;
class SeoController {
    static get routes() {
        let SeoRouter = express.Router();
        SeoRouter.route("/create")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            let masters = yield LocationMasters_1.default.getMasters();
            res.render('frontend/seo', { 'locationmasters': masters });
        }))
            .post(inputvalidator_1.default.seoValidate, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            var newSeoDetails = {
                country_id: req.body.country,
                state_id: req.body.state,
                city_id: req.body.city,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                title: req.body.title,
                seo_type: req.body.seotype,
                image_fids: roomdetails_1.default.convertImageStringsToArray(req.body.images),
                status: req.body.status,
                description: SeoController.htmlEntities.encode(req.body.description),
                hotel_id: req.body.hotel_id,
                link: SeoController.htmlEntities.encode(req.body.seo_link),
                meta_tags: req.body.metatags,
                meta_description: SeoController.htmlEntities.encode(req.body.meta_description),
            };
            let errorobj = {};
            if (req.query.id !== undefined) {
                newSeoDetails['seo_id'] = req.query.id;
                errorobj['seo_id'] = req.query.id;
            }
            var postbody = JSON.stringify(newSeoDetails);
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
                    console.log('errorobj', errors);
                    res.render('frontend/seo', errorobj);
                }
                else {
                    console.log('post data');
                    APIClient_1.default.send('/seo_manager/saveSeoInfo', postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/seo/list');
                        }
                        else {
                            errorobj['success'] = false;
                            errorobj['message'] = api_result.message;
                            res.status(400)
                                .render('frontend/seo', errorobj);
                        }
                    });
                }
            });
        }));
        SeoRouter.route('/:id/edit')
            .get(inputvalidator_1.default.paramsID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let seo_id = req.params.id;
            let masters = yield LocationMasters_1.default.getMasters();
            request_1.default.get('/seo_manager/getSeoContent', { seo_id: seo_id })
                .then(result => {
                if (result.success) {
                    var requestBody = {
                        country: result.data._country_id,
                        state: result.data._state_id,
                        city: result.data._city_id,
                        latitude: result.data._latitude,
                        longitude: result.data._longitude,
                        title: result.data._title,
                        seotype: result.data._seo_type,
                        images: JSON.stringify(result.data._image_fids),
                        status: result.data._status,
                        description: SeoController.htmlEntities.decode(result.data._description),
                        hotel_id: result.data._hotel_id,
                        seo_link: SeoController.htmlEntities.decode(result.data._link),
                        metatags: result.data._meta_tags,
                        meta_description: (result.data._meta_description !== undefined ? SeoController.htmlEntities.encode(result.data._meta_description) : ""),
                    };
                    res.status(400)
                        .render('frontend/seo', { success: true, message: 'success retrived seo details', 'locationmasters': masters, seo_id: result.data._seo_id, requestBody: requestBody });
                }
                else {
                    res.status(400)
                        .render('frontend/seo', { success: false, message: 'could not retrive the seo details' });
                }
            })
                .catch(err => {
                res.status(400)
                    .render('frontend/seo', { success: false, message: err.message });
            });
        }));
        SeoRouter.route("/list")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('frontend/seo_list');
        }));
        return SeoRouter;
    }
}
SeoController.htmlEntities = new Html_Entities();
exports.default = SeoController;
