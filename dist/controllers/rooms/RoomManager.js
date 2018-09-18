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
const app_1 = require("../../config/app");
const express = require("express");
const MastersLaw = require("../../helpers/masters.law");
const room_1 = require("../../models/rooms/room");
const type_room_1 = require("../../models/rooms/type.room");
const amenities_room_1 = require("../../models/rooms/amenities.room");
const rate_1 = require("../../models/rates/rate");
const room_activity_1 = require("../../models/inventory/room_activity");
const masters_1 = require("../../helpers/masters");
const FacilitiesAndServices_1 = require("../hotel_info/FacilitiesAndServices");
const identification_1 = require("../../helpers/identification");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const LocationMasters_1 = require("../../helpers/LocationMasters");
const Html_Entities = require('html-entities').AllHtmlEntities;
var mongodb = require('mongodb');
var MongoDataTable = require('mongo-datatable');
var MongoClient = mongodb.MongoClient;
var cols = require('mongo-datatable/lib/columns');
var validator = require('mongo-datatable/lib/validator');
var ObjectId = require('mongodb').ObjectID;
class RoomManager {
    static get routes() {
        let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
        let roomReservation = core_1.default.app.get('mongoClient').get('RoomReservation');
        let ratesCollection = core_1.default.app.get('mongoClient').get('rates');
        let roomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
        let RoomRouter = express.Router();
        RoomRouter.route('/:id/getAllRooms')
            .post(inputvalidator_1.default.paramsID, function (req, res) {
            let respond;
            MongoClient.connect(app_1.environments[process.env.ENV].mongoDBUrl, function (err, db) {
                let options = req.body;
                let columns = req.body.columns;
                let CustomizedQuery = {};
                columns.forEach(column => {
                    if (column.name == "_type" && column.searchable == 'false' && column.search.value != "") {
                        CustomizedQuery["_type._name"] = new RegExp('^' + column.search.value);
                    }
                    if (column.name == "RoomType" && column.searchable == 'false' && column.search.value != "") {
                        CustomizedQuery["_type._type"] = new RegExp('^' + column.search.value);
                    }
                    if (column.name == "_number" && column.searchable == 'false' && column.search.value != "") {
                        CustomizedQuery["_number"] = new RegExp('^' + column.search.value);
                    }
                    if (column.name == "_hotelId" && column.searchable == 'false' && column.search.value != "") {
                        CustomizedQuery["_hotelId"] = new RegExp('^' + column.search.value);
                    }
                });
                if (req.params.id !== undefined && req.params.id !== null)
                    CustomizedQuery['_hotelId'] = req.params.id;
                if (CustomizedQuery !== undefined && Object.keys(CustomizedQuery).length)
                    options.customQuery = CustomizedQuery;
                options.caseInsensitiveSearch = true;
                new MongoDataTable(db).get('rooms', options, function (err, result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            res.status(500);
                            respond = {
                                success: false,
                                message: err.message,
                            };
                        }
                        res.status(200);
                        let Master = yield RoomManager.getAllMasters();
                        let Allhotels = yield core_1.default.app.get('mongoClient').get('hotel_details').find()
                            .then(hotels => {
                            return respond = {
                                success: true,
                                docs: hotels,
                            };
                        }).catch(err => {
                            return respond = {
                                success: false,
                            };
                        });
                        Object.keys(result.data).forEach(key => {
                            result.data[key]['RoomType'] = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', result.data[key]['_type']['_type']);
                            result.data[key]['_type'] = FacilitiesAndServices_1.default.findMastertext(Master, 'room_names', result.data[key]['_type']['_name']);
                            if (Allhotels.success) {
                                Allhotels.docs.forEach(hotel => {
                                    if (result.data[key]['_hotelId'] == hotel._hotel_id) {
                                        result.data[key]['_hotelId'] = hotel._nida_stay_name;
                                    }
                                });
                            }
                        });
                        respond = {
                            success: true,
                            message: 'All Rooms have been fetched',
                            Tabledata: result
                        };
                        res.json(respond);
                    });
                });
            });
        });
        RoomRouter.route('/getByRoomNo')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            var regexValue = '^' + req.query.room_number;
            query = {
                _number: new RegExp(regexValue),
                _hotelId: req.query.hotel_id
            };
            yield roomCollection
                .find(query, { _number: true, _floorNumber: true, _room_id: true, _type: true })
                .then(documents => {
                let resArr = new Array();
                if (documents.length > 0) {
                    documents.forEach(item => {
                        resArr.push({ label: item._number, floorNumber: item._floorNumber, room_id: item._room_id, room_name: item._type._name });
                    });
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `We have collected the requested room(s)`,
                    data: resArr
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
        RoomRouter.route('/getByHotelID')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.query.hotel_id !== undefined) {
                let result = yield this.getAllRoomsByHotel(req.query.hotel_id);
                res.status(result.restatus).json(result);
            }
            else {
                res.status(400).json({ success: false, message: 'hotel_id is requried' });
            }
        }));
        RoomRouter.route('/')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let query;
            let respond;
            if (req.query.id !== undefined && inputvalidator_1.default.isValidUUID(req.query.id)) {
                query = {
                    _room_id: req.query.id
                };
            }
            yield roomCollection
                .find(query)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: `We have collected the requested room(s)`,
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
        }))
            .post(inputvalidator_1.default.validateRoomType('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            roomCollection.createIndex({ _hotelId: 1, _number: 1 }, { unique: true });
            let hotelId = req.body.hotel_id;
            Object.keys(req.body.room_data_list).forEach(key => {
                req.body.room_data_list[key]['room_id'] = identification_1.default.generateUuid;
            });
            let roomDataList = req.body.room_data_list;
            let roomTypeData = req.body.room_type_data;
            let newRoomType = type_room_1.default.create(roomTypeData);
            let roomAmenitiesData = req.body.room_amenities_data;
            let newRoomAmenities = amenities_room_1.default.create(roomAmenitiesData);
            let newRoomList = room_1.default.create(hotelId, roomDataList, newRoomType, newRoomAmenities);
            var duplicateExists = 0;
            let duplicateNumbers = new Array();
            yield roomCollection
                .find({ _hotelId: hotelId })
                .then(rooms => {
                if (rooms.length > 0) {
                    rooms.forEach(dbroom => {
                        req.body.room_data_list.forEach((formroom, index) => {
                            if (formroom.number == dbroom._number && dbroom._type._type != req.body.roomtype_id) {
                                duplicateExists = 1;
                                duplicateNumbers.push(formroom.number);
                            }
                        });
                    });
                }
            });
            if (duplicateExists == 1) {
                return res.status(400).json({ success: false, message: 'Duplicate Room number exists: ' + duplicateNumbers.toString() });
            }
            yield roomCollection
                .insert(newRoomList)
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                yield ratesCollection
                    .findOne({
                    _hotelId: hotelId
                })
                    .then((document) => __awaiter(this, void 0, void 0, function* () {
                    let ratePlan = rate_1.default.spawn(document);
                    ratePlan.addRoomTypeMarkup(roomTypeData.type);
                    yield ratesCollection.update({ _hotelId: hotelId }, ratePlan);
                }));
                let roomActivities = new Array();
                for (let room of newRoomList) {
                    let roomActivity = yield room_activity_1.default.create(hotelId, room.type.type, room.number);
                    roomActivities.push(roomActivity.document);
                }
                yield roomActivityCollection.insert(roomActivities);
                res.status(200);
                respond = {
                    success: true,
                    message: `New Rooms have been stored`,
                    data: document[0]
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }))
            .put(inputvalidator_1.default.validateRoomType('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            roomCollection.createIndex({ _hotelId: 1, _number: 1 });
            let respond;
            let room_ops_types = new Array();
            let hotelId = req.body.hotel_id;
            let room_ids = new Array();
            let new_room_nos = new Array();
            let old_room_nos = new Array();
            req.body.room_data_list.forEach((room, index) => {
                if (room.room_id !== "" && room.room_id !== null) {
                    room_ops_types[index] = 'update';
                    room_ids.push(room.room_id);
                }
                else {
                    room.room_id = identification_1.default.generateUuid;
                    room_ops_types[index] = 'create';
                    new_room_nos.push(room.number);
                }
            });
            var duplicateExists = 0;
            let duplicateNumbers = new Array();
            yield roomCollection
                .find({ _hotelId: hotelId })
                .then(rooms => {
                if (rooms.length > 0) {
                    rooms.forEach(dbroom => {
                        req.body.room_data_list.forEach((formroom, index) => {
                            if (formroom.number == dbroom._number && dbroom._type._type != req.body.roomtype_id) {
                                duplicateExists = 1;
                                duplicateNumbers.push(formroom.number);
                            }
                        });
                    });
                }
            });
            if (duplicateExists == 1) {
                return res.status(400).json({ success: false, message: 'Duplicate Room number exists: ' + duplicateNumbers.toString() });
            }
            let reservationRoomNoChangeExists = 0;
            let reservationRoomNumberchangeArr = new Array();
            yield roomReservation
                .find({ hotelUuid: hotelId })
                .then(reservations => {
                if (reservations.length > 0) {
                    reservations.forEach(reservation => {
                        req.body.room_data_list.forEach((formroom, index) => {
                            if (formroom.number != reservation.roomNumber && reservation.roomUuid == formroom.room_id) {
                                reservationRoomNoChangeExists = 1;
                                reservationRoomNumberchangeArr.push({ newNumber: formroom.number, oldNumber: reservation.roomNumber, room_id: reservation.roomUuid });
                            }
                        });
                    });
                }
            });
            if (reservationRoomNoChangeExists == 1) {
                yield Promise.all(reservationRoomNumberchangeArr.map((numberObj) => __awaiter(this, void 0, void 0, function* () {
                    yield roomReservation
                        .update({ hotelUuid: hotelId, roomUuid: numberObj.room_id }, { $set: { roomNumber: numberObj.newNumber } }, { multi: true })
                        .then(res => { })
                        .catch(err => {
                        console.log(err);
                    });
                })));
            }
            yield roomCollection
                .find({ _room_id: { $in: room_ids } })
                .then(rooms => {
                if (rooms.length) {
                    rooms.forEach((dbroom, dbindex) => {
                        req.body.room_data_list.forEach((room, index) => {
                            if (room.room_id !== "" && room.room_id !== null) {
                                if (room.room_id == dbroom._room_id) {
                                    if (room.number != dbroom._number) {
                                        old_room_nos.push(dbroom._number);
                                        new_room_nos.push(room.number);
                                    }
                                }
                            }
                        });
                    });
                }
            });
            let activeRoomNumbers = new Array();
            req.body.room_data_list.forEach((room, index) => {
                if (room.room_id !== "" && room.room_id !== null) {
                    activeRoomNumbers.push(room.number);
                }
            });
            yield roomActivityCollection.remove({
                hotelUuid: hotelId,
                roomNumber: { $nin: activeRoomNumbers },
                roomType: req.body.room_type_data.type
            })
                .then((ressult) => __awaiter(this, void 0, void 0, function* () {
                let roomActivities = new Array();
                for (let new_number of new_room_nos) {
                    let roomActivity = yield room_activity_1.default.create(hotelId, req.body.room_type_data.type, new_number);
                    roomActivities.push(roomActivity.document);
                }
                yield roomActivityCollection.insert(roomActivities);
            }))
                .catch(err => {
                return res.status(400).json({ success: false, message: err.message });
            });
            if (req.body.roomtype_id != req.body.room_type_data.type) {
                yield ratesCollection
                    .findOne({
                    _hotelId: hotelId
                })
                    .then((document) => __awaiter(this, void 0, void 0, function* () {
                    let ratePlan = rate_1.default.spawn(document);
                    ratePlan.removeRoomTypeMarkup(req.body.roomtype_id);
                    ratePlan.addRoomTypeMarkup(req.body.room_type_data.type);
                    yield ratesCollection.update({ _hotelId: hotelId }, ratePlan);
                }))
                    .catch(err => {
                    return res.status(400).json({ success: false, message: err.message });
                });
            }
            let roomDataList = req.body.room_data_list;
            let roomTypeData = req.body.room_type_data;
            let newRoomType = type_room_1.default.create(roomTypeData);
            let roomAmenitiesData = req.body.room_amenities_data;
            let newRoomAmenities = amenities_room_1.default.create(roomAmenitiesData);
            let newRoomList = room_1.default.update(hotelId, roomDataList, newRoomType, newRoomAmenities, room_ops_types);
            yield Promise.all(newRoomList.map((room) => __awaiter(this, void 0, void 0, function* () {
                console.log(room.room_id);
                yield roomCollection
                    .update({ _room_id: room.room_id }, { $set: { _room_id: room.room_id, _hotelId: room.hotelId, _type: room.type, _number: room.number, _floorNumber: room.floorNumber, _amenities: room.amenities, _virtualRoom: room.virtualRoom } }, { upsert: true })
                    .then(document => {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `New Rooms have been stored`,
                        data: document[0]
                    };
                })
                    .catch(err => {
                    res.status(400);
                    respond = {
                        success: false,
                        message: err.message
                    };
                });
            })));
            res.json(respond);
        }))
            .delete((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield roomCollection
                .remove({
                _room_id: req.query.id
            })
                .then(result => {
                res.status(200);
                respond = {
                    success: true,
                    message: `The requested room has been deleted`
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
        RoomRouter.get('/types', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.getRoomTypes(req.query.hotel_id);
            res.status(result.resStatus);
            res.json(result);
        }));
        RoomRouter.get('/view', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            yield roomCollection
                .find({
                _hotelId: req.query.hotel_id
            })
                .then(roomList => {
                let floorNumberList = roomList.map(room => room._floorNumber).filter((value, index, self) => self.indexOf(value) === index);
                let data = floorNumberList.map(uniqueFloorNumber => {
                    return {
                        floorNumber: uniqueFloorNumber,
                        rooms: roomList.filter(room => room._floorNumber === uniqueFloorNumber)
                    };
                });
                return data;
            })
                .then(data => {
                res.status(200);
                respond = {
                    success: true,
                    message: `We have collected the requested view`,
                    data: data
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
        RoomRouter.get('/:id/NoOfRoomsLeft', inputvalidator_1.default.paramsID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.params.id;
            let hotelcollection = core_1.default.app.get('mongoClient').get('hotel_details');
            let roomData = yield hotelcollection
                .aggregate([{
                    $lookup: {
                        from: 'rooms',
                        localField: '_hotel_id',
                        foreignField: '_hotelId',
                        as: 'rooms'
                    }
                }, {
                    $match: { "_hotel_id": hotel_id }
                }])
                .then(hotel => {
                if (hotel.length > 0) {
                    res.status(200).json({
                        success: true,
                        message: 'successfully retrived details',
                        noOfrooms: hotel[0].rooms.length,
                        hotel_rooms: Number(hotel[0]._total_no_Of_rooms),
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: 'No hotel found for hotel ID ' + hotel_id
                    });
                }
            }).catch(err => {
                res.status(200).json({
                    success: false,
                    message: err
                });
            });
        }));
        RoomRouter.get('/getRoomTypesByHotel', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelcollection = core_1.default.app.get('mongoClient').get('hotel_details');
            let Master = yield RoomManager.getAllMasters();
            let locMasters = yield LocationMasters_1.default.getMasters();
            let hotel_id = req.params.id;
            let respond = {};
            let search = new RegExp('^' + req.query.hotel_id);
            yield hotelcollection
                .aggregate([{
                    $lookup: {
                        from: 'rooms',
                        localField: '_hotel_id',
                        foreignField: '_hotelId',
                        as: 'rooms'
                    }
                }, {
                    $match: { "_hotel_id": search, "_status": "1" }
                }])
                .then(roomList => {
                let rooms = roomList[0].rooms.map(room => room._type).filter((value, index, self) => self.findIndex(element => element._type === value._type) === index);
                let amenities = roomList[0].rooms.map(room => room).filter((value, index, self) => self.findIndex(element => element._type._type === value._type._type) === index).map(room => room._amenities);
                let final_data = roomList[0];
                delete (final_data.rooms);
                return { hotel: final_data, rooms: rooms, amenities: amenities };
            })
                .then(hotel_room => {
                hotel_room.rooms.map(room => {
                    room.room_type_id = room._type;
                    room._type = FacilitiesAndServices_1.default.findMastertext(Master, 'room_types', room._type);
                    room._name = FacilitiesAndServices_1.default.findMastertext(Master, 'room_names', room._name);
                });
                hotel_room.hotel._country_id = LocationMasters_1.default.getCountryNameById(locMasters, hotel_room.hotel._country_id);
                hotel_room.hotel._state_id = LocationMasters_1.default.getStateNameById(locMasters, hotel_room.hotel._state_id);
                hotel_room.hotel._city_id = LocationMasters_1.default.getCityNameById(locMasters, hotel_room.hotel._city_id);
                hotel_room.hotel._locality_id = LocationMasters_1.default.getLocalityNameById(locMasters, hotel_room.hotel._locality_id);
                hotel_room.hotel._description = RoomManager.htmlEntities.decode(hotel_room.hotel._description);
                return hotel_room;
            })
                .then(data => {
                res.status(200);
                respond = {
                    success: true,
                    message: `We have collected the requested view`,
                    data: data
                };
            }).catch(err => {
                res.status(400);
                respond = {
                    success: false,
                    message: err
                };
            });
            res.json(respond);
        }));
        return RoomRouter;
    }
}
RoomManager.htmlEntities = new Html_Entities();
RoomManager.getAllRoomsByHotel = (hotel_id) => __awaiter(this, void 0, void 0, function* () {
    let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
    let respond;
    let query;
    var regexValue = hotel_id;
    query = {
        _hotelId: new RegExp(regexValue)
    };
    return yield roomCollection
        .find(query, { _room_id: true })
        .then(documents => {
        let resArr = new Array();
        if (documents.length > 0) {
            documents.forEach(item => {
                resArr.push(item._room_id);
            });
        }
        return respond = {
            restatus: 200,
            success: true,
            message: `We have collected the requested room(s)`,
            data: resArr
        };
    })
        .catch(error => {
        return respond = {
            restatus: 400,
            success: false,
            message: error.message
        };
    });
});
RoomManager.getRoomTypes = (hotel_id) => __awaiter(this, void 0, void 0, function* () {
    let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
    let respond;
    return yield roomCollection
        .find({
        _hotelId: hotel_id
    })
        .then(roomList => {
        return roomList.map(room => room._type).filter((value, index, self) => self.findIndex(element => element._type === value._type) === index);
    })
        .then((typeList) => __awaiter(this, void 0, void 0, function* () {
        let data = Array();
        yield Promise.all(typeList.map((type) => __awaiter(this, void 0, void 0, function* () {
            yield roomCollection.find({ '_type._type': type._type, _hotelId: hotel_id }).then(roomList => {
                data.push({
                    rooms: roomList.length,
                    type: type
                });
            });
        })));
        return data;
    }))
        .then(data => {
        return respond = {
            resStatus: 200,
            success: true,
            message: `We have collected the requested types`,
            data: data
        };
    })
        .catch(error => {
        return respond = {
            resStatus: 400,
            success: false,
            message: error.message
        };
    });
});
RoomManager.getRoomTypeDetailsByType = (hotel_id, roomtype) => __awaiter(this, void 0, void 0, function* () {
    let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
    let respond;
    return yield roomCollection
        .find({
        "_hotelId": hotel_id,
        "_type._type": roomtype
    })
        .then(data => {
        return respond = {
            resStatus: 200,
            success: true,
            message: `We have collected the requested types`,
            data: data
        };
    })
        .catch(error => {
        return respond = {
            resStatus: 400,
            success: false,
            message: error.message
        };
    });
});
RoomManager.getAllMasters = () => __awaiter(this, void 0, void 0, function* () {
    let respond = {};
    let masterExists = true;
    let masterCollection = core_1.default.app.get('mongoClient').get('masters');
    masterExists = yield masterCollection.find({ type: MastersLaw.Type.ROOMS })
        .then(coll => {
        if (coll.length == 0) {
            return false;
        }
    });
    if (masterExists === false)
        return respond;
    let dropdowndata = yield masters_1.default.getDropdown(MastersLaw.Type.ROOMS, undefined);
    Object.keys(dropdowndata).forEach(df => {
        respond[dropdowndata[df]['title']] = dropdowndata[df].data;
    });
    let keyValueData = yield masters_1.default.getKeyValuePair(MastersLaw.Type.ROOMS, undefined);
    Object.keys(keyValueData).forEach(df => {
        respond[keyValueData[df]['title']] = keyValueData[df].data;
    });
    return respond;
});
RoomManager.saveRoomTypeImages = (hotel_id, roomtype, fids) => __awaiter(this, void 0, void 0, function* () {
    let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
    let respond;
    return yield roomCollection
        .find({
        _hotelId: hotel_id, "_type._type": roomtype
    }).then((rooms) => __awaiter(this, void 0, void 0, function* () {
        if (rooms.length > 0) {
            let roomIDS = new Array();
            rooms.forEach(room => {
                roomIDS.push(room._room_id);
            });
            return yield roomCollection
                .update({ _room_id: { $in: roomIDS } }, { $addToSet: { "_type._image_fids": { $each: fids } } })
                .then(upres => {
                console.log(upres);
                return { success: true, message: 'images uploaded successfully.' };
            })
                .catch(err => {
                return { success: false, message: err.message };
            });
        }
        else {
            return { success: false, message: 'No rooms found!' };
        }
    })).catch(err => {
        return { success: false, message: err.message };
    });
});
RoomManager.deleteRoomTypeImage = (hotel_id, roomtype, fid) => __awaiter(this, void 0, void 0, function* () {
    let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
    let respond;
    return yield roomCollection
        .find({
        _hotelId: hotel_id, "_type._type": roomtype
    }).then((rooms) => __awaiter(this, void 0, void 0, function* () {
        if (rooms.length > 0) {
            let roomIDS = new Array();
            rooms.forEach(room => {
                roomIDS.push(room._room_id);
            });
            return yield roomCollection
                .update({ _room_id: { $in: roomIDS } }, { $pull: { "_type._image_fids": fid } })
                .then(upres => {
                console.log(upres);
                return { success: true, message: 'images Deleted successfully.' };
            })
                .catch(err => {
                return { success: false, message: err.message };
            });
        }
        else {
            return { success: false, message: 'No rooms found!' };
        }
    })).catch(err => {
        return { success: false, message: err.message };
    });
});
exports.default = RoomManager;
