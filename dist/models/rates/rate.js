"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../../helpers/time");
class Rate {
    static create(hotelId) {
        let newRate = new Rate();
        let currentMoment = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        newRate.hotelId = hotelId;
        newRate.defaultCurrency = 'MYR';
        newRate.defaultCostRate = 0;
        newRate.defaultDayWiseCost = {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0
        };
        newRate.defaultDateWiseCost = new Array();
        newRate.roomTypeMarkups = new Array();
        newRate.sellRatePlans = new Array();
        newRate.createdAt = currentMoment;
        newRate.updatedAt = currentMoment;
        newRate.configured = false;
        newRate.active = false;
        return newRate;
    }
    static spawn(document) {
        let newRate = new Rate();
        newRate.hotelId = document._hotelId;
        newRate.defaultCurrency = document._defaultCurrency;
        newRate.defaultCostRate = document._defaultCostRate;
        newRate.defaultDayWiseCost = document._defaultDayWiseCost;
        newRate.defaultDateWiseCost = document._defaultDateWiseCost;
        newRate.roomTypeMarkups = document._roomTypeMarkups;
        newRate.sellRatePlans = document._sellRatePlans;
        newRate.createdAt = document._createdAt;
        newRate.updatedAt = document._updatedAt;
        newRate.configured = document._configured;
        newRate.active = document._active;
        return newRate;
    }
    configureDefault(data) {
        this.defaultCurrency = data.defaultCurrency;
        this.defaultCostRate = data.defaultCostRate;
        this.defaultDayWiseCost = data.defaultDayWiseCost;
        if (data.defaultDateWiseCost.hasOwnProperty('dates')) {
            data.defaultDateWiseCost.dates.forEach(date => {
                for (let ob of this.defaultDateWiseCost) {
                    let otherDates = new Array();
                    for (let e of ob.dates) {
                        if (time_1.default.formatGivenDate(date) !== time_1.default.formatGivenDate(e)) {
                            otherDates.push(e);
                        }
                    }
                    ob.dates = otherDates;
                }
            });
            this.defaultDateWiseCost = this.defaultDateWiseCost.filter(e => e.dates.length > 0);
            this.defaultDateWiseCost.push(data.defaultDateWiseCost);
        }
        this.configured = true;
        this.updatedAt = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        return this;
    }
    get defaultConfiguration() {
        return {
            defaultCostRate: this.defaultCostRate,
            defaultCurrency: this.defaultCurrency,
            defaultDayWiseCost: this.defaultDayWiseCost,
            defaultDateWiseCost: this.defaultDateWiseCost
        };
    }
    getRoomType(roomType) {
        return this.roomTypeMarkups.find(e => e.roomType === roomType);
    }
    getMarkup(roomType) {
        return this.roomTypeMarkups.find(e => e.roomType === roomType).markup;
    }
    addRoomTypeMarkup(roomType) {
        this.roomTypeMarkups.push({
            roomType: roomType,
            markup: undefined,
            configured: false,
            active: false
        });
        this.refreshRateStatus();
    }
    removeRoomTypeMarkup(roomType) {
        let roomTypeMarkup = this.roomTypeMarkups.find(e => e.roomType === roomType);
        let removedMarkup = this.roomTypeMarkups.splice(this.roomTypeMarkups.indexOf(roomTypeMarkup), 1);
        if (removedMarkup.length === 1) {
            this.refreshRateStatus();
            return true;
        }
        return false;
    }
    configureRoomTypeMarkup(roomType, markup) {
        let roomTypeMarkup = this.roomTypeMarkups.find(e => e.roomType === roomType);
        if (roomTypeMarkup !== undefined) {
            roomTypeMarkup.markup = markup;
            roomTypeMarkup.configured = true;
            this.refreshRateStatus();
            return true;
        }
        return false;
    }
    activateRoomTypeMarkup(roomType) {
        let roomTypeMarkup = this.roomTypeMarkups.find(e => e.roomType === roomType);
        if (roomTypeMarkup !== undefined) {
            roomTypeMarkup.active = true;
            this.refreshRateStatus();
            return true;
        }
        return false;
    }
    deactivateRoomTypeMarkup(roomType) {
        let roomTypeMarkup = this.roomTypeMarkups.find(e => e.roomType === roomType);
        if (roomTypeMarkup !== undefined) {
            roomTypeMarkup.active = false;
            this.refreshRateStatus();
            return true;
        }
        return false;
    }
    addSellRatePlan(data) {
        let newSellRatePlan = {
            name: data.name,
            startDate: time_1.default.serverMomentInPattern(data.startDate, 'DD-MM-YYYY').toDate(),
            endDate: time_1.default.serverMomentInPattern(data.endDate, 'DD-MM-YYYY').toDate(),
            channels: data.channels,
            cancellationPolicyId: data.cancellationPolicyId,
            markup: data.markup,
            conditions: data.conditions,
            active: data.active
        };
        this.sellRatePlans.forEach(plan => {
            if (newSellRatePlan.name === plan.name) {
                return false;
            }
        });
        this.sellRatePlans.push(newSellRatePlan);
        return true;
    }
    get isConfigured() {
        return this.configured;
    }
    get isActive() {
        return this.active;
    }
    refreshRateStatus() {
        let roomTypeMarkup = this.roomTypeMarkups.filter(e => e.active === false);
        if (roomTypeMarkup.length > 0) {
            this.active = false;
        }
        else {
            this.active = true;
        }
        this.updatedAt = time_1.default.serverMomentInPattern(time_1.default.serverTime, 'DD-MM-YYYY HH:mm:ss').toDate();
    }
    isPlanNameValid(name) {
        let isValid = true;
        this.sellRatePlans.forEach(e => {
            if (e.name == name) {
                isValid = false;
            }
        });
        return isValid;
    }
    sliceSellRatePlan(name) {
        let sellRatePlan;
        let index;
        this.sellRatePlans.forEach((e, i) => {
            if (e.name == name) {
                sellRatePlan = e;
                index = i;
            }
        });
        if (sellRatePlan !== undefined && index !== undefined) {
            this.sellRatePlans.splice(index, 1);
        }
        return sellRatePlan;
    }
    getConfiguredChannelsByDate(startDate, endDate) {
        let configuredChannels = new Array();
        let startDateA = time_1.default.serverMomentInPattern(startDate, 'DD-MM-YYYY');
        let endDateA = time_1.default.serverMomentInPattern(endDate, 'DD-MM-YYYY');
        for (let plan of this.sellRatePlans) {
            let startDateB = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(plan.startDate), 'DD-MM-YYYY');
            let endDateB = time_1.default.serverMomentInPattern(time_1.default.formatGivenDate(plan.endDate), 'DD-MM-YYYY');
            if (startDateA <= endDateB && endDateA >= startDateB) {
                plan.channels.forEach(channel => configuredChannels.push(channel));
            }
        }
        return configuredChannels.filter((value, index, self) => self.indexOf(value) === index);
    }
    hasChannelConflicts(startDate, endDate, channels) {
        let existingConfiguredChannels = this.getConfiguredChannelsByDate(startDate, endDate);
        let hasConflicts = false;
        existingConfiguredChannels.forEach(e => {
            if (channels.indexOf(e) !== -1) {
                hasConflicts = true;
            }
        });
        return hasConflicts;
    }
    isConditionValid(conditions) {
        let isValid = true;
        conditions.forEach(condition => {
            if (condition.minimumStay == null && condition.advanceBookingPeriod == null) {
                isValid = false;
            }
            else if (condition.cancellationPolicyId == null || condition.markup == null) {
                isValid = false;
            }
            else if (condition.markup.coating == null || condition.markup.type == null || condition.markup.value == null) {
                isValid = false;
            }
        });
        return isValid;
    }
    configureSellRatePlan(name, startDate, endDate, cancellationPolicyId, markup, channels, conditions) {
        let data = {
            name: name,
            startDate: time_1.default.serverMomentInPattern(startDate, 'DD-MM-YYYY').toDate(),
            endDate: time_1.default.serverMomentInPattern(endDate, 'DD-MM-YYYY').toDate(),
            cancellationPolicyId: cancellationPolicyId,
            markup: markup,
            channels: channels,
            conditions: conditions,
            active: false
        };
        this.sellRatePlans.push(data);
    }
    activateSellRatePlan(sellRateName) {
        let sellRatePlan = this.sellRatePlans.find(e => e.name === sellRateName);
        if (sellRatePlan !== undefined) {
            sellRatePlan.active = true;
            return true;
        }
        return false;
    }
    deactivateSellRatePlan(sellRateName) {
        let sellRatePlan = this.sellRatePlans.find(e => e.name === sellRateName);
        if (sellRatePlan !== undefined) {
            sellRatePlan.active = false;
            return true;
        }
        return false;
    }
    get sellPlanPayload() {
        let payload = new Array();
        this.sellRatePlans.forEach(plan => {
            payload.push({
                name: plan.name,
                startDate: time_1.default.formatGivenDate(plan.startDate),
                endDate: time_1.default.formatGivenDate(plan.endDate),
                markup: plan.markup,
                channels: plan.channels,
                active: plan.active,
            });
        });
        return payload;
    }
    get hotelId() {
        return this._hotelId;
    }
    set hotelId(value) {
        this._hotelId = value;
    }
    get defaultCurrency() {
        return this._defaultCurrency;
    }
    set defaultCurrency(value) {
        this._defaultCurrency = value;
    }
    get defaultCostRate() {
        return this._defaultCostRate;
    }
    set defaultCostRate(value) {
        this._defaultCostRate = value;
    }
    get defaultDayWiseCost() {
        return this._defaultDayWiseCost;
    }
    set defaultDayWiseCost(value) {
        this._defaultDayWiseCost = value;
    }
    get defaultDateWiseCost() {
        return this._defaultDateWiseCost;
    }
    set defaultDateWiseCost(value) {
        this._defaultDateWiseCost = value;
    }
    get roomTypeMarkups() {
        return this._roomTypeMarkups;
    }
    set roomTypeMarkups(value) {
        this._roomTypeMarkups = value;
    }
    get sellRatePlans() {
        return this._sellRatePlans;
    }
    set sellRatePlans(value) {
        this._sellRatePlans = value;
    }
    get createdAt() {
        return this._createdAt;
    }
    set createdAt(value) {
        this._createdAt = value;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    set updatedAt(value) {
        this._updatedAt = value;
    }
    get configured() {
        return this._configured;
    }
    set configured(value) {
        this._configured = value;
    }
    get active() {
        return this._active;
    }
    set active(value) {
        this._active = value;
    }
}
exports.default = Rate;
