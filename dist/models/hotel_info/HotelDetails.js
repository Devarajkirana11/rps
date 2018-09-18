"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HotelDetailsModel {
    static create(data) {
        let newHotelDetails = new HotelDetailsModel();
        newHotelDetails.nida_stay_name = data.nida_stay_name;
        newHotelDetails.country_id = data.country_id;
        newHotelDetails.city_id = data.city_id;
        newHotelDetails.state_id = data.state_id;
        newHotelDetails.locality_id = data.locality_id;
        newHotelDetails.actual_hotel_name = data.actual_hotel_name;
        newHotelDetails.zipcode = data.zipcode;
        newHotelDetails.latitude = data.latitude;
        newHotelDetails.longitude = data.longitude;
        return newHotelDetails;
    }
    static HotelDetailsCreate(data) {
        let newHotelDetails = new HotelDetailsModel();
        newHotelDetails.hotel_id = data.hotel_id;
        newHotelDetails.nida_stay_name = data.nida_stay_name;
        newHotelDetails.country_id = data.country_id;
        newHotelDetails.city_id = data.city_id;
        newHotelDetails.state_id = data.state_id;
        newHotelDetails.locality_id = data.locality_id;
        newHotelDetails.actual_hotel_name = data.actual_hotel_name;
        newHotelDetails.zipcode = data.zipcode;
        newHotelDetails.latitude = data.latitude;
        newHotelDetails.longitude = data.longitude;
        newHotelDetails.total_no_Of_rooms = data.total_no_Of_rooms;
        newHotelDetails.address_line1 = data.address_line1;
        newHotelDetails.address_line2 = data.address_line2;
        newHotelDetails.hotel_type = data.hotel_type;
        newHotelDetails.image_fids = data.image_fids;
        newHotelDetails.status = data.status;
        newHotelDetails.code = data.code;
        newHotelDetails.description = data.description;
        newHotelDetails.rating_snippet = data.rating_snippet;
        newHotelDetails.rating_link = data.rating_link;
        newHotelDetails.custom_rating_image = data.custom_rating_image;
        newHotelDetails.custom_rating_link = data.custom_rating_link;
        newHotelDetails.ota_hotel_code = data.ota_hotel_code;
        newHotelDetails.ota_username = data.ota_username;
        newHotelDetails.ota_password = data.ota_password;
        newHotelDetails.deposit_amount = data.deposit_amount;
        return newHotelDetails;
    }
    get deposit_amount() {
        return this._deposit_amount;
    }
    set deposit_amount(value) {
        this._deposit_amount = value;
    }
    get ota_hotel_code() {
        return this._ota_hotel_code;
    }
    set ota_hotel_code(value) {
        this._ota_hotel_code = value;
    }
    get ota_username() {
        return this._ota_username;
    }
    set ota_username(value) {
        this._ota_username = value;
    }
    get ota_password() {
        return this._ota_password;
    }
    set ota_password(value) {
        this._ota_password = value;
    }
    get custom_rating_image() {
        return this._custom_rating_image;
    }
    set custom_rating_image(value) {
        this._custom_rating_image = value;
    }
    get custom_rating_link() {
        return this._custom_rating_link;
    }
    set custom_rating_link(value) {
        this._custom_rating_link = value;
    }
    get rating_link() {
        return this._rating_link;
    }
    set rating_link(value) {
        this._rating_link = value;
    }
    get rating_snippet() {
        return this._rating_snippet;
    }
    set rating_snippet(value) {
        this._rating_snippet = value;
    }
    get code() {
        return this._code;
    }
    set code(value) {
        this._code = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get nida_stay_name() {
        return this._nida_stay_name;
    }
    set nida_stay_name(value) {
        this._nida_stay_name = value;
    }
    get country_id() {
        return this._country_id;
    }
    set country_id(value) {
        this._country_id = value;
    }
    get city_id() {
        return this._city_id;
    }
    set city_id(value) {
        this._city_id = value;
    }
    get state_id() {
        return this._state_id;
    }
    set state_id(value) {
        this._state_id = value;
    }
    get locality_id() {
        return this._locality_id;
    }
    set locality_id(value) {
        this._locality_id = value;
    }
    get actual_hotel_name() {
        return this._actual_hotel_name;
    }
    set actual_hotel_name(value) {
        this._actual_hotel_name = value;
    }
    get zipcode() {
        return this._zipcode;
    }
    set zipcode(value) {
        this._zipcode = value;
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
    get total_no_Of_rooms() {
        return this._total_no_Of_rooms;
    }
    set total_no_Of_rooms(value) {
        this._total_no_Of_rooms = value;
    }
    get address_line1() {
        return this._address_line1;
    }
    set address_line1(value) {
        this._address_line1 = value;
    }
    get address_line2() {
        return this._address_line2;
    }
    set address_line2(value) {
        this._address_line2 = value;
    }
    get hotel_type() {
        return this._hotel_type;
    }
    set hotel_type(value) {
        this._hotel_type = value;
    }
    get image_fids() {
        return this._image_fids;
    }
    set image_fids(value) {
        this._image_fids = value;
    }
}
exports.default = HotelDetailsModel;
