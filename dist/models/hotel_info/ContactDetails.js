"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContactDetailsModel {
    static ContactDetailsCreate(data) {
        let ownerDetailsModel = new Array();
        let managerDetailsModel = new Array();
        let frontdeskDetailsModel = new Array();
        let financeDetailsModel = new Array();
        data.OwnerContactDetails.forEach(ownerdata => {
            ownerDetailsModel.push(this.OwnerDetailsCreate(ownerdata));
        });
        data.ManagerContactDetails.forEach(managerdata => {
            managerDetailsModel.push(this.ManagerDetailsCreate(managerdata));
        });
        data.FrontDeskContactDetails.forEach(frontdeskdata => {
            frontdeskDetailsModel.push(this.FrontDeskDetailsCreate(frontdeskdata));
        });
        data.FinanceContactDetails.forEach(financedata => {
            financeDetailsModel.push(this.FinanceDetailsCreate(financedata));
        });
        let newContactDetails = new ContactDetailsModel();
        newContactDetails.contact_id = data.contact_id;
        newContactDetails.hotel_id = data.hotel_id;
        newContactDetails.OwnerContactDetails = ownerDetailsModel;
        newContactDetails.ManagerContactDetails = managerDetailsModel;
        newContactDetails.FrontDeskContactDetails = frontdeskDetailsModel;
        newContactDetails.FinanceContactDetails = financeDetailsModel;
        newContactDetails.FrontDeskSameAsFinance = data.FrontDeskSameAsFinance;
        return newContactDetails;
    }
    static OwnerDetailsCreate(data) {
        let newOwnerContactDetails = new ContactDetailsModel();
        newOwnerContactDetails.username = data.username;
        newOwnerContactDetails.contactname = data.contactname;
        newOwnerContactDetails.contactemail = data.contactemail;
        newOwnerContactDetails.countrycodel = data.countrycodel;
        newOwnerContactDetails.contactnumberl = data.contactnumberl;
        newOwnerContactDetails.countrycodem = data.countrycodem;
        newOwnerContactDetails.contactnumberm = data.contactnumberm;
        newOwnerContactDetails.country = data.country;
        newOwnerContactDetails.city = data.city;
        newOwnerContactDetails.address_line1 = data.address_line1;
        newOwnerContactDetails.address_line2 = data.address_line2;
        newOwnerContactDetails.state = data.state;
        newOwnerContactDetails.zipcode = data.zipcode;
        return newOwnerContactDetails;
    }
    static ManagerDetailsCreate(data) {
        let newManagerContactDetails = new ContactDetailsModel();
        newManagerContactDetails.firstname = data.firstname;
        newManagerContactDetails.lastname = data.lastname;
        newManagerContactDetails.landline_stdcode = data.landline_stdcode;
        newManagerContactDetails.landline_number = data.landline_number;
        newManagerContactDetails.mobileno_stdcode = data.mobileno_stdcode;
        newManagerContactDetails.mobileno = data.mobileno;
        newManagerContactDetails.email = data.email;
        return newManagerContactDetails;
    }
    static FrontDeskDetailsCreate(data) {
        let newFronDeskContactDetails = new ContactDetailsModel();
        newFronDeskContactDetails.firstname = data.firstname;
        newFronDeskContactDetails.lastname = data.lastname;
        newFronDeskContactDetails.landline_stdcode = data.landline_stdcode;
        newFronDeskContactDetails.landline_number = data.landline_number;
        newFronDeskContactDetails.mobileno_stdcode = data.mobileno_stdcode;
        newFronDeskContactDetails.mobileno = data.mobileno;
        newFronDeskContactDetails.email = data.email;
        return newFronDeskContactDetails;
    }
    static FinanceDetailsCreate(data) {
        let newFinanceContactDetails = new ContactDetailsModel();
        newFinanceContactDetails.firstname = data.firstname;
        newFinanceContactDetails.lastname = data.lastname;
        newFinanceContactDetails.landline_stdcode = data.landline_stdcode;
        newFinanceContactDetails.landline_number = data.landline_number;
        newFinanceContactDetails.mobileno_stdcode = data.mobileno_stdcode;
        newFinanceContactDetails.mobileno = data.mobileno;
        newFinanceContactDetails.email = data.email;
        return newFinanceContactDetails;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get contact_id() {
        return this._contact_id;
    }
    set contact_id(value) {
        this._contact_id = value;
    }
    get FrontDeskSameAsFinance() {
        return this._FrontDeskSameAsFinance;
    }
    set FrontDeskSameAsFinance(value) {
        this._FrontDeskSameAsFinance = value;
    }
    get username() {
        return this._username;
    }
    set username(value) {
        this._username = value;
    }
    get contactname() {
        return this._contactname;
    }
    set contactname(value) {
        this._contactname = value;
    }
    get contactemail() {
        return this._contactemail;
    }
    set contactemail(value) {
        this._contactemail = value;
    }
    get countrycodel() {
        return this._countrycodel;
    }
    set countrycodel(value) {
        this._countrycodel = value;
    }
    get contactnumberl() {
        return this._contactnumberl;
    }
    set contactnumberl(value) {
        this._contactnumberl = value;
    }
    get countrycodem() {
        return this._countrycodem;
    }
    set countrycodem(value) {
        this._countrycodem = value;
    }
    get contactnumberm() {
        return this._contactnumberm;
    }
    set contactnumberm(value) {
        this._contactnumberm = value;
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
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    get zipcode() {
        return this._zipcode;
    }
    set zipcode(value) {
        this._zipcode = value;
    }
    get firstname() {
        return this._firstname;
    }
    set firstname(value) {
        this._firstname = value;
    }
    get lastname() {
        return this._lastname;
    }
    set lastname(value) {
        this._lastname = value;
    }
    get landline_stdcode() {
        return this._landline_stdcode;
    }
    set landline_stdcode(value) {
        this._landline_stdcode = value;
    }
    get landline_number() {
        return this._landline_number;
    }
    set landline_number(value) {
        this._landline_number = value;
    }
    get mobileno_stdcode() {
        return this._mobileno_stdcode;
    }
    set mobileno_stdcode(value) {
        this._mobileno_stdcode = value;
    }
    get mobileno() {
        return this._mobileno;
    }
    set mobileno(value) {
        this._mobileno = value;
    }
    get email() {
        return this._email;
    }
    set email(value) {
        this._email = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get OwnerContactDetails() {
        return this._OwnerContactDetails;
    }
    set OwnerContactDetails(value) {
        this._OwnerContactDetails = value;
    }
    get ManagerContactDetails() {
        return this._ManagerContactDetails;
    }
    set ManagerContactDetails(value) {
        this._ManagerContactDetails = value;
    }
    get FrontDeskContactDetails() {
        return this._FrontDeskContactDetails;
    }
    set FrontDeskContactDetails(value) {
        this._FrontDeskContactDetails = value;
    }
    get FinanceContactDetails() {
        return this._FinanceContactDetails;
    }
    set FinanceContactDetails(value) {
        this._FinanceContactDetails = value;
    }
}
exports.default = ContactDetailsModel;
