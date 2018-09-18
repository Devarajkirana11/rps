"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidV4 = require("uuid/v4");
const Crypto = require("crypto");
var randomstring = require('randomstring');
class Identification {
    static get generateUuid() {
        return uuidV4();
    }
    static get generateReferenceId() {
        return randomstring.generate({
            length: 6,
            charset: 'alphanumeric',
            readable: true,
            capitalization: 'uppercase'
        });
    }
    static hash(data) {
        return Crypto.createHash('sha256')
            .update(data)
            .digest('hex');
    }
}
exports.default = Identification;
