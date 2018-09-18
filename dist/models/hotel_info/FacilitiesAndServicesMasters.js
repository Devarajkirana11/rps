"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FacilitiesAndServicesMastersModel {
    static createHotelCheckTimings(data) {
        let newHotelCheckTimings = new FacilitiesAndServicesMastersModel();
        newHotelCheckTimings.hotel_checks = this.createDropDown(data.hotel_checks);
        return newHotelCheckTimings;
    }
    static createAvailability(data) {
        let newavailability = new FacilitiesAndServicesMastersModel();
        newavailability.availability = this.createDropDown(data.availability);
        return newavailability;
    }
    static createSecurityTypes(data) {
        let newsecuritytypes = new FacilitiesAndServicesMastersModel();
        newsecuritytypes.securitytypes = this.createDropDown(data.security_types);
        return newsecuritytypes;
    }
    static createBoardingTypes(data) {
        let newboardingtypes = new FacilitiesAndServicesMastersModel();
        newboardingtypes.boardingtypes = this.createDropDown(data.boarding_types);
        return newboardingtypes;
    }
    static createFacilitiesOfCharge(data) {
        let newfacilitiesOfcharge = new FacilitiesAndServicesMastersModel();
        newfacilitiesOfcharge.facilitiesOfcharge = this.createDropDown(data.facilitiesOfcharge);
        return newfacilitiesOfcharge;
    }
    static createInternetConnectionTypes(data) {
        let newinternetconnectiontypes = new FacilitiesAndServicesMastersModel();
        newinternetconnectiontypes.internetconnectiontypes = this.createDropDown(data.internetconnectiontypes);
        return newinternetconnectiontypes;
    }
    static createInternetConnectionLocations(data) {
        let newinternetConnectionLocation = new FacilitiesAndServicesMastersModel();
        newinternetConnectionLocation.internet_locations = this.CreateKeyValuePair(data.internet_locations);
        return newinternetConnectionLocation;
    }
    static createReservation(data) {
        let newreservation = new FacilitiesAndServicesMastersModel();
        newreservation.reservation = this.createDropDown(data.reservation);
        return newreservation;
    }
    static createParkingTypes(data) {
        let newparking_types = new FacilitiesAndServicesMastersModel();
        newparking_types.parking_types = this.CreateKeyValuePair(data.parking_types);
        return newparking_types;
    }
    static createPetsAllowed(data) {
        let newPets_allowed = new FacilitiesAndServicesMastersModel();
        newPets_allowed.pets_allowed = this.createDropDown(data.pets_allowed);
        return newPets_allowed;
    }
    static createLanguagesSpoken(data) {
        let newLanguagesSpoken = new FacilitiesAndServicesMastersModel();
        newLanguagesSpoken.Languages_Spoken = this.createDropDown(data.languages_spoken);
        return newLanguagesSpoken;
    }
    static createFacilityActivities(data) {
        let newFacilityActivities = new FacilitiesAndServicesMastersModel();
        newFacilityActivities.Activities = this.CreateKeyValuePair(data.activities);
        return newFacilityActivities;
    }
    static createFoodAndDrink(data) {
        let newFoodAndDrink = new FacilitiesAndServicesMastersModel();
        newFoodAndDrink.Food_Drink = this.CreateKeyValuePair(data.food_drink);
        return newFoodAndDrink;
    }
    static createPoolSpa(data) {
        let newPoolSpa = new FacilitiesAndServicesMastersModel();
        newPoolSpa.Pool_Spa = this.CreateKeyValuePair(data.pool_spa);
        return newPoolSpa;
    }
    static createTransportation(data) {
        let newTransportation = new FacilitiesAndServicesMastersModel();
        newTransportation.Transportation = this.CreateKeyValuePair(data.transportation);
        return newTransportation;
    }
    static createFrontDeskServices(data) {
        let newFrontDeskServices = new FacilitiesAndServicesMastersModel();
        newFrontDeskServices.FrontDesk_Services = this.CreateKeyValuePair(data.frontdesk_services);
        return newFrontDeskServices;
    }
    static createCommonAreas(data) {
        let newCommonAreas = new FacilitiesAndServicesMastersModel();
        newCommonAreas.Common_Areas = this.CreateKeyValuePair(data.common_areas);
        return newCommonAreas;
    }
    static createEntertainmentFamilyServices(data) {
        let newEntertainmentFamilyServices = new FacilitiesAndServicesMastersModel();
        newEntertainmentFamilyServices.Entertainment_Family_Services = this.CreateKeyValuePair(data.entertainment_family_services);
        return newEntertainmentFamilyServices;
    }
    static createCleaningServices(data) {
        let newCleaningServices = new FacilitiesAndServicesMastersModel();
        newCleaningServices.Cleaning_Services = this.CreateKeyValuePair(data.cleaning_services);
        return newCleaningServices;
    }
    static createBusinessFacilities(data) {
        let newBusinessFacilities = new FacilitiesAndServicesMastersModel();
        newBusinessFacilities.Business_Facilities = this.CreateKeyValuePair(data.business_facilities);
        return newBusinessFacilities;
    }
    static createMiscellaneous(data) {
        let newMiscellaneous = new FacilitiesAndServicesMastersModel();
        newMiscellaneous.Miscellaneous = this.CreateKeyValuePair(data.miscellaneous);
        return newMiscellaneous;
    }
    static CreateKeyValuePair(data) {
        let outputarray = new Array();
        Object.keys(data).forEach(key => {
            let newKeyValuePair = new FacilitiesAndServicesMastersModel();
            newKeyValuePair.text = data[key].text;
            newKeyValuePair.value = data[key].value;
            newKeyValuePair.imageExists = data[key].imageExists;
            newKeyValuePair.dropdownExists = data[key].dropdownExists;
            outputarray.push(newKeyValuePair);
        });
        return outputarray;
    }
    static createDropDown(data) {
        let dropdown = new Array();
        Object.keys(data).forEach(key => {
            let newdropdownrow = new FacilitiesAndServicesMastersModel();
            newdropdownrow.value = data[key].value;
            newdropdownrow.text = data[key].text;
            dropdown.push(newdropdownrow);
        });
        return dropdown;
    }
    get hotel_checks() {
        return this._hotel_checks;
    }
    set hotel_checks(value) {
        this._hotel_checks = value;
    }
    get availability() {
        return this._availability;
    }
    set availability(value) {
        this._availability = value;
    }
    get securitytypes() {
        return this._security_types;
    }
    set securitytypes(value) {
        this._security_types = value;
    }
    get boardingtypes() {
        return this._boarding_types;
    }
    set boardingtypes(value) {
        this._boarding_types = value;
    }
    get facilitiesOfcharge() {
        return this._facilitiesOfcharge;
    }
    set facilitiesOfcharge(value) {
        this._facilitiesOfcharge = value;
    }
    get internetconnectiontypes() {
        return this._internetconnectiontypes;
    }
    set internetconnectiontypes(value) {
        this._internetconnectiontypes = value;
    }
    get internet_locations() {
        return this._internet_locations;
    }
    set internet_locations(value) {
        this._internet_locations = value;
    }
    get reservation() {
        return this._reservation;
    }
    set reservation(value) {
        this._reservation = value;
    }
    get parking_types() {
        return this._parking_types;
    }
    set parking_types(value) {
        this._parking_types = value;
    }
    get pets_allowed() {
        return this._pets_allowed;
    }
    set pets_allowed(value) {
        this._pets_allowed = value;
    }
    get Languages_Spoken() {
        return this._languages_spoken;
    }
    set Languages_Spoken(value) {
        this._languages_spoken = value;
    }
    get Activities() {
        return this._activities;
    }
    set Activities(value) {
        this._activities = value;
    }
    get Food_Drink() {
        return this._food_drink;
    }
    set Food_Drink(value) {
        this._food_drink = value;
    }
    get Pool_Spa() {
        return this._pool_spa;
    }
    set Pool_Spa(value) {
        this._pool_spa = value;
    }
    get Transportation() {
        return this._transportation;
    }
    set Transportation(value) {
        this._transportation = value;
    }
    get FrontDesk_Services() {
        return this._frontdesk_services;
    }
    set FrontDesk_Services(value) {
        this._frontdesk_services = value;
    }
    get Common_Areas() {
        return this._common_areas;
    }
    set Common_Areas(value) {
        this._common_areas = value;
    }
    get Entertainment_Family_Services() {
        return this._entertainment_family_services;
    }
    set Entertainment_Family_Services(value) {
        this._entertainment_family_services = value;
    }
    get Cleaning_Services() {
        return this._cleaning_services;
    }
    set Cleaning_Services(value) {
        this._cleaning_services = value;
    }
    get Business_Facilities() {
        return this._business_facilities;
    }
    set Business_Facilities(value) {
        this._business_facilities = value;
    }
    get Miscellaneous() {
        return this._miscellaneous;
    }
    set Miscellaneous(value) {
        this._miscellaneous = value;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    get imageExists() {
        return this._imageExists;
    }
    set imageExists(value) {
        this._imageExists = value;
    }
    get dropdownExists() {
        return this._dropdownExists;
    }
    set dropdownExists(value) {
        this._dropdownExists = value;
    }
}
exports.default = FacilitiesAndServicesMastersModel;
