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
const app_1 = require("../../config/app");
const core_1 = require("../../core");
const express = require("express");
const XLSX = require("xlsx");
const multer = require("multer");
const path = require("path");
const request_1 = require("../../helpers/request");
const time_1 = require("../../helpers/time");
const identification_1 = require("../../helpers/identification");
const guest_booking_1 = require("../../models/guest_booking/guest_booking");
const frontend_manager_1 = require("../../controllers/frontend/frontend_manager");
const InventoryLaw = require("../../models/inventory/law");
const inventory_manager_1 = require("../../controllers/inventory/inventory_manager");
const HotelManager_1 = require("../../controllers/hotel_info/HotelManager");
const momentLibrary = require("moment-timezone");
const { read, write, utils } = XLSX;
var ObjectId = require('mongodb').ObjectID;
class excelData {
    static get routes() {
        let excelRouter = express.Router();
        excelRouter.route('/upload')
            .get((req, res) => {
            res.status(200);
            res.render('excel_upload');
        })
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            this.basepath = path.join(app_1.environments[process.env.ENV].baseURLconfig.rootdir, '../', 'public');
            var storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, excelData.basepath);
                },
                filename: function (req, file, cb) {
                    excelData.filename = file.originalname;
                    cb(null, file.originalname);
                }
            });
            this.upload = multer({ storage: storage });
            var uploadtype = this.upload.single('fileupload');
            uploadtype(req, res, function (err) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        respond = {
                            success: false,
                            message: err.message
                        };
                        return res.status(400).render('excel_upload', respond);
                    }
                    else {
                        if (req.file) {
                            var workbook = XLSX.readFile(req.file.path);
                            var sheet_name_list = workbook.SheetNames;
                            respond = {
                                data: XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
                            };
                            let resObj = excelData.validateJson(respond.data);
                            let availabilityErrors = new Array();
                            let importMessages = new Array();
                            if (resObj.error_data.length > 0) {
                                respond.errors = resObj.error_data;
                            }
                            if (resObj.newArr.length > 0) {
                                yield HotelManager_1.default.getHotelByID(req.body.hotel_id)
                                    .then((hotelObj) => __awaiter(this, void 0, void 0, function* () {
                                    if (hotelObj.success) {
                                        if (hotelObj.data.length > 0) {
                                            let currency = 'MYR';
                                            yield request_1.default.get('/search/get-currency', { hotel_id: hotelObj.data[0]._hotel_id })
                                                .then(curdata => {
                                                currency = curdata.currency;
                                            }).catch(err => {
                                                console.log(err.message);
                                            });
                                            yield excelData.asyncForEach(resObj.newArr, (row) => __awaiter(this, void 0, void 0, function* () {
                                                let availabilityInputs = {
                                                    check_in: time_1.default.formatGivenDate(row['Check_In']),
                                                    check_out: time_1.default.formatGivenDate(row['Check_Out'])
                                                };
                                                let DuplicateReferenceId = yield excelData.findDuplicateDBData(row['Reservation_ID']);
                                                if (DuplicateReferenceId === false) {
                                                    let No_of_NightsMatching = excelData.validateNoOfNights(availabilityInputs, row['No_of_Nights']);
                                                    if (No_of_NightsMatching) {
                                                        yield inventory_manager_1.default.getAvailableRoomNumbers(req.body.hotel_id, row['Room_Type_No'], availabilityInputs.check_in, availabilityInputs.check_out)
                                                            .then((availResult) => __awaiter(this, void 0, void 0, function* () {
                                                            if (availResult.length > 0) {
                                                                let room_type_nos = new Array();
                                                                room_type_nos.push({ roomType: row['Room_Type_No'], no_of_rooms: row['No_of_Rooms'] });
                                                                let emailGen = excelData.generateEmailAddress();
                                                                let guest = {
                                                                    firstName: row['First_Name'],
                                                                    lastName: row['Last_Name'],
                                                                    phoneNumber: '0123456789',
                                                                    emailAddress: emailGen
                                                                };
                                                                let guestData = {
                                                                    guest_id: '',
                                                                    salutation: '',
                                                                    firstname: row['First_Name'],
                                                                    lastname: row['Last_Name'],
                                                                    mobileno_stdcode: '',
                                                                    mobileno: '0123456789',
                                                                    email: emailGen,
                                                                    nationality: '',
                                                                    reason_to_stay: '',
                                                                    booking_id: '',
                                                                    additional_identification: '',
                                                                    additional_identification_number: ''
                                                                };
                                                                let eachRoomTypePrice = new Array();
                                                                eachRoomTypePrice.push({ type: row['Room_Type_No'], totalRoomPrice: row['Room_Price'] });
                                                                let room_rate_array = new Array();
                                                                let costPerRoom = Number(row['Room_Price']) / Number(row['No_of_Rooms']);
                                                                let No_of_Nights = Number(row['No_of_Nights']);
                                                                let costPerNight = costPerRoom / No_of_Nights;
                                                                let final_room_rate = new Array();
                                                                for (var i = 0; i < No_of_Nights; i++) {
                                                                    if (i == 0) {
                                                                        room_rate_array.push({ cost: costPerNight, date: time_1.default.OTAformatGivenDate(row['Check_In']) });
                                                                    }
                                                                    else {
                                                                        room_rate_array.push({ cost: costPerNight, date: time_1.default.addDays(i, time_1.default.formatGivenDate(row['Check_In']), "YYYY-MM-DD") });
                                                                    }
                                                                }
                                                                final_room_rate[row['Room_Type_No']] = room_rate_array;
                                                                let inputvalues = {
                                                                    status: excelData.getBookingStatus(row['Booking_Status'], time_1.default.formatGivenDate(row['Check_In']), row['Payment_Status']),
                                                                    number_of_guests: row['No_of_Guests'],
                                                                    room_types: JSON.stringify(room_type_nos),
                                                                    check_in: time_1.default.formatGivenDate(row['Check_In']),
                                                                    check_out: time_1.default.formatGivenDate(row['Check_Out']),
                                                                    guest: JSON.stringify(guest),
                                                                    referred_by: null,
                                                                    bookingCommission: null,
                                                                    eachRoomTypePrice: JSON.stringify(eachRoomTypePrice),
                                                                    dailyRates: JSON.stringify(final_room_rate),
                                                                    user_uuid: '',
                                                                    remarks: row['Reservation_ID'],
                                                                    bookedOn: time_1.default.formatGivenDate(row['Booking_Date']),
                                                                    booking_source: excelData.getBookingSource(row['Booking_Source']),
                                                                    no_of_child: Number(row['Children'])
                                                                };
                                                                yield request_1.default.post('/inventory/booking/dataimport', { hotel_uuid: req.body.hotel_id }, inputvalues)
                                                                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                                                                    if (result.success) {
                                                                        let newGuestBookingData = guestData;
                                                                        newGuestBookingData['booking_id'] = result.data.uuid;
                                                                        newGuestBookingData['guest_id'] = identification_1.default.generateUuid;
                                                                        let newGuestBookingDetails = guest_booking_1.default.GuestBookingCreate(newGuestBookingData);
                                                                        let newGuestBookingCollection = core_1.default.app.get('mongoClient').get('guest_booking_info');
                                                                        let inputstatement;
                                                                        inputstatement = newGuestBookingCollection.insert(newGuestBookingDetails);
                                                                        yield inputstatement
                                                                            .then((document) => __awaiter(this, void 0, void 0, function* () {
                                                                            let depositAmount = 0;
                                                                            if (hotelObj.data[0]._deposit_amount !== undefined) {
                                                                                if (hotelObj.data[0]._deposit_amount != "") {
                                                                                    depositAmount = Number(row['No_of_Rooms']) * Number(hotelObj.data[0]._deposit_amount);
                                                                                }
                                                                            }
                                                                            yield request_1.default.post('/payment-manager/payment/deposit', {}, {
                                                                                bookinguuid: result.data.uuid,
                                                                                hoteluuid: req.body.hotel_id,
                                                                                depositAmount: depositAmount,
                                                                                depositCollected: 0
                                                                            }).then((depositresponse) => __awaiter(this, void 0, void 0, function* () {
                                                                                yield request_1.default.post('/payment-manager/payment/booking', null, {
                                                                                    "bookinguuid": result.data.uuid,
                                                                                    "paymentReferrenceId": row['Reservation_ID'],
                                                                                    "totalRoomPrice": row['Room_Price'],
                                                                                    "discountType": "FLAT",
                                                                                    "discountValue": 0,
                                                                                    "discountAmount": 0,
                                                                                    "priceAfterDiscount": row['Room_Price'],
                                                                                    "serviceFee": row['Service_Fee'],
                                                                                    "tax": row['Tax(VAT)7%'],
                                                                                    "tourismTax": req.body.tourismTax,
                                                                                    "totalAmountPaid": row['Total_Amount'],
                                                                                    "totalAmount": row['Total_Amount'],
                                                                                    "paymentType": excelData.getPaymentType(row['Payment_Type']),
                                                                                    "paymentStatus": excelData.getPaymentStatus(row['Payment_Status']),
                                                                                    "currency": currency,
                                                                                    "tourismTaxIncluded": (req.body.tourismTax > 0 ? 'Yes' : 'No'),
                                                                                    "depositAmount": depositAmount,
                                                                                    "depositIncluded": 'No',
                                                                                    "remainingAmount": row['Total_Amount'],
                                                                                    "hoteluuid": req.body.hotel_id,
                                                                                    "booking_channel": row['Booking_Source'],
                                                                                    "channel_name": row['Booking_Channel'],
                                                                                    "recordCreationType": 'import',
                                                                                    "manual_updated_on": time_1.default.formatGivenDate(row['Payment_Date'])
                                                                                }).then((payresult) => __awaiter(this, void 0, void 0, function* () {
                                                                                    if (payresult.success) {
                                                                                        yield frontend_manager_1.default.RegisterUserOnBooking(guest)
                                                                                            .then(result => {
                                                                                            importMessages.push('import message ' + JSON.stringify(payresult));
                                                                                        }).catch(err => {
                                                                                            availabilityErrors.push(JSON.stringify({ success: false, message: err.message }));
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        availabilityErrors.push(JSON.stringify({
                                                                                            success: false,
                                                                                            message: "Payment method " + payresult.message
                                                                                        }));
                                                                                    }
                                                                                })).catch(error => {
                                                                                    availabilityErrors.push(JSON.stringify({
                                                                                        success: false,
                                                                                        message: "Payment Method " + error.message
                                                                                    }));
                                                                                });
                                                                            })).catch(error => {
                                                                                availabilityErrors.push(JSON.stringify({
                                                                                    success: false,
                                                                                    message: "Deposit Method " + error.message
                                                                                }));
                                                                            });
                                                                        }))
                                                                            .catch(error => {
                                                                            availabilityErrors.push(JSON.stringify({
                                                                                success: false,
                                                                                message: "Guest Booking " + error.message
                                                                            }));
                                                                        });
                                                                    }
                                                                    else {
                                                                        availabilityErrors.push(JSON.stringify({
                                                                            success: false,
                                                                            message: "Inventory " + result.message
                                                                        }));
                                                                    }
                                                                })).catch(error => {
                                                                    availabilityErrors.push(JSON.stringify({
                                                                        success: false,
                                                                        message: "Inventory " + error.message
                                                                    }));
                                                                });
                                                            }
                                                            else {
                                                                resObj.successCount--;
                                                                availabilityErrors.push('Could not import data due to non Availablitiy of room type ' + row['Room_Type_No'] + ' and reference id ' + row['Reservation_ID']);
                                                            }
                                                        }))
                                                            .catch(err => {
                                                            resObj.successCount--;
                                                            availabilityErrors.push(err.message + ' of room type ' + row['Room_Type_No'] + ' and reference id ' + row['Reservation_ID']);
                                                        });
                                                    }
                                                    else {
                                                        resObj.successCount--;
                                                        availabilityErrors.push('Could not import data due to No of Nights did not match with Check In and CheckOut difference, room type ' + row['Room_Type_No'] + ' and reference id ' + row['Reservation_ID']);
                                                    }
                                                }
                                                else {
                                                    resObj.successCount--;
                                                    availabilityErrors.push('Could not import data due to Duplicate Data of room type ' + row['Room_Type_No'] + ' and reference id ' + row['Reservation_ID']);
                                                }
                                            }));
                                        }
                                        else {
                                            return res.status(200).json({ success: false, msg: 'Invalid Hotel, Please select different hotel' });
                                        }
                                    }
                                    else {
                                        return res.status(200).json({ success: false, msg: 'Invalid Hotel' });
                                    }
                                }))
                                    .catch(err => {
                                    return res.status(400).json({ success: false, msg: err.message });
                                });
                            }
                            respond.successCount = resObj.successCount;
                            if (respond['errors'] !== undefined) {
                                respond.errors = respond.errors.concat(availabilityErrors);
                            }
                            else {
                                respond['errors'] = availabilityErrors;
                            }
                            respond['importMessages'] = importMessages;
                            respond['success'] = true;
                            res.status(200).json(respond);
                        }
                        else {
                            res.status(200).json({ success: false, message: "No File Chosen" });
                        }
                    }
                });
            });
        }));
        return excelRouter;
    }
    static validateJson(json) {
        let error_data = new Array();
        let successCount = 0;
        let new_result_Arr = new Array();
        let dupicateArr = new Array();
        let metaData = {
            "Reservation_ID": 'text',
            "Booking_Channel": 'text',
            "Booking_Source": 'text',
            "Booking_Date": 'text',
            'Check_In': 'date',
            'Check_Out': 'date',
            'First_Name': 'text',
            'Last_Name': 'text',
            'Room_Price': 'number',
            'Service_Fee': 'number',
            'Tax(VAT)7%': 'number',
            'Total_Amount': 'number',
            'No_of_Rooms': 'number',
            'No_of_Nights': 'number',
            'No_of_Guests': 'number',
            'Room_Type_No': 'number',
            'Payment_Type': 'text',
            'Payment_Status': 'text',
            'Booking_Status': 'text',
            'Payment_Date': 'text',
            'Children': 'number'
        };
        json.forEach((row, rowno) => {
            let err_status = 0;
            Object.keys(metaData).forEach((meta, index) => {
                if (row[meta] === undefined) {
                    error_data.push('Invalid data at row no ' + Number(rowno + 1) + ' in column ' + meta + ' value ' + row[meta]);
                    err_status = 1;
                }
            });
            if (dupicateArr.indexOf(row['Reservation_ID']) == -1) {
                dupicateArr.push(row['Reservation_ID']);
            }
            else {
                err_status = 1;
                error_data.push('duplicate data found  ' + row['Reservation_ID'] + ' at row ' + Number(rowno + 1));
            }
            if (err_status == 0) {
                successCount++;
                new_result_Arr.push(row);
            }
        });
        return { error_data: error_data, successCount: successCount, newArr: new_result_Arr };
    }
    static getPaymentStatus(payment) {
        let payment_status = "ON_HOLD";
        switch (payment) {
            case "On Hold":
                payment_status = 'ON_HOLD';
                break;
            case "Confirmed":
                payment_status = "CONFIRMED";
                break;
        }
        return payment_status;
    }
    static getPaymentType(payment) {
        let payment_type = "POS";
        switch (payment) {
            case "POS":
                payment_type = 'POS';
                break;
            case "CASH":
                payment_type = "CASH";
                break;
            case "Credit Card":
                payment_type = "CREDIT_CARD";
                break;
            case "Paid Online":
                payment_type = "Paid Online";
                break;
            case "None":
                payment_type = "CASH";
                break;
        }
        return payment_type;
    }
    static generateEmailAddress() {
        let genId = identification_1.default.generateUuid;
        return genId + '@hotelnida.com';
    }
    static getBookingStatus(booking, check_in, payment_status) {
        let booking_status = InventoryLaw.BookingStatus.ON_HOLD;
        switch (booking) {
            case "On Hold":
                booking_status = InventoryLaw.BookingStatus.ON_HOLD;
                break;
            case "Confirmed":
                booking_status = InventoryLaw.BookingStatus.CONFIRMED;
                break;
            case "Occupied":
                booking_status = InventoryLaw.BookingStatus.OCCUPIED;
                break;
            case "Check In":
                booking_status = InventoryLaw.BookingStatus.CHECK_IN;
                break;
            case "Check Out":
                booking_status = InventoryLaw.BookingStatus.CHECK_OUT;
                break;
            case "Vacated":
                booking_status = InventoryLaw.BookingStatus.VACATED;
                break;
            case "No Show":
                booking_status = InventoryLaw.BookingStatus.NO_SHOW;
                break;
            case "Cancelled":
                booking_status = InventoryLaw.BookingStatus.CANCELLED;
                break;
        }
        let currentDateTime = momentLibrary(time_1.default.serverTime, 'DD-MM-YYYY');
        let check_in_datetime = momentLibrary(check_in, 'DD-MM-YYYY');
        let diffInDays = currentDateTime.diff(check_in_datetime, 'days');
        if (diffInDays >= 0) {
            booking_status = InventoryLaw.BookingStatus.CHECK_IN;
        }
        if (excelData.getPaymentStatus(payment_status) == 'ON_HOLD') {
            booking_status = InventoryLaw.BookingStatus.ON_HOLD;
        }
        return booking_status;
    }
    static getBookingSource(booking) {
        let source = InventoryLaw.BookingSource.OTA;
        switch (booking) {
            case "OTA":
                source = InventoryLaw.BookingSource.OTA;
                break;
            case "WEB":
                source = InventoryLaw.BookingSource.WEB;
                break;
            case "Walk In": source = InventoryLaw.BookingSource.WALK_IN;
        }
        return source;
    }
    static validateNoOfNights(availabilityInputs, No_of_Nights) {
        let check_in = momentLibrary(availabilityInputs.check_in, 'DD-MM-YYYY HH:mm:ss');
        let check_out = momentLibrary(availabilityInputs.check_out, 'DD-MM-YYYY HH:mm:ss');
        let diffInDays = check_out.diff(check_in, 'days');
        if (diffInDays == Number(No_of_Nights)) {
            return true;
        }
        else {
            return false;
        }
    }
}
excelData.asyncForEach = function (array, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let index = 0; index < array.length; index++) {
            yield callback(array[index], index, array);
        }
    });
};
excelData.findDuplicateDBData = function (referenceID) {
    return __awaiter(this, void 0, void 0, function* () {
        let PaymentCollection = core_1.default.app.get('mongoClient').get('payments');
        return yield PaymentCollection.find({
            paymentReferrenceId: referenceID
        }).then(data => {
            if (data.length > 0) {
                return true;
            }
            else {
                return false;
            }
        }).catch(err => {
            console.log(err.message);
            return true;
        });
    });
};
exports.default = excelData;
