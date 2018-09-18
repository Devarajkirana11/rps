"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
const time_1 = require("../../helpers/time");
class Booking {
    static import(data) {
        let booking = new Booking();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        booking.uuid = identification_1.default.generateUuid;
        booking.referenceId = identification_1.default.generateReferenceId;
        booking.hotelId = data.hotelId;
        booking.source = data.source;
        booking.status = data.status;
        booking.noofchild = data.noofchild;
        booking.hotelRemark = data.hotelRemark;
        booking.policies = new Array();
        booking.guest = data.guest;
        booking.discount = data.discount;
        booking.serviceFee = data.serviceFee;
        booking.tax = data.tax;
        booking.bookedOn = data.bookedOn;
        booking.bookedBy = data.bookedBy;
        booking.roomReservations = new Array();
        booking.referred_by = data.referred_by;
        booking.bookingCommission = data.bookingCommission;
        return booking;
    }
    static create(data) {
        let booking = new Booking();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        booking.uuid = identification_1.default.generateUuid;
        booking.referenceId = identification_1.default.generateReferenceId;
        booking.hotelId = data.hotelId;
        booking.source = data.source;
        booking.status = data.status;
        booking.noofchild = data.noofchild;
        booking.hotelRemark = data.hotelRemark;
        booking.policies = new Array();
        booking.guest = data.guest;
        booking.discount = data.discount;
        booking.serviceFee = data.serviceFee;
        booking.tax = data.tax;
        booking.bookedOn = currentMoment;
        booking.bookedBy = data.bookedBy;
        booking.roomReservations = new Array();
        booking.referred_by = data.referred_by;
        booking.bookingCommission = data.bookingCommission;
        return booking;
    }
    static spawn(document) {
        let booking = new Booking();
        booking.uuid = document.uuid;
        booking.referenceId = document.referenceId;
        booking.hotelId = document.hotelId;
        booking.source = document.source;
        booking.channelId = document.channelId;
        booking.status = document.status;
        booking.roomReservations = document.roomReservations;
        booking.noofchild = document.noofchild;
        booking.hotelRemark = document.hotelRemark;
        booking.guestRemark = document.guestRemark;
        booking.policies = document.policies;
        booking.guest = document.guest;
        booking.totalRoomPrice = document.totalRoomPrice;
        booking.discount = document.discount;
        booking.grandPrice = document.grandPrice;
        booking.serviceFee = document.serviceFee;
        booking.tax = document.tax;
        booking.totalAmount = document.totalAmount;
        booking.paymentUuid = document.paymentUuid;
        booking.bookedOn = document.bookedOn;
        booking.bookedBy = document.bookedBy;
        booking.referred_by = document.referred_by;
        return booking;
    }
    get document() {
        return {
            uuid: this.uuid,
            referenceId: this.referenceId,
            hotelId: this.hotelId,
            source: this.source,
            channelId: this.channelId,
            status: this.status,
            roomReservations: this.roomReservations,
            noofchild: this.noofchild,
            hotelRemark: this.hotelRemark,
            guestRemark: this.guestRemark,
            policies: this.policies,
            guest: this.guest,
            totalRoomPrice: this.totalRoomPrice,
            discount: this.discount,
            grandPrice: this.grandPrice,
            serviceFee: this.serviceFee,
            tax: this.tax,
            totalAmount: this.totalAmount,
            paymentUuid: this.paymentUuid,
            bookedOn: this.bookedOn,
            bookedBy: this.bookedBy,
            referred_by: this.referred_by,
            bookingCommission: this.bookingCommission,
        };
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get referenceId() {
        return this._referenceId;
    }
    set referenceId(value) {
        this._referenceId = value;
    }
    get hotelId() {
        return this._hotelId;
    }
    set hotelId(value) {
        this._hotelId = value;
    }
    get source() {
        return this._source;
    }
    set source(value) {
        this._source = value;
    }
    get channelId() {
        return this._channelId;
    }
    set channelId(value) {
        this._channelId = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get roomReservations() {
        return this._roomReservations;
    }
    set roomReservations(value) {
        this._roomReservations = value;
    }
    get noofchild() {
        return this._noofchild;
    }
    set noofchild(value) {
        this._noofchild = value;
    }
    get hotelRemark() {
        return this._hotelRemark;
    }
    set hotelRemark(value) {
        this._hotelRemark = value;
    }
    get guestRemark() {
        return this._guestRemark;
    }
    set guestRemark(value) {
        this._guestRemark = value;
    }
    get policies() {
        return this._policies;
    }
    set policies(value) {
        this._policies = value;
    }
    get guest() {
        return this._guest;
    }
    set guest(value) {
        this._guest = value;
    }
    get totalRoomPrice() {
        return this._totalRoomPrice;
    }
    set totalRoomPrice(value) {
        this._totalRoomPrice = value;
    }
    get discount() {
        return this._discount;
    }
    set discount(value) {
        this._discount = value;
    }
    get grandPrice() {
        return this._grandPrice;
    }
    set grandPrice(value) {
        this._grandPrice = value;
    }
    get serviceFee() {
        return this._serviceFee;
    }
    set serviceFee(value) {
        this._serviceFee = value;
    }
    get tax() {
        return this._tax;
    }
    set tax(value) {
        this._tax = value;
    }
    get totalAmount() {
        return this._totalAmount;
    }
    set totalAmount(value) {
        this._totalAmount = value;
    }
    get paymentUuid() {
        return this._paymentUuid;
    }
    set paymentUuid(value) {
        this._paymentUuid = value;
    }
    get bookedOn() {
        return this._bookedOn;
    }
    set bookedOn(value) {
        this._bookedOn = value;
    }
    get bookedBy() {
        return this._bookedBy;
    }
    set bookedBy(value) {
        this._bookedBy = value;
    }
    set referred_by(value) {
        this._referred_by = value;
    }
    get referred_by() {
        return this._referred_by;
    }
    set bookingCommission(value) {
        this._bookingCommission = value;
    }
    get bookingCommission() {
        return this._bookingCommission;
    }
}
exports.default = Booking;
