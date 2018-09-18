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
const app_1 = require("../config/app");
var call = require('request-promise');
class Request {
    static get(path, query = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var options = {
                method: 'GET',
                uri: app_1.environments[process.env.ENV].baseURLconfig.baseURL + path,
                qs: query,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };
            yield call(options)
                .then(response => resolve(response))
                .catch(error => reject(error));
        }));
    }
    static post(path, query = {}, body = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var options = {
                method: 'POST',
                uri: app_1.environments[process.env.ENV].baseURLconfig.baseURL + path,
                qs: query,
                body: body,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };
            yield call(options)
                .then(response => resolve(response))
                .catch(error => reject(error));
        }));
    }
    static put(path, query = {}, body = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var options = {
                method: 'PUT',
                uri: app_1.environments[process.env.ENV].baseURLconfig.baseURL + path,
                qs: query,
                body: body,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };
            yield call(options)
                .then(response => resolve(response))
                .catch(error => reject(error));
        }));
    }
    static ext_post(path, query = {}, body = {}, headers = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var options = {
                method: 'POST',
                uri: path,
                qs: query,
                body: body,
                headers: headers,
                json: true
            };
            yield call(options)
                .then(response => resolve(response))
                .catch(error => reject(error));
        }));
    }
    static ext_get(path, query = {}, headers = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var options = {
                method: 'GET',
                uri: path,
                qs: query,
                headers: headers,
                json: true
            };
            yield call(options)
                .then(response => resolve(response))
                .catch(error => reject(error));
        }));
    }
}
exports.default = Request;
