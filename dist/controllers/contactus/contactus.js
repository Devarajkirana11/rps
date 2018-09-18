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
const express = require("express");
const request_1 = require("../../helpers/request");
const email_1 = require("../../helpers/email");
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class ContactUs {
    static get routes() {
        let ContactUsRouter = express.Router();
        ContactUsRouter.route('/')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render('contact-us', {
                layout: 'homeLayout',
                class: 'inner-page'
            });
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let first_name = req.body.first_name;
            let last_name = req.body.last_name;
            let fullname = first_name + ' ' + last_name;
            let email = req.body.email;
            let message = req.body.message;
            let newContactUs = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                message: req.body.message
            };
            let errorobj = {};
            errorobj['requestBody'] = req.body;
            req.checkBody('first_name', 'Please enter the first name').notEmpty();
            req.checkBody('last_name', 'Please enter the last name').notEmpty();
            req.checkBody('email', 'Please enter the valid email id').notEmpty();
            req.checkBody('message', 'Please enter the message').notEmpty();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400);
                    var errors = result.array();
                    res.render('contact-us', {
                        errors: errors,
                        output: req.body,
                        layout: 'homeLayout',
                        class: 'inner-page',
                        inputs: newContactUs
                    });
                }
                else {
                    request_1.default.post('/contactus-manager/contactus-create', {}, {
                        params: newContactUs
                    }).then(success => {
                        email_1.default.send({
                            from: 'info@hotelnida.com',
                            to: "customercare@hotelnida.com",
                            subject: 'Contact Us Enquiry',
                            body: 'Contact Us',
                            category: ['Contact Us'],
                            template: 'contact_us',
                            templateObject: { fullname: fullname, category: "Contact Us Enquiry", email: email, message: message }
                        });
                        let success_msg = {
                            message: "Thank you for contacting us and we have received your inquiry! We strive to respond to you within 24 hours."
                        };
                        res.status(200)
                            .render('contact-us', {
                            success_msg: success_msg,
                            layout: 'homeLayout',
                            class: 'inner-page'
                        });
                    }).catch(error => {
                        res.status(400)
                            .redirect("/");
                    });
                }
            });
        }));
        return ContactUsRouter;
    }
}
exports.default = ContactUs;
