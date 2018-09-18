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
const HotelLandmarks_1 = require("../../models/hotel_info/HotelLandmarks");
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
var ObjectId = require('mongodb').ObjectID;
class HotelLandmarksManager {
    static get routes() {
        let HotelLandmarkManagerRouter = express.Router();
        HotelLandmarkManagerRouter.route('/getLandmarksForHotel/:hotel_id')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let hotel_id = req.params.hotel_id;
            let hotelLandmarks = core_1.default.app.get('mongoClient').get('hotel_landmarks');
            yield hotelLandmarks
                .find({ _hotel_id: hotel_id }, { "sort": { "_id": -1 } })
                .then(document => {
                respond = {
                    success: true,
                    data: document
                };
            })
                .catch(error => {
                res.status(404);
            });
            res.json(respond);
        }));
        HotelLandmarkManagerRouter.route('/create/:hotel_id/:landmark_id')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            if (req.params.landmark_id === 'undefined' && req.params.hotel_id !== 'undefined') {
                let landmarkDetailsData = req.body.params;
                let newLandmark = HotelLandmarks_1.default.create(landmarkDetailsData);
                newLandmark['hotel_id'] = req.params.hotel_id;
                console.log(newLandmark);
                let hotelLandmarksCollection = core_1.default.app.get('mongoClient').get('hotel_landmarks');
                yield hotelLandmarksCollection
                    .insert(newLandmark)
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `New Landmark has been created with id ${document._id}`
                    };
                })
                    .catch(error => {
                    res.status(500);
                    respond = {
                        success: false,
                        message: error.message
                    };
                });
            }
            else {
                let landmark_id = req.params.landmark_id;
                let hotel_id = req.params.hotel_id;
                let landmarkDetailsData = req.body.params;
                let newLandmark = HotelLandmarks_1.default.create(landmarkDetailsData);
                newLandmark['hotel_id'] = hotel_id;
                let NearbyDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_landmarks');
                yield NearbyDetailsCollection
                    .update({ _landmark_id: landmark_id, _hotel_id: hotel_id }, newLandmark)
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `Landmark info updated successfully!`
                    };
                })
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
        HotelLandmarkManagerRouter.route('/getHotelLandmarkDetails/:hotel_id/:landmark_id')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let landmark_id = req.params.landmark_id;
            let hotel_id = req.params.hotel_id;
            let landmarkDetails = core_1.default.app.get('mongoClient').get('hotel_landmarks');
            yield landmarkDetails
                .find({
                _landmark_id: landmark_id,
                _hotel_id: hotel_id
            })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Success`,
                    data: document
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
        return HotelLandmarkManagerRouter;
    }
}
exports.default = HotelLandmarksManager;
