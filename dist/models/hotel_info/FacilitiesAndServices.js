"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FacilitiesAndServicesModel {
    static createFacilitiesAndServices(data) {
        let newFacilitiesAndServices = new FacilitiesAndServicesModel();
        newFacilitiesAndServices.facility_id = data.facility_id;
        newFacilitiesAndServices.hotel_id = data.hotel_id;
        newFacilitiesAndServices.hotel_checks = this.createHotelChecks(data.check_timings);
        newFacilitiesAndServices.internet = this.createInternetOptions(data.internet);
        newFacilitiesAndServices.parking = this.createParkingOptions(data.parking);
        newFacilitiesAndServices.pets_allowed = data.pets_allowed;
        newFacilitiesAndServices.languages_spoken = data.languages_spoken;
        let ArrayFields = new Array('activities', 'food_drink', 'pool_spa', 'transportation', 'frontdesk_services', 'common_areas', 'entertainment_family_services', 'cleaning_services', 'business_facilities', 'miscellaneous');
        Object.keys(ArrayFields).forEach(key => {
            console.log(data[ArrayFields[key]]);
            newFacilitiesAndServices[ArrayFields[key]] = FacilitiesAndServicesModel.createFieldDataObj(data[ArrayFields[key]]);
        });
        return newFacilitiesAndServices;
    }
    static createHotelChecks(data) {
        let newHotelChecks = new FacilitiesAndServicesModel();
        newHotelChecks.check_in = this.createHotelTimings(data.check_in);
        newHotelChecks.check_out = this.createHotelTimings(data.check_out);
        return newHotelChecks;
    }
    static createHotelTimings(data) {
        let newHotelTimings = new FacilitiesAndServicesModel();
        newHotelTimings.from = data.from;
        newHotelTimings.to = data.to;
        return newHotelTimings;
    }
    static createInternetOptions(data) {
        let newInternetOptions = new FacilitiesAndServicesModel();
        newInternetOptions.internet_to_guests = data.internet_to_guests;
        newInternetOptions.connection_type = data.connection_type;
        newInternetOptions.connection_location = this.createFieldDataObj(data.connection_location);
        return newInternetOptions;
    }
    static createParkingOptions(data) {
        let newParkingOptions = new FacilitiesAndServicesModel();
        newParkingOptions.parking_to_guests = data.parking_to_guests;
        newParkingOptions.parking_guest_reservation = data.parking_guest_reservation;
        newParkingOptions.parking_facilities = this.createFieldDataObj(data.parking_facilities);
        return newParkingOptions;
    }
    static createFieldDataObj(data) {
        let NewFieldDataArray = new Array();
        Object.keys(data).forEach(key => {
            let newFieldDataObj = new FacilitiesAndServicesModel();
            newFieldDataObj.parent_id = data[key].parent_id;
            newFieldDataObj.image_fids = data[key].image_fids;
            newFieldDataObj.dropdown = data[key].dropdown;
            NewFieldDataArray.push(newFieldDataObj);
        });
        return NewFieldDataArray;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get facility_id() {
        return this._facility_id;
    }
    set facility_id(value) {
        this._facility_id = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get from() {
        return this._from;
    }
    set from(value) {
        this._from = value;
    }
    get to() {
        return this._to;
    }
    set to(value) {
        this._to = value;
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
    get hotel_checks() {
        return this._hotel_checks;
    }
    set hotel_checks(value) {
        this._hotel_checks = value;
    }
    get internet_to_guests() {
        return this._internet_to_guests;
    }
    set internet_to_guests(value) {
        this._internet_to_guests = value;
    }
    get connection_type() {
        return this._connection_type;
    }
    set connection_type(value) {
        this._connection_type = value;
    }
    get connection_location() {
        return this._connection_location;
    }
    set connection_location(value) {
        this._connection_location = value;
    }
    get internet() {
        return this._internet;
    }
    set internet(value) {
        this._internet = value;
    }
    get parking_to_guests() {
        return this._parking_to_guests;
    }
    set parking_to_guests(value) {
        this._parking_to_guests = value;
    }
    get parking_guest_reservation() {
        return this._parking_guests_reservation;
    }
    set parking_guest_reservation(value) {
        this._parking_guests_reservation = value;
    }
    get parking_facilities() {
        return this._parking_facilities;
    }
    set parking_facilities(value) {
        this._parking_facilities = value;
    }
    get parking() {
        return this._parking;
    }
    set parking(value) {
        this._parking = value;
    }
    get pets_allowed() {
        return this._pets_allowed;
    }
    set pets_allowed(value) {
        this._pets_allowed = value;
    }
    get languages_spoken() {
        return this._languages_spoken;
    }
    set languages_spoken(value) {
        this._languages_spoken = value;
    }
    get activities() {
        return this._activities;
    }
    set activities(value) {
        this._activities = value;
    }
    get food_drink() {
        return this._food_drink;
    }
    set food_drink(value) {
        this._food_drink = value;
    }
    get pool_spa() {
        return this._pool_spa;
    }
    set pool_spa(value) {
        this._pool_spa = value;
    }
    get transportation() {
        return this._transportation;
    }
    set transportation(value) {
        this._transportation = value;
    }
    get frontdesk_services() {
        return this._frontdesk_services;
    }
    set frontdesk_services(value) {
        this._frontdesk_services = value;
    }
    get common_areas() {
        return this._common_areas;
    }
    set common_areas(value) {
        this._common_areas = value;
    }
    get entertainment_family_services() {
        return this._entertainment_family_services;
    }
    set entertainment_family_services(value) {
        this._entertainment_family_services = value;
    }
    get cleaning_services() {
        return this._cleaning_services;
    }
    set cleaning_services(value) {
        this._cleaning_services = value;
    }
    get business_facilities() {
        return this._business_facilities;
    }
    set business_facilities(value) {
        this._business_facilities = value;
    }
    get miscellaneous() {
        return this._miscellaneous;
    }
    set miscellaneous(value) {
        this._miscellaneous = value;
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
}
exports.default = FacilitiesAndServicesModel;
