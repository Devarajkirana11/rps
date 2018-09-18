"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContactUs {
    static create(data) {
        let newContactUs = new ContactUs();
        newContactUs.first_name = data.first_name;
        newContactUs.last_name = data.last_name;
        newContactUs.email = data.email;
        newContactUs.message = data.message;
        return newContactUs;
    }
    get first_name() {
        return this._first_name;
    }
    set first_name(value) {
        this._first_name = value;
    }
    get last_name() {
        return this._last_name;
    }
    set last_name(value) {
        this._last_name = value;
    }
    get email() {
        return this._email;
    }
    set email(value) {
        this._email = value;
    }
    get message() {
        return this._message;
    }
    set message(value) {
        this._message = value;
    }
}
exports.default = ContactUs;
