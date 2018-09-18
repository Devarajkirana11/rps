"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../../helpers/time");
class FutureNidacash {
    static create(data) {
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        let newFutureNidacash = new FutureNidacash();
        newFutureNidacash.referral_bookings = data.referral_bookings;
        newFutureNidacash.self_bookings = data.self_bookings;
        newFutureNidacash.friends_bookings = data.friends_bookings;
        newFutureNidacash.total_bookings = data.total_bookings;
        newFutureNidacash.referral_earnings = data.referral_earnings;
        newFutureNidacash.self_earnings = data.self_earnings;
        newFutureNidacash.friends_earnings = data.friends_earnings;
        newFutureNidacash.upcoming_earnings = data.upcoming_earnings;
        newFutureNidacash.created_on = currentMoment;
        return newFutureNidacash;
    }
    get document() {
        return {
            referral_bookings: this.referral_bookings,
            self_bookings: this.self_bookings,
            friends_bookings: this.friends_bookings,
            total_bookings: this.total_bookings,
            referral_earnings: this.referral_earnings,
            self_earnings: this.self_earnings,
            friends_earnings: this.friends_earnings,
            upcoming_earnings: this.upcoming_earnings,
            created_on: this.created_on,
        };
    }
    get referral_bookings() {
        return this._referral_bookings;
    }
    set referral_bookings(value) {
        this._referral_bookings = value;
    }
    get self_bookings() {
        return this._self_bookings;
    }
    set self_bookings(value) {
        this._self_bookings = value;
    }
    get friends_bookings() {
        return this._friends_bookings;
    }
    set friends_bookings(value) {
        this._friends_bookings = value;
    }
    get total_bookings() {
        return this._total_bookings;
    }
    set total_bookings(value) {
        this._total_bookings = value;
    }
    get referral_earnings() {
        return this._referral_earnings;
    }
    set referral_earnings(value) {
        this._referral_earnings = value;
    }
    get self_earnings() {
        return this._self_earnings;
    }
    set self_earnings(value) {
        this._self_earnings = value;
    }
    get friends_earnings() {
        return this._friends_earnings;
    }
    set friends_earnings(value) {
        this._friends_earnings = value;
    }
    get upcoming_earnings() {
        return this._upcoming_earnings;
    }
    set upcoming_earnings(value) {
        this._upcoming_earnings = value;
    }
    get created_on() {
        return this._created_on;
    }
    set created_on(value) {
        this._created_on = value;
    }
}
exports.default = FutureNidacash;
