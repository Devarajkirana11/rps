"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HotelLandmarksModel {
    static create(data) {
        let newHotelLandmarks = new HotelLandmarksModel();
        newHotelLandmarks.hotel_id = data.hotel_id;
        newHotelLandmarks.landmark_id = data.landmark_id;
        newHotelLandmarks.distance = data.distance;
        return newHotelLandmarks;
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
    get landmark_id() {
        return this._landmark_id;
    }
    set landmark_id(value) {
        this._landmark_id = value;
    }
    get distance() {
        return this._distance;
    }
    set distance(value) {
        this._distance = value;
    }
}
exports.default = HotelLandmarksModel;
