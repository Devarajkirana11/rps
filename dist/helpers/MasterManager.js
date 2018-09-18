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
const inputvalidator_1 = require("../middlewares/validation/inputvalidator");
const masters_1 = require("./masters");
const MastersLaw = require("./masters.law");
class MasterManager {
    static getMasterType(type) {
        if (type == "HOTEL_FACILITIES") {
            return MastersLaw.Type.HOTEL_FACILITIES;
        }
        else if (type == "ROOMS") {
            return MastersLaw.Type.ROOMS;
        }
        else if (type == "MAINTAINANCE")
            return MastersLaw.Type.MAINTAINANCE;
        else {
            return undefined;
        }
    }
    static get routes() {
        let MasterRouter = express.Router();
        MasterRouter.route('/:mastertype/dropdown').get(inputvalidator_1.default.checkMasterType, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let title = undefined;
            if (req.query.title !== undefined) {
                title = req.query.title;
            }
            let respond;
            yield masters_1.default.getDropdown(this.getMasterType(req.params.mastertype), title)
                .then(dropdown => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Master dropdown is collected`,
                    data: dropdown
                };
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
        MasterRouter.route('/:mastertype/dropdown').post(inputvalidator_1.default.checkMasterType, inputvalidator_1.default.Validate('dropdown'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let newDropdown = {
                title: req.body.title,
                data: req.body.data
            };
            let respond;
            yield masters_1.default.putDropdown(this.getMasterType(req.params.mastertype), newDropdown)
                .then(success => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Master has been updated`
                };
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
        MasterRouter.route('/:mastertype/dropdown').delete(inputvalidator_1.default.checkMasterType, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let title = req.query.title;
            let respond;
            yield masters_1.default.deleteDropdown(this.getMasterType(req.params.mastertype), title)
                .then(success => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Dropdown has been deleted`
                };
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
        MasterRouter.route('/:mastertype/key-value-pair').get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let title = undefined;
            if (req.query.title !== undefined) {
                title = req.query.title;
            }
            let respond;
            yield masters_1.default.getKeyValuePair(this.getMasterType(req.params.mastertype), title)
                .then(keyValuePair => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Master keyValuePair is collected`,
                    data: keyValuePair
                };
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
        MasterRouter.route('/:mastertype/key-value-pair').post(inputvalidator_1.default.Validate('key-value-pair'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let newKeyValuePair = {
                title: req.body.title,
                data: req.body.data
            };
            let respond;
            yield masters_1.default.putKeyValuePair(this.getMasterType(req.params.mastertype), newKeyValuePair)
                .then(success => {
                res.status(200);
                respond = {
                    success: true,
                    message: `Master has been updated`
                };
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
        MasterRouter.route('/:mastertype/key-value-pair').delete((req, res) => __awaiter(this, void 0, void 0, function* () {
            let title = req.query.title;
            let respond;
            yield masters_1.default.deleteKeyValuePair(this.getMasterType(req.params.mastertype), title)
                .then(success => {
                res.status(200);
                respond = {
                    success: true,
                    message: `KeyValuePair has been deleted`
                };
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
        return MasterRouter;
    }
}
exports.default = MasterManager;
