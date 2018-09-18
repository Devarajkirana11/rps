"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FlexiModel {
    static createFlexi(data) {
        let flexi = new FlexiModel();
        flexi.flexi_id = data.flexi_id;
        flexi.hotel_id = data.hotel_id;
        flexi.flexi_allowed = data.flexi_allowed;
        flexi.last_checkin_time = data.last_checkin_time;
        flexi.price_mark_up = data.price_mark_up;
        flexi.occupancy_level = this.occupancy(data.occupancy_level);
        return flexi;
    }
    static occupancy(data) {
        let flexi = new Array();
        if (data.constructor === Array) {
            if (data.length > 0) {
                data.forEach(occupancy => {
                    let flexiObj = new FlexiModel();
                    flexiObj.room_type = occupancy.room_type;
                    flexiObj.occupancy_percentage = occupancy.occupancy_percentage;
                    flexi.push(flexiObj);
                });
            }
        }
        return flexi;
    }
    get last_checkin_time() {
        return this._last_checkin_time;
    }
    set last_checkin_time(value) {
        this._last_checkin_time = value;
    }
    get flexi_id() {
        return this._flexi_id;
    }
    set flexi_id(value) {
        this._flexi_id = value;
    }
    get occupancy_level() {
        return this._occupancy_level;
    }
    set occupancy_level(value) {
        this._occupancy_level = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get room_type() {
        return this._room_type;
    }
    set room_type(value) {
        this._room_type = value;
    }
    get occupancy_percentage() {
        return this._occupancy_percentage;
    }
    set occupancy_percentage(value) {
        this._occupancy_percentage = value;
    }
    get flexi_allowed() {
        return this._flexi_allowed;
    }
    set flexi_allowed(value) {
        this._flexi_allowed = value;
    }
    get price_mark_up() {
        return this._price_mark_up;
    }
    set price_mark_up(value) {
        this._price_mark_up = value;
    }
}
exports.default = FlexiModel;
