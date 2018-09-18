"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomAmenities {
    static create(amenitiesData) {
        let newRoomAmenities = new RoomAmenities();
        newRoomAmenities.room = this.createAmenity(amenitiesData.room);
        newRoomAmenities.bathroom = this.createAmenity(amenitiesData.bathroom);
        newRoomAmenities.mediaAndTechnology = this.createAmenity(amenitiesData.mediaAndTechnology);
        newRoomAmenities.foodAndDrink = this.createAmenity(amenitiesData.foodAndDrink);
        newRoomAmenities.servicesAndExtras = this.createAmenity(amenitiesData.servicesAndExtras);
        newRoomAmenities.outdoorAndView = this.createAmenity(amenitiesData.outdoorAndView);
        newRoomAmenities.accessibility = this.createAmenity(amenitiesData.accessibility);
        newRoomAmenities.entertainmentAndFamilyServices = this.createAmenity(amenitiesData.entertainmentAndFamilyServices);
        return newRoomAmenities;
    }
    static createAmenity(data) {
        let NewFieldDataArray = new Array();
        Object.keys(data).forEach(key => {
            let newFieldDataObj = new RoomAmenities();
            newFieldDataObj.parent_id = data[key].parent_id;
            newFieldDataObj.image_fids = data[key].image_fids;
            newFieldDataObj.description = data[key].description;
            newFieldDataObj.dropdown = data[key].dropdown;
            NewFieldDataArray.push(newFieldDataObj);
        });
        return NewFieldDataArray;
    }
    get room() {
        return this._room;
    }
    set room(value) {
        this._room = value;
    }
    get bathroom() {
        return this._bathroom;
    }
    set bathroom(value) {
        this._bathroom = value;
    }
    get mediaAndTechnology() {
        return this._mediaAndTechnology;
    }
    set mediaAndTechnology(value) {
        this._mediaAndTechnology = value;
    }
    get foodAndDrink() {
        return this._foodAndDrink;
    }
    set foodAndDrink(value) {
        this._foodAndDrink = value;
    }
    get servicesAndExtras() {
        return this._servicesAndExtras;
    }
    set servicesAndExtras(value) {
        this._servicesAndExtras = value;
    }
    get outdoorAndView() {
        return this._outdoorAndView;
    }
    set outdoorAndView(value) {
        this._outdoorAndView = value;
    }
    get accessibility() {
        return this._accessibility;
    }
    set accessibility(value) {
        this._accessibility = value;
    }
    get entertainmentAndFamilyServices() {
        return this._entertainmentAndFamilyServices;
    }
    set entertainmentAndFamilyServices(value) {
        this._entertainmentAndFamilyServices = value;
    }
    get parent_id() {
        return this._parent_id;
    }
    set parent_id(value) {
        this._parent_id = value;
    }
    get image_fids() {
        return this._image_fids;
    }
    set image_fids(value) {
        this._image_fids = value;
    }
    get dropdown() {
        return this._dropdown;
    }
    set dropdown(value) {
        this._dropdown = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
}
exports.default = RoomAmenities;
