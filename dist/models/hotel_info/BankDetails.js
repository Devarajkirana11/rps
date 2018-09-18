"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BankDetailsModel {
    static BankLegalCreate(data) {
        let newBankLegalDetails = new BankDetailsModel();
        let bankDetailsModel = new Array();
        let legalDetailsModel = new Array();
        data.bankdetails.forEach(bankdata => {
            bankDetailsModel.push(this.BankDetailsCreate(bankdata));
        });
        data.legaldetails.forEach(legaldata => {
            legalDetailsModel.push(this.LegalDetailsCreate(legaldata));
        });
        newBankLegalDetails.hotel_id = data.hotel_id;
        newBankLegalDetails.bank_id = data.bank_id;
        newBankLegalDetails.bankdetails = bankDetailsModel;
        newBankLegalDetails.legaldetails = legalDetailsModel;
        return newBankLegalDetails;
    }
    static BankDetailsCreate(data) {
        let newBankDetails = new BankDetailsModel();
        newBankDetails.bankname = data.bankname;
        newBankDetails.bankaddress = this.BankLegalAddressCreate(data.bankaddress);
        newBankDetails.bankbranch = data.bankbranch;
        newBankDetails.bankaccountnumber = data.bankaccountnumber;
        newBankDetails.bankcode = data.bankcode;
        newBankDetails.bankswiftcode = data.bankswiftcode;
        newBankDetails.accountholderfirstname = data.accountholderfirstname;
        newBankDetails.accountholderlastname = data.accountholderlastname;
        newBankDetails.accountholderaddress = this.BankLegalAddressCreate(data.accountholderaddress);
        newBankDetails.accountSameAsHotelAddress = data.accountSameAsHotelAddress;
        return newBankDetails;
    }
    static LegalDetailsCreate(data) {
        let newLegalDetails = new BankDetailsModel();
        newLegalDetails.servicetaxtype = data.servicetaxtype;
        newLegalDetails.servicetaxno = data.servicetaxno;
        newLegalDetails.registeredofficeaddress = this.BankLegalAddressCreate(data.registeredofficeaddress);
        newLegalDetails.certificatetype = data.certificatetype;
        newLegalDetails.certificateno = data.certificateno;
        newLegalDetails.legaldocument_fid = data.legaldocument_fid;
        newLegalDetails.legalSameAsHotelAddress = data.legalSameAsHotelAddress;
        return newLegalDetails;
    }
    static BankLegalAddressCreate(data) {
        let newBankLegalAddressDetails = new BankDetailsModel();
        newBankLegalAddressDetails.country = data.country;
        newBankLegalAddressDetails.state = data.state;
        newBankLegalAddressDetails.city = data.city;
        newBankLegalAddressDetails.zipcode = data.zipcode;
        newBankLegalAddressDetails.address_line1 = data.address_line1;
        newBankLegalAddressDetails.address_line2 = data.address_line2;
        return newBankLegalAddressDetails;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get bank_id() {
        return this._bank_id;
    }
    set bank_id(value) {
        this._bank_id = value;
    }
    get bankname() {
        return this._bankname;
    }
    set bankname(value) {
        this._bankname = value;
    }
    get bankaddress() {
        return this._bankaddress;
    }
    set bankaddress(value) {
        this._bankaddress = value;
    }
    get bankbranch() {
        return this._bankbranch;
    }
    set bankbranch(value) {
        this._bankbranch = value;
    }
    get bankaccountnumber() {
        return this._bankaccountnumber;
    }
    set bankaccountnumber(value) {
        this._bankaccountnumber = value;
    }
    get bankcode() {
        return this._bankcode;
    }
    set bankcode(value) {
        this._bankcode = value;
    }
    get bankbranchcode() {
        return this._bankbranchcode;
    }
    set bankbranchcode(value) {
        this._bankbranchcode = value;
    }
    get bankswiftcode() {
        return this._bankswiftcode;
    }
    set bankswiftcode(value) {
        this._bankswiftcode = value;
    }
    get accountholderfirstname() {
        return this._accountholderfirstname;
    }
    set accountholderfirstname(value) {
        this._accountholderfirstname = value;
    }
    get accountholderlastname() {
        return this._accountholderlastname;
    }
    set accountholderlastname(value) {
        this._accountholderlastname = value;
    }
    get accountholderaddress() {
        return this._accountholderaddress;
    }
    set accountholderaddress(value) {
        this._accountholderaddress = value;
    }
    get accountSameAsHotelAddress() {
        return this._accountSameAsHotelAddress;
    }
    set accountSameAsHotelAddress(value) {
        this._accountSameAsHotelAddress = value;
    }
    get servicetaxtype() {
        return this._servicetaxtype;
    }
    set servicetaxtype(value) {
        this._servicetaxtype = value;
    }
    get servicetaxno() {
        return this._servicetaxno;
    }
    set servicetaxno(value) {
        this._servicetaxno = value;
    }
    get registeredofficeaddress() {
        return this._registeredofficeaddress;
    }
    set registeredofficeaddress(value) {
        this._registeredofficeaddress = value;
    }
    get certificatetype() {
        return this._certificatetype;
    }
    set certificatetype(value) {
        this._certificatetype = value;
    }
    get certificateno() {
        return this._certificateno;
    }
    set certificateno(value) {
        this._certificateno = value;
    }
    get legaldocument_fid() {
        return this._legaldocument_fid;
    }
    set legaldocument_fid(value) {
        this._legaldocument_fid = value;
    }
    get legalSameAsHotelAddress() {
        return this._legalSameAsHotelAddress;
    }
    set legalSameAsHotelAddress(value) {
        this._legalSameAsHotelAddress = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get bankdetails() {
        return this._bankdetails;
    }
    set bankdetails(value) {
        this._bankdetails = value;
    }
    get legaldetails() {
        return this._legaldetails;
    }
    set legaldetails(value) {
        this._legaldetails = value;
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
}
exports.default = BankDetailsModel;
