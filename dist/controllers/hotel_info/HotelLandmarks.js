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
const APIClient_1 = require("../../helpers/APIClient");
const adminmanager_1 = require("../admin/adminmanager");
const Permission_1 = require("../../middlewares/permission/Permission");
const LocationMasters_1 = require("../../helpers/LocationMasters");
var ObjectId = require('mongodb').ObjectID;
class HotelLandmarksController {
    static get routes() {
        let HotelLandmarkRouter = express.Router();
        HotelLandmarkRouter.route('/:hotel_id')
            .get(Permission_1.default.check_hotel_routes, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield LocationMasters_1.default.getMasters();
            let hotel_id = req.params.hotel_id;
            let postbody = JSON.stringify({
                params: { hotel_id: req.params.hotel_id }
            });
            APIClient_1.default.send('/hotel-landmark-manager/getLandmarksForHotel/' + req.params.hotel_id, postbody, function (api_result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (api_result.success) {
                        let landmarkname;
                        yield Object.keys(api_result.data).forEach((key) => __awaiter(this, void 0, void 0, function* () {
                            let nearbyLandmarksCollection = core_1.default.app.get('mongoClient').get('nearby_landmarks');
                            yield nearbyLandmarksCollection
                                .find({ _landmark_id: api_result.data[key]._landmark_id })
                                .then(document => {
                                api_result.data[key]['landmark_name'] = document[0]._landmark_name;
                                api_result.data[key]['hotel_id'] = hotel_id;
                                api_result.data[key]['category'] = document[0]._category;
                                api_result.data[key]['country'] = masters[document[0]._country_id].name;
                                api_result.data[key]['state'] = LocationMasters_1.default.getStateNameById(masters, document[0]._state_id);
                                api_result.data[key]['city'] = LocationMasters_1.default.getCityNameById(masters, document[0]._city_id);
                                api_result.data[key]['locality'] = LocationMasters_1.default.getLocalityNameById(masters, document[0]._locality_id);
                            })
                                .catch(error => {
                            });
                        }));
                        let templateData = {
                            success: true,
                            data: api_result.data,
                            hotel_id: hotel_id,
                            message: "successfully retrieved near by landmarks"
                        };
                        res.status(200);
                        res.render('hotel_landmarks', templateData);
                    }
                    else {
                        let templateData = {
                            success: false,
                            hotel_id: req.params.hotel_id,
                            message: "There are no landmarks for this hotel"
                        };
                        res.status(400);
                        res.render('hotel_landmarks', templateData);
                    }
                });
            }, 'GET');
        }));
        HotelLandmarkRouter.route("/create/:hotel_id")
            .get(Permission_1.default.check_hotel_routes, (req, res) => __awaiter(this, void 0, void 0, function* () {
            APIClient_1.default.send('/admin-manager/nearby-landmarks/list', '', function (api_result) {
                if (api_result.success) {
                    res.status(200)
                        .render('landmarks_hotel_edit', { landmarks: api_result.data, hotel_id: req.params.hotel_id });
                }
                else {
                    res.status(400)
                        .render('landmarks_hotel_edit', { landmarks: [], hotel_id: req.params.hotel_id });
                }
            });
        }))
            .post(Permission_1.default.check_hotel_routes, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            var newLandmarkDetails = {
                landmark_id: req.body.landmark_id,
                distance: req.body.distance
            };
            let errorobj = {};
            if (req.query.landmark_id !== undefined) {
                var postbody = JSON.stringify({ params: newLandmarkDetails, hotel_id: req.params.hotel_id });
                errorobj['landmark_id'] = req.query.landmark_id;
            }
            else {
                var postbody = JSON.stringify({ params: newLandmarkDetails });
            }
            let landmarks = yield adminmanager_1.default.getLandmarks();
            errorobj['requestBody'] = req.body;
            errorobj['landmarks'] = landmarks;
            req.checkBody('landmark_id', 'Invalid Landmark Name').notEmpty();
            req.checkBody('distance', 'Invalid distance').notEmpty();
            req.sanitize('landmark_id').toString();
            req.sanitize('distance').toString();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    res.render('landmarks_hotel_edit', errorobj);
                }
                else {
                    APIClient_1.default.send(`/hotel-landmark-manager/create/${req.params.hotel_id}/${req.params.landmark_id}`, postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/hotel-landmarks/' + req.params.hotel_id);
                        }
                        else {
                            res.status(400)
                                .render('landmarks_hotel_edit', errorobj);
                        }
                    });
                }
            });
        }));
        HotelLandmarkRouter.route("/create/:hotel_id/:landmark_id")
            .get(Permission_1.default.check_hotel_routes, (req, res) => __awaiter(this, void 0, void 0, function* () {
            APIClient_1.default.send('/admin-manager/nearby-landmarks/list', '', function (api_result) {
                if (api_result.success) {
                    res.status(200)
                        .render('landmarks_hotel_edit', { landmarks: api_result.data, hotel_id: req.params.hotel_id });
                }
                else {
                    res.status(400)
                        .render('landmarks_hotel_edit', { landmarks: [], hotel_id: req.params.hotel_id });
                }
            });
        }))
            .post(Permission_1.default.check_hotel_routes, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            var newLandmarkDetails = {
                landmark_id: req.body.landmark_id,
                distance: req.body.distance
            };
            let errorobj = {};
            if (req.query.landmark_id !== undefined) {
                var postbody = JSON.stringify({ params: newLandmarkDetails, hotel_id: req.params.hotel_id });
                errorobj['landmark_id'] = req.query.landmark_id;
            }
            else {
                var postbody = JSON.stringify({ params: newLandmarkDetails });
            }
            let landmarks = yield adminmanager_1.default.getLandmarks();
            errorobj['requestBody'] = req.body;
            errorobj['landmarks'] = landmarks;
            req.checkBody('landmark_id', 'Invalid Landmark Name').notEmpty();
            req.checkBody('distance', 'Invalid distance').notEmpty();
            req.sanitize('landmark_id').toString();
            req.sanitize('distance').toString();
            console.log(newLandmarkDetails);
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    for (let error of errors) {
                        var key = error.param;
                        errorobj[key] = error.msg;
                    }
                    res.render('landmarks_hotel_edit', errorobj);
                }
                else {
                    APIClient_1.default.send(`/hotel-landmark-manager/create/${req.params.hotel_id}/${req.params.landmark_id}`, postbody, function (api_result) {
                        if (api_result.success) {
                            res.status(200)
                                .redirect('/hotel-landmarks/' + req.params.hotel_id);
                        }
                        else {
                            res.status(400)
                                .render('landmarks_hotel_edit', errorobj);
                        }
                    });
                }
            });
        }));
        HotelLandmarkRouter.route("/edit/:hotel_id/:landmark_id")
            .get(Permission_1.default.check_hotel_routes, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let landmarks = yield adminmanager_1.default.getLandmarks();
            let postbody = JSON.stringify({});
            APIClient_1.default.send(`/hotel-landmark-manager/getHotelLandmarkDetails/${req.params.hotel_id}/${req.params.landmark_id}`, postbody, function (api_result) {
                if (api_result.success) {
                    var newLandmarkDetails = {
                        landmark_id: api_result.data[0]._landmark_id,
                        distance: api_result.data[0]._distance,
                    };
                    let templateData = {
                        success: true,
                        message: api_result.message,
                        requestBody: newLandmarkDetails,
                        landmarks: landmarks.data,
                        landmark_id: req.params.landmark_id,
                        hotel_id: req.params.hotel_id
                    };
                    res.status(200)
                        .render('landmarks_hotel_edit', templateData);
                }
                else {
                    res.status(400)
                        .render('landmarks_hotel_edit', api_result);
                }
            }, 'GET');
        }));
        HotelLandmarkRouter.put('/delete', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.body.id;
            console.log("hotellandmaekid", id);
            let respond;
            let hotel_landmarks = core_1.default.app.get('mongoClient').get('hotel_landmarks');
            yield hotel_landmarks
                .remove({ _id: ObjectId(id) })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Landmark has been removed from hotel`
                };
            })
                .catch(error => {
                res.status(500);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        return HotelLandmarkRouter;
    }
    static getLandmarkNameByID(landmarkid) {
    }
}
exports.default = HotelLandmarksController;
