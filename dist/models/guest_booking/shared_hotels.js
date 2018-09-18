"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SharedHotels {
    static create(data) {
        let newSharedDetails = new SharedHotels();
        newSharedDetails.user_id = data.user_id;
        newSharedDetails.hotel_id = data.hotel_id;
        newSharedDetails.share_url = data.share_url;
        newSharedDetails.share_type = data.share_type;
        newSharedDetails.link_opens = 0;
        return newSharedDetails;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get user_id() {
        return this._user_id;
    }
    set user_id(value) {
        this._user_id = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get share_url() {
        return this._share_url;
    }
    set share_url(value) {
        this._share_url = value;
    }
    get share_type() {
        return this._share_type;
    }
    set share_type(value) {
        this._share_type = value;
    }
    get link_opens() {
        return this._link_opens;
    }
    set link_opens(value) {
        this._link_opens = value;
    }
}
exports.default = SharedHotels;
