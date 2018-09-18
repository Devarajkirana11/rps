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
const newsletter_1 = require("../../models/newsletter/newsletter");
var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
class NewsLetterDetailsController {
    static get routes() {
        let NewsLetterRouter = express.Router();
        NewsLetterRouter.route('/newsletter-create')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            let NewsLetterDetailsData = req.body.params;
            let newNewsLetter = newsletter_1.default.create(NewsLetterDetailsData);
            let NewsLetterDetailsCollection = core_1.default.app.get('mongoClient').get('NewsLetter');
            yield NewsLetterDetailsCollection
                .insert(newNewsLetter)
                .then(document => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'success_msg'
                };
                console.log("kichikakuuu");
            })
                .catch(error => {
                res.status(500);
                respond = {
                    success: false,
                    message: error.message
                };
            });
            res.json(respond);
        }));
        return NewsLetterRouter;
    }
}
exports.default = NewsLetterDetailsController;
