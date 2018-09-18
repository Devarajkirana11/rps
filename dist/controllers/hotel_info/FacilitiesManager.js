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
const FacilitiesAndServices_1 = require("../../models/hotel_info/FacilitiesAndServices");
const FacilitiesAndServices_2 = require("../../middlewares/validation/FacilitiesAndServices");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const identification_1 = require("../../helpers/identification");
const FacilitiesAndServices_3 = require("./FacilitiesAndServices");
const masters_1 = require("../../helpers/masters");
const MastersLaw = require("../../helpers/masters.law");
var ObjectId = require('mongodb').ObjectID;
class FacilitiesManager {
    static get routes() {
        let FacilitiesAndServicesRouter = express.Router();
        FacilitiesAndServicesRouter.route('/createFacilitiesAndServices').post(FacilitiesAndServices_2.default.FacilitiesAndServicesValidate('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let newObjectData = req.body;
            let newObject = FacilitiesAndServices_1.default.createFacilitiesAndServices(newObjectData);
            let respond;
            let DBCollection = core_1.default.app.get('mongoClient').get('facilities_services');
            let inputstatement;
            if (req.body.facility_id !== undefined && inputvalidator_1.default.isValidUUID(req.body.facility_id)) {
                inputstatement = DBCollection.findOneAndUpdate({
                    _facility_id: req.body.facility_id
                }, {
                    $set: newObject
                });
            }
            else {
                newObject['facility_id'] = identification_1.default.generateUuid;
                inputstatement = DBCollection.insert(newObject);
            }
            yield inputstatement
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'New facilities_services has been stored with id ' + document._id,
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
        FacilitiesAndServicesRouter.route('/:facility_id/findFacilitiesAndServices')
            .get(FacilitiesAndServices_2.default.FacilitiesAndServicesFind('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let DBCollection = core_1.default.app.get('mongoClient').get('facilities_services');
            yield DBCollection.find({
                _facility_id: req.params.facility_id
            })
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'facilities_services has been retrived ',
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
        FacilitiesAndServicesRouter.route('/:hotel_id/findFacilitiesAndServicesByHid')
            .get(FacilitiesAndServices_2.default.FacilitiesAndServicesFindByHid, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let Masters = yield this.getAllMasters();
            let DBCollection = core_1.default.app.get('mongoClient').get('facilities_services');
            yield DBCollection.find({
                _hotel_id: req.params.hotel_id
            }, { _hotel_checks: 1, _activities: 1, "_internet._connection_location": 1, "_parking._parking_facilities": 1, _food_drink: 1, _pool_spa: 1, _transportation: 1, _frontdesk_services: 1, _common_areas: 1, _enterainment_family_services: 1, _cleaning_services: 1, _business_facilities: 1, _miscellaneous: 1 })
                .then(document => {
                let amenities = {};
                if (document.length > 0) {
                    amenities = document[0];
                    document[0]._hotel_checks._check_in._from = FacilitiesAndServices_3.default.findMastertext(Masters, 'hotel_checks', document[0]._hotel_checks._check_in._from);
                    document[0]._hotel_checks._check_out._to = FacilitiesAndServices_3.default.findMastertext(Masters, 'hotel_checks', document[0]._hotel_checks._check_out._to);
                    delete amenities._id;
                }
                res.status(200);
                respond = {
                    success: true,
                    message: 'facilities_services has been retrived ',
                    data: amenities
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
        return FacilitiesAndServicesRouter;
    }
}
FacilitiesManager.getAllMasters = () => __awaiter(this, void 0, void 0, function* () {
    let respond = {};
    let masterExists = true;
    let masterCollection = core_1.default.app.get('mongoClient').get('masters');
    masterExists = yield masterCollection.find({ type: MastersLaw.Type.HOTEL_FACILITIES })
        .then(coll => {
        if (coll.length == 0) {
            return false;
        }
    });
    if (masterExists === false)
        return respond;
    let dropdowndata = yield masters_1.default.getDropdown(MastersLaw.Type.HOTEL_FACILITIES, undefined);
    Object.keys(dropdowndata).forEach(df => {
        respond[dropdowndata[df]['title']] = dropdowndata[df].data;
    });
    let keyValueData = yield masters_1.default.getKeyValuePair(MastersLaw.Type.HOTEL_FACILITIES, undefined);
    Object.keys(keyValueData).forEach(df => {
        respond[keyValueData[df]['title']] = keyValueData[df].data;
    });
    return respond;
});
FacilitiesManager.getFacilities_images = (hid) => __awaiter(this, void 0, void 0, function* () {
    let respond;
    let DBCollection = core_1.default.app.get('mongoClient').get('facilities_services');
    return yield DBCollection
        .find({
        _hotel_id: hid
    })
        .then((docs) => __awaiter(this, void 0, void 0, function* () {
        if (docs.length > 0) {
            let imageFids = new Array();
            Object.keys(docs).forEach(doc => {
                Object.keys(docs[doc]).forEach(fas => {
                    if (FacilitiesAndServices_2.default.isArray(docs[doc][fas])) {
                        docs[doc][fas].map(item => item._image_fids).filter(value => value !== undefined && value.length != 0).map((value, i) => value.map(fid => imageFids.push(fid)));
                    }
                    else if (FacilitiesAndServices_2.default.isObject(docs[doc][fas])) {
                        if (docs[doc][fas]['_connection_location'] != undefined) {
                            docs[doc][fas]['_connection_location'].map(locs => locs._image_fids).filter(value => value.length != 0).map(value => value.map(fid => imageFids.push(fid)));
                        }
                        if (docs[doc][fas]['_parking_facilities'] != undefined) {
                            docs[doc][fas]['_parking_facilities'].map(locs => locs._image_fids).filter(value => value.length != 0).map(value => value.map(fid => imageFids.push(fid)));
                        }
                    }
                });
            });
            return respond = {
                resStatus: 200,
                success: true,
                message: 'These are the  Images found in facilities',
                images: imageFids
            };
        }
        else {
            return respond = {
                resStatus: 400,
                success: false,
                message: 'No Images Found for the ID ' + hid
            };
        }
    })).catch(error => {
        return respond = {
            resStatus: 500,
            success: false,
            message: error.message
        };
    });
});
exports.default = FacilitiesManager;
