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
class Cashier {
    static create(data) {
        let cashier = new Cashier();
        cashier.uuid = identification_1.default.generateUuid;
        cashier.hotelUuid = data.hotelUuid;
        cashier.openingBalance = data.openingBalance;
        cashier.shifts = new Array();
        cashier.begin = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        cashier.status = Law.CashierStatus.LATEST;
        return cashier;
    }
    static spawn(document) {
        let cashier = new Cashier();
        cashier.uuid = document.uuid;
        cashier.hotelUuid = document.hotelUuid;
        cashier.openingBalance = document.openingBalance;
        cashier.closingBalance = document.closingBalance;
        cashier.withdrawal = document.withdrawal;
        cashier.shifts = document.shifts;
        cashier.begin = document.begin;
        cashier.end = document.end;
        cashier.status = document.status;
        return cashier;
    }
    get document() {
        return {
            uuid: this.uuid,
            hotelUuid: this.hotelUuid,
            openingBalance: this.openingBalance,
            closingBalance: this.closingBalance,
            withdrawal: this.withdrawal,
            shifts: this.shifts,
            begin: this.begin,
            end: this.end,
            status: this.status
        };
    }
    get hasNoShift() {
        return this.shifts.length === 0;
    }
    get hasNoOpenShift() {
        return this.shifts.find(e => e.status === Law.ShiftStatus.OPEN) === undefined;
    }
    get openShift() {
        return this.shifts.find(e => e.status === Law.ShiftStatus.OPEN);
    }
    get hasNoLatestShift() {
        return this.shifts.find(e => e.status === Law.ShiftStatus.LATEST) === undefined;
    }
    get latestShift() {
        return this.shifts.find(e => e.status === Law.ShiftStatus.LATEST);
    }
    close(withdrawal) {
        this.latestShift.status = Law.ShiftStatus.CLOSED;
        this.status = Law.CashierStatus.CLOSED;
        this.end = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        this.withdrawal = withdrawal;
        return this.closingBalance - this.withdrawal;
    }
    initiate(topUpFloat, userUuid) {
        let firstShift = new Shift(1, userUuid);
        firstShift.openingBalance = this.openingBalance;
        firstShift.topUpFloat = topUpFloat;
        firstShift.openingFloat = firstShift.openingBalance + firstShift.topUpFloat;
        firstShift.begin = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        firstShift.status = Law.ShiftStatus.OPEN;
        this.shifts.push(firstShift.document);
    }
    continue(topUpFloat, userUuid) {
        let nextShiftNumber = this.latestShift.number + 1;
        this.latestShift.status = Law.ShiftStatus.CLOSED;
        let nextShift = new Shift(nextShiftNumber, userUuid);
        nextShift.openingBalance = this.closingBalance ? this.closingBalance : 0;
        nextShift.topUpFloat = topUpFloat ? topUpFloat : 0;
        nextShift.openingFloat = nextShift.openingBalance + nextShift.topUpFloat;
        nextShift.begin = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        nextShift.status = Law.ShiftStatus.OPEN;
        this.shifts.push(nextShift.document);
    }
    takeOver(topUpFloat, userUuid) {
        if (this.hasNoShift) {
            this.initiate(topUpFloat, userUuid);
        }
        else {
            this.continue(topUpFloat, userUuid);
        }
    }
    handOver(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let expectedClosingBalance = 0;
            let miscellaneousAmount = 0;
            let miscellaneousExpenses = 0;
            this.openShift.walkIn = data.walkIn;
            this.openShift.payAtHotel = data.payAtHotel;
            this.openShift.tourismTax = data.tourismTax;
            this.openShift.depositCollected = data.depositCollected;
            this.openShift.depositRefund = data.depositRefund;
            this.openShift.lossDamageFee = data.lossDamageFee;
            this.openShift.bookingRefund = data.bookingRefund;
            this.openShift.withdrawal = data.withdrawal;
            expectedClosingBalance = expectedClosingBalance + this.openShift.openingFloat;
            expectedClosingBalance = expectedClosingBalance + this.openShift.walkIn.cash;
            expectedClosingBalance = expectedClosingBalance + this.openShift.payAtHotel.cash;
            expectedClosingBalance = expectedClosingBalance + this.openShift.depositCollected.cash;
            expectedClosingBalance = expectedClosingBalance + this.openShift.tourismTax.cash;
            expectedClosingBalance = expectedClosingBalance - this.openShift.depositRefund;
            expectedClosingBalance = expectedClosingBalance - this.openShift.bookingRefund;
            this.openShift.expectedClosingBalance = expectedClosingBalance;
            this.openShift.miscellaneous = data.miscellaneous;
            for (let miscellaneous of this.openShift.miscellaneous) {
                miscellaneousExpenses = miscellaneousExpenses + miscellaneous.amount;
            }
            this.openShift.actualClosingBalance = expectedClosingBalance - miscellaneousExpenses - this.openShift.withdrawal;
            this.closingBalance = this.openShift.actualClosingBalance;
            this.openShift.end = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
            this.openShift.status = Law.ShiftStatus.LATEST;
        });
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get hotelUuid() {
        return this._hotelUuid;
    }
    set hotelUuid(value) {
        this._hotelUuid = value;
    }
    get openingBalance() {
        return this._openingBalance;
    }
    set openingBalance(value) {
        this._openingBalance = value;
    }
    get closingBalance() {
        return this._closingBalance;
    }
    set closingBalance(value) {
        this._closingBalance = value;
    }
    get withdrawal() {
        return this._withdrawal;
    }
    set withdrawal(value) {
        this._withdrawal = value;
    }
    get shifts() {
        return this._shifts;
    }
    set shifts(value) {
        this._shifts = value;
    }
    get begin() {
        return this._begin;
    }
    set begin(value) {
        this._begin = value;
    }
    get end() {
        return this._end;
    }
    set end(value) {
        this._end = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
}
exports.Cashier = Cashier;
class Shift {
    constructor(shiftNumber, userUuid) {
        this.number = shiftNumber;
        this.userUuid = userUuid;
    }
    get document() {
        return {
            number: this.number,
            userUuid: this.userUuid,
            status: this.status,
            begin: this.begin,
            end: this.end,
            openingBalance: this.openingBalance,
            topUpFloat: this.topUpFloat,
            openingFloat: this.openingFloat,
            walkIn: this.walkIn,
            payAtHotel: this.payAtHotel,
            tourismTax: this.tourismTax,
            depositCollected: this.depositCollected,
            depositRefund: this.depositRefund,
            bookingRefund: this.bookingRefund,
            withdrawal: this.withdrawal,
            lossDamageFee: this.lossDamageFee,
            expectedClosingBalance: this.expectedClosingBalance,
            miscellaneous: this.miscellaneous,
            actualClosingBalance: this.actualClosingBalance
        };
    }
    get number() {
        return this._number;
    }
    set number(value) {
        this._number = value;
    }
    get userUuid() {
        return this._userUuid;
    }
    set userUuid(value) {
        this._userUuid = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get begin() {
        return this._begin;
    }
    set begin(value) {
        this._begin = value;
    }
    get end() {
        return this._end;
    }
    set end(value) {
        this._end = value;
    }
    get openingBalance() {
        return this._openingBalance;
    }
    set openingBalance(value) {
        this._openingBalance = value;
    }
    get topUpFloat() {
        return this._topUpFloat;
    }
    set topUpFloat(value) {
        this._topUpFloat = value;
    }
    get openingFloat() {
        return this._openingFloat;
    }
    set openingFloat(value) {
        this._openingFloat = value;
    }
    get walkIn() {
        return this._walkIn;
    }
    set walkIn(value) {
        this._walkIn = value;
    }
    get payAtHotel() {
        return this._payAtHotel;
    }
    set payAtHotel(value) {
        this._payAtHotel = value;
    }
    get tourismTax() {
        return this._tourismTax;
    }
    set tourismTax(value) {
        this._tourismTax = value;
    }
    get depositCollected() {
        return this._depositCollected;
    }
    set depositCollected(value) {
        this._depositCollected = value;
    }
    get depositRefund() {
        return this._depositRefund;
    }
    set depositRefund(value) {
        this._depositRefund = value;
    }
    get withdrawal() {
        return this._withdrawal;
    }
    set withdrawal(value) {
        this._withdrawal = value;
    }
    get lossDamageFee() {
        return this._lossDamageFee;
    }
    set lossDamageFee(value) {
        this._lossDamageFee = value;
    }
    get bookingRefund() {
        return this._bookingRefund;
    }
    set bookingRefund(value) {
        this._bookingRefund = value;
    }
    get expectedClosingBalance() {
        return this._expectedClosingBalance;
    }
    set expectedClosingBalance(value) {
        this._expectedClosingBalance = value;
    }
    get miscellaneous() {
        return this._miscellaneous;
    }
    set miscellaneous(value) {
        this._miscellaneous = value;
    }
    get actualClosingBalance() {
        return this._actualClosingBalance;
    }
    set actualClosingBalance(value) {
        this._actualClosingBalance = value;
    }
}
exports.Shift = Shift;
