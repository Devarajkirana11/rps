"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomType {
    static create(typeData) {
        let newRoomType = new RoomType();
        newRoomType.type = typeData.type;
        newRoomType.name = typeData.name;
        newRoomType.no_of_rooms = typeData.no_of_rooms;
        newRoomType.measurementUnit = typeData.measurementUnit;
        newRoomType.size = typeData.size;
        newRoomType.description = '';
        newRoomType.smokingPolicy = typeData.smokingPolicy;
        newRoomType.bedStandardArrangement = typeData.bedStandardArrangement;
        newRoomType.bedAlternativeArrangement = typeData.bedAlternativeArrangement;
        newRoomType.no_of_guest_stay = typeData.no_of_guest_stay;
        newRoomType.no_of_bedrooms = typeData.no_of_bedrooms;
        newRoomType.image_fids = typeData.image_fids;
        return newRoomType;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get custom_name() {
        return this._custom_name;
    }
    set custom_name(value) {
        this._custom_name = value;
    }
    get no_of_rooms() {
        return this._no_of_rooms;
    }
    set no_of_rooms(value) {
        this._no_of_rooms = value;
    }
    get measurementUnit() {
        return this._measurementUnit;
    }
    set measurementUnit(value) {
        this._measurementUnit = value;
    }
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get smokingPolicy() {
        return this._smokingPolicy;
    }
    set smokingPolicy(value) {
        this._smokingPolicy = value;
    }
    get bedStandardArrangement() {
        return this._bedStandardArrangement;
    }
    set bedStandardArrangement(value) {
        this._bedStandardArrangement = value;
    }
    get bedAlternativeArrangement() {
        return this._bedAlternativeArrangement;
    }
    set bedAlternativeArrangement(value) {
        this._bedAlternativeArrangement = value;
    }
    get no_of_guest_stay() {
        return this._no_of_guest_stay;
    }
    set no_of_guest_stay(value) {
        this._no_of_guest_stay = value;
    }
    get no_of_bedrooms() {
        return this._no_of_bedrooms;
    }
    set no_of_bedrooms(value) {
        this._no_of_bedrooms = value;
    }
    get image_fids() {
        return this._image_fids;
    }
    set image_fids(value) {
        this._image_fids = value;
    }
}
exports.default = RoomType;
