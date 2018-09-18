"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../config/app");
const path = require("path");
var expressValidator = require('express-validator');
const sgMail = require('@sendgrid/mail');
var Handlebars = require('handlebars');
var fs = require('fs-extra');
class Email {
    static send(data) {
        let tempalte_path = path.join(app_1.environments[process.env.ENV].baseURLconfig.rootdir, '../', 'views', 'email', data.template + '.handlebars');
        let template_data = fs.readFileSync(tempalte_path, 'utf8');
        var template = Handlebars.compile(template_data);
        sgMail.setApiKey(app_1.environments[process.env.ENV].SendGridEmail.apikey);
        const msg = {
            to: data.to,
            cc: data.cc,
            from: data.from,
            subject: data.subject,
            categories: data.category,
            text: data.body,
            html: template(data.templateObject)
        };
        sgMail.sendMultiple(msg);
    }
}
exports.default = Email;
