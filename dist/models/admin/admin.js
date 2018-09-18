"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Admin {
    static create(data) {
        let newTax = new Admin();
        newTax.tax_id = data.tax_id;
        newTax.tax_level = data.tax_level;
        newTax.hotel_id = data.hotel_id;
        newTax.name = data.name;
        newTax.country = data.country;
        newTax.state = data.state;
        newTax.city = data.city;
        newTax.type = data.type;
        newTax.tax_value = data.tax_value;
        newTax.status = data.status;
        newTax.created_on = data.created_on;
        newTax.applicable_level = data.applicable_level;
        newTax.calculation_type = data.calculation_type;
        newTax.based_on = data.based_on;
        newTax.add_on = data.add_on;
        return newTax;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get tax_level() {
        return this._tax_level;
    }
    set tax_level(value) {
        this._tax_level = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get tax_id() {
        return this._tax_id;
    }
    set tax_id(value) {
        this._tax_id = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get calculation_type() {
        return this._calculation_type;
    }
    set calculation_type(value) {
        this._calculation_type = value;
    }
    get based_on() {
        return this._based_on;
    }
    set based_on(value) {
        this._based_on = value;
    }
    get add_on() {
        return this._add_on;
    }
    set add_on(value) {
        this._add_on = value;
    }
    get applicable_level() {
        return this._applicable_level;
    }
    set applicable_level(value) {
        this._applicable_level = value;
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    get country() {
        return this._country;
    }
    set country(value) {
        this._country = value;
    }
    get city() {
        return this._city;
    }
    set city(value) {
        this._city = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get taxt_value() {
        return this._tax_value;
    }
    set tax_value(value) {
        this._tax_value = value;
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
}
exports.default = Admin;
