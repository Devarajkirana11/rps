"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
class dc {
    static createdc(data) {
        let newdc = new dc();
        newdc.uuid = identification_1.default.generateUuid;
        newdc.name = data.name;
        newdc.address_1 = data.address_1;
        newdc.address_2 = data.address_2;
        newdc.area = data.area;
        newdc.city = data.city;
        newdc.state = data.state;
        newdc.pincode = data.pincode;
        newdc.latitude = data.latitude;
        newdc.longitude = data.longitude;
        newdc.status = data.status;
        newdc.created_on = data.created_on;
        newdc.updated_on = data.updated_on;
        return newdc;
    }
    get document() {
        return {
            uuid: this.uuid,
            name: this.name,
            address_1: this.address_1,
            address_2: this.address_2,
            area: this.area,
            city: this.city,
            state: this.state,
            pincode: this.pincode,
            latitude: this.latitude,
            longitude: this.longitude,
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
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get address_1() {
        return this._address_1;
    }
    set address_1(value) {
        this._address_1 = value;
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
    get address_2() {
        return this._address_2;
    }
    set address_2(value) {
        this._address_2 = value;
    }
    get area() {
        return this._area;
    }
    set area(value) {
        this._area = value;
    }
    get city() {
        return this._city;
    }
    set city(value) {
        this._city = value;
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    get latitude() {
        return this._latitude;
    }
    set latitude(value) {
        this._latitude = value;
    }
    get longitude() {
        return this._longitude;
    }
    set longitude(value) {
        this._longitude = value;
    }
    get pincode() {
        return this._pincode;
    }
    set pincode(value) {
        this._pincode = value;
    }
}
exports.default = dc;
