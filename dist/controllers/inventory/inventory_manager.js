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
const console = require("console");
const express = require("express");
const Law = require("../../models/inventory/law");
const LogLaw = require("../../models/log/law");
const booking_1 = require("../../models/inventory/booking");
const core_1 = require("../../core");
const log_1 = require("../../models/log/log");
const payment_1 = require("../../models/payment/payment");
const request_1 = require("../../helpers/request");
const room_activity_1 = require("../../models/inventory/room_activity");
const room_reservation_1 = require("../../models/inventory/room_reservation");
const time_1 = require("../../helpers/time");
class InventoryManager {
    static get routes() {
        let bookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        bookingCollection.createIndex({ uuid: 1 }, { unique: true });
        let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        roomReservationCollection.createIndex({ uuid: 1, bookingUuid: 1 }, { unique: true });
        let roomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
        roomActivityCollection.createIndex({ hotelUuid: 1, roomNumber: 1 }, { unique: true });
        let roomsCollection = core_1.default.app.get('mongoClient').get('rooms');
        let ratesCollection = core_1.default.app.get('mongoClient').get('rates');
        let usersCollection = core_1.default.app.get('mongoClient').get('users');
        let paymentCollection = core_1.default.app.get('mongoClient').get('payments');
        let inventoryRouter = express.Router();
        inventoryRouter.route('/front-desk').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let startDate = req.query.start_date;
            let respond;
            let weekDays = new Array();
            for (let index = 0; index < 7; index++) {
                yield weekDays.push(time_1.default.serverMomentInPattern(startDate, 'DD-MM-YYYY')
                    .add(index, 'day')
                    .format('DD-MM-YYYY'));
            }
            let roomReservationDocuments = new Array();
            for (let day of weekDays) {
                yield roomReservationCollection
                    .find({
                    hotelUuid: hotelUuid,
                    checkIn: {
                        $lte: time_1.default.serverMomentInPattern(day, 'DD-MM-YYYY').toDate()
                    },
                    checkOut: {
                        $gte: time_1.default.serverMomentInPattern(day, 'DD-MM-YYYY').toDate()
                    }
                })
                    .then(documents => {
                    console.log('documents', documents);
                    for (let doc of documents) {
                        roomReservationDocuments.push(doc);
                    }
                })
                    .catch(error => { });
            }
            let uniqueUuid = yield roomReservationDocuments.map(reservation => reservation.uuid).filter((value, index, self) => self.indexOf(value) === index);
            let filteredDocs = new Array();
            for (let uuid of uniqueUuid) {
                filteredDocs.push(yield roomReservationDocuments.find(e => e.uuid === uuid));
            }
            let rooms = yield roomsCollection.find({
                _hotelId: hotelUuid
            });
            let uniqueRoomTypes = yield rooms.map(room => room._type._type).filter((value, index, self) => self.indexOf(value) === index);
            let roomType = yield filteredDocs.map(reservation => reservation.roomType).filter((value, index, self) => self.indexOf(value) === index);
            let lastFinal = new Array();
            for (let type of uniqueRoomTypes) {
                let specificRooms = yield rooms.filter(e => e._type._type === type);
                let roomsData = new Array();
                for (let room of specificRooms) {
                    let reservations = yield filteredDocs.filter(e => e.roomUuid === room._room_id && e.status !== Law.RoomStatus.CANCELLED);
                    for (let reservation of reservations) {
                        reservation.checkIn = yield time_1.default.formatGivenDate(reservation.checkIn);
                        reservation.checkOut = yield time_1.default.formatGivenDate(reservation.checkOut);
                    }
                    roomsData.push({
                        number: room._number,
                        type: type,
                        reservations: reservations
                    });
                }
                let availabilityData = new Array();
                for (let day of weekDays) {
                    let totalAvailability = specificRooms.length;
                    for (let roomdata of roomsData) {
                        let dayReservations = yield roomdata.reservations.filter(e => {
                            let checkIn = time_1.default.serverMomentInPattern(e.checkIn, 'DD-MM-YYYY');
                            let checkOut = time_1.default.serverMomentInPattern(e.checkOut, 'DD-MM-YYYY');
                            return checkIn.isSameOrBefore(time_1.default.serverMomentInPattern(day, 'DD-MM-YYYY')) && checkOut.isAfter(time_1.default.serverMomentInPattern(day, 'DD-MM-YYYY'));
                        });
                        if (dayReservations.length > 0) {
                            totalAvailability--;
                        }
                    }
                    let roomActivityDocuments = yield roomActivityCollection.find({
                        hotelUuid: hotelUuid,
                        roomType: type
                    });
                    for (let activity of roomActivityDocuments) {
                        let roomActivity = yield room_activity_1.default.spawn(activity);
                        let isRoomAvailable = yield roomActivity.isAvailableDuring(day, day);
                        if (isRoomAvailable == false) {
                            totalAvailability--;
                        }
                    }
                    if (totalAvailability >= 0) {
                        totalAvailability = totalAvailability;
                    }
                    else {
                        totalAvailability = 0;
                    }
                    availabilityData.push(totalAvailability);
                }
                let hoho = {
                    roomType: type,
                    availability: availabilityData,
                    rooms: roomsData
                };
                lastFinal.push(hoho);
            }
            res.status(200);
            respond = {
                success: true,
                message: `Front-desk documents`,
                data: lastFinal
            };
            res.json(respond);
        }));
        inventoryRouter
            .route('/front-desk/maintenance')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let respond;
            yield roomActivityCollection
                .find({
                hotelUuid: hotelUuid
            })
                .then((activityDocuments) => __awaiter(this, void 0, void 0, function* () {
                let finalMaintenanceBlocks = new Array();
                for (let activity of activityDocuments) {
                    let roomActivity = room_activity_1.default.spawn(activity);
                    let roomMaintenanceBlocks = yield roomActivity.getMaintenanceBlocks();
                    for (let blockIssue of roomMaintenanceBlocks) {
                        yield finalMaintenanceBlocks.push(blockIssue);
                    }
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning all maintenance blocks`,
                    data: finalMaintenanceBlocks
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: `We could not find any room activity under this hotel`
                };
            });
            res.json(respond);
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let roomNumbers = JSON.parse(req.body.room_numbers);
            let fromDate = req.body.from_date;
            let toDate = req.body.to_date;
            let reason = req.body.reason;
            let remark = req.body.remark;
            let userId = req.body.user_id;
            let userUuid = req.body.user_uuid;
            let respond;
            for (let roomNumber of roomNumbers) {
                let activityDocument = yield roomActivityCollection.findOne({
                    hotelUuid: hotelUuid,
                    roomNumber: roomNumber
                });
                let roomActivity = room_activity_1.default.spawn(activityDocument);
                roomActivity.addMaintenanceBlock({
                    reason: Law.BlockingIssue[reason],
                    duration: {
                        startDate: fromDate,
                        endDate: toDate
                    },
                    remark: remark,
                    blockedOn: time_1.default.serverMoment.format('DD-MM-YYYY'),
                    blockedBy: userId
                });
                yield roomActivityCollection.update({
                    hotelUuid: roomActivity.hotelUuid,
                    roomNumber: roomActivity.roomNumber
                }, roomActivity.document);
                let data = {
                    type: LogLaw.Type.MAINTENANCE_CREATE,
                    by: userId,
                    payload: {
                        room_number: roomNumber[0],
                        hotel_uuid: hotelUuid,
                        reason: Law.BlockingIssue[reason],
                        remark: remark,
                        blockedOn: time_1.default.serverMoment.toDate(),
                        blockedBy: userId,
                        duration: {
                            startDate: time_1.default.serverMomentInPattern(fromDate, 'DD-MM-YYYY').toDate(),
                            endDate: time_1.default.serverMomentInPattern(toDate, 'DD-MM-YYYY').toDate()
                        },
                        roomType: roomActivity.roomType
                    }
                };
                let maintenanceLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(maintenanceLog.document);
            }
            res.status(200);
            respond = {
                success: true,
                message: `We have updated the maintenance blocks`
            };
            res.json(respond);
        }))
            .delete((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let roomNumber = req.body.room_numbers;
            let reason = req.body.reason;
            let userUuid = req.body.user_uuid;
            let respond;
            yield roomActivityCollection
                .findOne({
                hotelUuid: hotelUuid,
                roomNumber: roomNumber
            })
                .then((activityDocument) => __awaiter(this, void 0, void 0, function* () {
                let roomActivity = room_activity_1.default.spawn(activityDocument);
                yield roomActivity.removeMaintenanceBlock(reason);
                yield roomActivityCollection.update({
                    hotelUuid: roomActivity.hotelUuid,
                    roomNumber: roomActivity.roomNumber
                }, roomActivity.document);
            }))
                .then(success => {
                let data = {
                    type: LogLaw.Type.MAINTENANCE_DELETE,
                    by: userUuid,
                    payload: {
                        room_number: roomNumber[0],
                        hotel_uuid: hotelUuid,
                        reason: Law.BlockingIssue[reason]
                    }
                };
                let maintenanceLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(maintenanceLog.document);
                res.status(200);
                respond = {
                    success: true,
                    message: `We have deleted the maintenance blocks`
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
        inventoryRouter
            .route('/front-desk/room-cleaning')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let userUuid = req.body.user_uuid;
            let respond;
            yield roomActivityCollection
                .find({
                hotelUuid: hotelUuid,
                isDirty: true
            })
                .then((activityDocuments) => __awaiter(this, void 0, void 0, function* () {
                let roomCleanings = new Array();
                for (let activity of activityDocuments) {
                    let roomActivity = room_activity_1.default.spawn(activity);
                    roomCleanings.push({
                        roomNumber: roomActivity.roomNumber,
                        floorNumber: roomActivity.roomNumber.toString().charAt(0),
                        roomType: roomActivity.roomType,
                        status: 'Dirty'
                    });
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning all room cleaning tasks`,
                    data: roomCleanings
                };
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: `We could not find any room activity under this hotel`
                };
            });
            res.json(respond);
        }))
            .put((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let userUuid = req.body.user_uuid;
            let roomNumber = req.body.room_number;
            let isDirty = req.body.isDirty == 'true';
            let respond;
            yield roomActivityCollection
                .update({
                hotelUuid: hotelUuid,
                roomNumber: roomNumber
            }, {
                $set: {
                    isDirty: isDirty
                }
            })
                .then(success => {
                let data = {
                    type: LogLaw.Type.ROOM_CLEANING,
                    by: userUuid,
                    payload: {
                        room_number: roomActivityCollection.room_number,
                        hotel_uuid: roomActivityCollection.hotel_uuid,
                        floorNumber: roomActivityCollection.floorNumber,
                        room_type: roomActivityCollection.room_type,
                        status: roomActivityCollection.isDirty
                    }
                };
                let bookingLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(bookingLog.document);
                res.status(200);
                respond = {
                    success: true,
                    message: `We have tagged the room as clean now`
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        inventoryRouter.route('/booking').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookingUuid = req.query.booking_uuid;
            let respond;
            yield bookingCollection
                .findOne({
                uuid: bookingUuid
            })
                .then((bookingDocument) => __awaiter(this, void 0, void 0, function* () {
                let booking = booking_1.default.spawn(bookingDocument);
                let roomReservations = new Array();
                for (let roomReservationUuid of booking.roomReservations) {
                    let reservation = yield roomReservationCollection.findOne({
                        uuid: roomReservationUuid
                    });
                    roomReservations.push(reservation);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Found the requested booking`,
                    data: {
                        booking: bookingDocument,
                        roomReservations: roomReservations
                    }
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
        }));
        inventoryRouter
            .route('/booking/walk-in')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookingUuid = req.query.booking_uuid;
            let respond;
            yield bookingCollection
                .findOne({
                uuid: bookingUuid
            })
                .then((bookingDocument) => __awaiter(this, void 0, void 0, function* () {
                let booking = booking_1.default.spawn(bookingDocument);
                let roomReservations = new Array();
                for (let roomReservationUuid of booking.roomReservations) {
                    let reservation = yield roomReservationCollection.findOne({
                        uuid: roomReservationUuid
                    });
                    roomReservations.push(reservation);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `Found the requested booking`,
                    data: {
                        booking: bookingDocument,
                        roomReservations: roomReservations
                    }
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
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let status = req.body.status;
            let source = req.body.source;
            let hotelRemark = req.body.hotel_remark;
            let noofchild = req.body.no_of_child;
            let guest = JSON.parse(req.body.guest);
            let discountMarkup = JSON.parse(req.body.discount_markup);
            let bookedBy = req.body.bookedBy;
            let rooms = JSON.parse(req.body.rooms);
            let userUuid = req.body.user_uuid;
            let discount = {
                type: Law.DiscountType.WALK_IN,
                markup: discountMarkup
            };
            let respond;
            let today = time_1.default.serverMoment.format('DD-MM-YYYY');
            if (status === Law.BookingStatus.CONFIRMED && time_1.default.serverMomentInPattern(rooms[0].checkIn, 'DD-MM-YYYY').isSameOrBefore(time_1.default.serverMoment, 'day')) {
                status = Law.BookingStatus.CHECK_IN;
            }
            let referred_by = null;
            let bookingInfo = {
                hotelId: hotelUuid,
                source: source,
                status: status,
                noofchild: noofchild,
                hotelRemark: hotelRemark,
                guest: guest,
                discount: discount,
                serviceFee: 0,
                tax: 0,
                referred_by: referred_by,
                bookedBy: bookedBy,
                bookingCommission: null
            };
            let booking = booking_1.default.create(bookingInfo);
            let roomReservationData = new Array();
            for (let roomData of rooms) {
                let roomDetails = yield roomsCollection.findOne({
                    _hotelId: hotelUuid,
                    _number: roomData.roomNumber
                });
                let costBreakdown = roomData.costBreakdown;
                costBreakdown.forEach(function (value, index) {
                    value.date = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(value.date), 'DD-MM-YYYY').toDate();
                });
                let roomReservation = room_reservation_1.default.create({
                    roomUuid: roomDetails['_room_id'],
                    hotelUuid: hotelUuid,
                    bookingUuid: booking.uuid,
                    roomNumber: roomData.roomNumber,
                    roomType: roomData.roomType,
                    status: Law.RoomStatus[booking.status],
                    guest: roomData.guest,
                    numberOfGuests: roomData.numberOfGuests,
                    numberOfNights: roomData.numberOfNights,
                    breakfastIncluded: roomData.breakfastIncluded,
                    roomPrice: roomData.roomPrice,
                    costBreakdown: costBreakdown,
                    checkIn: time_1.default.serverMomentInPattern(roomData.checkIn, 'DD-MM-YYYY').toDate(),
                    checkOut: time_1.default.serverMomentInPattern(roomData.checkOut, 'DD-MM-YYYY').toDate()
                });
                let inventory_values = {
                    hotel_uuid: hotelUuid,
                    start_date: roomData.checkIn,
                    end_date: roomData.checkOut,
                    room_type: roomData.roomType
                };
                request_1.default.post('/ota-manager/inventory-update', {}, inventory_values).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log('Error: ', error.message);
                });
                roomReservationData.push({
                    uuid: roomReservation.uuid,
                    roomUuid: roomReservation.roomUuid,
                    roomNumber: roomReservation.roomNumber
                });
                yield roomReservationCollection
                    .insert(roomReservation.document)
                    .then((document) => __awaiter(this, void 0, void 0, function* () {
                    booking.roomReservations.push(roomReservation.uuid);
                    booking.status = Law.BookingStatus[roomReservation.status];
                }))
                    .catch(error => { });
            }
            yield bookingCollection
                .insert(booking.document)
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let data = {
                    type: LogLaw.Type.BOOKING_CREATE,
                    by: userUuid,
                    payload: {
                        bookingUuid: booking.uuid,
                        numberOfRooms: booking.roomReservations.length,
                        numberOfGuests: rooms[0].numberOfGuests,
                        guest: rooms[0].guest,
                        roomReservations: roomReservationData,
                        checkIn: time_1.default.serverMomentInPattern(rooms[0].checkIn, "DD-MM-YYYY").toDate(),
                        checkOut: time_1.default.serverMomentInPattern(rooms[0].checkOut, "DD-MM-YYYY").toDate(),
                        status: Law.RoomStatus[booking.status],
                        bookingCommission: booking.bookingCommission,
                        referred_by: bookingInfo.referred_by
                    }
                };
                let bookingLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(bookingLog.document);
                if (Law.RoomStatus[status] === Law.RoomStatus.CHECK_IN) {
                    let data = {
                        type: LogLaw.Type.RESERVE,
                        by: userUuid,
                        payload: {
                            bookingUuid: booking.uuid,
                            hotelUuid: hotelUuid,
                            numberOfRooms: booking.roomReservations.length,
                            vacancyStatus: Law.RoomStatus.CHECK_IN,
                            roomNumber: rooms[0].roomNumber
                        }
                    };
                    let checkInLog = log_1.default.create(data);
                    let logCollection = core_1.default.app.get('mongoClient').get('Log');
                    logCollection.insert(checkInLog.document);
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `New booking has been registered`,
                    data: document
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
        }));
        inventoryRouter.route('/booking/web').post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let status = req.body.status;
            let no_of_child = req.body.no_of_child;
            let guest = JSON.parse(req.body.guest);
            let numberOfGuests = req.body.number_of_guests;
            let roomTypes = JSON.parse(req.body.room_types);
            let checkIn = req.body.check_in;
            let checkOut = req.body.check_out;
            let bookingCommission = JSON.parse(req.body.bookingCommission);
            let eachRoomTypePrice = JSON.parse(req.body.eachRoomTypePrice);
            let dailyRates = JSON.parse(req.body.dailyRates);
            let referred_by = req.body.referred_by;
            let userUuid = req.body.user_uuid;
            let bookedBy = req.body.user_uuid;
            let respond;
            let bookingInfo = {
                hotelId: hotelUuid,
                source: Law.BookingSource.WEB,
                status: Law.BookingStatus.ON_HOLD,
                noofchild: no_of_child,
                hotelRemark: null,
                guest: guest,
                discount: null,
                serviceFee: 0,
                tax: 0,
                referred_by: referred_by,
                bookingCommission: bookingCommission,
                bookedBy: userUuid
            };
            let numberOfNights = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').diff(time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY'), 'days');
            let booking = booking_1.default.create(bookingInfo);
            let roomReservationData = new Array();
            for (let roomTypeData of roomTypes) {
                let no_of_rooms = Number(roomTypeData.no_of_rooms);
                for (let roomIndex = 0; roomIndex < no_of_rooms; roomIndex++) {
                    let availableRoomNumbers = yield InventoryManager.getAvailableRoomNumbers(hotelUuid, roomTypeData.roomType, checkIn, checkOut);
                    let room = yield roomsCollection.findOne({
                        _hotelId: hotelUuid,
                        _number: availableRoomNumbers[0]
                    });
                    let currentRoomPrice = 0;
                    eachRoomTypePrice.forEach(roomTypePrice => {
                        if (roomTypePrice['type'] == roomTypeData.roomType) {
                            currentRoomPrice = roomTypePrice['totalRoomPrice'];
                        }
                    });
                    let costBreakdown = dailyRates[roomTypeData.roomType];
                    costBreakdown.forEach(function (value, index) {
                        value.date = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(value.date), 'DD-MM-YYYY').toDate();
                    });
                    let roomReservation = room_reservation_1.default.create({
                        roomUuid: room['_room_id'],
                        hotelUuid: hotelUuid,
                        bookingUuid: booking.uuid,
                        roomNumber: room['_number'],
                        roomType: roomTypeData.roomType,
                        status: Law.RoomStatus.ON_HOLD,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfNights: numberOfNights,
                        breakfastIncluded: "No",
                        roomPrice: currentRoomPrice,
                        costBreakdown: costBreakdown,
                        checkIn: time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY').toDate(),
                        checkOut: time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').toDate()
                    });
                    roomReservationData.push({
                        uuid: roomReservation.uuid,
                        roomUuid: roomReservation.roomUuid,
                        roomNumber: roomReservation.roomNumber
                    });
                    let inventory_values = {
                        hotel_uuid: hotelUuid,
                        start_date: checkIn,
                        end_date: checkOut,
                        room_type: roomTypeData.roomType
                    };
                    request_1.default.post('/ota-manager/inventory-update', {}, inventory_values).then(response => {
                        console.log(response);
                    }).catch(error => {
                        console.log('Error: ', error.message);
                    });
                    yield roomReservationCollection
                        .insert(roomReservation.document)
                        .then((document) => __awaiter(this, void 0, void 0, function* () {
                        booking.roomReservations.push(roomReservation.uuid);
                        booking.status = Law.BookingStatus[roomReservation.status];
                    }))
                        .catch(error => { });
                }
            }
            yield bookingCollection
                .insert(booking.document)
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let data = {
                    type: LogLaw.Type.BOOKING_CREATE,
                    by: userUuid,
                    payload: {
                        bookingUuid: booking.uuid,
                        numberOfRooms: booking.roomReservations.length,
                        roomReservations: roomReservationData,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfNights: numberOfNights,
                        checkIn: time_1.default.serverMomentInPattern(checkIn, "DD-MM-YYYY").toDate(),
                        checkOut: time_1.default.serverMomentInPattern(checkOut, "DD-MM-YYYY").toDate(),
                        roomNumber: roomReservationData[0].roomNumber,
                        status: status,
                        bookingCommission: bookingCommission,
                        referred_by: bookingInfo.referred_by
                    }
                };
                let bookingLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(bookingLog.document);
                res.status(200);
                respond = {
                    success: true,
                    message: `New booking has been registered`,
                    data: document
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
        }));
        inventoryRouter.route('/booking/dataimport').post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let status = req.body.status;
            let no_of_child = req.body.no_of_child;
            let guest = JSON.parse(req.body.guest);
            let numberOfGuests = req.body.number_of_guests;
            let roomTypes = JSON.parse(req.body.room_types);
            let checkIn = req.body.check_in;
            let checkOut = req.body.check_out;
            let bookingCommission = JSON.parse(req.body.bookingCommission);
            let eachRoomTypePrice = JSON.parse(req.body.eachRoomTypePrice);
            let dailyRates = JSON.parse(req.body.dailyRates);
            let referred_by = req.body.referred_by;
            let userUuid = req.body.user_uuid;
            let remarks = req.body.remarks;
            let booking_source = req.body.booking_source;
            let room_status = req.body.status;
            let bookedBy = req.body.user_uuid;
            let respond;
            let bookingInfo = {
                hotelId: hotelUuid,
                source: booking_source,
                status: status,
                noofchild: no_of_child,
                hotelRemark: remarks,
                guest: guest,
                discount: null,
                serviceFee: 0,
                tax: 0,
                referred_by: referred_by,
                bookingCommission: bookingCommission,
                bookedBy: userUuid,
                bookedOn: time_1.default.serverMomentInPattern(req.body.bookedOn, 'DD-MM-YYYY').toDate()
            };
            let numberOfNights = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').diff(time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY'), 'days');
            let booking = booking_1.default.import(bookingInfo);
            let roomReservationData = new Array();
            for (let roomTypeData of roomTypes) {
                let no_of_rooms = Number(roomTypeData.no_of_rooms);
                for (let roomIndex = 0; roomIndex < no_of_rooms; roomIndex++) {
                    let availableRoomNumbers = yield InventoryManager.getAvailableRoomNumbers(hotelUuid, roomTypeData.roomType, checkIn, checkOut);
                    let room = yield roomsCollection.findOne({
                        _hotelId: hotelUuid,
                        _number: availableRoomNumbers[0]
                    });
                    let currentRoomPrice = 0;
                    eachRoomTypePrice.forEach(roomTypePrice => {
                        if (roomTypePrice['type'] == roomTypeData.roomType) {
                            currentRoomPrice = roomTypePrice['totalRoomPrice'];
                        }
                    });
                    let costBreakdown = dailyRates[roomTypeData.roomType];
                    costBreakdown.forEach(function (value, index) {
                        value.date = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(value.date), 'DD-MM-YYYY').toDate();
                    });
                    let roomReservation = room_reservation_1.default.create({
                        roomUuid: room['_room_id'],
                        hotelUuid: hotelUuid,
                        bookingUuid: booking.uuid,
                        roomNumber: room['_number'],
                        roomType: roomTypeData.roomType,
                        status: room_status,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfNights: numberOfNights,
                        breakfastIncluded: "No",
                        roomPrice: currentRoomPrice,
                        costBreakdown: costBreakdown,
                        checkIn: time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY').toDate(),
                        checkOut: time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').toDate()
                    });
                    roomReservationData.push({
                        uuid: roomReservation.uuid,
                        roomUuid: roomReservation.roomUuid,
                        roomNumber: roomReservation.roomNumber
                    });
                    let inventory_values = {
                        hotel_uuid: hotelUuid,
                        start_date: checkIn,
                        end_date: checkOut,
                        room_type: roomTypeData.roomType
                    };
                    yield roomReservationCollection
                        .insert(roomReservation.document)
                        .then((document) => __awaiter(this, void 0, void 0, function* () {
                        booking.roomReservations.push(roomReservation.uuid);
                        booking.status = Law.BookingStatus[roomReservation.status];
                    }))
                        .catch(error => { });
                }
            }
            yield bookingCollection
                .insert(booking.document)
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let data = {
                    type: LogLaw.Type.BOOKING_CREATE,
                    by: userUuid,
                    payload: {
                        bookingUuid: booking.uuid,
                        numberOfRooms: booking.roomReservations.length,
                        roomReservations: roomReservationData,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfNights: numberOfNights,
                        checkIn: time_1.default.serverMomentInPattern(checkIn, "DD-MM-YYYY").toDate(),
                        checkOut: time_1.default.serverMomentInPattern(checkOut, "DD-MM-YYYY").toDate(),
                        roomNumber: roomReservationData[0].roomNumber,
                        status: status,
                        bookingCommission: bookingCommission,
                        referred_by: bookingInfo.referred_by
                    }
                };
                let bookingLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(bookingLog.document);
                if (Law.RoomStatus[status] === Law.RoomStatus.CHECK_IN) {
                    for (let roomData of roomReservationData) {
                        let data = {
                            type: LogLaw.Type.RESERVE,
                            by: userUuid,
                            payload: {
                                bookingUuid: booking.uuid,
                                hotelUuid: hotelUuid,
                                numberOfRooms: booking.roomReservations.length,
                                vacancyStatus: Law.RoomStatus.CHECK_IN,
                                roomNumber: roomData.roomNumber
                            }
                        };
                        let checkInLog = log_1.default.create(data);
                        let logCollection = core_1.default.app.get('mongoClient').get('Log');
                        logCollection.insert(checkInLog.document);
                    }
                }
                res.status(200);
                respond = {
                    success: true,
                    message: `New booking has been registered`,
                    data: document
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
        }));
        inventoryRouter.route('/booking/ota').post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let status = req.body.status;
            let no_of_child = req.body.no_of_child;
            let guest = JSON.parse(req.body.guest);
            let numberOfGuests = req.body.number_of_guests;
            let breakfastIncluded = req.body.breakfastIncluded;
            let roomTypes = JSON.parse(req.body.room_types);
            let roomPriceArray = req.body.roomPriceArray;
            let checkIn = req.body.check_in;
            let checkOut = req.body.check_out;
            let userUuid = req.body.user_uuid;
            let bookedBy = req.body.user_uuid;
            let price = req.body.price;
            let respond;
            let bookingInfo = {
                hotelId: hotelUuid,
                source: Law.BookingSource.OTA,
                status: status,
                noofchild: no_of_child,
                hotelRemark: null,
                guest: guest,
                discount: null,
                serviceFee: 0,
                tax: 0,
                referred_by: null,
                bookedBy: bookedBy,
                bookingCommission: null
            };
            let numberOfNights = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').diff(time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY'), 'days');
            let booking = booking_1.default.create(bookingInfo);
            let roomReservationData = new Array();
            for (let roomType of roomTypes) {
                let availableRoomNumbers = yield InventoryManager.getAvailableRoomNumbers(hotelUuid, roomType, checkIn, checkOut);
                let room = yield roomsCollection.findOne({
                    _hotelId: hotelUuid,
                    _number: availableRoomNumbers[0]
                });
                let costBreakdown = price[roomType];
                costBreakdown.forEach(function (value, index) {
                    value.date = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(value.date), 'DD-MM-YYYY').toDate();
                });
                if (room) {
                    let roomReservation = room_reservation_1.default.create({
                        roomUuid: room['_room_id'],
                        hotelUuid: hotelUuid,
                        bookingUuid: booking.uuid,
                        roomNumber: room['_number'],
                        roomType: roomType,
                        status: status,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfNights: numberOfNights,
                        breakfastIncluded: breakfastIncluded[roomType],
                        roomPrice: roomPriceArray[roomType],
                        costBreakdown: costBreakdown,
                        checkIn: time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY').toDate(),
                        checkOut: time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').toDate()
                    });
                    roomReservationData.push({
                        uuid: roomReservation.uuid,
                        roomUuid: roomReservation.roomUuid,
                        roomNumber: roomReservation.roomNumber
                    });
                    yield roomReservationCollection
                        .insert(roomReservation.document)
                        .then((document) => __awaiter(this, void 0, void 0, function* () {
                        booking.roomReservations.push(roomReservation.uuid);
                        booking.status = Law.BookingStatus[roomReservation.status];
                    }))
                        .catch(error => { });
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: "Room is not available"
                    };
                }
            }
            yield bookingCollection
                .insert(booking.document)
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let data = {
                    type: LogLaw.Type.BOOKING_CREATE,
                    by: userUuid,
                    payload: {
                        bookingUuid: booking.uuid,
                        numberOfRooms: booking.roomReservations.length,
                        roomReservations: roomReservationData,
                        guest: guest,
                        numberOfGuests: numberOfGuests,
                        numberOfNights: numberOfNights,
                        checkIn: time_1.default.serverMomentInPattern(checkIn, "DD-MM-YYYY").toDate(),
                        checkOut: time_1.default.serverMomentInPattern(checkOut, "DD-MM-YYYY").toDate(),
                        roomNumber: roomReservationData[0].roomNumber,
                        status: status,
                        referred_by: bookingInfo.referred_by,
                        bookingCommission: booking.bookingCommission
                    }
                };
                let bookingLog = log_1.default.create(data);
                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                logCollection.insert(bookingLog.document);
                res.status(200);
                respond = {
                    success: true,
                    message: `New booking has been registered`,
                    data: document
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
        }));
        inventoryRouter.put('/booking/vacancy', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let bookingUuid = req.body.booking_uuid;
            let vacancyStatus = req.body.status;
            let user_uuid = '';
            if (req.session.user) {
                user_uuid = req.session.user._user_id;
            }
            else {
                user_uuid = '';
            }
            let respond;
            yield bookingCollection
                .findOne({
                uuid: bookingUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let booking = booking_1.default.spawn(document);
                let allReservationsTobeCheckedIn = true;
                let allReservationsTobeCheckedOut = true;
                switch (vacancyStatus) {
                    case Law.VacancyStatus.IN:
                        for (let roomReservationUuid of booking.roomReservations) {
                            let reservationDocument = yield roomReservationCollection.findOne({
                                uuid: roomReservationUuid
                            });
                            let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                            if (reservation.status !== Law.RoomStatus.CHECK_IN && reservation.status !== Law.RoomStatus.NO_SHOW) {
                                allReservationsTobeCheckedIn = false;
                                break;
                            }
                        }
                        if (allReservationsTobeCheckedIn) {
                            for (let roomReservationUuid of booking.roomReservations) {
                                let reservationDocument = yield roomReservationCollection.findOne({
                                    uuid: roomReservationUuid
                                });
                                let postvalues = {
                                    user_uuid: req.body.user_uuid
                                };
                                let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                                reservation.status = Law.RoomStatus.OCCUPIED;
                                reservation.statusColor = Law.RoomStatusColor.OCCUPIED;
                                let data = {
                                    type: LogLaw.Type.CHECK_IN,
                                    by: user_uuid,
                                    payload: {
                                        bookingUuid: booking.uuid,
                                        _hotelId: hotelUuid,
                                        numberOfRooms: booking.roomReservations.length,
                                        vacancyStatus: Law.RoomStatus.CHECK_IN,
                                        roomNumber: reservationDocument.roomNumber
                                    }
                                };
                                let checkInLog = log_1.default.create(data);
                                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                                logCollection.insert(checkInLog.document);
                                yield roomReservationCollection.update({
                                    uuid: reservation.uuid
                                }, reservation.document);
                            }
                            yield bookingCollection.update({
                                uuid: bookingUuid
                            }, {
                                $set: {
                                    status: Law.BookingStatus.OCCUPIED
                                }
                            });
                            res.status(200);
                            respond = {
                                success: true,
                                message: `Guests have been checked-in`
                            };
                        }
                        else {
                            res.status(200);
                            respond = {
                                success: false,
                                message: `Only if all room reservations are on check-in dates can check-in`
                            };
                        }
                        break;
                    case Law.VacancyStatus.OUT:
                        for (let roomReservationUuid of booking.roomReservations) {
                            let reservationDocument = yield roomReservationCollection.findOne({
                                uuid: roomReservationUuid
                            });
                            let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                            if (reservation.status !== Law.RoomStatus.OCCUPIED && reservation.status !== Law.RoomStatus.CHECK_OUT) {
                                allReservationsTobeCheckedOut = false;
                                break;
                            }
                        }
                        if (allReservationsTobeCheckedOut) {
                            for (let roomReservationUuid of booking.roomReservations) {
                                let reservationDocument = yield roomReservationCollection.findOne({
                                    uuid: roomReservationUuid
                                });
                                let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                                let postvalues = {
                                    user_uuid: req.body.user_uuid
                                };
                                reservation.status = Law.RoomStatus.VACATED;
                                reservation.statusColor = Law.RoomStatusColor.VACATED;
                                let data = {
                                    type: LogLaw.Type.CHECK_OUT,
                                    by: user_uuid,
                                    payload: {
                                        bookingUuid: booking.uuid,
                                        hotelUuid: roomReservationUuid,
                                        numberOfRooms: booking.roomReservations.length,
                                        vacancyStatus: Law.RoomStatus.CHECK_OUT,
                                        roomNumber: reservationDocument.roomNumber
                                    }
                                };
                                let checkOutLog = log_1.default.create(data);
                                let logCollection = core_1.default.app.get('mongoClient').get('Log');
                                logCollection.insert(checkOutLog.document);
                                yield roomReservationCollection.update({
                                    uuid: reservation.uuid
                                }, reservation.document);
                                yield roomActivityCollection.update({
                                    hotelUuid: reservation.hotelUuid,
                                    roomNumber: reservation.roomNumber
                                }, {
                                    $set: {
                                        isDirty: true
                                    }
                                });
                            }
                            yield bookingCollection.update({
                                uuid: bookingUuid
                            }, {
                                $set: {
                                    status: Law.BookingStatus.VACATED
                                }
                            });
                            res.status(200);
                            respond = {
                                success: true,
                                message: `Guests have been checked-out`
                            };
                        }
                        else {
                            res.status(200);
                            respond = {
                                success: false,
                                message: `Only if all rooms are occupied then can check-out on check-out dates`
                            };
                        }
                        break;
                }
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        inventoryRouter.put('/booking/no-show', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let bookingUuid = req.body.booking_uuid;
            let userUuid = req.body.user_uuid;
            let respond;
            yield bookingCollection
                .findOne({
                uuid: bookingUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let booking = booking_1.default.spawn(document);
                for (let roomReservationUuid of booking.roomReservations) {
                    let reservationDocument = yield roomReservationCollection.findOne({
                        uuid: roomReservationUuid
                    });
                    let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                    reservation.status = Law.RoomStatus.NO_SHOW;
                    reservation.statusColor = Law.RoomStatusColor.NO_SHOW;
                    yield roomReservationCollection.update({
                        uuid: reservation.uuid
                    }, reservation.document);
                }
                yield bookingCollection.update({
                    uuid: bookingUuid
                }, {
                    $set: {
                        status: Law.BookingStatus.NO_SHOW
                    }
                });
                res.status(200);
                respond = {
                    success: true,
                    message: `Booking has tagged as NO_SHOW`
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
        }));
        inventoryRouter.put('/booking/cancellation', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookingUuid = req.body.booking_uuid;
            let respond;
            yield bookingCollection
                .findOne({
                uuid: bookingUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let booking = booking_1.default.spawn(document);
                for (let roomReservationUuid of booking.roomReservations) {
                    let reservationDocument = yield roomReservationCollection.findOne({
                        uuid: roomReservationUuid
                    });
                    let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                    reservation.status = Law.RoomStatus.CANCELLED;
                    yield roomReservationCollection.update({
                        uuid: reservation.uuid
                    }, reservation.document);
                }
                yield bookingCollection.update({
                    uuid: bookingUuid
                }, {
                    $set: {
                        status: Law.BookingStatus.CANCELLED
                    }
                });
                res.status(200);
                respond = {
                    success: true,
                    message: `Booking has been cancelled`
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
        }));
        inventoryRouter.put('/booking/change-room', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let roomReservationUuid = req.body.room_reservation_uuid;
            let newRoomNumber = req.body.new_room_number;
            let no_of_guest = req.body.no_of_guest;
            let respond;
            yield roomReservationCollection
                .findOne({
                uuid: roomReservationUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let reservation = room_reservation_1.default.spawn(document);
                let roomDetails = yield roomsCollection.findOne({
                    _hotelId: hotelUuid,
                    _number: newRoomNumber
                });
                reservation.roomUuid = roomDetails['_room_id'];
                reservation.roomNumber = roomDetails['_number'];
                reservation.roomType = roomDetails['_type']['_type'];
                reservation.numberOfGuests = no_of_guest;
                yield roomReservationCollection.update({
                    uuid: reservation.uuid
                }, reservation.document);
                res.status(200);
                respond = {
                    success: true,
                    message: `Room has been changed`
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
        }));
        inventoryRouter.put('/booking/payment', (req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookingUuid = req.body.booking_uuid;
            let userUuid = req.body.user_uuid;
            let respond;
            yield bookingCollection
                .findOne({
                uuid: bookingUuid
            })
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                let booking = booking_1.default.spawn(document);
                let allReservationsTobeConfirmed = true;
                for (let roomReservationUuid of booking.roomReservations) {
                    let reservationDocument = yield roomReservationCollection.findOne({
                        uuid: roomReservationUuid
                    });
                    let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                    if (reservation.status !== Law.RoomStatus.ON_HOLD) {
                        allReservationsTobeConfirmed = false;
                        break;
                    }
                }
                if (allReservationsTobeConfirmed) {
                    let roomStatus;
                    let paymentDocument = yield paymentCollection.findOne({
                        bookinguuid: bookingUuid
                    });
                    if (paymentDocument !== null) {
                        let payment = payment_1.default.spawn(paymentDocument);
                        if (payment.paymentStatus == 'CONFIRMED') {
                            for (let roomReservationUuid of booking.roomReservations) {
                                let reservationDocument = yield roomReservationCollection.findOne({
                                    uuid: roomReservationUuid
                                });
                                let reservation = yield room_reservation_1.default.spawn(reservationDocument);
                                roomStatus = time_1.default.serverMoment.isSameOrAfter(time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(reservation.checkIn), 'DD-MM-YYYY'), 'day') ? Law.RoomStatus.CHECK_IN : Law.RoomStatus.CONFIRMED;
                                reservation.status = roomStatus;
                                reservation.statusColor = Law.RoomStatusColor[roomStatus];
                                yield roomReservationCollection.update({
                                    uuid: reservation.uuid
                                }, reservation.document);
                            }
                            booking.status = Law.BookingStatus[roomStatus];
                            booking.totalRoomPrice = payment.totalRoomPrice;
                            booking.grandPrice = payment.priceAfterDiscount;
                            booking.serviceFee = payment.serviceFee;
                            booking.tax = payment.tax + payment.tourismTax;
                            booking.totalAmount = payment.totalAmountPaid;
                            yield bookingCollection.update({
                                uuid: bookingUuid
                            }, booking.document);
                            res.status(200);
                            respond = {
                                success: true,
                                message: `Booking payment has been confirmed`
                            };
                        }
                        else {
                            res.status(200);
                            respond = {
                                success: false,
                                message: `Payment has not been confirmed`
                            };
                        }
                    }
                    else {
                        res.status(200);
                        respond = {
                            success: false,
                            message: `We couldn't locate any payment for this booking`
                        };
                    }
                }
                else {
                    res.status(200);
                    respond = {
                        success: false,
                        message: `Only if the booking is on-hold then you can confirm it`
                    };
                }
            }))
                .catch(error => {
                res.status(404);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        inventoryRouter.route('/booking/availability/room-numbers').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let roomType = req.query.room_type;
            let checkIn = req.query.check_in;
            let checkOut = req.query.check_out;
            let respond;
            yield InventoryManager.getAvailableRoomNumbers(hotelUuid, roomType, checkIn, checkOut)
                .then(availableRooms => {
                if (availableRooms.length > 0) {
                    res.status(200);
                    respond = {
                        success: true,
                        message: `Returning available rooms of this type`,
                        data: {
                            availableRooms: availableRooms
                        }
                    };
                }
                else {
                    res.status(200);
                    respond = {
                        success: false,
                        message: `We found no available room under this room type`
                    };
                }
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        inventoryRouter.route('/booking/availability/grid-view').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let respond;
            yield InventoryManager.getRoomsGridWithAvailability(hotelUuid)
                .then(gridView => {
                res.status(200);
                respond = { success: true, message: `Returning rooms grid view`, data: gridView };
            })
                .catch(error => {
                res.status(400);
                respond = { success: false, message: error.message };
            });
            res.json(respond);
        }));
        inventoryRouter.route('/booking/availability/quantity').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let roomType = req.query.room_type;
            let checkIn = req.query.check_in;
            let checkOut = req.query.check_out;
            let respond;
            yield InventoryManager.getAvailableRooms(hotelUuid, roomType, checkIn, checkOut)
                .then(availableRooms => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Returning available rooms of this type`,
                    data: {
                        availableRooms: availableRooms
                    }
                };
            })
                .catch(error => {
                res.status(400);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        return inventoryRouter;
    }
    static getAvailableRooms(hotelUuid, roomType, checkIn, checkOut) {
        return __awaiter(this, void 0, void 0, function* () {
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let roomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
            let totalAvailableRooms = 0;
            let numberOfNights = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').diff(time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY'), 'days');
            let currentDay = time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY');
            let roomActivityDocuments = yield roomActivityCollection.find({
                hotelUuid: hotelUuid,
                roomType: roomType
            });
            for (let activity of roomActivityDocuments) {
                let roomActivity = yield room_activity_1.default.spawn(activity);
                let isRoomAvailable = yield roomActivity.isAvailableDuring(checkIn, checkOut);
                if (isRoomAvailable) {
                    totalAvailableRooms++;
                }
            }
            let availableRoomsDuringStay = totalAvailableRooms;
            for (let index = 0; index < numberOfNights; index++) {
                let currentDayDisplay = currentDay.format('DD-MM-YYYY');
                let roomReservationDocuments = yield roomReservationCollection.find({
                    hotelUuid: hotelUuid,
                    roomType: roomType,
                    status: { $ne: "CANCELLED" },
                    checkIn: {
                        $lte: time_1.default.serverMomentInPattern(currentDayDisplay, 'DD-MM-YYYY').toDate()
                    },
                    checkOut: {
                        $gt: time_1.default.serverMomentInPattern(currentDayDisplay, 'DD-MM-YYYY').toDate()
                    }
                });
                let todayAvailableRooms = totalAvailableRooms - roomReservationDocuments.length;
                if (todayAvailableRooms <= availableRoomsDuringStay) {
                    availableRoomsDuringStay = todayAvailableRooms;
                }
                currentDay.add(1, 'day');
            }
            return availableRoomsDuringStay;
        });
    }
    static getAvailableRoomNumbers(hotelUuid, roomType, checkIn, checkOut) {
        return __awaiter(this, void 0, void 0, function* () {
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let roomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
            let nonBlockedRoomNumbers = new Array();
            let availableRooms = new Array();
            let numberOfNights = time_1.default.serverMomentInPattern(checkOut, 'DD-MM-YYYY').diff(time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY'), 'days');
            let roomActivityDocuments = yield roomActivityCollection.find({
                hotelUuid: hotelUuid,
                roomType: roomType
            });
            for (let activity of roomActivityDocuments) {
                let roomActivity = yield room_activity_1.default.spawn(activity);
                let isRoomAvailable = yield roomActivity.isAvailableDuring(checkIn, checkOut);
                if (isRoomAvailable) {
                    nonBlockedRoomNumbers.push(roomActivity.roomNumber);
                }
            }
            for (let roomNumber of nonBlockedRoomNumbers) {
                let currentDay = time_1.default.serverMomentInPattern(checkIn, 'DD-MM-YYYY');
                let isAvailableDuringStay = true;
                for (let index = 0; index < numberOfNights; index++) {
                    let currentDayDisplay = currentDay.format('DD-MM-YYYY');
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        roomNumber: roomNumber,
                        checkIn: {
                            $lte: time_1.default.serverMomentInPattern(currentDayDisplay, 'DD-MM-YYYY').toDate()
                        },
                        checkOut: {
                            $gt: time_1.default.serverMomentInPattern(currentDayDisplay, 'DD-MM-YYYY').toDate()
                        }
                    });
                    roomReservationDocuments = roomReservationDocuments.filter(e => e.status === Law.RoomStatus.ON_HOLD || e.status === Law.RoomStatus.CONFIRMED || e.status === Law.RoomStatus.CHECK_IN || e.status === Law.RoomStatus.OCCUPIED || e.status === Law.RoomStatus.NO_SHOW);
                    if (roomReservationDocuments.length > 0) {
                        isAvailableDuringStay = false;
                        break;
                    }
                    currentDay.add(1, 'day');
                }
                if (isAvailableDuringStay) {
                    availableRooms.push(roomNumber);
                }
            }
            return availableRooms;
        });
    }
    static getRoomsGridWithAvailability(hotelUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let roomActivityCollection = core_1.default.app.get('mongoClient').get('RoomActivity');
            let roomCollection = core_1.default.app.get('mongoClient').get('rooms');
            let today = time_1.default.serverMoment.format('DD-MM-YYYY');
            let tomorrow = time_1.default.serverMoment.add(1, 'day').format('DD-MM-YYYY');
            let data;
            yield roomCollection.find({ _hotelId: hotelUuid }).then((roomList) => __awaiter(this, void 0, void 0, function* () {
                for (let room of roomList) {
                    delete room['_type'];
                    delete room['_amenities'];
                    console.log('room: ', room);
                    let roomActivityDocument = yield roomActivityCollection.findOne({ hotelUuid: hotelUuid, roomNumber: room['_number'] });
                    console.log('roomActivityDocument: ', roomActivityDocument);
                    let roomActivity = yield room_activity_1.default.spawn(roomActivityDocument);
                    let isRoomAvailable = yield roomActivity.isAvailableDuring(today, tomorrow);
                    console.log('isRoomAvailable: ', isRoomAvailable);
                    if (isRoomAvailable) {
                        let roomReservationDocuments = yield roomReservationCollection.find({
                            hotelUuid: hotelUuid,
                            roomNumber: roomActivity.roomNumber,
                            checkIn: {
                                $lte: time_1.default.serverMomentInPattern(today, 'DD-MM-YYYY').toDate()
                            },
                            checkOut: {
                                $gte: time_1.default.serverMomentInPattern(tomorrow, 'DD-MM-YYYY').toDate()
                            }
                        });
                        if (roomReservationDocuments.length === 0) {
                            console.log('roomReservationDocuments.length: ', roomReservationDocuments.length);
                            room['_isAvailable'] = true;
                        }
                    }
                }
                let floorNumberList = yield roomList.map(room => room._floorNumber).filter((value, index, self) => self.indexOf(value) === index);
                data = yield floorNumberList.map(uniqueFloorNumber => {
                    return { floorNumber: uniqueFloorNumber, rooms: roomList.filter(room => room._floorNumber === uniqueFloorNumber) };
                });
            }));
            return data;
        });
    }
}
exports.default = InventoryManager;
