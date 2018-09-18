"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VacancyStatus;
(function (VacancyStatus) {
    VacancyStatus["IN"] = "IN";
    VacancyStatus["OUT"] = "OUT";
})(VacancyStatus = exports.VacancyStatus || (exports.VacancyStatus = {}));
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["ON_HOLD"] = "ON_HOLD";
    RoomStatus["CONFIRMED"] = "CONFIRMED";
    RoomStatus["CHECK_IN"] = "CHECK_IN";
    RoomStatus["OCCUPIED"] = "OCCUPIED";
    RoomStatus["CHECK_OUT"] = "CHECK_OUT";
    RoomStatus["VACATED"] = "VACATED";
    RoomStatus["NO_SHOW"] = "NO_SHOW";
    RoomStatus["CANCELLED"] = "CANCELLED";
})(RoomStatus = exports.RoomStatus || (exports.RoomStatus = {}));
var RoomStatusColor;
(function (RoomStatusColor) {
    RoomStatusColor["ON_HOLD"] = "#ED6F19";
    RoomStatusColor["CONFIRMED"] = "#16a085";
    RoomStatusColor["CHECK_IN"] = "#ADD96C";
    RoomStatusColor["OCCUPIED"] = "#0084BC";
    RoomStatusColor["CHECK_OUT"] = "#D4001A";
    RoomStatusColor["VACATED"] = "#000000";
    RoomStatusColor["NO_SHOW"] = "#FF5B00";
    RoomStatusColor["CANCELLED"] = "";
})(RoomStatusColor = exports.RoomStatusColor || (exports.RoomStatusColor = {}));
var BlockingColor;
(function (BlockingColor) {
    BlockingColor["INACTIVE"] = "#252525";
    BlockingColor["MAINTENANCE"] = "#323232";
})(BlockingColor = exports.BlockingColor || (exports.BlockingColor = {}));
var BlockingIssue;
(function (BlockingIssue) {
    BlockingIssue["CEILING_LEAKAGE"] = "CEILING_LEAKAGE";
    BlockingIssue["BROKEN_MAIN_DOOR"] = "BROKEN_MAIN_DOOR";
    BlockingIssue["AIR_CONDITIONING"] = "AIR_CONDITIONING";
    BlockingIssue["TOILET_FLUSH"] = "TOILET_FLUSH";
    BlockingIssue["OTHERS"] = "OTHERS";
})(BlockingIssue = exports.BlockingIssue || (exports.BlockingIssue = {}));
var NonBlockingIssue;
(function (NonBlockingIssue) {
    NonBlockingIssue["DIRTINESS"] = "DIRTINESS";
    NonBlockingIssue["TELEPHONE"] = "TELEPHONE";
    NonBlockingIssue["LUGGAGE_RACK_MARBLE"] = "LUGGAGE_RACK_MARBLE";
    NonBlockingIssue["MAIN_DOOR_NOISE"] = "MAIN_DOOR_NOISE";
    NonBlockingIssue["MAIN_DOOR_STOPPER"] = "MAIN_DOOR_STOPPER";
    NonBlockingIssue["BATHROOM_LIGHT"] = "BATHROOM_LIGHT";
    NonBlockingIssue["BATHROOM_EXHAUST"] = "BATHROOM_EXHAUST";
    NonBlockingIssue["BATHROOM_DOOR_NOISE"] = "BATHROOM_DOOR_NOISE";
    NonBlockingIssue["BATHROOM_DOOR_STOPPER"] = "BATHROOM_DOOR_STOPPER";
    NonBlockingIssue["BATHROOM_TUB_STOPPER"] = "BATHROOM_TUB_STOPPER";
    NonBlockingIssue["BATHROOM_SHOWER_GLASS_SILICON_FILLING"] = "BATHROOM_SHOWER_GLASS_SILICON_FILLING";
    NonBlockingIssue["COFFEE_TABLE_LAMP"] = "COFFEE_TABLE_LAMP";
    NonBlockingIssue["COFFEE_TABLE_GLASS"] = "COFFEE_TABLE_GLASS";
    NonBlockingIssue["CONSOLE"] = "CONSOLE";
    NonBlockingIssue["CONSOLE_BASE_BUSH"] = "CONSOLE_BASE_BUSH";
    NonBlockingIssue["TV"] = "TV";
    NonBlockingIssue["TV_REMOTE"] = "TV_REMOTE";
    NonBlockingIssue["KETTLE"] = "BATHROOM_LIGHT";
    NonBlockingIssue["BULB_FUSE"] = "BULB_FUSE";
})(NonBlockingIssue = exports.NonBlockingIssue || (exports.NonBlockingIssue = {}));
var BookingSource;
(function (BookingSource) {
    BookingSource["WALK_IN"] = "WALK_IN";
    BookingSource["WEB"] = "WEB";
    BookingSource["OTA"] = "OTA";
})(BookingSource = exports.BookingSource || (exports.BookingSource = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["ON_HOLD"] = "ON_HOLD";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CHECK_IN"] = "CHECK_IN";
    BookingStatus["OCCUPIED"] = "OCCUPIED";
    BookingStatus["CHECK_OUT"] = "CHECK_OUT";
    BookingStatus["VACATED"] = "VACATED";
    BookingStatus["NO_SHOW"] = "NO_SHOW";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus = exports.BookingStatus || (exports.BookingStatus = {}));
var MarkupType;
(function (MarkupType) {
    MarkupType["PERCENTAGE"] = "PERCENTAGE";
    MarkupType["FLAT"] = "FLAT";
})(MarkupType = exports.MarkupType || (exports.MarkupType = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["VOUCHER"] = "VOUCHER";
    DiscountType["WALK_IN"] = "WALK_IN";
})(DiscountType = exports.DiscountType || (exports.DiscountType = {}));
