"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Policies {
    static cancellationcreate(data) {
        let newCreate = new Policies();
        newCreate.policy_id = data.policy_id;
        newCreate.name = data.name;
        newCreate.duration = data.duration;
        newCreate.duration_hours = data.duration_hours;
        newCreate.percentage_value = data.percentage_value;
        newCreate.status = data.status;
        return newCreate;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get policy_id() {
        return this._policy_id;
    }
    set policy_id(value) {
        this._policy_id = value;
    }
    get duration_hours() {
        return this._duration_hours;
    }
    set duration_hours(value) {
        this._duration_hours = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get duration() {
        return this._duration;
    }
    set duration(value) {
        this._duration = value;
    }
    get percentage_value() {
        return this._percentage_value;
    }
    set percentage_value(value) {
        this._percentage_value = value;
    }
}
exports.default = Policies;
