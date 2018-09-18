"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../../helpers/time");
class Room {
    static create(hotelId, roomDataList, typeData, amenitiesData) {
        let roomList = new Array();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        roomDataList.forEach(roomData => {
            let newRoom = new Room();
            newRoom.room_id = roomData.room_id;
            newRoom.number = roomData.number;
            newRoom.floorNumber = roomData.floorNumber;
            newRoom.hotelId = hotelId;
            newRoom.type = typeData;
            newRoom.amenities = amenitiesData;
            newRoom.createdAt = currentMoment;
            newRoom.updatedAt = currentMoment;
            newRoom.isAvailable = false;
            newRoom.description = '';
            newRoom.virtualRoom = roomData.virtualRoom;
            roomList.push(newRoom);
        });
        return roomList;
    }
    static update(hotelId, roomDataList, typeData, amenitiesData, room_ops_types) {
        let roomList = new Array();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        roomDataList.forEach((roomData, index) => {
            let newRoom = new Room();
            newRoom.room_id = roomData.room_id;
            newRoom.number = roomData.number;
            newRoom.floorNumber = roomData.floorNumber;
            newRoom.hotelId = hotelId;
            newRoom.type = typeData;
            newRoom.amenities = amenitiesData;
            if (room_ops_types[index] == 'create') {
                newRoom.createdAt = currentMoment;
                newRoom.isAvailable = false;
            }
            newRoom.updatedAt = currentMoment;
            newRoom.description = '';
            newRoom.virtualRoom = roomData.virtualRoom;
            roomList.push(newRoom);
        });
        return roomList;
    }
    get room_id() {
        return this._room_id;
    }
    set room_id(value) {
        this._room_id = value;
    }
    get number() {
        return this._number;
    }
    set number(value) {
        this._number = value;
    }
    get floorNumber() {
        return this._floorNumber;
    }
    set floorNumber(value) {
        this._floorNumber = value;
    }
    get hotelId() {
        return this._hotelId;
    }
    set hotelId(value) {
        this._hotelId = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get amenities() {
        return this._amenities;
    }
    set amenities(value) {
        this._amenities = value;
    }
    get createdAt() {
        return this._createdAt;
    }
    set createdAt(value) {
        this._createdAt = value;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    set updatedAt(value) {
        this._updatedAt = value;
    }
    get isAvailable() {
        return this._isAvailable;
    }
    set isAvailable(value) {
        this._isAvailable = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get virtualRoom() {
        return this._virtualRoom;
    }
    set virtualRoom(value) {
        this._virtualRoom = value;
    }
}
exports.default = Room;
