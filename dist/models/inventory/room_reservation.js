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
const Law = require("./law");
const identification_1 = require("../../helpers/identification");
const time_1 = require("../../helpers/time");
class RoomReservation {
    static create(data) {
        let newRoomReservation = new RoomReservation();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        newRoomReservation.uuid = identification_1.default.generateUuid;
        newRoomReservation.roomUuid = data.roomUuid;
        newRoomReservation.hotelUuid = data.hotelUuid;
        newRoomReservation.bookingUuid = data.bookingUuid;
        newRoomReservation.roomNumber = data.roomNumber;
        newRoomReservation.roomType = data.roomType;
        newRoomReservation.status = data.status;
        newRoomReservation.statusColor = Law.RoomStatusColor[data.status];
        newRoomReservation.guest = data.guest;
        newRoomReservation.numberOfGuests = data.numberOfGuests;
        newRoomReservation.numberOfNights = data.numberOfNights;
        newRoomReservation.breakfastIncluded = data.breakfastIncluded;
        newRoomReservation.roomPrice = data.roomPrice;
        newRoomReservation.costBreakdown = data.costBreakdown;
        newRoomReservation.checkIn = data.checkIn;
        newRoomReservation.checkOut = data.checkOut;
        return newRoomReservation;
    }
    static spawn(document) {
        let newRoomReservation = new RoomReservation();
        newRoomReservation.uuid = document.uuid;
        newRoomReservation.roomUuid = document.roomUuid;
        newRoomReservation.hotelUuid = document.hotelUuid;
        newRoomReservation.bookingUuid = document.bookingUuid;
        newRoomReservation.roomNumber = document.roomNumber;
        newRoomReservation.roomType = document.roomType;
        newRoomReservation.status = document.status;
        newRoomReservation.statusColor = document.statusColor;
        newRoomReservation.guest = document.guest;
        newRoomReservation.numberOfGuests = document.numberOfGuests;
        newRoomReservation.numberOfNights = document.numberOfNights;
        newRoomReservation.breakfastIncluded = document.breakfastIncluded;
        newRoomReservation.roomPrice = document.roomPrice;
        newRoomReservation.costBreakdown = document.costBreakdown;
        newRoomReservation.checkIn = document.checkIn;
        newRoomReservation.checkOut = document.checkOut;
        return newRoomReservation;
    }
    get document() {
        return {
            uuid: this.uuid,
            roomUuid: this.roomUuid,
            hotelUuid: this.hotelUuid,
            bookingUuid: this.bookingUuid,
            roomNumber: this.roomNumber,
            roomType: this.roomType,
            status: this.status,
            statusColor: this.statusColor,
            guest: this.guest,
            numberOfGuests: this.numberOfGuests,
            numberOfNights: this.numberOfNights,
            breakfastIncluded: this.breakfastIncluded,
            roomPrice: this.roomPrice,
            costBreakdown: this.costBreakdown,
            checkIn: this.checkIn,
            checkOut: this.checkOut
        };
    }
    get dashboardDocument() {
        return {
            uuid: this.uuid,
            roomUuid: this.roomUuid,
            bookingUuid: this.bookingUuid,
            roomNumber: this.roomNumber,
            roomType: this.roomType,
            status: this.status,
            statusColor: this.statusColor,
            guest: this.guest,
            numberOfGuests: this.numberOfGuests,
            numberOfNights: this.numberOfNights,
            breakfastIncluded: this.breakfastIncluded,
            roomPrice: this.roomPrice,
            costBreakdown: this.costBreakdown,
            checkIn: time_1.default.formatGivenDate(this.checkIn),
            checkOut: time_1.default.formatGivenDate(this.checkOut)
        };
    }
    static spawnDashboardDocuments(documents) {
        return __awaiter(this, void 0, void 0, function* () {
            let dashboardDocuments = new Array();
            for (let document of documents) {
                let roomReservation = yield RoomReservation.spawn(document);
                dashboardDocuments.push(roomReservation.dashboardDocument);
            }
            return dashboardDocuments;
        });
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get roomUuid() {
        return this._roomUuid;
    }
    set roomUuid(value) {
        this._roomUuid = value;
    }
    get hotelUuid() {
        return this._hotelUuid;
    }
    set hotelUuid(value) {
        this._hotelUuid = value;
    }
    get bookingUuid() {
        return this._bookingUuid;
    }
    set bookingUuid(value) {
        this._bookingUuid = value;
    }
    get roomNumber() {
        return this._roomNumber;
    }
    set roomNumber(value) {
        this._roomNumber = value;
    }
    get roomType() {
        return this._roomType;
    }
    set roomType(value) {
        this._roomType = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get statusColor() {
        return this._statusColor;
    }
    set statusColor(value) {
        this._statusColor = value;
    }
    get guest() {
        return this._guest;
    }
    set guest(value) {
        this._guest = value;
    }
    get numberOfGuests() {
        return this._numberOfGuests;
    }
    set numberOfGuests(value) {
        this._numberOfGuests = value;
    }
    get numberOfNights() {
        return this._numberOfNights;
    }
    set numberOfNights(value) {
        this._numberOfNights = value;
    }
    get breakfastIncluded() {
        return this._breakfastIncluded;
    }
    set breakfastIncluded(value) {
        this._breakfastIncluded = value;
    }
    get roomPrice() {
        return this._roomPrice;
    }
    set roomPrice(value) {
        this._roomPrice = value;
    }
    get costBreakdown() {
        return this._costBreakdown;
    }
    set costBreakdown(value) {
        this._costBreakdown = value;
    }
    get checkIn() {
        return this._checkIn;
    }
    set checkIn(value) {
        this._checkIn = value;
    }
    get checkOut() {
        return this._checkOut;
    }
    set checkOut(value) {
        this._checkOut = value;
    }
}
exports.default = RoomReservation;
