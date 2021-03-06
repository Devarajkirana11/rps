"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var in_array = require('in_array');
class Permission {
}
Permission.admin_access_control = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    res.locals.user_details = req.session.user;
    if (req.session.user) {
        let roles = req.session.user.roles;
        if (in_array(1, roles)) {
            next();
        }
        else {
            res.redirect('/');
        }
    }
    else {
        res.redirect('/user/login');
    }
});
Permission.manager_access_control = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    res.locals.user_details = req.session.user;
    let path = req.originalUrl;
    if (path.indexOf('?') > -1) {
        let path_parsing = path.split('?');
        path = path_parsing[0];
    }
    if (path == '/user/login' || path == '/user/register') {
        next();
    }
    else {
        if (req.session.user) {
            let roles = req.session.user.roles;
            if (in_array(1, roles)) {
                next();
            }
            else if (in_array(4, roles)) {
                next();
            }
            else {
                res.redirect('/');
            }
        }
        else {
            res.redirect('/user/login');
        }
    }
});
Permission.cde_access_control = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    res.locals.user_details = req.session.user;
    let path = req.originalUrl;
    if (path.indexOf('?') > -1) {
        let path_parsing = path.split('?');
        path = path_parsing[0];
    }
    if (req.session.user) {
        let roles = req.session.user.roles;
        if (in_array(1, roles)) {
            next();
        }
        else if (in_array(4, roles)) {
            next();
        }
        else if (in_array(3, roles)) {
            next();
        }
        else {
            res.redirect('/');
        }
    }
    else {
        res.redirect('/user/login');
    }
});
Permission.access_control = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let path = req.originalUrl;
    if (path.indexOf('?') > -1) {
        let path_parsing = path.split('?');
        path = path_parsing[0];
    }
    console.log(path);
    res.locals.user_details = req.session.user;
    if (path == '/user/login' || path == '/user/register') {
        next();
    }
    else {
        if (req.session.user) {
            let roles = req.session.user.roles;
            if (in_array(1, roles)) {
                next();
            }
            else {
                res.redirect('/');
            }
        }
        else {
            res.redirect('/user/login');
        }
    }
});
exports.default = Permission;
