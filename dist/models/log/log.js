"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../../helpers/time");
class Log {
    static create(data) {
        let newLog = new Log();
        newLog.type = data.type;
        newLog.by = data.by;
        newLog.payload = data.payload;
        newLog.moment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        return newLog;
    }
    static spawn(document) {
        let existingLog = new Log();
        existingLog.type = document.type;
        existingLog.moment = document.moment;
        existingLog.by = document.by;
        existingLog.payload = document.payload;
        return existingLog;
    }
    get document() {
        return {
            type: this.type,
            moment: this.moment,
            by: this.by,
            payload: this.payload
        };
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get moment() {
        return this._moment;
    }
    set moment(value) {
        this._moment = value;
    }
    get by() {
        return this._by;
    }
    set by(value) {
        this._by = value;
    }
    get payload() {
        return this._payload;
    }
    set payload(value) {
        this._payload = value;
    }
}
exports.default = Log;
