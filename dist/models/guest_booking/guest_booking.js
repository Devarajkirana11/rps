"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuestBookingModel {
    static GuestBookingCreate(data) {
        let newGuestBookingDetails = new GuestBookingModel();
        newGuestBookingDetails.salutation = data.salutation;
        newGuestBookingDetails.firstname = data.firstname;
        newGuestBookingDetails.lastname = data.lastname;
        newGuestBookingDetails.mobileno_stdcode = data.mobileno_stdcode;
        newGuestBookingDetails.mobileno = data.mobileno;
        newGuestBookingDetails.email = data.email;
        newGuestBookingDetails.nationality = data.nationality;
        newGuestBookingDetails.reason_to_stay = data.reason_to_stay;
        newGuestBookingDetails.Booking_id = data.booking_id;
        newGuestBookingDetails.guest_id = data.guest_id;
        newGuestBookingDetails.additional_identification = data.additional_identification;
        newGuestBookingDetails.additional_identification_number = data.additional_identification_number;
        return newGuestBookingDetails;
    }
    static BookingCreate(data) {
        let newGuestBookingDetails = new GuestBookingModel();
        newGuestBookingDetails.salutation = data.salutation;
        newGuestBookingDetails.firstname = data.firstname;
        newGuestBookingDetails.lastname = data.lastname;
        newGuestBookingDetails.gender = data.gender;
        newGuestBookingDetails.mobileno_stdcode = data.mobileno_stdcode;
        newGuestBookingDetails.mobileno = data.mobileno;
        newGuestBookingDetails.phoneno_stdcode = data.phoneno_stdcode;
        newGuestBookingDetails.phoneno = data.phoneno;
        newGuestBookingDetails.email = data.email;
        newGuestBookingDetails.nationality = data.nationality;
        newGuestBookingDetails.country = data.country;
        newGuestBookingDetails.state = data.state;
        newGuestBookingDetails.city = data.city;
        newGuestBookingDetails.address = data.address;
        newGuestBookingDetails.address2 = data.address2;
        newGuestBookingDetails.postal_code = data.postal_code;
        newGuestBookingDetails.reason_to_stay = data.reason_to_stay;
        newGuestBookingDetails.Booking_id = data.booking_id;
        newGuestBookingDetails.guest_id = data.guest_id;
        newGuestBookingDetails.identification_type = data.identification_type;
        newGuestBookingDetails.additional_identification = data.additional_identification;
        newGuestBookingDetails.additional_identification_number = data.additional_identification_number;
        newGuestBookingDetails.identification_doc = data.identification_doc;
        newGuestBookingDetails.ic_number = data.ic_number;
        newGuestBookingDetails.reason_to_stay = data.reason_to_stay;
        newGuestBookingDetails.company_information = data.company_information;
        newGuestBookingDetails.company_name = data.company_name;
        newGuestBookingDetails.company_address = data.company_address;
        newGuestBookingDetails.company_telephone = data.company_telephone;
        newGuestBookingDetails.company_taxid = data.company_taxid;
        newGuestBookingDetails.company_fax = data.company_fax;
        return newGuestBookingDetails;
    }
    get salutation() {
        return this._salutation;
    }
    set salutation(value) {
        this._salutation = value;
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
    get gender() {
        return this._gender;
    }
    set gender(value) {
        this._gender = value;
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
    get phoneno_stdcode() {
        return this._phoneno_stdcode;
    }
    set phoneno_stdcode(value) {
        this._phoneno_stdcode = value;
    }
    get phoneno() {
        return this._phoneno;
    }
    set phoneno(value) {
        this._phoneno = value;
    }
    get email() {
        return this._email;
    }
    set email(value) {
        this._email = value;
    }
    get nationality() {
        return this._nationality;
    }
    set nationality(value) {
        this._nationality = value;
    }
    get country() {
        return this._country;
    }
    set country(value) {
        this._country = value;
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    get city() {
        return this._city;
    }
    set city(value) {
        this._city = value;
    }
    get address() {
        return this._address;
    }
    set address(value) {
        this._address = value;
    }
    get address2() {
        return this._address2;
    }
    set address2(value) {
        this._address2 = value;
    }
    get postal_code() {
        return this._postal_code;
    }
    set postal_code(value) {
        this._postal_code = value;
    }
    get reason_to_stay() {
        return this._reason_to_stay;
    }
    set reason_to_stay(value) {
        this._reason_to_stay = value;
    }
    get Booking_id() {
        return this._booking_id;
    }
    set Booking_id(value) {
        this._booking_id = value;
    }
    get guest_id() {
        return this._guest_id;
    }
    set guest_id(value) {
        this._guest_id = value;
    }
    get additional_identification() {
        return this._additional_identification;
    }
    set additional_identification(value) {
        this._additional_identification = value;
    }
    get additional_identification_number() {
        return this._additional_identification_number;
    }
    set additional_identification_number(value) {
        this._additional_identification_number = value;
    }
    get identification_type() {
        return this._identification_type;
    }
    set identification_type(value) {
        this._identification_type = value;
    }
    get identification_doc() {
        return this._identification_doc;
    }
    set identification_doc(value) {
        this._identification_doc = value;
    }
    get ic_number() {
        return this._ic_number;
    }
    set ic_number(value) {
        this._ic_number = value;
    }
    get company_information() {
        return this._company_information;
    }
    set company_information(value) {
        this._company_information = value;
    }
    get company_name() {
        return this._company_name;
    }
    set company_name(value) {
        this._company_name = value;
    }
    get company_address() {
        return this._company_address;
    }
    set company_address(value) {
        this._company_address = value;
    }
    get company_telephone() {
        return this._company_telephone;
    }
    set company_telephone(value) {
        this._company_telephone = value;
    }
    get company_taxid() {
        return this._company_taxid;
    }
    set company_taxid(value) {
        this._company_taxid = value;
    }
    get company_fax() {
        return this._company_fax;
    }
    set company_fax(value) {
        this._company_fax = value;
    }
}
exports.default = GuestBookingModel;
