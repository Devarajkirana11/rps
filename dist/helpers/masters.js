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
const core_1 = require("../core");
class Masters {
    constructor(masterType) {
        this.type = masterType;
        this.dropdown = new Array();
        this.keyValuePair = new Array();
    }
    get document() {
        return {
            type: this.type,
            dropdown: this.dropdown,
            keyValuePair: this.keyValuePair
        };
    }
    static getDropdown(masterType, title) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let masterCollection = core_1.default.app.get('mongoClient').get('masters');
            yield masterCollection
                .findOne({
                type: masterType
            })
                .then(master => {
                if (title === undefined) {
                    resolve(master.dropdown);
                }
                else {
                    resolve(master.dropdown.find(element => element.title == title));
                }
            })
                .catch(error => reject(error));
        }));
    }
    static putDropdown(masterType, newDropdown) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let masterCollection = core_1.default.app.get('mongoClient').get('masters');
            yield masterCollection
                .findOne({
                type: masterType
            })
                .then((master) => __awaiter(this, void 0, void 0, function* () {
                if (master === null) {
                    let newMaster = new Masters(masterType);
                    newMaster.dropdown.push(newDropdown);
                    return yield masterCollection.insert(newMaster.document);
                }
                else {
                    let index = master.dropdown.findIndex(element => element.title === newDropdown.title);
                    if (master.dropdown[index]) {
                        master.dropdown[index] = newDropdown;
                    }
                    else {
                        master.dropdown.push(newDropdown);
                    }
                    return yield masterCollection.update({
                        type: masterType
                    }, master);
                }
            }))
                .then(success => resolve(success))
                .catch(error => reject(error));
        }));
    }
    static deleteDropdown(masterType, title) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let masterCollection = core_1.default.app.get('mongoClient').get('masters');
            if (title !== undefined && title !== null && title !== '') {
                yield masterCollection
                    .findOne({
                    type: masterType
                })
                    .then((master) => __awaiter(this, void 0, void 0, function* () {
                    let index = master.dropdown.findIndex(element => element.title === title);
                    if (master.dropdown[index]) {
                        master.dropdown.splice(index, 1);
                    }
                    else {
                        reject(new Error('Could not find title'));
                    }
                    yield masterCollection.update({
                        type: masterType
                    }, master);
                    resolve();
                }))
                    .catch(error => reject(error));
            }
            else {
                reject(new Error('Title must be provided'));
            }
        }));
    }
    static getKeyValuePair(masterType, title) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let masterCollection = core_1.default.app.get('mongoClient').get('masters');
            yield masterCollection
                .findOne({
                type: masterType
            })
                .then(master => {
                if (title === undefined) {
                    resolve(master.keyValuePair);
                }
                else {
                    resolve(master.keyValuePair.find(element => element.title == title));
                }
            })
                .catch(error => reject(error));
        }));
    }
    static putKeyValuePair(masterType, newKeyValuePair) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let masterCollection = core_1.default.app.get('mongoClient').get('masters');
            yield masterCollection
                .findOne({
                type: masterType
            })
                .then((master) => __awaiter(this, void 0, void 0, function* () {
                if (master === null) {
                    let newMaster = new Masters(masterType);
                    newMaster.keyValuePair.push(newKeyValuePair);
                    return yield masterCollection.insert(newMaster.document);
                }
                else {
                    let index = master.keyValuePair.findIndex(element => element.title === newKeyValuePair.title);
                    if (master.keyValuePair[index]) {
                        master.keyValuePair[index] = newKeyValuePair;
                    }
                    else {
                        master.keyValuePair.push(newKeyValuePair);
                    }
                    return yield masterCollection.update({
                        type: masterType
                    }, master);
                }
            }))
                .then(success => resolve(success))
                .catch(error => reject(error));
        }));
    }
    static deleteKeyValuePair(masterType, title) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let masterCollection = core_1.default.app.get('mongoClient').get('masters');
            if (title !== undefined && title !== null && title !== '') {
                yield masterCollection
                    .findOne({
                    type: masterType
                })
                    .then((master) => __awaiter(this, void 0, void 0, function* () {
                    let index = master.keyValuePair.findIndex(element => element.title === title);
                    if (master.keyValuePair[index]) {
                        master.keyValuePair.splice(index, 1);
                    }
                    else {
                        reject(new Error('Could not find title'));
                    }
                    yield masterCollection.update({
                        type: masterType
                    }, master);
                    resolve();
                }))
                    .catch(error => reject(error));
            }
            else {
                reject(new Error('Title must be provided'));
            }
        }));
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get dropdown() {
        return this._dropdown;
    }
    set dropdown(value) {
        this._dropdown = value;
    }
    get keyValuePair() {
        return this._keyValuePair;
    }
    set keyValuePair(value) {
        this._keyValuePair = value;
    }
}
Masters.getHotelDetails = () => __awaiter(this, void 0, void 0, function* () {
    let result;
    let hotelCollection = core_1.default.app.get('mongoClient').get('hotel_details');
    yield hotelCollection.find({}, { "sort": { "_id": -1 } })
        .then(document => {
        result = {
            success: true,
            message: `We have collected the requested hotel Details`,
            data: document
        };
    })
        .catch(error => {
        result = {
            success: false,
            message: error.message,
            data: []
        };
    });
    return result;
});
Masters.getUserDetails = () => __awaiter(this, void 0, void 0, function* () {
    let result;
    let hotelCollection = core_1.default.app.get('mongoClient').get('users');
    yield hotelCollection.find({}, { "sort": { "_id": -1 } })
        .then(document => {
        result = {
            success: true,
            message: `We have collected the requested users Details`,
            data: document
        };
    })
        .catch(error => {
        result = {
            success: false,
            message: error.message,
            data: []
        };
    });
    return result;
});
exports.default = Masters;
