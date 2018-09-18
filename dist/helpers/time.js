"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../config/app");
const moment = require("moment-timezone");
class Time {
    static addDays(noOfdays = 0, date, format = "DD-MM-YYYY") {
        return moment(date, "DD-MM-YYYY")
            .tz(Time.serverRegion)
            .add(noOfdays, 'days')
            .format(format);
    }
    static nextYearDate() {
        return moment()
            .tz(Time.serverRegion)
            .add(12, 'months')
            .format('DD-MM-YYYY');
    }
    static formatGivenDate(date) {
        return moment(date)
            .tz(Time.serverRegion)
            .format('DD-MM-YYYY');
    }
    static OTAformatGivenDate(date) {
        return moment(date)
            .tz(Time.serverRegion)
            .format('YYYY-MM-DD');
    }
    static formatGivenDateWithTime(date) {
        return moment(date)
            .tz(Time.serverRegion)
            .format('DD-MM-YYYY HH:mm:ss');
    }
    static countryFormatGivenDateWithTime(date, country) {
        if (country == 'Thailand') {
            return moment(date)
                .tz(Time.serverRegion)
                .subtract('hours', 1)
                .format('DD-MM-YYYY HH:mm:ss');
        }
        else {
            return moment(date)
                .tz(Time.serverRegion)
                .format('DD-MM-YYYY HH:mm:ss');
        }
    }
    static get serverTime() {
        return moment()
            .tz(Time.serverRegion)
            .format('DD-MM-YYYY HH:mm:ss');
    }
    static get serverMoment() {
        return moment().tz(Time.serverRegion);
    }
    static serverMomentInPattern(date, pattern) {
        return moment(date, pattern).tz(Time.serverRegion);
    }
    static serverMomentInStrictPattern(date, pattern, strict) {
        return moment(date, pattern, strict).tz(Time.serverRegion);
    }
}
Time.serverRegion = app_1.environments[process.env.ENV].region;
exports.default = Time;
