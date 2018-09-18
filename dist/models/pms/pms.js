"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Pms {
    static bookingcreate(data) {
        let newBooking = new Pms();
        newBooking.booking_id = data.booking_id;
        newBooking.booking_channel = data.booking_channel;
        newBooking.check_in = data.check_in;
        newBooking.check_out = data.check_out;
        newBooking.day_use = data.day_use;
        newBooking.slots = data.slots;
        newBooking.adults = data.adults;
        newBooking.child = data.child;
        newBooking.no_of_rooms = data.no_of_rooms;
        newBooking.room_type = data.room_type;
        newBooking.room_no = data.room_no;
        newBooking.guest_email = data.guest_email;
        newBooking.guest_first_name = data.guest_first_name;
        newBooking.guest_last_name = data.guest_last_name;
        newBooking.guest_mobile_code = data.guest_mobile_code;
        newBooking.guest_mobile_number = data.guest_mobile_number;
        newBooking.guest_phone_code = data.guest_phone_code;
        newBooking.guest_phone_number = data.guest_phone_number;
        newBooking.guest_address = data.guest_address;
        newBooking.guest_address_2 = data.guest_address_2;
        newBooking.guest_postal_code = data.guest_postal_code;
        newBooking.guest_country = data.guest_country;
        newBooking.guest_state = data.guest_state;
        newBooking.guest_city = data.guest_city;
        newBooking.guest_ic_no = data.guest_ic_no;
        newBooking.guest_nationality = data.guest_nationality;
        newBooking.total_price = data.total_price;
        newBooking.amount_paid = data.amount_paid;
        newBooking.balance_amount = data.balance_amount;
        newBooking.discount = data.discount;
        newBooking.deposit = data.deposit;
        newBooking.status = data.status;
        newBooking.created_by = data.created_by;
        newBooking.created_on = data.created_on;
        newBooking.updated_on = data.updated_on;
        newBooking.updated_by = data.updated_by;
        return newBooking;
    }
    get booking_id() {
        return this._booking_id;
    }
    set booking_id(value) {
        this._booking_id = value;
    }
    get booking_channel() {
        return this._booking_channel;
    }
    set booking_channel(value) {
        this._booking_channel = value;
    }
    get check_in() {
        return this._check_in;
    }
    set check_in(value) {
        this._check_in = value;
    }
    get check_out() {
        return this._check_out;
    }
    set check_out(value) {
        this._check_out = value;
    }
    get day_use() {
        return this._day_use;
    }
    set day_use(value) {
        this._day_use = value;
    }
    get slots() {
        return this._slots;
    }
    set slots(value) {
        this._slots = value;
    }
    get adults() {
        return this._adults;
    }
    set adults(value) {
        this._adults = value;
    }
    get child() {
        return this._child;
    }
    set child(value) {
        this._child = value;
    }
    get no_of_rooms() {
        return this._no_of_rooms;
    }
    set no_of_rooms(value) {
        this._no_of_rooms = value;
    }
    get room_type() {
        return this._room_type;
    }
    set room_type(value) {
        this._room_type = value;
    }
    get room_no() {
        return this._room_no;
    }
    set room_no(value) {
        this._room_no = value;
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
    get deposit() {
        return this._deposit;
    }
    set deposit(value) {
        this._deposit = value;
    }
    get discount() {
        return this._discount;
    }
    set discount(value) {
        this._discount = value;
    }
    get total_price() {
        return this._total_price;
    }
    set total_price(value) {
        this._total_price = value;
    }
    get amount_paid() {
        return this._amount_paid;
    }
    set amount_paid(value) {
        this._amount_paid = value;
    }
    get balance_amount() {
        return this._balance_amount;
    }
    set balance_amount(value) {
        this._balance_amount = value;
    }
    get guest_first_name() {
        return this._guest_first_name;
    }
    set guest_first_name(value) {
        this._guest_first_name = value;
    }
    get guest_last_name() {
        return this._guest_last_name;
    }
    set guest_last_name(value) {
        this._guest_last_name = value;
    }
    get guest_email() {
        return this._guest_email;
    }
    set guest_email(value) {
        this._guest_email = value;
    }
    get guest_mobile_code() {
        return this._guest_mobile_code;
    }
    set guest_mobile_code(value) {
        this._guest_mobile_code = value;
    }
    get guest_mobile_number() {
        return this._guest_mobile_number;
    }
    set guest_mobile_number(value) {
        this._guest_mobile_number = value;
    }
    get guest_phone_code() {
        return this._guest_phone_code;
    }
    set guest_phone_code(value) {
        this._guest_phone_code = value;
    }
    get guest_phone_nunmber() {
        return this._guest_phone_number;
    }
    set guest_phone_number(value) {
        this._guest_phone_number = value;
    }
    get guest_address() {
        return this._guest_address;
    }
    set guest_address(value) {
        this._guest_address = value;
    }
    get guest_address_2() {
        return this._guest_address_2;
    }
    set guest_address_2(value) {
        this._guest_address_2 = value;
    }
    get guest_postal_code() {
        return this._guest_postal_code;
    }
    set guest_postal_code(value) {
        this._guest_postal_code = value;
    }
    get guest_country() {
        return this._guest_country;
    }
    set guest_country(value) {
        this._guest_country = value;
    }
    get guest_state() {
        return this._guest_state;
    }
    set guest_state(value) {
        this._guest_state = value;
    }
    get guest_city() {
        return this._guest_city;
    }
    set guest_city(value) {
        this._guest_city = value;
    }
    get guest_ic_no() {
        return this._guest_ic_no;
    }
    set guest_ic_no(value) {
        this._guest_ic_no = value;
    }
    get guest_nationality() {
        return this._guest_nationality;
    }
    set guest_nationality(value) {
        this._guest_nationality = value;
    }
    get created_by() {
        return this._created_by;
    }
    set created_by(value) {
        this._created_by = value;
    }
    get updated_by() {
        return this._updated_by;
    }
    set updated_by(value) {
        this._updated_by = value;
    }
    static create(data) {
        let newTax = new Pms();
        newTax.tax_id = data.tax_id;
        newTax.name = data.name;
        newTax.country = data.country;
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
}
exports.default = Pms;
