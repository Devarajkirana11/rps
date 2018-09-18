"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identification_1 = require("../../helpers/identification");
class Users {
    static usersCreate(data) {
        let newUsers = new Users();
        newUsers.uuid = identification_1.default.generateUuid;
        newUsers.user_id = Math.floor(100000 + Math.random() * 900000);
        newUsers.first_name = data.first_name;
        newUsers.last_name = data.last_name;
        newUsers.email = data.email;
        newUsers.mobile = data.mobile;
        newUsers.username = data.username;
        newUsers.password = data.password;
        newUsers.status = data.status;
        newUsers.created_on = data.created_on;
        newUsers.roles = data.roles;
        newUsers.updated_on = data.updated_on;
        newUsers.last_access = data.last_access;
        return newUsers;
    }
    static usersUpdate(data) {
        let newUsers = new Users();
        newUsers.first_name = data.first_name;
        newUsers.last_name = data.last_name;
        newUsers.email = data.email;
        newUsers.mobile = data.mobile;
        newUsers.username = data.username;
        newUsers.password = data.password;
        newUsers.status = data.status;
        newUsers.roles = data.roles;
        newUsers.updated_on = data.updated_on;
        return newUsers;
    }
    static spawn(document) {
        let users = new Users();
        users.uuid = document.uuid;
        users.user_id = document.user_id;
        users.first_name = document.first_name;
        users.last_name = document.last_name;
        users.username = document.username;
        users.email = document.email;
        users.mobile = document.mobile;
        users.password = document.password;
        users.roles = document.roles;
        users.status = document.status;
        users.created_on = document.created_on;
        users.last_access = document.last_access;
        users.updated_on = document.updated_on;
        return users;
    }
    get document() {
        return {
            uuid: this.uuid,
            user_id: this.user_id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            username: this.username,
            mobile: this.mobile,
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
    get username() {
        return this._username;
    }
    set username(value) {
        this._username = value;
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
exports.default = Users;
