"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
const time_1 = require("../../helpers/time");
class Payment {
    updatePayment(data) {
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        this.bookinguuid = data.bookinguuid;
        this.hoteluuid = data.hoteluuid;
        this.paymentReferrenceId = data.paymentReferrenceId;
        this.transactionReferrenceId = data.transactionReferrenceId;
        this.booking_channel = data.booking_channel;
        this.channel_name = data.channel_name;
        this.totalRoomPrice = data.totalRoomPrice;
        this.discountType = data.discountType;
        this.discountValue = data.discountValue;
        this.discountAmount = data.discountAmount;
        this.priceAfterDiscount = data.priceAfterDiscount;
        this.serviceFee = data.serviceFee;
        this.tax = data.tax;
        this.tourismTax = data.tourismTax;
        this.tourismTaxIncluded = data.tourismTaxIncluded;
        this.depositAmount = data.depositAmount;
        this.depositIncluded = data.depositIncluded;
        this.totalAmountPaid = data.totalAmountPaid;
        this.remainingAmount = data.remainingAmount;
        this.refundAmount = data.refundAmount;
        this.cancellationFee = data.cancellationFee;
        this.modificationFee = data.modificationFee;
        this.totalAmount = data.totalAmount;
        this.paymentCurrency = data.paymentCurrency;
        this.paymentType = data.paymentType;
        this.paymentStatus = data.paymentStatus;
        this.transactionDetails = data.transactionDetails;
        this.depositDetails = data.depositDetails;
        this.tourismtaxDetails = data.tourismtaxDetails;
        this.updatedOn = currentMoment;
    }
    static paymentCreate(data) {
        let payment = new Payment();
        let currentMoment = (typeof data['manual_updated_on'] == 'undefined' ? time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate() : time_1.default.serverMomentInPattern(data['manual_updated_on'], 'DD-MM-YYYY HH:mm:ss').toDate());
        payment.uuid = identification_1.default.generateUuid;
        payment.bookinguuid = data.bookinguuid;
        payment.hoteluuid = data.hoteluuid;
        payment.paymentReferrenceId = data.paymentReferrenceId;
        payment.transactionReferrenceId = data.transactionReferrenceId;
        payment.booking_channel = data.booking_channel;
        payment.channel_name = data.channel_name;
        payment.totalRoomPrice = data.totalRoomPrice;
        payment.discountType = data.discountType;
        payment.discountValue = data.discountValue;
        payment.discountAmount = data.discountAmount;
        payment.priceAfterDiscount = data.priceAfterDiscount;
        payment.serviceFee = data.serviceFee;
        payment.tax = data.tax;
        payment.tourismTax = data.tourismTax;
        payment.tourismTaxIncluded = data.tourismTaxIncluded;
        payment.depositAmount = data.depositAmount;
        payment.depositIncluded = data.depositIncluded;
        payment.totalAmountPaid = data.totalAmountPaid;
        payment.remainingAmount = data.remainingAmount;
        payment.totalAmount = data.totalAmount;
        payment.paymentCurrency = data.paymentCurrency;
        payment.paymentType = data.paymentType;
        payment.paymentStatus = data.paymentStatus;
        payment.transactionDetails = data.transactionDetails;
        payment.depositDetails = data.depositDetails;
        payment.tourismtaxDetails = data.tourismtaxDetails;
        payment.bookedOn = currentMoment;
        payment.updatedOn = currentMoment;
        return payment;
    }
    static spawn(document) {
        let payment = new Payment();
        payment.uuid = document.uuid;
        payment.bookinguuid = document.bookinguuid;
        payment.hoteluuid = document.hoteluuid;
        payment.paymentReferrenceId = document.paymentReferrenceId;
        payment.transactionReferrenceId = document.transactionReferrenceId;
        payment.booking_channel = document.booking_channel;
        payment.channel_name = document.channel_name;
        payment.totalRoomPrice = document.totalRoomPrice;
        payment.discountType = document.discountType;
        payment.discountValue = document.discountValue;
        payment.discountAmount = document.discountAmount;
        payment.priceAfterDiscount = document.priceAfterDiscount;
        payment.serviceFee = document.serviceFee;
        payment.tax = document.tax;
        payment.tourismTax = document.tourismTax;
        payment.tourismTaxIncluded = document.tourismTaxIncluded;
        payment.depositAmount = document.depositAmount;
        payment.depositIncluded = document.depositIncluded;
        payment.totalAmountPaid = document.totalAmountPaid;
        payment.remainingAmount = document.remainingAmount;
        payment.refundAmount = document.refundAmount;
        payment.cancellationFee = document.cancellationFee;
        payment.modificationFee = document.modificationFee;
        payment.totalAmount = document.totalAmount;
        payment.paymentCurrency = document.paymentCurrency;
        payment.paymentType = document.paymentType;
        payment.paymentStatus = document.paymentStatus;
        payment.bookedOn = document.bookedOn;
        payment.updatedOn = document.updatedOn;
        return payment;
    }
    get document() {
        return {
            uuid: this.uuid,
            bookinguuid: this.bookinguuid,
            hoteluuid: this.hoteluuid,
            paymentReferrenceId: this.paymentReferrenceId,
            transactionReferrenceId: this.transactionReferrenceId,
            booking_channel: this.booking_channel,
            channel_name: this.channel_name,
            totalRoomPrice: this.totalRoomPrice,
            discountType: this.discountType,
            discountValue: this.discountValue,
            discountAmount: this.discountAmount,
            priceAfterDiscount: this.priceAfterDiscount,
            serviceFee: this.serviceFee,
            tax: this.tax,
            tourismTax: this.tourismTax,
            tourismTaxIncluded: this.tourismTaxIncluded,
            depositAmount: this.depositAmount,
            depositIncluded: this.depositIncluded,
            totalAmountPaid: this.totalAmountPaid,
            remainingAmount: this.remainingAmount,
            refundAmount: this.refundAmount,
            cancellationFee: this.cancellationFee,
            modificationFee: this.modificationFee,
            totalAmount: this.totalAmount,
            paymentCurrency: this.paymentCurrency,
            paymentType: this.paymentType,
            paymentStatus: this.paymentStatus,
            transactionDetails: this.transactionDetails,
            depositDetails: this.depositDetails,
            tourismtaxDetails: this.tourismtaxDetails,
            bookedOn: this.bookedOn,
            updatedOn: this.updatedOn
        };
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get bookinguuid() {
        return this._bookinguuid;
    }
    set bookinguuid(value) {
        this._bookinguuid = value;
    }
    get hoteluuid() {
        return this._hoteluuid;
    }
    set hoteluuid(value) {
        this._hoteluuid = value;
    }
    get paymentReferrenceId() {
        return this._paymentReferrenceId;
    }
    set paymentReferrenceId(value) {
        this._paymentReferrenceId = value;
    }
    get transactionReferrenceId() {
        return this._transactionReferrenceId;
    }
    set transactionReferrenceId(value) {
        this._transactionReferrenceId = value;
    }
    get booking_channel() {
        return this._booking_channel;
    }
    set booking_channel(value) {
        this._booking_channel = value;
    }
    get channel_name() {
        return this._channel_name;
    }
    set channel_name(value) {
        this._channel_name = value;
    }
    get totalRoomPrice() {
        return this._totalRoomPrice;
    }
    set totalRoomPrice(value) {
        this._totalRoomPrice = value;
    }
    get discountType() {
        return this._discountType;
    }
    set discountType(value) {
        this._discountType = value;
    }
    get discountValue() {
        return this._discountValue;
    }
    set discountValue(value) {
        this._discountValue = value;
    }
    get discountAmount() {
        return this._discountAmount;
    }
    set depositAmount(value) {
        this._depositAmount = value;
    }
    get depositAmount() {
        return this._depositAmount;
    }
    set depositIncluded(value) {
        this._depositIncluded = value;
    }
    get depositIncluded() {
        return this._depositIncluded;
    }
    set discountAmount(value) {
        this._discountAmount = value;
    }
    get priceAfterDiscount() {
        return this._priceAfterDiscount;
    }
    set priceAfterDiscount(value) {
        this._priceAfterDiscount = value;
    }
    get serviceFee() {
        return this._serviceFee;
    }
    set serviceFee(value) {
        this._serviceFee = value;
    }
    get tax() {
        return this._tax;
    }
    set tax(value) {
        this._tax = value;
    }
    get tourismTax() {
        return this._tourismTax;
    }
    set tourismTax(value) {
        this._tourismTax = value;
    }
    get tourismTaxIncluded() {
        return this._tourismTaxIncluded;
    }
    set tourismTaxIncluded(value) {
        this._tourismTaxIncluded = value;
    }
    get totalAmountPaid() {
        return this._totalAmountPaid;
    }
    set totalAmountPaid(value) {
        this._totalAmountPaid = value;
    }
    get remainingAmount() {
        return this._remainingAmount;
    }
    set remainingAmount(value) {
        this._remainingAmount = value;
    }
    get refundAmount() {
        return this._refundAmount;
    }
    set refundAmount(value) {
        this._refundAmount = value;
    }
    get cancellationFee() {
        return this._cancellationFee;
    }
    set cancellationFee(value) {
        this._cancellationFee = value;
    }
    get modificationFee() {
        return this._modificationFee;
    }
    set modificationFee(value) {
        this._modificationFee = value;
    }
    get totalAmount() {
        return this._totalAmount;
    }
    set totalAmount(value) {
        this._totalAmount = value;
    }
    get paymentCurrency() {
        return this._paymentCurrency;
    }
    set paymentCurrency(value) {
        this._paymentCurrency = value;
    }
    get paymentType() {
        return this._paymentType;
    }
    set paymentType(value) {
        this._paymentType = value;
    }
    get paymentStatus() {
        return this._paymentStatus;
    }
    set paymentStatus(value) {
        this._paymentStatus = value;
    }
    get bookedOn() {
        return this._bookedOn;
    }
    set bookedOn(value) {
        this._bookedOn = value;
    }
    get transactionDetails() {
        return this._transactionDetails;
    }
    set transactionDetails(value) {
        this._transactionDetails = value;
    }
    get depositDetails() {
        return this._depositDetails;
    }
    set depositDetails(value) {
        this._depositDetails = value;
    }
    get tourismtaxDetails() {
        return this._tourismtaxDetails;
    }
    set tourismtaxDetails(value) {
        this._tourismtaxDetails = value;
    }
    get updatedOn() {
        return this._updatedOn;
    }
    set updatedOn(value) {
        this._updatedOn = value;
    }
}
exports.default = Payment;
