"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../../helpers/time");
class PastNidacash {
    static create(data) {
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        let newPastNidacash = new PastNidacash();
        newPastNidacash.date = data.date;
        newPastNidacash.signups = data.signups;
        newPastNidacash.referrals = data.referrals;
        newPastNidacash.signup_referrals = data.signup_referrals;
        newPastNidacash.referral_bookings = data.referral_bookings;
        newPastNidacash.self_bookings = data.self_bookings;
        newPastNidacash.friends_bookings = data.friends_bookings;
        newPastNidacash.total_bookings = data.total_bookings;
        newPastNidacash.referral_earnings = data.referral_earnings;
        newPastNidacash.self_earnings = data.self_earnings;
        newPastNidacash.friends_earnings = data.friends_earnings;
        newPastNidacash.stay_earnings = data.stay_earnings;
        newPastNidacash.created_on = currentMoment;
        return newPastNidacash;
    }
    get document() {
        return {
            date: this.date,
            signups: this.signups,
            referrals: this.referrals,
            signup_referrals: this.signup_referrals,
            referral_bookings: this.referral_bookings,
            self_bookings: this.self_bookings,
            friends_bookings: this.friends_bookings,
            total_bookings: this.total_bookings,
            referral_earnings: this.referral_earnings,
            self_earnings: this.self_earnings,
            friends_earnings: this.friends_earnings,
            stay_earnings: this.stay_earnings,
            created_on: this.created_on,
        };
    }
    get date() {
        return this._date;
    }
    set date(value) {
        this._date = value;
    }
    get signups() {
        return this._signups;
    }
    set signups(value) {
        this._signups = value;
    }
    get referrals() {
        return this._referrals;
    }
    set referrals(value) {
        this._referrals = value;
    }
    get signup_referrals() {
        return this._signup_referrals;
    }
    set signup_referrals(value) {
        this._signup_referrals = value;
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
    get stay_earnings() {
        return this._stay_earnings;
    }
    set stay_earnings(value) {
        this._stay_earnings = value;
    }
    get created_on() {
        return this._created_on;
    }
    set created_on(value) {
        this._created_on = value;
    }
}
exports.default = PastNidacash;
