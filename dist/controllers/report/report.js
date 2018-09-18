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
const request_1 = require("../../helpers/request");
const time_1 = require("../../helpers/time");
const express = require("express");
class ReportManager {
    static get routes() {
        let DailySalesRouter = express.Router();
        DailySalesRouter.route('/daily-sales')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            request_1.default.get('/report-manager/manager/daily-sales', {
                hotel_id: hotel_id,
                start_date: startDate,
                end_date: endDate
            }).then(dailySales => {
                console.log(dailySales.data);
                res.status(200);
                res.render('dailysales', {
                    output: dailySales.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('dailysales');
            });
        }));
        DailySalesRouter.route('/daily-salesfd')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            res.render('dailysalesfd', { hotel_id: hotel_id });
        }));
        DailySalesRouter.route('/daily-salesfd-ajax')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let day = req.query.day;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            let DataTableOptions = req.body;
            let responds;
            let booking_array = [];
            DataTableOptions["showAlertOnError"] = false;
            if (req.body.columns !== undefined) {
                let columns = req.body.columns;
                columns.forEach(column => {
                    if (column.name == "checkIn" && column.searchable == "false" && column.search.value != "") {
                        var dateObj = JSON.parse(column.search.value);
                        startDate = dateObj.startdate;
                    }
                    else if (column.name == "checkOut" && column.searchable == "false" && column.search.value != "") {
                        var dateObj = JSON.parse(column.search.value);
                        endDate = dateObj.enddate;
                    }
                });
            }
            request_1.default.post('/report-manager/manager/daily-salesfd', {}, {
                hotel_id: hotel_id,
                start_date: startDate,
                end_date: endDate,
                options: DataTableOptions
            }).then(dailySalesfd => {
                console.log(dailySalesfd.data);
                res.status(200);
                res.json({
                    success: true,
                    message: 'successfully fetched the data',
                    data: dailySalesfd.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.json({ success: false, message: error.message });
            });
        }));
        DailySalesRouter.route('/check-in')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/check-in', {
                hotel_id: hotel_id
            }).then(checkIn => {
                console.log(checkIn.data);
                res.status(200);
                res.render('checkin', {
                    output: checkIn.data,
                    hotel_id: hotel_id
                });
                console.log(hotel_id);
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('checkin');
            });
        }));
        DailySalesRouter.route('/check-out')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/check-out', {
                hotel_id: hotel_id
            }).then(checkOut => {
                console.log(checkOut.data);
                res.status(200);
                res.render('checkout', {
                    output: checkOut.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('checkout');
            });
        }));
        DailySalesRouter.route('/booking-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            request_1.default.get('/report-manager/manager/booking-report', {
                hotel_id: hotel_id,
            }).then(bookingReport => {
                console.log(bookingReport.data);
                res.status(200);
                res.render('bookingreport', {
                    output: bookingReport.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('bookingreport');
            });
        }));
        DailySalesRouter.route('/stay-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let time = time_1.default.serverMoment.toDate();
            res.status(200);
            res.render('stayreport', {
                hotel_id: hotel_id
            });
        }));
        DailySalesRouter.route('/total-earnings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/total-earnings', {
                hotel_id: hotel_id
            }).then(totalearnings => {
                console.log(totalearnings.data);
                res.status(200);
                res.render('totalearnings', {
                    output: totalearnings.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('totalearnings');
            });
        }));
        DailySalesRouter.route('/upcoming-earnings')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/upcoming-earnings', {
                hotel_id: hotel_id
            }).then(upcomingearnings => {
                console.log(upcomingearnings.data);
                res.status(200);
                res.render('upcomingearnings', {
                    output: upcomingearnings.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('upcomingearnings');
            });
        }));
        DailySalesRouter.route('/summary-collection')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            request_1.default.get('/report-manager/manager/summary-collection', {
                hotel_id: hotel_id,
            }).then(summarycollection => {
                console.log(summarycollection.data);
                res.status(200);
                res.render('summarycollection', {
                    output: summarycollection.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('summarycollection');
            });
        }));
        DailySalesRouter.route('/revenue-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let startDate = req.query.start_date;
            let endDate = req.query.end_date;
            request_1.default.get('/report-manager/manager/revenue-report', {
                hotel_id: hotel_id,
                start_date: startDate,
                end_date: endDate
            }).then(revenueReport => {
                res.status(200);
                res.render('revenueReport', {
                    output: revenueReport.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('revenueReport');
            });
        }));
        DailySalesRouter.route('/nida-cash')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/nida-cash', {}).then(nidaCash => {
                console.log(nidaCash.data);
                res.status(200);
                res.render('nidaCash', {
                    output: nidaCash.data,
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('nidaCash');
            });
        }));
        DailySalesRouter.route('/user-performance')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/user-performance', {}).then(userPerformance => {
                console.log(userPerformance.data);
                res.status(200);
                res.render('userPerformance', {
                    output: userPerformance.data,
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('userPerformance');
            });
        }));
        DailySalesRouter.route('/user-performance-hotel')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotel_id = req.query.hotel_id;
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/user-performance-hotel', {
                hotel_id: hotel_id
            }).then(userPerformanceHotel => {
                console.log(userPerformanceHotel.data);
                res.status(200);
                res.render('userPerformanceHotel', {
                    output: userPerformanceHotel.data,
                    hotel_id: hotel_id
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('userPerformanceHotel');
            });
        }));
        DailySalesRouter.route('/guest-history-summary')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            request_1.default.get('/report-manager/manager/guest-history-summary', {}).then(guestSummary => {
                console.log(guestSummary.data);
                res.status(200);
                res.render('guestSummary', {
                    output: guestSummary.data,
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('guestSummary');
            });
        }));
        DailySalesRouter.route('/guest-history')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let _email = req.query._email;
            request_1.default.get('/report-manager/manager/guest-history', {
                _email: _email
            }).then(guestHistory => {
                console.log(guestHistory.data);
                res.status(200);
                res.render('guestHistory', {
                    output: guestHistory.data,
                    _email: _email
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('guestHistory');
            });
        }));
        DailySalesRouter.route('/dailyRevenueReport')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let hotelUuid = req.query.hotel_id;
            res.status(200);
            res.render('dashboard_overview', {
                hotel_uuid: hotelUuid
            });
        }));
        DailySalesRouter.route('/past-nidacash-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let result = JSON.stringify({});
            var startDate = "01-04-2018";
            var endDate = time_1.default.serverMoment.toDate();
            endDate = time_1.default.formatGivenDate(endDate);
            request_1.default.get('/report-manager/manager/past-nidacash?start_date=' + startDate + '&end_date=' + endDate, {}).then(pastNidacashReport => {
                res.status(200);
                res.render('PastNidacashReport', {
                    output: pastNidacashReport.data,
                    footer: pastNidacashReport.footer[0]
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('PastNidacashReport');
            });
        }));
        DailySalesRouter.route('/future-nidacash-report')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let result = JSON.stringify({});
            request_1.default.get('/report-manager/manager/future-nidacash', {}).then(futureNidacashReport => {
                res.status(200);
                res.render('FutureNidacashReport', {
                    output: futureNidacashReport.data,
                });
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('FutureNidacashReport');
            });
        }));
        return DailySalesRouter;
    }
}
exports.default = ReportManager;
