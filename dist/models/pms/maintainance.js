"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const time_1 = require("../../helpers/time");
const Validator = require('objection').Validator;
const ValidationError = require('objection').ValidationError;
class Maintainance extends objection_1.Model {
    static createValidator() {
        return new MaintainanceValidator();
    }
}
Maintainance.tableName = 'maintainance';
Maintainance.jsonSchema = {
    type: 'object',
    required: ['userid', 'room_no', 'to_date', 'from_date', 'room_id', 'reason', 'status', 'blockstatus'],
    properties: {
        id: { type: 'integer' },
        blockid: { type: 'string' },
        userid: { type: 'string', minLength: 1, maxLength: 50 },
        to_date: { type: 'dateTime' },
        from_date: { type: 'dateTime' },
        status: { type: 'integer' },
        room_id: { type: 'string', minLength: 1, maxLength: 50 },
        reason: { type: 'integer' },
    }
};
exports.default = Maintainance;
class MaintainanceValidator extends Validator {
    validate(args) {
        const model = args.model;
        const json = args.json;
        const opt = args.options;
        const ctx = args.ctx;
        const errorJSON = {};
        if (!time_1.default.serverMomentInStrictPattern(json.from_date, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
            errorJSON['from_date'] = "Invalid from date";
        }
        if (!time_1.default.serverMomentInStrictPattern(json.to_date, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
            errorJSON['to_date'] = "Invalid to date";
        }
        if (Object.keys(errorJSON).length)
            throw new ValidationError(errorJSON);
        return json;
    }
    beforeValidate(args) {
        return super.beforeValidate(args);
    }
    afterValidate(args) {
        return super.afterValidate(args);
    }
}
