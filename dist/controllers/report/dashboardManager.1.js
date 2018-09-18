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
const LogLaw = require("../../models/log/law");
const InventoryLaw = require("../../models/inventory/law");
const MasterLaw = require("../../helpers/masters.law");
const time_1 = require("../../helpers/time");
const masters_1 = require("../../helpers/masters");
const moment = require('moment');
class DashboardManager {
    static get routes() {
        let DashboardRouter = express.Router();
        DashboardRouter.route('/manager/overview')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            let roomStatusStats = new Array();
            let roomTypeStats = new Array();
            let sourceTypeStats = new Array();
            let sourceStats = new Array();
            let weekDayStats = new Array();
            let begin = time_1.default.serverMomentInPattern(startDate, "DD-MM-YYYY");
            let end = time_1.default.serverMomentInPattern(endDate, "DD-MM-YYYY");
            let numberOfDays = end.diff(begin, 'days');
            let hotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            let roomsCollection = core_1.default.app.get('mongoClient').get('rooms');
            let bookingCollection = core_1.default.app.get('mongoClient').get('Booking');
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let paymentsCollection = core_1.default.app.get('mongoClient').get('payments');
            let logCollection = core_1.default.app.get('mongoClient').get('Log');
            let hotelDocuments = yield hotelDetailsCollection.find({
                _hotel_id: hotelUuid
            });
            let numberOfRoomNights = 0;
            if (hotelDocuments.length > 0) {
                numberOfRoomNights = Number(hotelDocuments[0]._total_no_Of_rooms) * Number(numberOfDays);
            }
            let maintenanceDocuments = yield logCollection.find({
                type: LogLaw.Type.MAINTENANCE_CREATE,
                "payload.hotel_uuid": hotelUuid,
                "payload.duration.startDate": {
                    $not: { $gt: end.toDate() }
                },
                "payload.duration.endDate": {
                    $not: { $lt: begin.toDate() }
                }
            });
            for (let maintain of maintenanceDocuments) {
                let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                if (begin >= blockingStartDate && end >= blockingEndDate) {
                    blockingStartDate = begin;
                }
                else if (begin <= blockingStartDate && end <= blockingEndDate) {
                    blockingEndDate = end;
                }
                else if (begin >= blockingStartDate && end <= blockingEndDate) {
                    blockingStartDate = begin;
                    blockingEndDate = end;
                }
                let dateDifference = blockingEndDate.diff(blockingStartDate, 'days');
                numberOfRoomNights = numberOfRoomNights - dateDifference;
            }
            let roomReservationDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $not: { $gt: end.toDate() }
                },
                checkOut: {
                    $not: { $lt: begin.toDate() }
                },
                status: {
                    $ne: "CANCELLED"
                }
            });
            let roomsSold = 0;
            for (let rooms of roomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                let stayDays = checkOut.diff(checkIn, 'days');
                for (let i = 0; i < stayDays; i++) {
                    roomsSold = roomsSold + 1;
                }
            }
            let metricStats;
            let totalAmount = 0;
            let currency = '';
            let adr = 0;
            let amount;
            var reservationCondition = {
                hotelUuid: hotelUuid,
                status: { $ne: InventoryLaw.BookingStatus.ON_HOLD },
                $and: [
                    { "costBreakdown.date": { $gte: begin.toDate() } },
                    { "costBreakdown.date": { $lte: end.toDate() } }
                ]
            };
            roomReservationCollection.find(reservationCondition, { "sort": { "_id": -1 } }).then((revenueDocuments) => __awaiter(this, void 0, void 0, function* () {
                let result = new Array();
                for (let occupied of revenueDocuments) {
                    for (let cost of occupied.costBreakdown) {
                        if (cost.date >= begin.toDate() && cost.date <= end.toDate()) {
                            amount = cost.cost;
                            totalAmount = totalAmount + amount;
                        }
                    }
                }
                if (roomsSold == 0 || totalAmount == 0) {
                    adr = 0;
                }
                else {
                    adr = totalAmount / roomsSold;
                }
                metricStats = {
                    totalRoomNights: numberOfRoomNights,
                    roomsSold: roomsSold,
                    occupancy: (roomsSold / numberOfRoomNights) * 100,
                    totalRevenue: totalAmount,
                    adr: adr,
                    revpar: totalAmount / numberOfRoomNights,
                    currency: currency
                };
            }));
            let roomTypeNames;
            yield masters_1.default.getDropdown(MasterLaw.Type.ROOMS, "room_types").then(result => {
                roomTypeNames = result.data;
            });
            let roomsDocuments = yield roomsCollection.aggregate([
                {
                    $match: {
                        _hotelId: hotelUuid
                    }
                },
                {
                    "$group": {
                        "_id": {
                            roomType: "$_type._type",
                            numberOfRooms: "$_type._no_of_rooms"
                        }
                    }
                }
            ]);
            for (let rooms of roomsDocuments) {
                let name = roomTypeNames.find(name => name.value === Number(rooms._id.roomType)).text;
                roomTypeStats.push({
                    roomType: Number(rooms._id.roomType),
                    numberOfRooms: Number(rooms._id.numberOfRooms),
                    roomTypeName: name,
                    numberOfRoomNights: Number(rooms._id.numberOfRooms) * Number(numberOfDays)
                });
            }
            let roomTypeMaintenanceDocuments = yield logCollection.find({
                type: LogLaw.Type.MAINTENANCE_CREATE,
                "payload.hotel_uuid": hotelUuid,
                "payload.duration.startDate": {
                    $not: { $gt: end.toDate() }
                },
                "payload.duration.endDate": {
                    $not: { $lt: begin.toDate() }
                }
            });
            for (let maintain of roomTypeMaintenanceDocuments) {
                let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                if (begin >= blockingStartDate && end >= blockingEndDate) {
                    maintain.payload.duration.startDate = begin.toDate();
                }
                else if (begin <= blockingStartDate && end <= blockingEndDate) {
                    maintain.payload.duration.endDate = end.toDate();
                }
                else if (begin >= blockingStartDate && end <= blockingEndDate) {
                    maintain.payload.duration.startDate = begin.toDate();
                    maintain.payload.duration.endDate = end.toDate();
                }
            }
            let roomsRealized = new Array();
            let roomNightsDocuments = new Array();
            for (let typeObj of roomTypeStats) {
                let blockedDatesArray = new Array();
                let roomTypeFilter = roomTypeMaintenanceDocuments.filter(e => Number(e.payload.roomType) === typeObj.roomType);
                let uniqueRoomTypes = yield roomTypeFilter.map(room => room.payload.room_number).filter((value, index, self) => self.indexOf(value) === index);
                for (let unique of uniqueRoomTypes) {
                    let filteredRooms = roomTypeFilter.filter(e => Number(e.payload.room_number) === Number(unique));
                    for (let filteredRoom of filteredRooms) {
                        let blockedStartDate = time_1.default.serverMomentInPattern(filteredRoom.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                        let blockedEndDate = time_1.default.serverMomentInPattern(filteredRoom.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                        let numberOfDaysBlocked = blockedEndDate.diff(blockedStartDate, 'days');
                        for (let i = 0; i < numberOfDaysBlocked; i++) {
                            let createdDate = blockedStartDate.add(1, 'days').format('YYYY-MM-DD');
                            if (blockedDatesArray.indexOf(createdDate) === -1) {
                                yield blockedDatesArray.push(createdDate);
                            }
                        }
                    }
                }
                typeObj.numberOfRoomNights = typeObj.numberOfRoomNights - blockedDatesArray.length;
                yield roomNightsDocuments.push({
                    x: typeObj.roomTypeName,
                    y: typeObj.numberOfRoomNights
                });
            }
            yield roomsRealized.push({
                key: 'Room Nights',
                values: roomNightsDocuments
            });
            let roomsOccupancy = new Array();
            let occupancyDocuments = new Array();
            let roomsSoldDocuments = new Array();
            for (let roomSold of roomTypeStats) {
                let roomTypeFilter = roomReservationDocuments.filter(e => Number(e.roomType) === roomSold.roomType);
                let roomsSold = 0;
                for (let filteredType of roomTypeFilter) {
                    let checkIn = time_1.default.serverMomentInPattern(filteredType.checkIn, "YYYY-MM-DD HH:mm:ss");
                    let checkOut = time_1.default.serverMomentInPattern(filteredType.checkOut, "YYYY-MM-DD HH:mm:ss");
                    if (begin >= checkIn && end >= checkOut) {
                        checkIn = begin;
                    }
                    else if (begin <= checkIn && end <= checkOut) {
                        checkOut = end;
                    }
                    else if (begin >= checkIn && end <= checkOut) {
                        checkIn = begin;
                        checkOut = end;
                    }
                    let daysOccupied = checkOut.diff(checkIn, 'days');
                    roomsSold = roomsSold + daysOccupied;
                }
                roomSold.roomsSold = roomsSold;
                yield roomsSoldDocuments.push({
                    x: roomSold.roomTypeName,
                    y: roomsSold
                });
                yield occupancyDocuments.push({
                    label: roomSold.roomTypeName,
                    value: roomSold.roomsSold / roomSold.numberOfRoomNights
                });
            }
            yield roomsRealized.push({
                key: "Rooms Sold",
                values: roomsSoldDocuments
            });
            yield roomsOccupancy.push({
                key: "Occupancy",
                values: occupancyDocuments
            });
            for (let rooms of roomReservationDocuments) {
                let bookingDocuments = yield bookingCollection.findOne({
                    uuid: rooms.bookingUuid
                });
                rooms.source = bookingDocuments.source;
            }
            let paymentDocuments = yield paymentsCollection.find({
                hoteluuid: hotelUuid,
                $and: [
                    { bookedOn: { $gte: begin.toDate() } },
                    { bookedOn: { $lte: end.toDate() } }
                ],
                totalAmount: { $ne: NaN }
            });
            for (let payment of paymentDocuments) {
                let bookingDocuments = yield bookingCollection.findOne({
                    uuid: payment.bookinguuid
                });
                payment.source = bookingDocuments.source;
            }
            let bookingSource = new Array();
            for (let booking in InventoryLaw.BookingSource) {
                let filteredRooms = roomReservationDocuments.filter(e => e.source === booking);
                let filteredPayments = paymentDocuments.filter(e => e.source === booking);
                if (booking === 'WALK_IN') {
                    booking = 'WALK IN';
                }
                let roomsSold = 0;
                for (let rooms of filteredRooms) {
                    let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                    let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                    if (begin >= checkIn && end >= checkOut) {
                        checkIn = begin;
                    }
                    else if (begin <= checkIn && end <= checkOut) {
                        checkOut = end;
                    }
                    roomsSold = roomsSold + checkOut.diff(checkIn, 'days');
                }
                let totalAmount = 0;
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                }
                let adr = 0;
                if (roomsSold == 0 || totalAmount == 0) {
                    adr = 0;
                }
                else {
                    adr = totalAmount / roomsSold;
                }
                bookingSource.push({
                    source: booking,
                    roomsSold: roomsSold,
                    totalAmount: totalAmount,
                    adr: adr
                });
            }
            let respond = {
                success: true,
                message: 'Prepared data as requested',
                data: {
                    metricStats,
                    roomTypeStats: {
                        roomsRealized,
                        roomsOccupancy
                    },
                    bookingSource
                }
            };
            res.json(respond);
        }));
        DashboardRouter.route('/manager/bookings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let metric = req.query.metric;
            let begin = time_1.default.serverMoment.startOf('month');
            let end = time_1.default.serverMoment.subtract(1, 'days');
            let monthStart = time_1.default.serverMoment.subtract(2, 'months').startOf('month');
            let numberOfDays = end.diff(begin, 'days');
            let bookingCollection = core_1.default.app.get('mongoClient').get('Booking');
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let roomReservationDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $not: { $gt: end.toDate() }
                },
                checkOut: {
                    $not: { $lt: begin.toDate() }
                },
                status: {
                    $ne: "CANCELLED"
                }
            });
            let bookingUuidArr = new Array();
            for (let rooms of roomReservationDocuments) {
                if (bookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                    bookingUuidArr.push(rooms.bookingUuid);
                }
            }
            let bookingSourceDocuments = yield bookingCollection.aggregate([
                {
                    $match: {
                        uuid: {
                            $in: bookingUuidArr
                        }
                    }
                },
                {
                    $group: {
                        _id: { source: "$source" },
                        totalBookings: { $sum: 1 }
                    }
                }
            ]);
            let totalBookings = 0;
            let sourceBookingArr = new Array();
            for (let booking of bookingSourceDocuments) {
                totalBookings = booking.totalBookings + totalBookings;
                if (booking._id.source == 'WALK_IN') {
                    booking._id.source = 'WALK IN';
                }
                sourceBookingArr.push({
                    source: booking._id.source,
                    totalBookings: booking.totalBookings
                });
            }
            let bookingDocuments = yield bookingCollection.find({
                uuid: {
                    $in: bookingUuidArr
                }
            });
            for (let room of roomReservationDocuments) {
                let booking = bookingDocuments.find(e => e.uuid === room.bookingUuid);
                if (booking.source == 'WALK_IN') {
                    booking.source = 'WALK IN';
                }
                if (booking !== undefined) {
                    room.source = booking.source;
                }
            }
            let uniqueSource = Array.from(new Set(roomReservationDocuments.map(item => item.source)));
            let totalRoomsSold = 0;
            let sourceRoomsSoldArr = new Array();
            for (let source of uniqueSource) {
                let filteredRooms = roomReservationDocuments.filter(e => e.source === source);
                let sourceRoomsSold = 0;
                for (let rooms of filteredRooms) {
                    let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                    let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                    if (begin >= checkIn && end >= checkOut) {
                        checkIn = begin;
                    }
                    else if (begin <= checkIn && end <= checkOut) {
                        checkOut = end;
                    }
                    else if (begin >= checkIn && end <= checkOut) {
                        checkIn = begin;
                        checkOut = end;
                    }
                    if (rooms !== undefined) {
                        totalRoomsSold = totalRoomsSold + checkOut.diff(checkIn, 'days');
                        sourceRoomsSold = sourceRoomsSold + checkOut.diff(checkIn, 'days');
                    }
                }
                sourceRoomsSoldArr.push({
                    source: source,
                    totalRoomsSold: sourceRoomsSold
                });
            }
            let sourceAvgStayArr = new Array();
            for (let booking of sourceBookingArr) {
                let room = sourceRoomsSoldArr.find(e => e.source == booking.source);
                sourceAvgStayArr.push({
                    source: booking.source,
                    avgStay: room.totalRoomsSold / booking.totalBookings
                });
            }
            let sourceRoomNightsArr = new Array();
            for (let rooms of sourceRoomsSoldArr) {
                sourceRoomNightsArr.push({
                    source: rooms.source,
                    roomNightsPerDay: rooms.totalRoomsSold / numberOfDays
                });
            }
            let summaryTableArr = new Array();
            let summaryBookingsArr = new Array();
            let summaryRoomsSoldArr = new Array();
            let summaryAvgStayArr = new Array();
            let summaryRoomNightsArr = new Array();
            let summaryUniqueBookingsArr = new Array();
            for (let rooms of roomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                if (summaryUniqueBookingsArr.findIndex(i => i.uuid == rooms.bookingUuid) === -1) {
                    summaryUniqueBookingsArr.push({
                        uuid: rooms.bookingUuid,
                        month: checkIn.clone().startOf('month').format('YYYY-MM-DD'),
                        day: checkIn.format('YYYY-MM-DD'),
                        week: checkIn.clone().startOf('week').format('YYYY-MM-DD'),
                        totalBookings: rooms.bookingUuid
                    });
                }
            }
            let smryBookingsUniqueMonths = Array.from(new Set(summaryUniqueBookingsArr.map(e => e.month)));
            let smryBookingsUniqueWeeks = Array.from(new Set(summaryUniqueBookingsArr.map(e => e.week)));
            let smryBookingsUniqueDays = Array.from(new Set(summaryUniqueBookingsArr.map(e => e.day)));
            smryBookingsUniqueMonths = smryBookingsUniqueMonths.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            });
            smryBookingsUniqueWeeks = smryBookingsUniqueWeeks.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            });
            smryBookingsUniqueDays = smryBookingsUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(0, numberOfDays);
            let monthlyBookingArr = new Array();
            let weeklyBookingArr = new Array();
            let dailyBookingArr = new Array();
            for (let month of smryBookingsUniqueMonths) {
                let bookings = summaryUniqueBookingsArr.filter(e => e.month == month);
                summaryBookingsArr.push({
                    key: month,
                    value: bookings.length,
                    class: 'month'
                });
            }
            for (let week of smryBookingsUniqueWeeks) {
                let bookings = summaryUniqueBookingsArr.filter(e => e.week == week);
                summaryBookingsArr.push({
                    key: week,
                    value: bookings.length,
                    class: 'week'
                });
            }
            for (let day of smryBookingsUniqueDays) {
                let bookings = summaryUniqueBookingsArr.filter(e => e.day == day);
                summaryBookingsArr.push({
                    key: day,
                    value: bookings.length,
                    class: 'day'
                });
            }
            let summaryReducedRoomsArr = new Array();
            for (let rooms of roomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                let stayDays = checkOut.diff(checkIn, 'days');
                for (let i = 0; i < stayDays; i++) {
                    let startDate = checkIn.clone().add(i, 'days');
                    summaryReducedRoomsArr.push({
                        month: startDate.clone().startOf('month').format('YYYY-MM-DD'),
                        day: startDate.format('YYYY-MM-DD'),
                        week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                        roomsSold: 1
                    });
                }
            }
            let smryRoomsSoldUniqueMonths = Array.from(new Set(summaryReducedRoomsArr.map(e => e.month)));
            let smryRoomsSoldUniqueWeeks = Array.from(new Set(summaryReducedRoomsArr.map(e => e.week)));
            let smryRoomsSoldUniqueDays = Array.from(new Set(summaryReducedRoomsArr.map(e => e.day)));
            smryRoomsSoldUniqueMonths = smryRoomsSoldUniqueMonths.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            });
            smryRoomsSoldUniqueWeeks = smryRoomsSoldUniqueWeeks.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            });
            smryRoomsSoldUniqueDays = smryRoomsSoldUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            }).slice(0, numberOfDays);
            let monthlyRoomsSoldArr = new Array();
            let weeklyRoomsSoldArr = new Array();
            let dailyRoomsSoldArr = new Array();
            for (let month of smryRoomsSoldUniqueMonths) {
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.month == month);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: month,
                    value: roomsSold,
                    class: 'month'
                });
            }
            for (let week of smryRoomsSoldUniqueWeeks) {
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.week == week);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: week,
                    value: roomsSold,
                    class: 'week'
                });
            }
            for (let day of smryRoomsSoldUniqueDays) {
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.day == day);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: day,
                    value: roomsSold,
                    class: 'day'
                });
            }
            let smryAvgStayDailyArr = new Array();
            for (let month of smryBookingsUniqueMonths) {
                let bookings = summaryUniqueBookingsArr.filter(e => e.month == month);
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.month == month);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryAvgStayArr.push({
                    key: month,
                    value: roomsSold / bookings.length,
                    class: 'month'
                });
            }
            for (let week of smryBookingsUniqueWeeks) {
                let bookings = summaryUniqueBookingsArr.filter(e => e.week == week);
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.week == week);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryAvgStayArr.push({
                    key: week,
                    value: roomsSold / bookings.length,
                    class: 'week'
                });
            }
            for (let day of smryBookingsUniqueDays) {
                let bookings = summaryUniqueBookingsArr.filter(e => e.day == day);
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.day == day);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryAvgStayArr.push({
                    key: day,
                    value: roomsSold / bookings.length,
                    class: 'day'
                });
            }
            for (let room of summaryRoomsSoldArr) {
                summaryRoomNightsArr.push({
                    key: room.key,
                    value: room.value,
                    class: room.class
                });
            }
            summaryTableArr.push({ booking: summaryBookingsArr }, { roomsSold: summaryRoomsSoldArr }, { avgStay: summaryAvgStayArr }, { roomNights: summaryRoomNightsArr });
            let trendsMonthlyArr = new Array();
            let trendsWeeklyArr = new Array();
            let trendsDailyArr = new Array();
            switch (metric) {
                case 'bookings': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.add(1, 'months').toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        }
                    });
                    let uniqueBookingsArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                        if (uniqueBookingsArr.findIndex(i => i.uuid == rooms.bookingUuid) === -1) {
                            uniqueBookingsArr.push({
                                uuid: rooms.bookingUuid,
                                month: checkIn.format('MMM-YY'),
                                day: checkIn.format('YYYY-MM-DD'),
                                week: checkIn.clone().startOf('week').format('YYYY-MM-DD'),
                                totalBookings: rooms.bookingUuid
                            });
                        }
                    }
                    let uniqueMonths = Array.from(new Set(uniqueBookingsArr.map(e => e.month)));
                    let uniqueWeeks = Array.from(new Set(uniqueBookingsArr.map(e => e.week)));
                    let uniqueDays = Array.from(new Set(uniqueBookingsArr.map(e => e.day)));
                    uniqueWeeks = uniqueWeeks.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    });
                    uniqueDays = uniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(uniqueDays.length - 60, 1));
                    let monthlyBookingArr = new Array();
                    let weeklyBookingArr = new Array();
                    let dailyBookingArr = new Array();
                    for (let month of uniqueMonths) {
                        let bookings = uniqueBookingsArr.filter(e => e.month == month);
                        monthlyBookingArr.push({
                            label: month,
                            value: bookings.length
                        });
                    }
                    trendsMonthlyArr.push({
                        key: "Bookings",
                        values: monthlyBookingArr
                    });
                    for (let week of uniqueWeeks) {
                        let bookings = uniqueBookingsArr.filter(e => e.week == week);
                        weeklyBookingArr.push({
                            label: week,
                            value: bookings.length
                        });
                    }
                    trendsWeeklyArr.push({
                        key: "Bookings",
                        values: weeklyBookingArr
                    });
                    for (let day of uniqueDays) {
                        let bookings = uniqueBookingsArr.filter(e => e.day == day);
                        dailyBookingArr.push({
                            label: day,
                            value: bookings.length
                        });
                    }
                    trendsDailyArr.push({
                        key: "Bookings",
                        values: dailyBookingArr
                    });
                    break;
                }
                case 'roomsSold': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: begin.toDate() }
                        },
                        status: {
                            $ne: "CANCELLED"
                        }
                    });
                    let reducedRoomsArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        let stayDays = checkOut.diff(checkIn, 'days');
                        for (let i = 0; i < stayDays; i++) {
                            let startDate = checkIn.clone().add(i, 'days');
                            reducedRoomsArr.push({
                                month: startDate.format('MMM-YY'),
                                day: startDate.format('YYYY-MM-DD'),
                                week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                roomsSold: 1
                            });
                        }
                    }
                    let uniqueMonths = Array.from(new Set(reducedRoomsArr.map(e => e.month)));
                    let uniqueWeeks = Array.from(new Set(reducedRoomsArr.map(e => e.week)));
                    let uniqueDays = Array.from(new Set(reducedRoomsArr.map(e => e.day)));
                    uniqueDays = uniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(uniqueDays.length - 60, 1));
                    let monthlyRoomsSoldArr = new Array();
                    let weeklyRoomsSoldArr = new Array();
                    let dailyRoomsSoldArr = new Array();
                    for (let month of uniqueMonths) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.month == month);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        monthlyRoomsSoldArr.push({
                            label: month,
                            value: roomsSold
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Rooms Sold',
                        values: monthlyRoomsSoldArr
                    });
                    for (let week of uniqueWeeks) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.week == week);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        weeklyRoomsSoldArr.push({
                            label: week,
                            value: roomsSold
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Rooms Sold',
                        values: weeklyRoomsSoldArr
                    });
                    for (let day of uniqueDays) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.day == day);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        dailyRoomsSoldArr.push({
                            label: day,
                            value: roomsSold
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Rooms Sold',
                        values: dailyRoomsSoldArr
                    });
                    break;
                }
                case 'avgStay': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        }
                    });
                    let uniqueBookingsArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                        if (uniqueBookingsArr.findIndex(i => i.uuid == rooms.bookingUuid) === -1) {
                            uniqueBookingsArr.push({
                                uuid: rooms.bookingUuid,
                                month: checkIn.format('MMM-YY'),
                                day: checkIn.format('YYYY-MM-DD'),
                                week: checkIn.startOf('week').format('YYYY-MM-DD'),
                                totalBookings: rooms.bookingUuid
                            });
                        }
                    }
                    let uniqueMonths = Array.from(new Set(uniqueBookingsArr.map(e => e.month)));
                    let uniqueWeeks = Array.from(new Set(uniqueBookingsArr.map(e => e.week)));
                    let uniqueDays = Array.from(new Set(uniqueBookingsArr.map(e => e.day)));
                    uniqueDays = uniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(uniqueDays.length - 60, 1));
                    let monthlyBookingArr = new Array();
                    let weeklyBookingArr = new Array();
                    let dailyBookingArr = new Array();
                    for (let month of uniqueMonths) {
                        let bookings = uniqueBookingsArr.filter(e => e.month == month);
                        monthlyBookingArr.push({
                            month: month,
                            totalBookings: bookings.length
                        });
                    }
                    for (let week of uniqueWeeks) {
                        let bookings = uniqueBookingsArr.filter(e => e.week == week);
                        weeklyBookingArr.push({
                            week: week,
                            totalBookings: bookings.length
                        });
                    }
                    for (let day of uniqueDays) {
                        let bookings = uniqueBookingsArr.filter(e => e.day == day);
                        dailyBookingArr.push({
                            day: day,
                            totalBookings: bookings.length
                        });
                    }
                    let reducedRoomsArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        let stayDays = checkOut.diff(checkIn, 'days');
                        for (let i = 0; i < stayDays; i++) {
                            let startDate = checkIn.clone().add(i, 'days');
                            reducedRoomsArr.push({
                                month: startDate.format('MMM-YY'),
                                day: startDate.format('YYYY-MM-DD'),
                                week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                roomsSold: 1
                            });
                        }
                    }
                    let monthlyRoomsSoldArr = new Array();
                    let weeklyRoomsSoldArr = new Array();
                    let dailyRoomsSoldArr = new Array();
                    for (let month of uniqueMonths) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.month == month);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        monthlyRoomsSoldArr.push({
                            month: month,
                            roomsSold: roomsSold
                        });
                    }
                    for (let week of uniqueWeeks) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.week == week);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        weeklyRoomsSoldArr.push({
                            week: week,
                            roomsSold: roomsSold
                        });
                    }
                    for (let day of uniqueDays) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.day == day);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        dailyRoomsSoldArr.push({
                            day: day,
                            roomsSold: roomsSold
                        });
                    }
                    let monthlyAvgStayArr = new Array();
                    let weeklyAvgStayArr = new Array();
                    let dailyAvgStayArr = new Array();
                    for (let booking of monthlyBookingArr) {
                        let roomSold = monthlyRoomsSoldArr.find(e => e.month == booking.month);
                        monthlyAvgStayArr.push({
                            label: booking.month,
                            value: roomSold.roomsSold / booking.totalBookings,
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Avg Stay',
                        values: monthlyAvgStayArr
                    });
                    for (let booking of weeklyBookingArr) {
                        let roomSold = weeklyRoomsSoldArr.find(e => e.week == booking.week);
                        weeklyAvgStayArr.push({
                            label: booking.week,
                            value: roomSold.roomsSold / booking.totalBookings,
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Avg Stay',
                        values: weeklyAvgStayArr
                    });
                    for (let booking of dailyBookingArr) {
                        let roomSold = dailyRoomsSoldArr.find(e => e.day == booking.day);
                        dailyAvgStayArr.push({
                            label: booking.day,
                            value: roomSold.roomsSold / booking.totalBookings,
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Avg Stay',
                        values: dailyAvgStayArr
                    });
                    break;
                }
                case 'roomNightsPerDay': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        }
                    });
                    let reducedRoomsArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        let stayDays = checkOut.diff(checkIn, 'days');
                        for (let i = 0; i < stayDays; i++) {
                            let startDate = checkIn.clone().add(i, 'days');
                            reducedRoomsArr.push({
                                month: startDate.format('MMM-YY'),
                                day: startDate.format('YYYY-MM-DD'),
                                week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                roomsSold: 1
                            });
                        }
                    }
                    let uniqueMonths = Array.from(new Set(reducedRoomsArr.map(e => e.month)));
                    let uniqueWeeks = Array.from(new Set(reducedRoomsArr.map(e => e.week)));
                    let uniqueDays = Array.from(new Set(reducedRoomsArr.map(e => e.day)));
                    uniqueDays = uniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(uniqueDays.length - 60, 1));
                    let monthlyRoomNightsArr = new Array();
                    let weeklyRoomNightsArr = new Array();
                    let dailyRoomNightsArr = new Array();
                    for (let month of uniqueMonths) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.month == month);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        monthlyRoomNightsArr.push({
                            label: month,
                            value: roomsSold / numberOfDays
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Room Nights Per Day',
                        values: monthlyRoomNightsArr
                    });
                    for (let week of uniqueWeeks) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.week == week);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        weeklyRoomNightsArr.push({
                            label: week,
                            value: roomsSold / numberOfDays
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Room Nights Per Day',
                        values: weeklyRoomNightsArr
                    });
                    for (let day of uniqueDays) {
                        let filteredRoomsSold = reducedRoomsArr.filter(e => e.day == day);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        dailyRoomNightsArr.push({
                            label: day,
                            value: roomsSold
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Room Nights Per Day',
                        values: dailyRoomNightsArr
                    });
                    break;
                }
            }
            let sourceRoomReservationDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $not: { $gt: end.toDate() }
                },
                checkOut: {
                    $not: { $lt: monthStart.toDate() }
                }
            });
            let reducedRoomsArr = new Array();
            let uniqueDaysArr = new Array();
            let uniqueSourceArr = new Array();
            let uniqueBookingIdArr = new Array();
            for (let rooms of sourceRoomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (monthStart >= checkIn && end >= checkOut) {
                    checkIn = monthStart;
                }
                else if (monthStart <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (monthStart >= checkIn && end <= checkOut) {
                    checkIn = monthStart;
                    checkOut = end;
                }
                if (uniqueDaysArr.indexOf(checkIn.format('YYYY-MM-DD')) === -1) {
                    uniqueDaysArr.push(checkIn.format('YYYY-MM-DD'));
                }
                if (uniqueBookingIdArr.indexOf(rooms.bookingUuid) === -1) {
                    uniqueBookingIdArr.push(rooms.bookingUuid);
                }
                let stayDays = checkOut.diff(checkIn, 'days');
                for (let i = 0; i < stayDays; i++) {
                    let startDate = checkIn.clone().add(i, 'days');
                    reducedRoomsArr.push({
                        bookingUuid: rooms.bookingUuid,
                        day: checkIn.format('YYYY-MM-DD'),
                        roomsSold: 1
                    });
                }
            }
            uniqueDaysArr = uniqueDaysArr.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(Math.max(uniqueDaysArr.length - 60, 1));
            let sourceBookingDocuments = yield bookingCollection.find({
                uuid: {
                    $in: bookingUuidArr
                }
            });
            uniqueSourceArr = Array.from(new Set(sourceBookingDocuments.map(e => e.source)));
            for (let room of reducedRoomsArr) {
                let booking = sourceBookingDocuments.find(e => e.uuid == room.bookingUuid);
                if (booking !== undefined) {
                    room.source = booking.source;
                }
            }
            let trendSourceRoomsSoldArr = new Array();
            for (let source of uniqueSourceArr) {
                let sourceDocuments = reducedRoomsArr.filter(e => e.source == source);
                let dayArr = new Array();
                for (let day of uniqueDaysArr) {
                    let dayDocuments = sourceDocuments.filter(e => e.day == day);
                    let roomsSold = 0;
                    for (let doc of dayDocuments) {
                        roomsSold = roomsSold + doc.roomsSold;
                    }
                    dayArr.push([Date.parse(day), roomsSold]);
                }
                trendSourceRoomsSoldArr.push({
                    key: source,
                    strokeWidth: 5,
                    values: dayArr
                });
            }
            let respond = {
                success: true,
                message: 'Prepared data as requested',
                data: {
                    overallStats: {
                        bookings: {
                            overallBookings: totalBookings,
                            sourceBookings: sourceBookingArr
                        },
                        roomsSold: {
                            overallRoomsSold: totalRoomsSold,
                            sourceRoomsSold: sourceRoomsSoldArr
                        },
                        avgStay: {
                            overallAvgStay: totalRoomsSold / totalBookings,
                            sourceAvgStay: sourceAvgStayArr
                        },
                        roomNights: {
                            overallRoomNights: totalRoomsSold / numberOfDays,
                            sourceRoomNights: sourceRoomNightsArr
                        }
                    },
                    summary: summaryTableArr,
                    trends: {
                        monthly: trendsMonthlyArr,
                        weekly: trendsWeeklyArr,
                        daily: trendsDailyArr
                    },
                    source: trendSourceRoomsSoldArr
                }
            };
            res.json(respond);
        }));
        DashboardRouter.route('/manager/revenue')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let metric = req.query.metric;
            let begin = time_1.default.serverMoment.startOf('month');
            let end = time_1.default.serverMoment;
            let monthStart = time_1.default.serverMoment.subtract(2, 'months').startOf('month');
            let numberOfDays = end.diff(begin, 'days');
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let paymentsCollection = core_1.default.app.get('mongoClient').get('payments');
            let bookingCollection = core_1.default.app.get('mongoClient').get('Booking');
            let logCollection = core_1.default.app.get('mongoClient').get('Log');
            let hotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            let roomReservationDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $not: { $gt: end.toDate() }
                },
                checkOut: {
                    $not: { $lt: begin.toDate() }
                },
                status: {
                    $ne: 'CANCELLED'
                }
            });
            let bookingUuidArr = new Array();
            for (let rooms of roomReservationDocuments) {
                if (bookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                    bookingUuidArr.push(rooms.bookingUuid);
                }
            }
            let paymentSourceDocuments = yield paymentsCollection.aggregate([
                {
                    $match: {
                        bookinguuid: {
                            $in: bookingUuidArr
                        },
                        totalAmount: {
                            $ne: NaN
                        }
                    }
                },
                {
                    $group: {
                        _id: { source: "$booking_channel" },
                        totalAmount: { $sum: "$totalAmount" }
                    }
                }
            ]);
            let totalAmount = 0;
            let sourcePaymentsArr = new Array();
            for (let payment of paymentSourceDocuments) {
                totalAmount = totalAmount + payment.totalAmount;
                sourcePaymentsArr.push({
                    source: payment._id.source,
                    totalAmount: totalAmount
                });
            }
            let bookingSourceDocuments = yield bookingCollection.find({
                uuid: {
                    $in: bookingUuidArr
                },
                status: {
                    $ne: 'CANCELLED'
                }
            });
            for (let rooms of roomReservationDocuments) {
                let booking = bookingSourceDocuments.find(e => e.uuid === rooms.bookingUuid);
                if (booking !== undefined) {
                    rooms.source = booking.source;
                }
            }
            let uniqueSource = Array.from(new Set(roomReservationDocuments.map(item => item.source)));
            let totalRoomsSold = 0;
            let sourceRoomsSoldArr = new Array();
            for (let source of uniqueSource) {
                let filteredRooms = roomReservationDocuments.filter(e => e.source === source);
                let sourceRoomsSold = 0;
                for (let rooms of filteredRooms) {
                    let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                    let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                    if (begin >= checkIn && end >= checkOut) {
                        checkIn = begin;
                    }
                    else if (begin <= checkIn && end <= checkOut) {
                        checkOut = end;
                    }
                    else if (begin >= checkIn && end <= checkOut) {
                        checkIn = begin;
                        checkOut = end;
                    }
                    if (rooms !== undefined) {
                        totalRoomsSold = totalRoomsSold + checkOut.diff(checkIn, 'days');
                        sourceRoomsSold = sourceRoomsSold + checkOut.diff(checkIn, 'days');
                    }
                }
                sourceRoomsSoldArr.push({
                    source: source,
                    totalRoomsSold: sourceRoomsSold
                });
            }
            let sourceAvgDailyRateArr = new Array();
            for (let payment of sourcePaymentsArr) {
                let roomsSold = sourceRoomsSoldArr.find(e => e.source == payment.source);
                sourceAvgDailyRateArr.push({
                    source: payment.source,
                    avgDailyRate: payment.totalAmount / roomsSold.totalRoomsSold
                });
            }
            let hotelDocuments = yield hotelDetailsCollection.findOne({
                _hotel_id: hotelUuid
            });
            let totalRooms = Number(hotelDocuments._total_no_Of_rooms);
            let numberOfRoomNights = Number(hotelDocuments._total_no_Of_rooms) * Number(numberOfDays);
            let maintenanceDocuments = yield logCollection.find({
                type: LogLaw.Type.MAINTENANCE_CREATE,
                "payload.hotel_uuid": hotelUuid,
                "payload.duration.startDate": {
                    $not: { $gt: end.toDate() }
                },
                "payload.duration.endDate": {
                    $not: { $lt: begin.toDate() }
                }
            });
            for (let maintain of maintenanceDocuments) {
                let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                if (begin >= blockingStartDate && end >= blockingEndDate) {
                    blockingStartDate = begin;
                }
                else if (begin <= blockingStartDate && end <= blockingEndDate) {
                    blockingEndDate = end;
                }
                else if (begin >= blockingStartDate && end <= blockingEndDate) {
                    blockingStartDate = begin;
                    blockingEndDate = end;
                }
                let dateDifference = blockingEndDate.diff(blockingStartDate, 'days');
                numberOfRoomNights = numberOfRoomNights - dateDifference;
            }
            let summaryTableArr = new Array();
            let summaryTotalRevenueArr = new Array();
            let summaryAvgDailyRateArr = new Array();
            let summaryRevParArr = new Array();
            let summaryAvgDailyRevenueArr = new Array();
            let smryPaymentsDocuments = yield paymentsCollection.find({
                bookinguuid: {
                    $in: bookingUuidArr
                },
                totalAmount: {
                    $ne: NaN
                }
            });
            let smryTotalRevenueArr = new Array();
            for (let payment of smryPaymentsDocuments) {
                let rooms = roomReservationDocuments.filter(e => e.bookingUuid == payment.bookinguuid);
                if (rooms.length > 0) {
                    for (let room of rooms) {
                        payment.checkIn = room.checkIn,
                            payment.checkOut = room.checkOut,
                            payment.costBreakdown = room.costBreakdown;
                    }
                }
            }
            let current = 1;
            for (let payment of smryPaymentsDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                if (payment.costBreakdown !== undefined) {
                    for (let cost of payment.costBreakdown) {
                        let costDate = time_1.default.serverMomentInPattern(cost.date, "YYYY-MM-DD HH:mm:ss");
                        smryTotalRevenueArr.push({
                            month: costDate.format('MMM-YY'),
                            day: costDate.format('YYYY-MM-DD'),
                            week: costDate.clone().startOf('week').format('YYYY-MM-DD'),
                            totalAmount: cost.cost
                        });
                    }
                }
                else {
                    let stayDays = checkOut.diff(checkIn, 'days');
                    for (let i = 0; i < stayDays; i++) {
                        let startDate = checkIn.clone().add(i, 'days');
                        smryTotalRevenueArr.push({
                            month: startDate.format('MMM-YY'),
                            day: startDate.format('YYYY-MM-DD'),
                            week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                            totalAmount: payment.totalAmount / stayDays
                        });
                    }
                }
                current + 1;
            }
            let smryTotalRevenueUniqueMonths = Array.from(new Set(smryTotalRevenueArr.map(e => e.month)));
            let smryTotalRevenueUniqueWeeks = Array.from(new Set(smryTotalRevenueArr.map(e => e.week)));
            let smryTotalRevenueUniqueDays = Array.from(new Set(smryTotalRevenueArr.map(e => e.day)));
            smryTotalRevenueUniqueDays = smryTotalRevenueUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(0, numberOfDays);
            for (let month of smryTotalRevenueUniqueMonths) {
                let filteredPayments = smryTotalRevenueArr.filter(e => e.month === month);
                let totalAmount = 0;
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                }
                summaryTotalRevenueArr.push({
                    key: month,
                    class: 'month',
                    value: totalAmount
                });
            }
            for (let week of smryTotalRevenueUniqueWeeks) {
                let filteredPayments = smryTotalRevenueArr.filter(e => e.week == week);
                let totalAmount = 0;
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                }
                summaryTotalRevenueArr.push({
                    key: week,
                    class: 'week',
                    value: totalAmount
                });
            }
            for (let day of smryTotalRevenueUniqueDays) {
                let filteredPayments = smryTotalRevenueArr.filter(e => e.day == day);
                let totalAmount = 0;
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                }
                summaryTotalRevenueArr.push({
                    key: day,
                    class: 'day',
                    value: totalAmount
                });
            }
            let summaryReducedRoomsArr = new Array();
            let summaryRoomsSoldArr = new Array();
            for (let rooms of roomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                let stayDays = checkOut.diff(checkIn, 'days');
                for (let i = 0; i < stayDays; i++) {
                    let startDate = checkIn.clone().add(i, 'days');
                    summaryReducedRoomsArr.push({
                        month: checkIn.format('MMM-YY'),
                        day: checkIn.format('YYYY-MM-DD'),
                        week: checkIn.clone().startOf('week').format('YYYY-MM-DD'),
                        roomsSold: 1
                    });
                }
            }
            let smryRoomsSoldUniqueMonths = Array.from(new Set(summaryReducedRoomsArr.map(e => e.month)));
            let smryRoomsSoldUniqueWeeks = Array.from(new Set(summaryReducedRoomsArr.map(e => e.week)));
            let smryRoomsSoldUniqueDays = Array.from(new Set(summaryReducedRoomsArr.map(e => e.day)));
            smryRoomsSoldUniqueDays = smryRoomsSoldUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(0, numberOfDays);
            for (let month of smryRoomsSoldUniqueMonths) {
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.month == month);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: month,
                    class: 'month',
                    value: roomsSold
                });
            }
            for (let week of smryRoomsSoldUniqueWeeks) {
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.week == week);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: week,
                    class: 'week',
                    value: roomsSold
                });
            }
            for (let day of smryRoomsSoldUniqueDays) {
                let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.day == day);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: day,
                    class: 'day',
                    value: roomsSold
                });
            }
            for (let revenue of summaryTotalRevenueArr) {
                let room = summaryRoomsSoldArr.find(e => e.key == revenue.key);
                if (room !== undefined) {
                    summaryAvgDailyRateArr.push({
                        key: revenue.key,
                        class: revenue.class,
                        value: revenue.value / room.value
                    });
                }
            }
            let summaryMaintenanceDocuments = yield logCollection.find({
                type: LogLaw.Type.MAINTENANCE_CREATE,
                "payload.hotel_uuid": hotelUuid,
                "payload.duration.startDate": {
                    $not: { $gt: end.toDate() }
                },
                "payload.duration.endDate": {
                    $not: { $lt: begin.toDate() }
                }
            });
            let summaryMaintenanceList = new Array();
            for (let maintain of summaryMaintenanceDocuments) {
                let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                if (begin >= blockingStartDate && end >= blockingEndDate) {
                    blockingStartDate = begin;
                }
                else if (begin <= blockingStartDate && end <= blockingEndDate) {
                    blockingEndDate = end;
                }
                else if (begin >= blockingStartDate && end <= blockingEndDate) {
                    blockingStartDate = begin;
                    blockingEndDate = end;
                }
                let dateDifference = blockingEndDate.diff(blockingStartDate, 'days') + 1;
                for (let i = 0; i < dateDifference; i++) {
                    summaryMaintenanceList.push({
                        date: blockingStartDate.clone().add(i, 'days').format('YYYY-MM-DD'),
                        daysBlocked: 1
                    });
                }
            }
            let summaryMaintenanceArr = new Array();
            let uniqueMaintenanceDays = Array.from(new Set(summaryMaintenanceList.map(e => e.date)));
            for (let day of uniqueMaintenanceDays) {
                let maintenance = summaryMaintenanceList.filter(e => e.date == day);
                let daysBlocked = 0;
                for (let maintain of maintenance) {
                    daysBlocked = daysBlocked + maintain.daysBlocked;
                }
                summaryMaintenanceArr.push({
                    date: day,
                    daysBlocked: daysBlocked
                });
            }
            let summaryTotalRoomsReducedArr = new Array();
            for (let i = 0; i < numberOfDays + 1; i++) {
                let day = begin.clone().add(i, 'days');
                let month = day.format('MMM-YY');
                let week = day.clone().startOf('week').format('YYYY-MM-DD');
                let blocked = summaryMaintenanceArr.find(e => e.date == day.format('YYYY-MM-DD'));
                let daysBlocked;
                if (blocked !== undefined) {
                    daysBlocked = blocked.daysBlocked;
                }
                else {
                    daysBlocked = 0;
                }
                summaryTotalRoomsReducedArr.push({
                    day: day.format('YYYY-MM-DD'),
                    month: month,
                    week: week,
                    totalRooms: totalRooms - daysBlocked
                });
            }
            let smryTotalRoomsUniqueMonths = Array.from(new Set(summaryTotalRoomsReducedArr.map(e => e.month)));
            let smryTotalRoomsUniqueWeeks = Array.from(new Set(summaryTotalRoomsReducedArr.map(e => e.week)));
            let smryTotalRoomsUniqueDays = Array.from(new Set(summaryTotalRoomsReducedArr.map(e => e.day)));
            smryTotalRoomsUniqueDays = smryTotalRoomsUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(0, numberOfDays);
            for (let month of smryTotalRoomsUniqueMonths) {
                let filteredTotalRooms = summaryTotalRoomsReducedArr.filter(e => e.month == month);
                let filteredRevenue = summaryTotalRevenueArr.find(e => e.month = month);
                let totalRooms = 0;
                for (let room of filteredTotalRooms) {
                    totalRooms = totalRooms + room.totalRooms;
                }
                summaryRevParArr.push({
                    key: month,
                    class: 'month',
                    value: filteredRevenue.value / totalRooms
                });
            }
            for (let week of smryTotalRoomsUniqueWeeks) {
                let filteredTotalRooms = summaryTotalRoomsReducedArr.filter(e => e.week == week);
                let filteredRevenue = summaryTotalRevenueArr.find(e => e.week = week);
                let totalRooms = 0;
                for (let room of filteredTotalRooms) {
                    totalRooms = totalRooms + room.totalRooms;
                }
                summaryRevParArr.push({
                    key: week,
                    class: 'week',
                    value: filteredRevenue.value / totalRooms
                });
            }
            for (let day of smryTotalRoomsUniqueDays) {
                let filteredTotalRooms = summaryTotalRoomsReducedArr.filter(e => e.day == day);
                let filteredRevenue = summaryTotalRevenueArr.find(e => e.day = day);
                let totalRooms = 0;
                for (let room of filteredTotalRooms) {
                    totalRooms = totalRooms + room.totalRooms;
                }
                summaryRevParArr.push({
                    key: day,
                    class: 'day',
                    value: filteredRevenue.value / totalRooms
                });
            }
            let smryAvgDailyRevenueArr = new Array();
            for (let payment of smryPaymentsDocuments) {
                let room = roomReservationDocuments.find(e => e.bookingUuid == payment.bookinguuid);
                if (room !== undefined) {
                    payment.checkIn = room.checkIn,
                        payment.checkOut = room.checkOut,
                        payment.costBreakdown = room.costBreakdown;
                }
            }
            for (let payment of smryPaymentsDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                smryAvgDailyRevenueArr.push({
                    month: checkIn.format('MMM-YY'),
                    day: checkIn.format('YYYY-MM-DD'),
                    week: checkIn.clone().startOf('week').format('YYYY-MM-DD'),
                    totalAmount: payment.totalAmount
                });
            }
            let smryAvgDailyRevenueUniqueMonths = Array.from(new Set(smryAvgDailyRevenueArr.map(e => e.month)));
            let smryAvgDailyRevenueUniqueWeeks = Array.from(new Set(smryAvgDailyRevenueArr.map(e => e.week)));
            let smryAvgDailyRevenueUniqueDays = Array.from(new Set(smryAvgDailyRevenueArr.map(e => e.day)));
            smryAvgDailyRevenueUniqueDays = smryAvgDailyRevenueUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(0, numberOfDays);
            for (let month of smryAvgDailyRevenueUniqueMonths) {
                let filteredPayments = smryAvgDailyRevenueArr.filter(e => e.month == month);
                let totalAmount = 0;
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                }
                summaryAvgDailyRevenueArr.push({
                    key: month,
                    class: 'month',
                    value: totalAmount / numberOfDays
                });
            }
            for (let week of smryAvgDailyRevenueUniqueWeeks) {
                let filteredPayments = smryAvgDailyRevenueArr.filter(e => e.week == week);
                let totalAmount = 0;
                let daysArr = new Array();
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                    if (daysArr.indexOf(payment.day) == -1) {
                        daysArr.push(payment.day);
                    }
                }
                summaryAvgDailyRevenueArr.push({
                    key: week,
                    class: 'week',
                    value: totalAmount / daysArr.length
                });
            }
            for (let day of smryAvgDailyRevenueUniqueDays) {
                let filteredPayments = smryAvgDailyRevenueArr.filter(e => e.day == day);
                let totalAmount = 0;
                for (let payment of filteredPayments) {
                    totalAmount = totalAmount + payment.totalAmount;
                }
                summaryAvgDailyRevenueArr.push({
                    key: day,
                    class: 'day',
                    value: totalAmount
                });
            }
            summaryTableArr.push({ totalRevenue: summaryTotalRevenueArr }, { avgDailyRate: summaryAvgDailyRateArr }, { revPar: summaryRevParArr }, { avgDailyRevenue: summaryAvgDailyRevenueArr });
            let trendsMonthlyArr = new Array();
            let trendsWeeklyArr = new Array();
            let trendsDailyArr = new Array();
            switch (metric) {
                case 'revenue': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        },
                        status: {
                            $ne: 'CANCELLED'
                        }
                    });
                    let bookingUuidArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        if (bookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                            bookingUuidArr.push(rooms.bookingUuid);
                        }
                    }
                    let smryPaymentsDocuments = yield paymentsCollection.find({
                        bookinguuid: {
                            $in: bookingUuidArr
                        },
                        totalAmount: {
                            $ne: NaN
                        }
                    });
                    let smryTotalRevenueArr = new Array();
                    for (let payment of smryPaymentsDocuments) {
                        let room = roomReservationDocuments.find(e => e.bookingUuid == payment.bookinguuid);
                        if (room !== undefined) {
                            payment.checkIn = room.checkIn,
                                payment.checkOut = room.checkOut,
                                payment.costBreakdown = room.costBreakdown;
                        }
                    }
                    for (let payment of smryPaymentsDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        if (payment.costBreakdown != undefined) {
                            for (let cost of payment.costBreakdown) {
                                let costDate = time_1.default.serverMomentInPattern(cost.date, "YYYY-MM-DD HH:mm:ss");
                                smryTotalRevenueArr.push({
                                    month: costDate.format('MMM-YY'),
                                    day: costDate.format('YYYY-MM-DD'),
                                    week: costDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: cost.cost
                                });
                            }
                        }
                        else {
                            let stayDays = checkOut.diff(checkIn, 'days');
                            for (let i = 0; i < stayDays; i++) {
                                let startDate = checkIn.clone().add(i, 'days');
                                smryTotalRevenueArr.push({
                                    month: startDate.format('MMM-YY'),
                                    day: startDate.format('YYYY-MM-DD'),
                                    week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: payment.totalAmount / stayDays
                                });
                            }
                        }
                    }
                    let smryTotalRevenueUniqueMonths = Array.from(new Set(smryTotalRevenueArr.map(e => e.month)));
                    let smryTotalRevenueUniqueWeeks = Array.from(new Set(smryTotalRevenueArr.map(e => e.week)));
                    let smryTotalRevenueUniqueDays = Array.from(new Set(smryTotalRevenueArr.map(e => e.day)));
                    smryTotalRevenueUniqueDays = smryTotalRevenueUniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(smryTotalRevenueUniqueDays.length - 60, 1));
                    let monthlyTotalRevenueArr = new Array();
                    let weeklyTotalRevenueArr = new Array();
                    let dailyTotalRevenueArr = new Array();
                    for (let month of smryTotalRevenueUniqueMonths) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.month == month);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        monthlyTotalRevenueArr.push({
                            label: month,
                            value: totalAmount
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Total Revenue',
                        values: monthlyTotalRevenueArr
                    });
                    for (let week of smryTotalRevenueUniqueWeeks) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.week == week);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        weeklyTotalRevenueArr.push({
                            label: week,
                            value: totalAmount
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Total Revenue',
                        values: weeklyTotalRevenueArr
                    });
                    for (let day of smryTotalRevenueUniqueDays) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.day == day);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        dailyTotalRevenueArr.push({
                            label: day,
                            value: totalAmount
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Total Revenue',
                        values: dailyTotalRevenueArr
                    });
                    break;
                }
                case 'avgDailyRate': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        },
                        status: {
                            $ne: 'CANCELLED'
                        }
                    });
                    let bookingUuidArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        if (bookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                            bookingUuidArr.push(rooms.bookingUuid);
                        }
                    }
                    let smryPaymentsDocuments = yield paymentsCollection.find({
                        bookinguuid: {
                            $in: bookingUuidArr
                        },
                        totalAmount: {
                            $ne: NaN
                        }
                    });
                    let smryTotalRevenueArr = new Array();
                    for (let payment of smryPaymentsDocuments) {
                        let room = roomReservationDocuments.find(e => e.bookingUuid == payment.bookinguuid);
                        if (room !== undefined) {
                            payment.checkIn = room.checkIn,
                                payment.checkOut = room.checkOut,
                                payment.costBreakdown = room.costBreakdown;
                        }
                    }
                    for (let payment of smryPaymentsDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        if (payment.costBreakdown != undefined) {
                            for (let cost of payment.costBreakdown) {
                                let costDate = time_1.default.serverMomentInPattern(cost.date, "YYYY-MM-DD HH:mm:ss");
                                smryTotalRevenueArr.push({
                                    month: costDate.format('MMM-YY'),
                                    day: costDate.format('YYYY-MM-DD'),
                                    week: costDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: cost.cost
                                });
                            }
                        }
                        else {
                            let stayDays = checkOut.diff(checkIn, 'days');
                            for (let i = 0; i < stayDays; i++) {
                                let startDate = checkIn.clone().add(i, 'days');
                                smryTotalRevenueArr.push({
                                    month: startDate.format('MMM-YY'),
                                    day: startDate.format('YYYY-MM-DD'),
                                    week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: payment.totalAmount / stayDays
                                });
                            }
                        }
                    }
                    let smryTotalRevenueUniqueMonths = Array.from(new Set(smryTotalRevenueArr.map(e => e.month)));
                    let smryTotalRevenueUniqueWeeks = Array.from(new Set(smryTotalRevenueArr.map(e => e.week)));
                    let smryTotalRevenueUniqueDays = Array.from(new Set(smryTotalRevenueArr.map(e => e.day)));
                    smryTotalRevenueUniqueDays = smryTotalRevenueUniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(smryTotalRevenueUniqueDays.length - 60, 1));
                    let monthlyTotalRevenueArr = new Array();
                    let weeklyTotalRevenueArr = new Array();
                    let dailyTotalRevenueArr = new Array();
                    for (let month of smryTotalRevenueUniqueMonths) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.month == month);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        monthlyTotalRevenueArr.push({
                            label: month,
                            value: totalAmount
                        });
                    }
                    for (let week of smryTotalRevenueUniqueWeeks) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.week == week);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        weeklyTotalRevenueArr.push({
                            label: week,
                            value: totalAmount
                        });
                    }
                    for (let day of smryTotalRevenueUniqueDays) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.day == day);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        dailyTotalRevenueArr.push({
                            label: day,
                            value: totalAmount
                        });
                    }
                    let summaryReducedRoomsArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                        let totalRoomsSold = 0;
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        if (rooms !== undefined) {
                            totalRoomsSold = checkOut.diff(checkIn, 'days');
                        }
                        summaryReducedRoomsArr.push({
                            month: checkIn.format('MMM-YY'),
                            day: checkIn.format('YYYY-MM-DD'),
                            week: checkIn.clone().startOf('week').format('YYYY-MM-DD'),
                            roomsSold: totalRoomsSold
                        });
                    }
                    let smryRoomsSoldUniqueMonths = Array.from(new Set(summaryReducedRoomsArr.map(e => e.month)));
                    let smryRoomsSoldUniqueWeeks = Array.from(new Set(summaryReducedRoomsArr.map(e => e.week)));
                    let smryRoomsSoldUniqueDays = Array.from(new Set(summaryReducedRoomsArr.map(e => e.day)));
                    smryRoomsSoldUniqueDays = smryRoomsSoldUniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(smryRoomsSoldUniqueDays.length - 60, 1));
                    let monthlyRoomsSoldArr = new Array();
                    let weeklyRoomsSoldArr = new Array();
                    let dailyRoomsSoldArr = new Array();
                    for (let month of smryRoomsSoldUniqueMonths) {
                        let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.month == month);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        monthlyRoomsSoldArr.push({
                            label: month,
                            value: roomsSold
                        });
                    }
                    for (let week of smryRoomsSoldUniqueWeeks) {
                        let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.week == week);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        weeklyRoomsSoldArr.push({
                            label: week,
                            value: roomsSold
                        });
                    }
                    for (let day of smryRoomsSoldUniqueDays) {
                        let filteredRoomsSold = summaryReducedRoomsArr.filter(e => e.day == day);
                        let roomsSold = 0;
                        for (let room of filteredRoomsSold) {
                            roomsSold = roomsSold + room.roomsSold;
                        }
                        dailyRoomsSoldArr.push({
                            label: day,
                            value: roomsSold
                        });
                    }
                    let monthlyAvgDailyRateArr = new Array();
                    let weeklyAvgDailyRateArr = new Array();
                    let dailyAvgDailyRateArr = new Array();
                    for (let revenue of monthlyTotalRevenueArr) {
                        let room = monthlyRoomsSoldArr.find(e => e.label == revenue.label);
                        monthlyAvgDailyRateArr.push({
                            label: revenue.label,
                            value: revenue.value / room.value
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Avg Daily Rate',
                        values: monthlyAvgDailyRateArr
                    });
                    for (let revenue of weeklyTotalRevenueArr) {
                        let room = weeklyRoomsSoldArr.find(e => e.label == revenue.label);
                        weeklyAvgDailyRateArr.push({
                            label: revenue.label,
                            value: revenue.value / room.value
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Avg Daily Rate',
                        values: weeklyAvgDailyRateArr
                    });
                    for (let revenue of dailyTotalRevenueArr) {
                        let room = dailyRoomsSoldArr.find(e => e.label == revenue.label);
                        dailyAvgDailyRateArr.push({
                            label: revenue.label,
                            value: revenue.value / room.value
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Avg Daily Rate',
                        values: dailyAvgDailyRateArr
                    });
                    break;
                }
                case 'revPar': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        },
                        status: {
                            $ne: 'CANCELLED'
                        }
                    });
                    let bookingUuidArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        if (bookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                            bookingUuidArr.push(rooms.bookingUuid);
                        }
                    }
                    let smryPaymentsDocuments = yield paymentsCollection.find({
                        bookinguuid: {
                            $in: bookingUuidArr
                        },
                        totalAmount: {
                            $ne: NaN
                        }
                    });
                    let smryTotalRevenueArr = new Array();
                    for (let payment of smryPaymentsDocuments) {
                        let room = roomReservationDocuments.find(e => e.bookingUuid == payment.bookinguuid);
                        if (room !== undefined) {
                            payment.checkIn = room.checkIn,
                                payment.checkOut = room.checkOut,
                                payment.costBreakdown = room.costBreakdown;
                        }
                    }
                    for (let payment of smryPaymentsDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        if (payment.costBreakdown != undefined) {
                            for (let cost of payment.costBreakdown) {
                                let costDate = time_1.default.serverMomentInPattern(cost.date, "YYYY-MM-DD HH:mm:ss");
                                smryTotalRevenueArr.push({
                                    month: costDate.format('MMM-YY'),
                                    day: costDate.format('YYYY-MM-DD'),
                                    week: costDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: cost.cost
                                });
                            }
                        }
                        else {
                            let stayDays = checkOut.diff(checkIn, 'days');
                            for (let i = 0; i < stayDays; i++) {
                                let startDate = checkIn.clone().add(i, 'days');
                                smryTotalRevenueArr.push({
                                    month: startDate.format('MMM-YY'),
                                    day: startDate.format('YYYY-MM-DD'),
                                    week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: payment.totalAmount / stayDays
                                });
                            }
                        }
                    }
                    let smryTotalRevenueUniqueMonths = Array.from(new Set(smryTotalRevenueArr.map(e => e.month)));
                    let smryTotalRevenueUniqueWeeks = Array.from(new Set(smryTotalRevenueArr.map(e => e.week)));
                    let smryTotalRevenueUniqueDays = Array.from(new Set(smryTotalRevenueArr.map(e => e.day)));
                    smryTotalRevenueUniqueDays = smryTotalRevenueUniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(smryTotalRevenueUniqueDays.length - 60, 1));
                    let monthlyTotalRevenueArr = new Array();
                    let weeklyTotalRevenueArr = new Array();
                    let dailyTotalRevenueArr = new Array();
                    for (let month of smryTotalRevenueUniqueMonths) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.month == month);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        monthlyTotalRevenueArr.push({
                            label: month,
                            value: totalAmount
                        });
                    }
                    for (let week of smryTotalRevenueUniqueWeeks) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.week == week);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        weeklyTotalRevenueArr.push({
                            label: week,
                            value: totalAmount
                        });
                    }
                    for (let day of smryTotalRevenueUniqueDays) {
                        let filteredPayments = smryTotalRevenueArr.filter(e => e.day == day);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        dailyTotalRevenueArr.push({
                            label: day,
                            value: totalAmount
                        });
                    }
                    let summaryMaintenanceDocuments = yield logCollection.find({
                        type: LogLaw.Type.MAINTENANCE_CREATE,
                        "payload.hotel_uuid": hotelUuid,
                        "payload.duration.startDate": {
                            $not: { $gt: end.toDate() }
                        },
                        "payload.duration.endDate": {
                            $not: { $lt: monthStart.toDate() }
                        }
                    });
                    let summaryMaintenanceList = new Array();
                    for (let maintain of maintenanceDocuments) {
                        let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                        let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                        if (begin >= blockingStartDate && end >= blockingEndDate) {
                            blockingStartDate = begin;
                        }
                        else if (begin <= blockingStartDate && end <= blockingEndDate) {
                            blockingEndDate = end;
                        }
                        else if (begin >= blockingStartDate && end <= blockingEndDate) {
                            blockingStartDate = begin;
                            blockingEndDate = end;
                        }
                        let dateDifference = blockingEndDate.diff(blockingStartDate, 'days') + 1;
                        for (let i = 0; i < dateDifference; i++) {
                            summaryMaintenanceList.push({
                                date: blockingStartDate.clone().add(i, 'days').format('YYYY-MM-DD'),
                                daysBlocked: 1
                            });
                        }
                    }
                    let summaryMaintenanceArr = new Array();
                    let uniqueMaintenanceDays = Array.from(new Set(summaryMaintenanceList.map(e => e.date)));
                    for (let day of uniqueMaintenanceDays) {
                        let maintenance = summaryMaintenanceList.filter(e => e.date == day);
                        let daysBlocked = 0;
                        for (let maintain of maintenance) {
                            daysBlocked = daysBlocked + maintain.daysBlocked;
                        }
                        summaryMaintenanceArr.push({
                            date: day,
                            daysBlocked: daysBlocked
                        });
                    }
                    let numberOfDays = end.diff(monthStart, 'days');
                    let summaryTotalRoomsReducedArr = new Array();
                    for (let i = 0; i < numberOfDays + 1; i++) {
                        let day = monthStart.clone().add(i, 'days');
                        let month = day.format('MMM-YY');
                        let week = day.clone().startOf('week').format('YYYY-MM-DD');
                        let blocked = summaryMaintenanceArr.find(e => e.date == day.format('YYYY-MM-DD'));
                        let daysBlocked;
                        if (blocked !== undefined) {
                            daysBlocked = blocked.daysBlocked;
                        }
                        else {
                            daysBlocked = 0;
                        }
                        summaryTotalRoomsReducedArr.push({
                            day: day.format('YYYY-MM-DD'),
                            month: month,
                            week: week,
                            totalRooms: totalRooms - daysBlocked
                        });
                    }
                    let summaryTotalRoomsArr = new Array();
                    let smryTotalRoomsUniqueMonths = Array.from(new Set(summaryTotalRoomsReducedArr.map(e => e.month)));
                    let smryTotalRoomsUniqueWeeks = Array.from(new Set(summaryTotalRoomsReducedArr.map(e => e.week)));
                    let smryTotalRoomsUniqueDays = Array.from(new Set(summaryTotalRoomsReducedArr.map(e => e.day)));
                    smryTotalRoomsUniqueDays = smryTotalRoomsUniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(smryTotalRoomsUniqueDays.length - 60, 1));
                    let monthlyTotalRoomsArr = new Array();
                    let weeklyTotalRoomsArr = new Array();
                    let dailyTotalRoomsArr = new Array();
                    for (let month of smryTotalRoomsUniqueMonths) {
                        let filteredTotalRooms = summaryTotalRoomsReducedArr.filter(e => e.month == month);
                        let totalRooms = 0;
                        for (let room of filteredTotalRooms) {
                            totalRooms = totalRooms + room.totalRooms;
                        }
                        monthlyTotalRoomsArr.push({
                            label: month,
                            value: totalRooms
                        });
                    }
                    for (let week of smryTotalRoomsUniqueWeeks) {
                        let filteredTotalRooms = summaryTotalRoomsReducedArr.filter(e => e.week == week);
                        let totalRooms = 0;
                        for (let room of filteredTotalRooms) {
                            totalRooms = totalRooms + room.totalRooms;
                        }
                        weeklyTotalRoomsArr.push({
                            label: week,
                            value: totalRooms
                        });
                    }
                    for (let day of smryTotalRoomsUniqueDays) {
                        let filteredTotalRooms = summaryTotalRoomsReducedArr.filter(e => e.day == day);
                        let totalRooms = 0;
                        for (let room of filteredTotalRooms) {
                            totalRooms = totalRooms + room.totalRooms;
                        }
                        dailyTotalRoomsArr.push({
                            label: day,
                            value: totalRooms
                        });
                    }
                    let monthlyRevParArr = new Array();
                    let weeklyRevParArr = new Array();
                    let dailyRevParArr = new Array();
                    for (let rev of monthlyTotalRevenueArr) {
                        let room = monthlyTotalRoomsArr.find(e => e.label == rev.label);
                        monthlyRevParArr.push({
                            label: rev.label,
                            value: rev.value / room.value
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Rev Par',
                        values: monthlyRevParArr
                    });
                    for (let rev of weeklyTotalRevenueArr) {
                        let room = weeklyTotalRoomsArr.find(e => e.label == rev.label);
                        weeklyRevParArr.push({
                            label: rev.label,
                            value: rev.value / room.value
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Rev Par',
                        values: weeklyRevParArr
                    });
                    for (let rev of dailyTotalRevenueArr) {
                        let room = dailyTotalRoomsArr.find(e => e.label == rev.label);
                        dailyRevParArr.push({
                            label: rev.label,
                            value: rev.value / room.value
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Rev Par',
                        values: dailyRevParArr
                    });
                    break;
                }
                case 'avgDailyRevenue': {
                    let roomReservationDocuments = yield roomReservationCollection.find({
                        hotelUuid: hotelUuid,
                        checkIn: {
                            $not: { $gt: end.toDate() }
                        },
                        checkOut: {
                            $not: { $lt: monthStart.toDate() }
                        },
                        status: {
                            $ne: 'CANCELLED'
                        }
                    });
                    let bookingUuidArr = new Array();
                    for (let rooms of roomReservationDocuments) {
                        if (bookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                            bookingUuidArr.push(rooms.bookingUuid);
                        }
                    }
                    let smryPaymentsDocuments = yield paymentsCollection.find({
                        bookinguuid: {
                            $in: bookingUuidArr
                        },
                        totalAmount: {
                            $ne: NaN
                        }
                    });
                    let smryAvgDailyRevenueArr = new Array();
                    for (let payment of smryPaymentsDocuments) {
                        let room = roomReservationDocuments.find(e => e.bookingUuid == payment.bookinguuid);
                        if (room !== undefined) {
                            payment.checkIn = room.checkIn,
                                payment.checkOut = room.checkOut,
                                payment.costBreakdown = room.costBreakdown;
                        }
                    }
                    for (let payment of smryPaymentsDocuments) {
                        let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                        let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                        if (monthStart >= checkIn && end >= checkOut) {
                            checkIn = monthStart;
                        }
                        else if (monthStart <= checkIn && end <= checkOut) {
                            checkOut = end;
                        }
                        else if (monthStart >= checkIn && end <= checkOut) {
                            checkIn = monthStart;
                            checkOut = end;
                        }
                        if (payment.costBreakdown != undefined) {
                            for (let cost of payment.costBreakdown) {
                                let costDate = time_1.default.serverMomentInPattern(cost.date, "YYYY-MM-DD HH:mm:ss");
                                smryAvgDailyRevenueArr.push({
                                    month: costDate.format('MMM-YY'),
                                    day: costDate.format('YYYY-MM-DD'),
                                    week: costDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: cost.cost
                                });
                            }
                        }
                        else {
                            let stayDays = checkOut.diff(checkIn, 'days');
                            for (let i = 0; i < stayDays; i++) {
                                let startDate = checkIn.clone().add(i, 'days');
                                smryAvgDailyRevenueArr.push({
                                    month: startDate.format('MMM-YY'),
                                    day: startDate.format('YYYY-MM-DD'),
                                    week: startDate.clone().startOf('week').format('YYYY-MM-DD'),
                                    totalAmount: payment.totalAmount / stayDays
                                });
                            }
                        }
                    }
                    let smryAvgDailyRevenueUniqueMonths = Array.from(new Set(smryAvgDailyRevenueArr.map(e => e.month)));
                    let smryAvgDailyRevenueUniqueWeeks = Array.from(new Set(smryAvgDailyRevenueArr.map(e => e.week)));
                    let smryAvgDailyRevenueUniqueDays = Array.from(new Set(smryAvgDailyRevenueArr.map(e => e.day)));
                    smryAvgDailyRevenueUniqueDays = smryAvgDailyRevenueUniqueDays.sort((a, b) => {
                        let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                        let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                        return A.diff(B, 'days');
                    }).slice(Math.max(smryAvgDailyRevenueUniqueDays.length - 60, 1));
                    let monthlyAvgDailyRevenueArr = new Array();
                    let weeklyAvgDailyRevenueArr = new Array();
                    let dailyAvgDailyRevenueArr = new Array();
                    for (let month of smryAvgDailyRevenueUniqueMonths) {
                        let filteredPayments = smryAvgDailyRevenueArr.filter(e => e.month == month);
                        let totalAmount = 0;
                        let daysArr = new Array();
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                            if (daysArr.indexOf(payment.day) == -1) {
                                daysArr.push(payment.day);
                            }
                        }
                        monthlyAvgDailyRevenueArr.push({
                            label: month,
                            value: totalAmount / daysArr.length
                        });
                    }
                    trendsMonthlyArr.push({
                        key: 'Avg Daily Revenue',
                        values: monthlyAvgDailyRevenueArr
                    });
                    for (let week of smryAvgDailyRevenueUniqueWeeks) {
                        let filteredPayments = smryAvgDailyRevenueArr.filter(e => e.week == week);
                        let totalAmount = 0;
                        let daysArr = new Array();
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                            if (daysArr.indexOf(payment.day) == -1) {
                                daysArr.push(payment.day);
                            }
                        }
                        weeklyAvgDailyRevenueArr.push({
                            label: week,
                            value: totalAmount / daysArr.length
                        });
                    }
                    trendsWeeklyArr.push({
                        key: 'Avg Daily Revenue',
                        values: weeklyAvgDailyRevenueArr
                    });
                    for (let day of smryAvgDailyRevenueUniqueDays) {
                        let filteredPayments = smryAvgDailyRevenueArr.filter(e => e.day == day);
                        let totalAmount = 0;
                        for (let payment of filteredPayments) {
                            totalAmount = totalAmount + payment.totalAmount;
                        }
                        dailyAvgDailyRevenueArr.push({
                            label: day,
                            value: totalAmount
                        });
                    }
                    trendsDailyArr.push({
                        key: 'Avg Daily Revenue',
                        values: dailyAvgDailyRevenueArr
                    });
                    break;
                }
            }
            let sourceRoomReservationDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $not: { $gt: end.toDate() }
                },
                checkOut: {
                    $not: { $lt: monthStart.toDate() }
                },
                status: {
                    $ne: 'CANCELLED'
                }
            });
            let sourceBookingUuidArr = new Array();
            for (let rooms of sourceRoomReservationDocuments) {
                if (sourceBookingUuidArr.indexOf(rooms.bookingUuid) === -1) {
                    sourceBookingUuidArr.push(rooms.bookingUuid);
                }
            }
            let sourcePaymentsDocuments = yield paymentsCollection.find({
                bookinguuid: {
                    $in: sourceBookingUuidArr
                },
                totalAmount: {
                    $ne: NaN
                }
            });
            let sourceTotalRevenueArr = new Array();
            for (let payment of smryPaymentsDocuments) {
                let room = roomReservationDocuments.find(e => e.bookingUuid == payment.bookinguuid);
                if (room !== undefined) {
                    payment.checkIn = room.checkIn,
                        payment.checkOut = room.checkOut,
                        payment.costBreakdown = room.costBreakdown;
                }
            }
            let uniqueDaysArr = new Array();
            for (let payment of smryPaymentsDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(payment.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(payment.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (monthStart >= checkIn && end >= checkOut) {
                    checkIn = monthStart;
                }
                else if (monthStart <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (monthStart >= checkIn && end <= checkOut) {
                    checkIn = monthStart;
                    checkOut = end;
                }
                if (uniqueDaysArr.indexOf(checkIn.format('YYYY-MM-DD')) === -1) {
                    uniqueDaysArr.push(checkIn.format('YYYY-MM-DD'));
                }
                if (payment.costBreakdown != undefined) {
                    for (let cost of payment.costBreakdown) {
                        let costDate = time_1.default.serverMomentInPattern(cost.date, "YYYY-MM-DD HH:mm:ss");
                        sourceTotalRevenueArr.push({
                            source: payment.booking_channel,
                            day: costDate.format('YYYY-MM-DD'),
                            totalAmount: cost.cost
                        });
                    }
                }
                else {
                    let stayDays = checkOut.diff(checkIn, 'days');
                    for (let i = 0; i < stayDays; i++) {
                        let startDate = checkIn.clone().add(i, 'days');
                        sourceTotalRevenueArr.push({
                            source: payment.booking_channel,
                            day: checkIn.format('YYYY-MM-DD'),
                            totalAmount: payment.totalAmount / stayDays
                        });
                    }
                }
            }
            uniqueDaysArr = uniqueDaysArr.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return A.diff(B, 'days');
            }).slice(Math.max(uniqueDaysArr.length - 60, 1));
            let uniqueSourceArr = Array.from(new Set(sourceTotalRevenueArr.map(e => e.source)));
            let trendSourceTotalRevenueArr = new Array();
            for (let source of uniqueSourceArr) {
                let sourceDocuments = sourceTotalRevenueArr.filter(e => e.source == source);
                let dayArr = new Array();
                for (let day of uniqueDaysArr) {
                    let dayDocuments = sourceDocuments.filter(e => e.day == day);
                    let totalAmount = 0;
                    for (let doc of dayDocuments) {
                        totalAmount = totalAmount + doc.totalAmount;
                    }
                    dayArr.push([Date.parse(day), totalAmount]);
                }
                trendSourceTotalRevenueArr.push({
                    key: source,
                    strokeWidth: 5,
                    values: dayArr
                });
            }
            let respond = {
                success: true,
                message: 'Prepared data as requested',
                data: {
                    overallStats: {
                        revenue: totalAmount,
                        avgDailyRate: totalAmount / totalRoomsSold,
                        revPar: totalAmount / numberOfRoomNights,
                        avgDailyRevenue: totalAmount / numberOfDays
                    },
                    summary: summaryTableArr,
                    trends: {
                        monthly: trendsMonthlyArr,
                        weekly: trendsWeeklyArr,
                        daily: trendsDailyArr
                    },
                    source: trendSourceTotalRevenueArr
                }
            };
            res.json(respond);
        }));
        DashboardRouter.route('/manager/inventory')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_uuid;
            let metric = req.query.metric;
            let begin = time_1.default.serverMoment.startOf('month');
            let end = time_1.default.serverMoment.subtract(1, 'days');
            let monthStart = time_1.default.serverMoment.subtract(2, 'months').startOf('month');
            let numberOfDays = end.diff(begin, 'days');
            let hotelDetailsCollection = core_1.default.app.get('mongoClient').get('hotel_details');
            let logCollection = core_1.default.app.get('mongoClient').get('Log');
            let roomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
            let hotelDocuments = yield hotelDetailsCollection.findOne({
                _hotel_id: hotelUuid
            });
            let numberOfRoomNights = 0;
            if (hotelDocuments !== undefined) {
                numberOfRoomNights = Number(hotelDocuments._total_no_Of_rooms) * Number(numberOfDays);
            }
            let maintenanceDocuments = yield logCollection.find({
                type: LogLaw.Type.MAINTENANCE_CREATE,
                "payload.hotel_uuid": hotelUuid,
                "payload.duration.startDate": {
                    $not: { $gt: end.toDate() }
                },
                "payload.duration.endDate": {
                    $not: { $lt: begin.toDate() }
                }
            });
            for (let maintain of maintenanceDocuments) {
                let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                if (begin >= blockingStartDate && end >= blockingEndDate) {
                    blockingStartDate = begin;
                }
                else if (begin <= blockingStartDate && end <= blockingEndDate) {
                    blockingEndDate = end;
                }
                else if (begin >= blockingStartDate && end <= blockingEndDate) {
                    blockingStartDate = begin;
                    blockingEndDate = end;
                }
                let dateDifference = blockingEndDate.diff(blockingStartDate, 'days');
                numberOfRoomNights = numberOfRoomNights - dateDifference;
            }
            let roomReservationDocuments = yield roomReservationCollection.find({
                hotelUuid: hotelUuid,
                checkIn: {
                    $not: { $gt: end.toDate() }
                },
                checkOut: {
                    $not: { $lt: begin.toDate() }
                }
            });
            let roomsSold = 0;
            for (let rooms of roomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                roomsSold = roomsSold + checkOut.diff(checkIn, 'days');
            }
            let summaryTableArr = new Array();
            let summaryRoomNightsArr = new Array();
            let summaryRoomsSoldArr = new Array();
            let summaryAvailableRoomsArr = new Array();
            let summaryOccupancyArr = new Array();
            let totalRooms = Number(hotelDocuments._total_no_Of_rooms);
            let summaryMaintenanceDocuments = yield logCollection.find({
                type: LogLaw.Type.MAINTENANCE_CREATE,
                "payload.hotel_uuid": hotelUuid,
                "payload.duration.startDate": {
                    $not: { $gt: end.toDate() }
                },
                "payload.duration.endDate": {
                    $not: { $lt: begin.toDate() }
                }
            });
            let summaryMaintenanceList = new Array();
            for (let maintain of maintenanceDocuments) {
                let blockingStartDate = time_1.default.serverMomentInPattern(maintain.payload.duration.startDate, "YYYY-MM-DD HH:mm:ss");
                let blockingEndDate = time_1.default.serverMomentInPattern(maintain.payload.duration.endDate, "YYYY-MM-DD HH:mm:ss");
                if (begin >= blockingStartDate && end >= blockingEndDate) {
                    blockingStartDate = begin;
                }
                else if (begin <= blockingStartDate && end <= blockingEndDate) {
                    blockingEndDate = end;
                }
                else if (begin >= blockingStartDate && end <= blockingEndDate) {
                    blockingStartDate = begin;
                    blockingEndDate = end;
                }
                let dateDifference = blockingEndDate.diff(blockingStartDate, 'days') + 1;
                for (let i = 0; i < dateDifference; i++) {
                    summaryMaintenanceList.push({
                        date: blockingStartDate.clone().add(i, 'days').format('YYYY-MM-DD'),
                        daysBlocked: 1
                    });
                }
            }
            let summaryMaintenanceArr = new Array();
            let uniqueMaintenanceDays = Array.from(new Set(summaryMaintenanceList.map(e => e.date)));
            for (let day of uniqueMaintenanceDays) {
                let maintenance = summaryMaintenanceList.filter(e => e.date == day);
                let daysBlocked = 0;
                for (let maintain of maintenance) {
                    daysBlocked = daysBlocked + maintain.daysBlocked;
                }
                summaryMaintenanceArr.push({
                    date: day,
                    daysBlocked: daysBlocked
                });
            }
            let smryRoomsNightsReducedArr = new Array();
            for (let i = 0; i < numberOfDays + 1; i++) {
                let day = begin.clone().add(i, 'days');
                let month = day.clone().startOf('month').format('YYYY-MM-DD');
                let week = day.clone().startOf('week').format('YYYY-MM-DD');
                let blocked = summaryMaintenanceArr.find(e => e.date == day.format('YYYY-MM-DD'));
                let daysBlocked;
                if (blocked !== undefined) {
                    daysBlocked = blocked.daysBlocked;
                }
                else {
                    daysBlocked = 0;
                }
                smryRoomsNightsReducedArr.push({
                    day: day.format('YYYY-MM-DD'),
                    month: month,
                    week: week,
                    totalRoomNights: totalRooms - daysBlocked
                });
            }
            let smryTotalRoomsUniqueMonths = Array.from(new Set(smryRoomsNightsReducedArr.map(e => e.month)));
            let smryTotalRoomsUniqueWeeks = Array.from(new Set(smryRoomsNightsReducedArr.map(e => e.week)));
            let smryTotalRoomsUniqueDays = Array.from(new Set(smryRoomsNightsReducedArr.map(e => e.day)));
            let trendsRoomNightsMonthly = new Array();
            let trendsRoomNightsWeekly = new Array();
            let trendsRoomNightsDaily = new Array();
            let trendsRoomNightsMonthlyArr = new Array();
            let trendsRoomNightsWeeklyArr = new Array();
            let trendsRoomNightsDailyArr = new Array();
            smryTotalRoomsUniqueMonths = smryTotalRoomsUniqueMonths.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            });
            smryTotalRoomsUniqueWeeks = smryTotalRoomsUniqueWeeks.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            });
            smryTotalRoomsUniqueDays = smryTotalRoomsUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            });
            for (let month of smryTotalRoomsUniqueMonths) {
                var filteredRooms = smryRoomsNightsReducedArr.filter(e => e.month == month);
                let totalRoomNights = 0;
                for (let room of filteredRooms) {
                    totalRoomNights = totalRoomNights + room.totalRoomNights;
                }
                summaryRoomNightsArr.push({
                    key: month,
                    class: 'month',
                    value: totalRoomNights
                });
                trendsRoomNightsMonthly.push({
                    label: month,
                    value: totalRoomNights
                });
            }
            trendsRoomNightsMonthlyArr.push({
                key: 'Room Nights',
                values: trendsRoomNightsMonthly
            });
            for (let week of smryTotalRoomsUniqueWeeks) {
                var filteredRooms = smryRoomsNightsReducedArr.filter(e => e.week == week);
                let totalRoomNights = 0;
                for (let room of filteredRooms) {
                    totalRoomNights = totalRoomNights + room.totalRoomNights;
                }
                summaryRoomNightsArr.push({
                    key: week,
                    class: 'week',
                    value: totalRoomNights
                });
                trendsRoomNightsWeekly.push({
                    label: week,
                    value: totalRoomNights
                });
            }
            trendsRoomNightsWeeklyArr.push({
                key: 'Room Nights',
                values: trendsRoomNightsWeekly
            });
            for (let day of smryTotalRoomsUniqueDays) {
                var filteredRooms = smryRoomsNightsReducedArr.filter(e => e.day == day);
                let totalRoomNights = 0;
                for (let room of filteredRooms) {
                    totalRoomNights = totalRoomNights + room.totalRoomNights;
                }
                summaryRoomNightsArr.push({
                    key: day,
                    class: 'day',
                    value: totalRoomNights
                });
                trendsRoomNightsDaily.push({
                    label: day,
                    value: totalRoomNights
                });
            }
            trendsRoomNightsDailyArr.push({
                key: 'Room Nights',
                values: trendsRoomNightsDaily
            });
            let smryReducedRoomsArr = new Array();
            for (let rooms of roomReservationDocuments) {
                let checkIn = time_1.default.serverMomentInPattern(rooms.checkIn, "YYYY-MM-DD HH:mm:ss");
                let checkOut = time_1.default.serverMomentInPattern(rooms.checkOut, "YYYY-MM-DD HH:mm:ss");
                if (begin >= checkIn && end >= checkOut) {
                    checkIn = begin;
                }
                else if (begin <= checkIn && end <= checkOut) {
                    checkOut = end;
                }
                else if (begin >= checkIn && end <= checkOut) {
                    checkIn = begin;
                    checkOut = end;
                }
                let stayDays = checkOut.diff(checkIn, 'days');
                for (let i = 0; i < stayDays; i++) {
                    let startDate = checkIn.clone().add(i, 'days');
                    smryReducedRoomsArr.push({
                        month: checkIn.clone().startOf('month').format('YYYY-MM-DD'),
                        day: checkIn.format('YYYY-MM-DD'),
                        week: checkIn.clone().startOf('week').format('YYYY-MM-DD'),
                        roomsSold: 1
                    });
                }
            }
            let smryRoomsSoldUniqueMonths = Array.from(new Set(smryReducedRoomsArr.map(e => e.month)));
            let smryRoomsSoldUniqueWeeks = Array.from(new Set(smryReducedRoomsArr.map(e => e.week)));
            let smryRoomsSoldUniqueDays = Array.from(new Set(smryReducedRoomsArr.map(e => e.day)));
            let trendsRoomsSoldMonthly = new Array();
            let trendsRoomsSoldWeekly = new Array();
            let trendsRoomsSoldDaily = new Array();
            let trendsRoomsSoldMonthlyArr = new Array();
            let trendsRoomsSoldWeeklyArr = new Array();
            let trendsRoomsSoldDailyArr = new Array();
            smryRoomsSoldUniqueMonths = smryRoomsSoldUniqueMonths.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            });
            smryRoomsSoldUniqueWeeks = smryRoomsSoldUniqueWeeks.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            });
            smryRoomsSoldUniqueDays = smryRoomsSoldUniqueDays.sort((a, b) => {
                let A = time_1.default.serverMomentInPattern(a, 'YYYY-MM-DD');
                let B = time_1.default.serverMomentInPattern(b, 'YYYY-MM-DD');
                return B.diff(A, 'days');
            });
            for (let month of smryRoomsSoldUniqueMonths) {
                let filteredRoomsSold = smryReducedRoomsArr.filter(e => e.month == month);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: month,
                    class: 'month',
                    value: roomsSold
                });
                trendsRoomsSoldMonthly.push({
                    label: month,
                    value: roomsSold
                });
            }
            trendsRoomsSoldMonthlyArr.push({
                key: 'Rooms Sold',
                values: trendsRoomsSoldMonthly
            });
            for (let week of smryRoomsSoldUniqueWeeks) {
                let filteredRoomsSold = smryReducedRoomsArr.filter(e => e.week == week);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: week,
                    class: 'week',
                    value: roomsSold
                });
                trendsRoomsSoldWeekly.push({
                    label: week,
                    value: roomsSold
                });
            }
            trendsRoomsSoldWeeklyArr.push({
                key: 'Rooms Sold',
                values: trendsRoomsSoldWeekly
            });
            for (let day of smryRoomsSoldUniqueDays) {
                let filteredRoomsSold = smryReducedRoomsArr.filter(e => e.day == day);
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryRoomsSoldArr.push({
                    key: day,
                    class: 'day',
                    value: roomsSold
                });
                trendsRoomsSoldDaily.push({
                    label: day,
                    value: roomsSold
                });
            }
            trendsRoomsSoldDailyArr.push({
                key: 'Rooms Sold',
                values: trendsRoomsSoldDaily
            });
            let trendsAvailableRoomsMonthly = new Array();
            let trendsAvailableRoomsWeekly = new Array();
            let trendsAvailableRoomsDaily = new Array();
            let trendsAvailableRoomsMonthlyArr = new Array();
            let trendsAvailableRoomsWeeklyArr = new Array();
            let trendsAvailableRoomsDailyArr = new Array();
            let trendsOccupancyMonthly = new Array();
            let trendsOccupancyWeekly = new Array();
            let trendsOccupancyDaily = new Array();
            let trendsOccupancyMonthlyArr = new Array();
            let trendsOccupancyWeeklyArr = new Array();
            let trendsOccupancyDailyArr = new Array();
            for (let month of smryTotalRoomsUniqueMonths) {
                var filteredRooms = smryRoomsNightsReducedArr.filter(e => e.month == month);
                let filteredRoomsSold = smryReducedRoomsArr.filter(e => e.month == month);
                let totalRoomNights = 0;
                for (let room of filteredRooms) {
                    totalRoomNights = totalRoomNights + room.totalRoomNights;
                }
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryAvailableRoomsArr.push({
                    key: month,
                    class: 'month',
                    value: totalRoomNights - roomsSold
                });
                trendsAvailableRoomsMonthly.push({
                    label: month,
                    value: totalRoomNights - roomsSold
                });
                summaryOccupancyArr.push({
                    key: month,
                    class: 'month',
                    value: roomsSold / totalRoomNights
                });
                trendsOccupancyMonthly.push({
                    label: month,
                    value: roomsSold / totalRoomNights
                });
            }
            trendsAvailableRoomsMonthlyArr.push({
                key: 'Available Rooms',
                values: trendsAvailableRoomsMonthly
            });
            trendsOccupancyMonthlyArr.push({
                key: 'Occupancy',
                values: trendsOccupancyMonthly
            });
            for (let week of smryTotalRoomsUniqueWeeks) {
                var filteredRooms = smryRoomsNightsReducedArr.filter(e => e.week == week);
                let filteredRoomsSold = smryReducedRoomsArr.filter(e => e.week == week);
                let totalRoomNights = 0;
                for (let room of filteredRooms) {
                    totalRoomNights = totalRoomNights + room.totalRoomNights;
                }
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryAvailableRoomsArr.push({
                    key: week,
                    class: 'week',
                    value: totalRoomNights - roomsSold
                });
                trendsAvailableRoomsWeekly.push({
                    label: week,
                    value: totalRoomNights - roomsSold
                });
                summaryOccupancyArr.push({
                    key: week,
                    class: 'week',
                    value: roomsSold / totalRoomNights
                });
                trendsOccupancyWeekly.push({
                    label: week,
                    value: roomsSold / totalRoomNights
                });
            }
            trendsAvailableRoomsWeeklyArr.push({
                key: 'Available Rooms',
                values: trendsAvailableRoomsWeekly
            });
            trendsOccupancyWeeklyArr.push({
                key: 'Occupancy',
                values: trendsOccupancyWeekly
            });
            for (let day of smryTotalRoomsUniqueDays) {
                var filteredRooms = smryRoomsNightsReducedArr.filter(e => e.day == day);
                let filteredRoomsSold = smryReducedRoomsArr.filter(e => e.day == day);
                let totalRoomNights = 0;
                for (let room of filteredRooms) {
                    totalRoomNights = totalRoomNights + room.totalRoomNights;
                }
                let roomsSold = 0;
                for (let room of filteredRoomsSold) {
                    roomsSold = roomsSold + room.roomsSold;
                }
                summaryAvailableRoomsArr.push({
                    key: day,
                    class: 'day',
                    value: totalRoomNights - roomsSold
                });
                trendsAvailableRoomsDaily.push({
                    label: day,
                    value: totalRoomNights - roomsSold
                });
                summaryOccupancyArr.push({
                    key: day,
                    class: 'day',
                    value: roomsSold / totalRoomNights
                });
                trendsOccupancyDaily.push({
                    label: day,
                    value: roomsSold / totalRoomNights
                });
            }
            trendsAvailableRoomsDailyArr.push({
                key: 'Available Rooms',
                values: trendsAvailableRoomsDaily
            });
            trendsOccupancyDailyArr.push({
                key: 'Occupancy',
                values: trendsOccupancyDaily
            });
            summaryTableArr.push({ roomNights: summaryRoomNightsArr }, { roomsSold: summaryRoomsSoldArr }, { availableRooms: summaryAvailableRoomsArr }, { occupancy: summaryOccupancyArr });
            let trendsMonthlyArr = new Array();
            let trendsWeeklyArr = new Array();
            let trendsDailyArr = new Array();
            switch (metric) {
                case 'roomNights': {
                    trendsMonthlyArr = trendsRoomNightsMonthlyArr;
                    trendsWeeklyArr = trendsRoomNightsWeeklyArr;
                    trendsDailyArr = trendsRoomNightsDailyArr;
                    break;
                }
                case 'roomsSold': {
                    trendsMonthlyArr = trendsRoomsSoldMonthlyArr;
                    trendsWeeklyArr = trendsRoomsSoldWeeklyArr;
                    trendsDailyArr = trendsRoomsSoldDailyArr;
                    break;
                }
                case 'availableRooms': {
                    trendsMonthlyArr = trendsAvailableRoomsMonthlyArr;
                    trendsWeeklyArr = trendsAvailableRoomsWeeklyArr;
                    trendsDailyArr = trendsAvailableRoomsDailyArr;
                    break;
                }
                case 'occupancy': {
                    trendsMonthlyArr = trendsOccupancyMonthlyArr;
                    trendsWeeklyArr = trendsOccupancyWeeklyArr;
                    trendsDailyArr = trendsOccupancyDailyArr;
                    break;
                }
            }
            let respond = {
                success: true,
                message: 'Data processed as requested',
                data: {
                    overallStats: {
                        totalRoomNights: numberOfRoomNights,
                        totalRoomsSold: roomsSold,
                        availableRooms: numberOfRoomNights - roomsSold,
                        occupancy: roomsSold / numberOfRoomNights
                    },
                    summary: summaryTableArr,
                    trends: {
                        monthly: trendsMonthlyArr,
                        weekly: trendsWeeklyArr,
                        daily: trendsDailyArr
                    }
                }
            };
            res.json(respond);
        }));
        return DashboardRouter;
    }
}
exports.default = DashboardManager;
