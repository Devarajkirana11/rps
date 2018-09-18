"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
const time_1 = require("../../helpers/time");
class Deposit {
    updateDeposit(data) {
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        this.bookinguuid = data.bookinguuid;
        this.hoteluuid = data.hoteluuid;
        this.lossDamageFee = data.lossDamageFee;
        this.depositRefunded = data.depositRefunded;
        this.lossDamageFeeCollected = data.lossDamageFeeCollected;
        this.updatedOn = currentMoment;
    }
    static CreateDepositDocument(data) {
        let deposit = new Deposit();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        deposit.uuid = identification_1.default.generateUuid;
        deposit.bookinguuid = data.bookinguuid;
        deposit.hoteluuid = data.hoteluuid;
        deposit.depositAmount = data.depositAmount;
        deposit.depositCollected = data.depositCollected;
        deposit.bookedOn = currentMoment;
        deposit.updatedOn = currentMoment;
        return deposit;
    }
    static spawn(document) {
        let deposit = new Deposit();
        deposit.uuid = document.uuid;
        deposit.bookinguuid = document.bookinguuid;
        deposit.depositAmount = document.depositAmount;
        deposit.depositCollected = document.depositCollected;
        deposit.lossDamageFee = document.lossDamageFee;
        deposit.depositRefunded = document.depositRefunded;
        deposit.lossDamageFeeCollected = document.lossDamageFeeCollected;
        deposit.bookedOn = document.bookedOn;
        deposit.updatedOn = document.updatedOn;
        return deposit;
    }
    get document() {
        return {
            uuid: this.uuid,
            bookinguuid: this.bookinguuid,
            hoteluuid: this.hoteluuid,
            depositAmount: this.depositAmount,
            depositCollected: this.depositCollected,
            lossDamageFee: this.lossDamageFee,
            depositRefunded: this.depositRefunded,
            lossDamageFeeCollected: this.lossDamageFeeCollected,
            bookedOn: this.bookedOn,
            updatedOn: this.updatedOn
        };
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get bookinguuid() {
        return this._bookinguuid;
    }
    set bookinguuid(value) {
        this._bookinguuid = value;
    }
    get hoteluuid() {
        return this._hoteluuid;
    }
    set hoteluuid(value) {
        this._hoteluuid = value;
    }
    get depositAmount() {
        return this._depositAmount;
    }
    set depositAmount(value) {
        this._depositAmount = value;
    }
    get depositCollected() {
        return this._depositCollected;
    }
    set depositCollected(value) {
        this._depositCollected = value;
    }
    get lossDamageFee() {
        return this._lossDamageFee;
    }
    set lossDamageFee(value) {
        this._lossDamageFee = value;
    }
    get depositRefunded() {
        return this._depositRefunded;
    }
    set depositRefunded(value) {
        this._depositRefunded = value;
    }
    get lossDamageFeeCollected() {
        return this._lossDamageFeeCollected;
    }
    set lossDamageFeeCollected(value) {
        this._lossDamageFeeCollected = value;
    }
    get bookedOn() {
        return this._bookedOn;
    }
    set bookedOn(value) {
        this._bookedOn = value;
    }
    get updatedOn() {
        return this._updatedOn;
    }
    set updatedOn(value) {
        this._updatedOn = value;
    }
}
exports.default = Deposit;
