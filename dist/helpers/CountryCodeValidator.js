"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
var expressValidator = require('express-validator');
class CountryCodeValidator {
    static CCvalidate() {
        core_1.default.app.use(expressValidator({
            customValidators: {
                isphonevalid: (nvalue, options) => {
                    if (options.optional !== undefined && options.optional === true)
                        return true;
                    else
                        return CountryCodeValidator.isPhoneValid(nvalue, options);
                }
            }
        }));
    }
    static isPhoneValid(nvalue, options) {
        var countrycodes = this.getPhoneValidations();
        let returnstatus;
        if (nvalue !== undefined && nvalue !== "" && nvalue !== null) {
            if (nvalue.constructor !== String) {
                nvalue = nvalue.toString();
            }
        }
        if (options.phonetype == "landline") {
            Object.keys(countrycodes).forEach(function (key) {
                if (key == "landline") {
                    Object.keys(countrycodes[key]).forEach(function (subkey) {
                        if (options.stdcode == countrycodes[key][subkey].stdcode) {
                            if (nvalue.length >= countrycodes[key][subkey].min && nvalue.length <= countrycodes[key][subkey].max)
                                returnstatus = true;
                            else
                                returnstatus = false;
                        }
                    });
                }
            });
        }
        else if (options.phonetype == "mobile") {
            Object.keys(countrycodes).forEach(function (key) {
                if (key == "mobile") {
                    Object.keys(countrycodes[key]).forEach(function (subkey) {
                        if (options.stdcode == countrycodes[key][subkey].stdcode) {
                            if (nvalue.length >= countrycodes[key][subkey].min && nvalue.length <= countrycodes[key][subkey].max)
                                returnstatus = true;
                            else
                                returnstatus = false;
                        }
                    });
                }
            });
        }
        return returnstatus;
    }
    static getPhoneValidations() {
        let data = { landline: {
                '(+60) Malaysia': { country_id: 132, stdcode: 60, min: 8, max: 10 },
                '(+62) Indonesia': { country_id: 102, stdcode: 62, min: 9, max: 12 },
                '(+66) Thailand': { country_id: 217, stdcode: 66, min: 9, max: 12 },
            },
            mobile: {
                '(+60) Malaysia': { country_id: 132, stdcode: 60, min: 8, max: 11 },
                '(+62) Indonesia': { country_id: 102, stdcode: 62, min: 9, max: 12 },
                '(+66) Thailand': { country_id: 217, stdcode: 66, min: 9, max: 12 },
            }
        };
        return data;
    }
}
exports.default = CountryCodeValidator;
