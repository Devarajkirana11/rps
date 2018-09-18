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
const core_1 = require("../../core");
const express = require("express");
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var session = require("express-sessions");
const Html_Entities = require('html-entities').AllHtmlEntities;
class NewsletterController {
    static get routes() {
        let NewsletterRouter = express.Router();
        let BookingCollection = core_1.default.app.get('mongoClient').get('Booking');
        let RoomReservationCollection = core_1.default.app.get('mongoClient').get('RoomReservation');
        let PaymentCollection = core_1.default.app.get('mongoClient').get('payments');
        NewsletterRouter.route("/news-letter/create")
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            var email_id = req.body.email_id;
            let errorobj = {};
            var postbody = JSON.stringify({ params: email_id });
            errorobj['requestBody'] = req.body;
            req.checkBody('email_id', 'Email cannot be empty').notEmpty();
            req.checkBody('email_id', 'Please enter the valid email').isEmail();
        }));
        return NewsletterRouter;
    }
}
NewsletterController.htmlEntities = new Html_Entities();
exports.default = NewsletterController;
