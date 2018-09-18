"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let tokenSecret = 'RoutePlanning123$$';
exports.tokenSecret = tokenSecret;
let cookieSecret = 'RoutePlanning123$$';
exports.cookieSecret = cookieSecret;
var Zone;
(function (Zone) {
    Zone["INDIA"] = "Asia/India";
})(Zone || (Zone = {}));
let environments = {
    local: {
        region: Zone.INDIA,
        mongoDBUrl: 'mongodb://superadmin:superadmin123$$@localhost:27017/route',
        baseURLconfig: {
            host: 'localhost',
            port: 3000,
            protocol: 'http',
            rootdir: __dirname,
            baseURL: 'http://localhost:3000'
        }
    },
    testing: {
        region: Zone.INDIA,
        mongoDBUrl: 'mongodb://superadmin:superadmin123$$@localhost:27017/route',
        baseURLconfig: {
            host: 'localhost',
            port: 3000,
            protocol: 'http',
            rootdir: __dirname,
            baseURL: 'http://localhost:3000'
        }
    },
    staging: {
        region: Zone.INDIA,
        mongoDBUrl: 'mongodb://superadmin:superadmin123$$@localhost:27017/route',
        baseURLconfig: {
            host: 'localhost',
            port: 3000,
            protocol: 'http',
            rootdir: __dirname,
            baseURL: 'http://localhost:3000'
        }
    },
    production: {
        region: Zone.INDIA,
        mongoDBUrl: 'mongodb://superadmin:superadmin123$$@127.0.0.1:27017/route',
        baseURLconfig: {
            host: 'localhost',
            port: 3000,
            protocol: 'http',
            rootdir: __dirname,
            baseURL: 'http://localhost:3000'
        }
    }
};
exports.environments = environments;
