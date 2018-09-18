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
var paypal = require('paypal-rest-sdk');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var config = {
    "port": 3000,
    "api": {
        "host": "api.paypal.com",
        "port": "",
        "client_id": "AV9KEKvHyAY6uPFcozCsTIsbUPLayXRTg2OZLAOl-th1DE6oEj3sbdoRrJv8dINfYEia-wOI7A_MifvB",
        "client_secret": "EPeOz7Lks1Pd7eDO6Y_rcCP17zr8_sC4jloTMGXq_TRmxcW54Mw9OVLVqMUe_zG4LMjSB2KQ-0jDbDtA"
    }
};
paypal.configure(config.api);
class Payment {
    static get routes() {
        let PaymentRouter = express.Router();
        PaymentRouter.get('/success', function (req, res) {
            let paymentId = req.query.paymentId;
            paypal.payment.get(paymentId, function (error, payment) {
                if (error) {
                    console.log(error);
                    throw error;
                }
                else {
                    console.log("Get Payment Response");
                    console.log(JSON.stringify(payment));
                    let payment_json = payment;
                    paypal.payment.execute(paymentId, payment_json, function (error, payment) {
                        if (error) {
                            console.log(error);
                            throw error;
                        }
                        else {
                            console.log("Get execute Response");
                            console.log(JSON.stringify(payment));
                        }
                    });
                }
            });
            console.log(req.body);
            res.send("Payment transfered successfully.");
        });
        PaymentRouter.get('/cancel', function (req, res) {
            console.log(req.body);
            res.send("Payment canceled successfully.");
        });
        PaymentRouter.route('/paynow')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.render("payment-form");
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookinguuid = req.body.bookinguuid;
            var payment = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://hotelnida.com/payment-manager/success",
                    "cancel_url": "http://hotelnida.com/payment-manager/cancel"
                },
                "transactions": [{
                        "amount": {
                            "total": parseInt(req.body.amount),
                            "currency": req.body.currency
                        },
                        "description": req.body.description
                    }]
            };
            paypal.payment.create(payment, function (error, payment) {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed"
                    });
                }
                else {
                    if (payment.payer.payment_method === 'paypal') {
                        req.body.paymentId = payment.id;
                        if (payment.id) {
                            let PaymentCollection = core_1.default.app.get('mongoClient').get('payments');
                            PaymentCollection
                                .update({
                                bookinguuid: bookinguuid
                            }, {
                                $set: { paymentReferrenceId: payment.id }
                            })
                                .then((document) => __awaiter(this, void 0, void 0, function* () {
                            }))
                                .catch(error => {
                                return res.status(500).json({
                                    success: false,
                                    message: "Failed"
                                });
                            });
                        }
                        var redirectUrl;
                        for (var i = 0; i < payment.links.length; i++) {
                            var link = payment.links[i];
                            if (link.method === 'REDIRECT') {
                                redirectUrl = link.href;
                            }
                        }
                        return res.status(200).json({
                            success: true,
                            payment_type: "Online",
                            message: "Success",
                            redirectUrl: redirectUrl,
                            paymentId: payment.id
                        });
                    }
                }
            });
        }));
        return PaymentRouter;
    }
}
exports.default = Payment;
