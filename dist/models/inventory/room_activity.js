"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Law = require("./law");
const time_1 = require("../../helpers/time");
class RoomActivity {
    static create(hotelUuid, roomType, roomNumber) {
        let roomActivity = new RoomActivity();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        roomActivity.hotelUuid = hotelUuid;
        roomActivity.roomType = roomType;
        roomActivity.roomNumber = roomNumber;
        roomActivity.blockingIssues = new Array();
        roomActivity.nonBlockingIssues = new Array();
        roomActivity.isDirty = false;
        roomActivity.inactiveDuration = new Array();
        roomActivity.inactiveColor = Law.BlockingColor.INACTIVE;
        return roomActivity;
    }
    static spawn(document) {
        let roomActivity = new RoomActivity();
        roomActivity.hotelUuid = document.hotelUuid;
        roomActivity.roomType = document.roomType;
        roomActivity.roomNumber = document.roomNumber;
        roomActivity.blockingIssues = document.blockingIssues;
        roomActivity.isDirty = document.isDirty;
        roomActivity.nonBlockingIssues = document.nonBlockingIssues;
        roomActivity.nonBlockingRemark = document.nonBlockingRemark;
        roomActivity.inactiveDuration = document.inactiveDuration;
        roomActivity.inactiveColor = document.inactiveColor;
        return roomActivity;
    }
    getMaintenanceBlocks() {
        let maintenanceBlocks = new Array();
        let currentDay = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY').toDate();
        let today = time_1.default.formatGivenDate(currentDay);
        for (let issue of this.blockingIssues) {
            maintenanceBlocks.push({
                roomNumber: this.roomNumber,
                blockedFrom: time_1.default.formatGivenDate(issue.duration.startDate),
                blockedTo: time_1.default.formatGivenDate(issue.duration.endDate),
                blockedOn: time_1.default.formatGivenDate(issue.blockedOn),
                blockedBy: issue.blockedBy,
                reason: issue.reason
            });
        }
        return maintenanceBlocks;
    }
    get document() {
        return {
            hotelUuid: this.hotelUuid,
            roomType: this.roomType,
            roomNumber: this.roomNumber,
            blockingIssues: this.blockingIssues,
            isDirty: this.isDirty,
            nonBlockingIssues: this.nonBlockingIssues,
            nonBlockingRemark: this.nonBlockingRemark,
            inactiveDuration: this.inactiveDuration,
            inactiveColor: this.inactiveColor
        };
    }
    addMaintenanceBlock(data) {
        let isReasonValid = true;
        for (let issue of this.blockingIssues) {
            if (issue.reason === data.reason) {
                isReasonValid = false;
                break;
            }
        }
        if (isReasonValid) {
            data.duration.startDate = time_1.default.serverMomentInPattern(data.duration.startDate, 'DD-MM-YYYY').toDate();
            data.duration.endDate = time_1.default.serverMomentInPattern(data.duration.endDate, 'DD-MM-YYYY').toDate();
            this.blockingIssues.push({
                reason: data.reason,
                duration: data.duration,
                remark: data.remark,
                blockedOn: time_1.default.serverMomentInPattern(data.blockedOn, 'DD-MM-YYYY').toDate(),
                blockedBy: data.blockedBy
            });
        }
        return isReasonValid;
    }
    removeMaintenanceBlock(reason) {
        this.blockingIssues = this.blockingIssues.filter(e => e.reason !== reason);
    }
    isAvailableDuring(startDate, endDate) {
        let isAvailable = true;
        let bookingStartDateMoment = time_1.default.serverMomentInPattern(startDate, 'DD-MM-YYYY');
        let bookingEndDateMoment = time_1.default.serverMomentInPattern(endDate, 'DD-MM-YYYY');
        for (let issue of this.blockingIssues) {
            let issueStartDateMoment = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(issue.duration.startDate), 'DD-MM-YYYY');
            let issueEndDateMoment = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(issue.duration.endDate), 'DD-MM-YYYY');
            if (bookingStartDateMoment <= issueEndDateMoment && bookingEndDateMoment >= issueStartDateMoment) {
                isAvailable = false;
            }
        }
        return isAvailable;
    }
    get hotelUuid() {
        return this._hotelUuid;
    }
    set hotelUuid(value) {
        this._hotelUuid = value;
    }
    get roomType() {
        return this._roomType;
    }
    set roomType(value) {
        this._roomType = value;
    }
    get roomNumber() {
        return this._roomNumber;
    }
    set roomNumber(value) {
        this._roomNumber = value;
    }
    get blockingIssues() {
        return this._blockingIssues;
    }
    set blockingIssues(value) {
        this._blockingIssues = value;
    }
    get isDirty() {
        return this._isDirty;
    }
    set isDirty(value) {
        this._isDirty = value;
    }
    get nonBlockingIssues() {
        return this._nonBlockingIssues;
    }
    set nonBlockingIssues(value) {
        this._nonBlockingIssues = value;
    }
    get nonBlockingRemark() {
        return this._nonBlockingRemark;
    }
    set nonBlockingRemark(value) {
        this._nonBlockingRemark = value;
    }
    get inactiveDuration() {
        return this._inactiveDuration;
    }
    set inactiveDuration(value) {
        this._inactiveDuration = value;
    }
    get inactiveColor() {
        return this._inactiveColor;
    }
    set inactiveColor(value) {
        this._inactiveColor = value;
    }
}
exports.default = RoomActivity;
