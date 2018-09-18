"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NewsLetter {
    static create(data) {
        let newNewsLetter = new NewsLetter();
        newNewsLetter.first_name = data.first_name;
        newNewsLetter.last_name = data.last_name;
        newNewsLetter.email = data.email;
        return newNewsLetter;
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
}
exports.default = NewsLetter;
