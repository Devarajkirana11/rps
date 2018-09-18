"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIClient_1 = require("../../helpers/APIClient");
const request_1 = require("../../helpers/request");
const bcrypt = require("bcrypt-nodejs");
var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var jwt = require('jsonwebtoken');
class APIManager {
    static loginManager(body) {
        return new Promise((resolve, reject) => {
            var loginDetails = {
                username: body.username,
                password: body.password
            };
            var postbody = JSON.stringify({ params: loginDetails });
            let findQuery = "";
            let getParams = {};
            APIClient_1.default.send('/user-manager/user-authentication', postbody, function (api_result) {
                if (api_result.success) {
                    if (in_array(9, api_result.data._roles)) {
                        let TokenRes = APIManager.checkEmailTokens(api_result);
                        if (TokenRes.success === true) {
                            APIManager.updateLoginTime(api_result.data._user_id);
                            resolve(TokenRes);
                        }
                        else {
                            reject(TokenRes);
                        }
                    }
                    else {
                        let url = APIManager.redirectURL(api_result);
                        APIManager.updateLoginTime(api_result.data._user_id);
                        resolve({ success: true, url: url, user_data: api_result.data });
                    }
                }
                else {
                    let errors = [];
                    errors.push(api_result);
                    reject({ success: false, message: api_result.message, errors: errors });
                }
            });
        });
    }
    static socialLoginManager(reqBody) {
        return new Promise((resolve, reject) => {
            try {
                let newUser = {
                    social_loginId: reqBody.id,
                    first_name: reqBody.first_name,
                    last_name: reqBody.last_name,
                    email: (reqBody.email === undefined ? null : reqBody.email),
                    username: (reqBody.email === undefined ? null : reqBody.email),
                    password: '',
                    roles: ["9"],
                    status: 'Active',
                    created_on: Date.now(),
                    updated_on: Date.now(),
                    last_access: '',
                    auth_type: 'SOCIAL',
                    registered_device_type: reqBody.registered_device_type
                };
                let findQuery = "";
                let getParams = {};
                if (reqBody.email_exception.constructor !== Boolean) {
                    if (reqBody.email_exception !== undefined && reqBody.email_exception != "") {
                        let email_exp = reqBody.email_exception.toLowerCase();
                        reqBody.email_exception = (email_exp == "true" ? true : false);
                    }
                }
                if (reqBody.email_exception === false) {
                    findQuery = '/user-manager/' + reqBody.email + '/get_user_by_email';
                    getParams['type'] = 'validation';
                }
                else {
                    findQuery = '/user-manager/getBySocialId';
                    getParams['id'] = reqBody.id;
                }
                request_1.default.get(findQuery, getParams)
                    .then(response => {
                    if (response.success && response.data.length > 0) {
                        let user = response.data[0];
                        if (response.data[0]['_social'] === undefined) {
                            request_1.default.post('/user-manager/addSocialEntity', {}, { saveType: 'create', userid: user._user_id, type: reqBody.type, id: reqBody.id })
                                .catch(e => { reject({ success: false, message: e.message }); });
                        }
                        else {
                            let entityExists = false;
                            response.data[0]['_social'].forEach(entity => {
                                if (entity._social_id == reqBody.id) {
                                    entityExists = true;
                                }
                            });
                            if (entityExists === false) {
                                request_1.default.post('/user-manager/addSocialEntity', {}, { saveType: 'update', userid: user._user_id, type: reqBody.type, id: reqBody.id })
                                    .catch(e => { reject({ success: false, message: e.message }); });
                            }
                        }
                        let newObj = {};
                        newObj['data'] = response.data[0];
                        let url = APIManager.redirectURL(newObj);
                        APIManager.updateLoginTime(newObj.data._user_id);
                        resolve({ success: true, url: url, message: 'successfully logged In', user_data: newObj['data'] });
                    }
                    else {
                        newUser['social'] = [
                            {
                                social_type: reqBody.type,
                                social_id: reqBody.id
                            }
                        ];
                        request_1.default.post('/user-manager/user-register', {}, { params: newUser })
                            .then(api_result => {
                            if (api_result.success) {
                                request_1.default.get(findQuery, getParams)
                                    .then(response => {
                                    if (response.success && response.data.length) {
                                        let newObj = {};
                                        newObj['data'] = response.data[0];
                                        let url = this.redirectURL(newObj);
                                        APIManager.updateLoginTime(newObj.data._user_id);
                                        resolve({ success: true, url: url, message: 'successfully logged In', user_data: newObj['data'] });
                                    }
                                });
                            }
                            else {
                                reject({ success: false, message: 'Something went wrong! Please try again.' });
                            }
                        }).catch(e => {
                            reject({ success: false, message: e.message });
                        });
                    }
                }).catch(error => {
                    reject({ success: false, message: error.message });
                });
            }
            catch (e) {
                reject({ success: false, message: e.message });
            }
        });
    }
    static register(reqBody) {
        return new Promise((resolve, reject) => {
            try {
                let password = reqBody.password;
                let new_password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
                let role_array = ["9"];
                let newUser = {
                    user_id: reqBody.user_id,
                    first_name: reqBody.first_name,
                    last_name: reqBody.last_name,
                    email: reqBody.email,
                    username: reqBody.email,
                    password: new_password,
                    roles: role_array,
                    status: reqBody.status,
                    created_on: Date.now(),
                    updated_on: Date.now(),
                    last_access: '',
                    auth_type: 'REGULAR',
                    registered_device_type: reqBody.registered_device_type,
                    referred_by: reqBody.referred_by
                };
                var postbody = JSON.stringify({ params: newUser });
                request_1.default.get('/user-manager/' + reqBody.email + '/get_user_by_email', { type: 'validation' }).then(response => {
                    if (response.success && response.data.length > 0) {
                        if (response.data[0]._confirm_token._confirm_status !== undefined) {
                            if (response.data[0]._confirm_token._confirm_status === false) {
                                APIClient_1.default.send('/user-manager/resendConfirmationEmail', JSON.stringify({ email: reqBody.email, confirmation_token: response.data[0]._confirm_token._token }), function (api_result) {
                                    resolve({ success: true, email: reqBody.email, status: 3, message: 'Confirmation mail has sent your email address. Please confirm to proceed further!' });
                                });
                            }
                            else {
                                reject({ success: false, email: reqBody.email, status: 2, message: 'Your email address has been already registered with us, Please login to continue.' });
                            }
                        }
                        else {
                            reject({ success: false, email: reqBody.email, status: 2, message: 'Your email address has been already registered with us, Please login to continue.' });
                        }
                    }
                    else {
                        APIClient_1.default.send('/user-manager/user-register', postbody, function (api_result) {
                            if (api_result.success) {
                                resolve({ success: true, email: reqBody.email, status: 1, message: 'Confirmation mail has sent your email address. Please confirm to proceed further!' });
                            }
                            else {
                                reject(api_result);
                            }
                        });
                    }
                }).catch(error => {
                    reject({ success: false, message: error.message });
                });
            }
            catch (e) {
                reject({ success: false, message: e.message });
            }
        });
    }
    static emailConfirm(reqbody) {
        return new Promise(function (resolve, reject) {
            request_1.default.get('/user-manager/' + reqbody.email + '/get_user_by_email', {})
                .then(response => {
                if (response.success) {
                    if (response.data[0]._confirm_token._token == reqbody.id && response.data[0]._confirm_token._confirm_status === false) {
                        if (response.data[0]._password != "") {
                            if (in_array(9, response.data[0]._roles)) {
                                resolve({ success: true, msg: 'successfully Confirmed the user', url: '/users/earnings', user_data: response.data[0], status: 11 });
                            }
                        }
                        else {
                            resolve({ success: true, msg: 'Successfully verified your email address! Please choose you password.', url: 'choose_password_form', userid: response.data[0]._user_id, status: 1 });
                        }
                    }
                    else if (response.data[0]._confirm_token._token == reqbody.id && response.data[0]._confirm_token._confirm_status === true) {
                        reject({ success: false, url: 'confirmation', status: 2, email: reqbody.email, mgs: 'Your email has been already verified!' });
                    }
                    else if (response.data[0]._confirm_token._token != reqbody.id) {
                        reject({ success: false, url: 'confirmation', status: 3, email: reqbody.email, mgs: 'Invalid Token!' });
                    }
                }
                else {
                    reject({ success: false, url: 'confirmation', status: 4, email: reqbody.email, mgs: 'Your Email Address doesn\'t exists' });
                }
            }).catch(error => {
                reject({ success: false, url: 'confirmation', status: 0, email: reqbody.email, mgs: error.message });
            });
        });
    }
    static forgotPassword(reqbody) {
        return new Promise(function (resolve, reject) {
            let userobj = { email: reqbody.email };
            request_1.default.get('/user-manager/' + reqbody.email + '/get_user_by_email', { type: 'validation' })
                .then(response => {
                if (response.success && response.data.length > 0) {
                    userobj['userid'] = response.data[0]._user_id;
                    request_1.default.post('/user-manager/forgotpassword_email_authentication', {}, userobj)
                        .then(response => {
                        if (response.success) {
                            resolve({ success: true, email_string: reqbody.email, status: 1, message: response.message });
                        }
                        else {
                            reject({ success: false, email_string: reqbody.email, status: 2, message: response.message });
                        }
                    }).catch(error => {
                        reject({ success: false, email_string: reqbody.email, status: 2, message: error.message });
                    });
                }
                else {
                    reject({ success: false, email_string: reqbody.email, status: 2, message: 'Your email address is not registered with us, Please Register!' });
                }
            }).catch(error => {
                reject({ success: false, email_string: reqbody.email, status: 2, message: error.message });
            });
        });
    }
    static getProfile(userid) {
        return new Promise(function (resolve, reject) {
            let postvalues = { user_id: userid };
            request_1.default.post('/user-manager/get-user-details', {}, postvalues)
                .then(response => {
                if (response.success) {
                    resolve({ success: true, message: 'Profile details', data: response.data[0] });
                }
                else {
                    reject({ success: false, message: 'Could not find your profile', data: {} });
                }
            }).catch(error => {
                reject({ success: false, message: error.message, data: {} });
            });
        });
    }
    static updateProfile(reqbody) {
        return new Promise((resolve, reject) => {
            let password = '';
            if (reqbody.password) {
                password = bcrypt.hashSync(reqbody.password, bcrypt.genSaltSync(10), null);
            }
            else {
                password = reqbody.pass_hidden;
            }
            let postvalues = {
                _user_id: reqbody.user_id,
                _first_name: reqbody.first_name,
                _last_name: reqbody.last_name,
                _email: reqbody.email,
                _username: reqbody.user_name,
                _password: password
            };
            request_1.default.post('/user-manager/user-profile-update', {}, postvalues)
                .then(response => {
                if (response.success) {
                    response.output = postvalues;
                    resolve(response);
                }
                else {
                    response.output = postvalues;
                    reject(response);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
    static redirectURL(response) {
        if (in_array(9, response.data._roles)) {
            return '/users/earnings';
        }
        else {
            let url;
            let roles = response.data._roles;
            if (in_array(4, roles)) {
                url = '/hotel_details/' + response.data._hotel_name + '/view';
            }
            else if (in_array(5, roles)) {
                url = '/hotel_details/' + response.data._hotel_name + '/view';
            }
            else if (in_array(6, roles)) {
                url = '/hotel_details/' + response.data._hotel_name + '/view';
            }
            else if (in_array(7, roles)) {
                url = '/pms/shift/opening?hotel_id=' + response.data._hotel_name;
            }
            else if (in_array(1, roles)) {
                url = '/hotel_details';
            }
            else {
                url = '/profile';
            }
            return url;
        }
    }
    static checkEmailTokens(api_result) {
        if (api_result.data._confirm_token._confirm_status !== undefined) {
            if (api_result.data._confirm_token._confirm_status === false) {
                if (api_result.data._forgot_password_token._token !== undefined) {
                    if (api_result.data._forgot_password_token._confirm_status === true) {
                        return { success: true, url: APIManager.redirectURL(api_result), user_data: api_result.data };
                    }
                    else {
                        return { success: false, message: 'Please confirm your email address to login!' };
                    }
                }
                else {
                    return { success: false, message: 'Please confirm your email address to login!' };
                }
            }
            else {
                return { success: true, url: APIManager.redirectURL(api_result), user_data: api_result.data };
            }
        }
        else {
            return { success: true, url: APIManager.redirectURL(api_result), user_data: api_result.data };
        }
    }
    static updateLoginTime(userid) {
        request_1.default.post('/user-manager/updateUserLoginTime', {}, { userid: userid })
            .catch(err => {
            console.error(err);
        });
    }
    static updateLogoutTime(userid) {
        request_1.default.post('/user-manager/updateUserLogoutTime', {}, { userid: userid })
            .catch(err => {
            console.error(err);
        });
    }
    static verifyEmailAddress(email) {
        return new Promise(function (resolve, reject) {
            let userobj = { email: email };
            request_1.default.get('/user-manager/' + email + '/get_user_by_email', { type: 'validation' })
                .then(response => {
                if (response.success && response.data.length > 0) {
                    userobj['userid'] = response.data[0]._user_id;
                    request_1.default.post('/user-manager/forgotpassword_email_authentication', {}, userobj)
                        .then(response => {
                        if (response.success) {
                            resolve({ success: true, email_string: email, status: 1, message: response.message });
                        }
                        else {
                            reject({ success: false, email_string: email, status: 2, message: response.message });
                        }
                    }).catch(error => {
                        reject({ success: false, email_string: email, status: 2, message: error.message });
                    });
                }
                else {
                    reject({ success: false, email_string: email, status: 2, message: 'Your email address is not registered with us, Please Register!' });
                }
            }).catch(error => {
                reject({ success: false, email_string: email, status: 2, message: error.message });
            });
        });
    }
}
exports.default = APIManager;
