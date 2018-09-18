"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
class CDE {
    static createCDE(data) {
        let newCDE = new CDE();
        newCDE.uuid = identification_1.default.generateUuid;
        newCDE.user_id = Math.floor(100000 + Math.random() * 900000);
        newCDE.first_name = data.first_name;
        newCDE.last_name = data.last_name;
        newCDE.email = data.email;
        newCDE.mobile = data.mobile;
        newCDE.age = data.age;
        newCDE.employee_id = data.employee_id;
        newCDE.joining_date = data.joining_date;
        newCDE.password = data.password;
        newCDE.status = data.status;
        newCDE.created_on = data.created_on;
        newCDE.roles = data.roles;
        newCDE.updated_on = data.updated_on;
        newCDE.last_access = data.last_access;
        return newCDE;
    }
    get document() {
        return {
            uuid: this.uuid,
            user_id: this.user_id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            mobile: this.mobile,
            age: this.age,
            employee_id: this.employee_id,
            joining_date: this.joining_date,
            password: this.password,
            roles: this.roles,
            status: this.status,
            created_on: this.created_on,
            updated_on: this.updated_on,
            last_access: this.last_access
        };
    }
    get user_id() {
        return this._user_id;
    }
    set user_id(value) {
        this._user_id = value;
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get created_on() {
        return this._created_on;
    }
    set created_on(value) {
        this._created_on = value;
    }
    get updated_on() {
        return this._updated_on;
    }
    set updated_on(value) {
        this._updated_on = value;
    }
    get last_access() {
        return this._last_access;
    }
    set last_access(value) {
        this._last_access = value;
    }
    get roles() {
        return this._roles;
    }
    set roles(value) {
        this._roles = value;
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
    get mobile() {
        return this._mobile;
    }
    set mobile(value) {
        this._mobile = value;
    }
    get employee_id() {
        return this._employee_id;
    }
    set employee_id(value) {
        this._employee_id = value;
    }
    get joining_date() {
        return this._joining_date;
    }
    set joining_date(value) {
        this._joining_date = value;
    }
    get age() {
        return this._age;
    }
    set age(value) {
        this._age = value;
    }
    get password() {
        return this._password;
    }
    set password(value) {
        this._password = value;
    }
    get last_logged_in() {
        return this._last_logged_in;
    }
    set last_logged_in(value) {
        this._last_logged_in = value;
    }
    get last_logged_out() {
        return this._last_logged_out;
    }
    set last_logged_out(value) {
        this._last_logged_out = value;
    }
}
exports.default = CDE;
