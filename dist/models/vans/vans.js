"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
class vans {
    static createvan(data) {
        let newvan = new vans();
        newvan.uuid = identification_1.default.generateUuid;
        newvan.make = data.make;
        newvan.reg_no = data.reg_no;
        newvan.type = data.type;
        newvan.capacity = data.capacity;
        newvan.provider = data.provider;
        newvan.gps_tracking_id = data.gps_tracking_id;
        newvan.documents = data.documents;
        newvan.dc_uuid = data.dc_uuid;
        newvan.dc_name = data.dc_name;
        newvan.color_code = data.color_code;
        newvan.status = data.status;
        newvan.created_on = data.created_on;
        newvan.updated_on = data.updated_on;
        return newvan;
    }
    get document() {
        return {
            uuid: this.uuid,
            make: this.make,
            reg_no: this.reg_no,
            type: this.type,
            capacity: this.capacity,
            provider: this.provider,
            gps_tracking_id: this.gps_tracking_id,
            documents: this.documents,
            dc_uuid: this.dc_uuid,
            dc_name: this.dc_name,
            color_code: this.color_code,
            status: this.status,
            created_on: this.created_on,
            updated_on: this.updated_on
        };
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get make() {
        return this._make;
    }
    set make(value) {
        this._make = value;
    }
    get reg_no() {
        return this._reg_no;
    }
    set reg_no(value) {
        this._reg_no = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get created_on() {
        return this._created_on;
    }
    set created_on(value) {
        this._created_on = value;
    }
    get updated_on() {
        return this._updated_on;
    }
    set updated_on(value) {
        this._updated_on = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get capacity() {
        return this._capacity;
    }
    set capacity(value) {
        this._capacity = value;
    }
    get provider() {
        return this._provider;
    }
    set provider(value) {
        this._provider = value;
    }
    get gps_tracking_id() {
        return this._gps_tracking_id;
    }
    set gps_tracking_id(value) {
        this._gps_tracking_id = value;
    }
    get documents() {
        return this._documents;
    }
    set documents(value) {
        this._documents = value;
    }
    get dc_uuid() {
        return this._dc_uuid;
    }
    set dc_uuid(value) {
        this._dc_uuid = value;
    }
    get dc_name() {
        return this._dc_name;
    }
    set dc_name(value) {
        this._dc_name = value;
    }
    get color_code() {
        return this._color_code;
    }
    set color_code(value) {
        this._color_code = value;
    }
}
exports.default = vans;
