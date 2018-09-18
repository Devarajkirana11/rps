"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../config/app");
const http = require("http");
class APIClient {
    static send(path, postbody, callbackfun, method = 'POST') {
        const options = {
            hostname: app_1.environments[process.env.ENV].baseURLconfig.host,
            port: app_1.environments[process.env.ENV].baseURLconfig.port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                "Content-Length": postbody.length
            }
        };
        var post_req = http.request(options, function (response) {
            var data = [];
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                data.push(chunk);
            });
            response.on('end', function () {
                console.log('Api Client Response ' + data);
                if (data.length != 0) {
                    try {
                        JSON.parse(data.join(''));
                    }
                    catch (e) {
                        callbackfun({ success: false, message: 'Not a valid Response JSON ' + e });
                    }
                    callbackfun(JSON.parse(data.join('')));
                }
                else {
                    callbackfun({ success: false, message: 'Couldn\'t get Response from Server!' });
                }
            });
        });
        post_req.on('error', function (e) {
            callbackfun({ success: false, message: e.message });
        });
        post_req.write(postbody);
        post_req.end();
    }
}
exports.default = APIClient;
