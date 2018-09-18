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
const moment = require('moment');
class Dashboard {
    static get routes() {
        let DashboardRouter = express.Router();
        DashboardRouter.route('/overview')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            res.status(200);
            res.render('dashboard_overview', {
                hotel_uuid: hotelUuid
            });
        }));
        DashboardRouter.route('/bookings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            res.status(200);
            res.render('dashboard_bookings', {
                hotel_uuid: hotelUuid
            });
        }));
        DashboardRouter.route('/revenue')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            res.status(200);
            res.render('dashboard_revenue', {
                hotel_uuid: hotelUuid
            });
        }));
        DashboardRouter.route('/inventory')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            res.status(200);
            res.render('dashboard_inventory', {
                hotel_uuid: hotelUuid
            });
        }));
        return DashboardRouter;
    }
}
exports.default = Dashboard;
