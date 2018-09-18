"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
class orders {
    static createOrder(data) {
        let newOrder = new orders();
        newOrder.uuid = identification_1.default.generateUuid;
        newOrder.order_id = data.order_id;
        newOrder.address_1 = data.address_1;
        newOrder.address_2 = data.address_2;
        newOrder.city = data.city;
        newOrder.pin_code = data.pin_code;
        newOrder.mobile = data.mobile;
        newOrder.store = data.store;
        newOrder.order_total = data.order_total;
        newOrder.payment_method = data.payment_method;
        newOrder.customer_name = data.customer_name;
        newOrder.delivery_charge = data.delivery_charge;
        newOrder.delivery_date = data.delivery_date;
        newOrder.slot = data.slot;
        newOrder.latitude = data.latitude;
        newOrder.longitude = data.longitude;
        newOrder.dc_name = data.dc_name;
        newOrder.weight = data.weight;
        newOrder.van_uuid = data.van_uuid;
        newOrder.color_code = data.color_code;
        newOrder.status = data.status;
        newOrder.created_on = data.created_on;
        newOrder.updated_on = data.updated_on;
        return newOrder;
    }
    get document() {
        return {
            uuid: this.uuid,
            order_id: this.order_id,
            address_1: this.address_1,
            address_2: this.address_2,
            city: this.city,
            pin_code: this.pin_code,
            mobile: this.mobile,
            store: this.store,
            order_total: this.order_total,
            payment_method: this.payment_method,
            customer_name: this.customer_name,
            delivery_charge: this.delivery_charge,
            delivery_date: this.delivery_date,
            slot: this.slot,
            latitude: this.latitude,
            longitude: this.longitude,
            dc_name: this.dc_name,
            weight: this.weight,
            van_uuid: this.van_uuid,
            color_code: this.color_code,
            status: this.status,
            created_on: this.created_on,
            updated_on: this.updated_on
        };
    }
    get order_id() {
        return this._order_id;
    }
    set order_id(value) {
        this._order_id = value;
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
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
    get delivery_date() {
        return this._delivery_date;
    }
    set delivery_date(value) {
        this._delivery_date = value;
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
    get dc_name() {
        return this._dc_name;
    }
    set dc_name(value) {
        this._dc_name = value;
    }
    get slot() {
        return this._slot;
    }
    set slot(value) {
        this._slot = value;
    }
    get mobile() {
        return this._mobile;
    }
    set mobile(value) {
        this._mobile = value;
    }
    get store() {
        return this._store;
    }
    set store(value) {
        this._store = value;
    }
    get order_total() {
        return this._order_total;
    }
    set order_total(value) {
        this._order_total = value;
    }
    get payment_method() {
        return this._payment_method;
    }
    set payment_method(value) {
        this._payment_method = value;
    }
    get customer_name() {
        return this._customer_name;
    }
    set customer_name(value) {
        this._customer_name = value;
    }
    get address_1() {
        return this._address_1;
    }
    set address_1(value) {
        this._address_1 = value;
    }
    get address_2() {
        return this._address_2;
    }
    set address_2(value) {
        this._address_2 = value;
    }
    get city() {
        return this._city;
    }
    set city(value) {
        this._city = value;
    }
    get pin_code() {
        return this._pin_code;
    }
    set pin_code(value) {
        this._pin_code = value;
    }
    get delivery_charge() {
        return this._delivery_charge;
    }
    set delivery_charge(value) {
        this._delivery_charge = value;
    }
    get weight() {
        return this._weight;
    }
    set weight(value) {
        this._weight = value;
    }
    get van_uuid() {
        return this._van_uuid;
    }
    set van_uuid(value) {
        this._van_uuid = value;
    }
    get color_code() {
        return this._color_code;
    }
    set color_code(value) {
        this._color_code = value;
    }
}
exports.default = orders;
