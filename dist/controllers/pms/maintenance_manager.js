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
const { raw } = require('objection');
const express = require("express");
const Parallel = require("async-parallel");
const MastersLaw = require("../../helpers/masters.law");
const schema_1 = require("../../models/pms/migration/schema");
const maintainance_1 = require("../../models/pms/maintainance");
const masters_1 = require("../../helpers/masters");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const identification_1 = require("../../helpers/identification");
const time_1 = require("../../helpers/time");
const FacilitiesAndServices_1 = require("../hotel_info/FacilitiesAndServices");
const RoomManager_1 = require("../rooms/RoomManager");
class MaintainanceController {
    static get routes() {
        let MMRouter = express.Router();
        MMRouter.route('/getAllBlocks')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let masters = yield this.getAllMasters();
            let columns = req.body.columns;
            let queryColumns = new Array();
            columns.forEach(column => {
                queryColumns.push(column['data']);
            });
            let blockfreeStatus = 2;
            let $sLimitStart;
            let $sLimitLength;
            if (req.body['start'] !== undefined && req.body['start'] != '-1') {
                $sLimitStart = parseInt(req.body['start']);
                $sLimitLength = parseInt(req.body['length']);
            }
            let $sWhere = "blockstatus != " + blockfreeStatus;
            if (res.locals.user_details._hotel_name !== undefined) {
                let rooms = yield RoomManager_1.default.getAllRoomsByHotel(res.locals.user_details._hotel_name);
                if (rooms.success === true) {
                    $sWhere += " AND room_id in (";
                    $sWhere += "'" + rooms.data.join("','") + "'";
                    $sWhere += ") ";
                }
            }
            if (req.body['search']['value'] !== undefined && req.body['search']['value'] != "") {
                $sWhere += " and (";
                columns.forEach((column, index) => {
                    if (column['searchable'] == 'true' && column['search']['value'] !== undefined && column['search']['value'] == "") {
                        $sWhere += column['data'] + " LIKE '%" + req.body['search']['value'] + "%' ";
                        if (index != (parseInt(columns.length) - 1)) {
                            $sWhere += " OR ";
                        }
                    }
                });
                $sWhere += ")";
            }
            columns.forEach(column => {
                if (column['searchable'] == 'true' && column['search']['value'] !== undefined && column['search']['value'] !== "") {
                    if ($sWhere == "") {
                        $sWhere = "WHERE ";
                    }
                    else {
                        $sWhere += " AND ";
                    }
                    if (column['data'] != 'from_date' && column['data'] !== 'to_date') {
                        $sWhere += " " + column['data'] + " LIKE '%" + column['search']['value'] + "%' ";
                    }
                    else if (column['data'] == 'from_date') {
                        $sWhere += " " + column['data'] + " >= '" + column['search']['value'] + "' ";
                    }
                    else if (column['data'] == 'to_date') {
                        $sWhere += " " + column['data'] + " <= '" + column['search']['value'] + "' ";
                    }
                }
            });
            let $sOrder = "";
            let $sOrderdir;
            if (req.body['order'][0]['column'] !== undefined) {
                columns.forEach((column, index) => {
                    if (req.body['order'][0]['column'] == index) {
                        $sOrder = column['data'];
                        $sOrderdir = req.body['order'][0]['dir'];
                    }
                });
            }
            console.log(maintainance_1.default.query()
                .select(raw(queryColumns.join()))
                .where(raw($sWhere))
                .page($sLimitStart, $sLimitLength)
                .orderBy($sOrder, $sOrderdir).toString());
            let $rResult = new Array();
            let $iFilteredTotal;
            let $iTotal = 0;
            let responseeCount = 0;
            yield Parallel.each([
                maintainance_1.default.query()
                    .select(raw(queryColumns.join()))
                    .where(raw($sWhere))
                    .range($sLimitStart, $sLimitLength)
                    .orderBy($sOrder, $sOrderdir)
                    .then(rows => { return { type: 'fetch', data: rows }; })
                    .catch(err => { console.log(err); return { type: 'fetch', data: new Array(), message: err }; }),
                maintainance_1.default.query()
                    .where(raw($sWhere))
                    .page($sLimitStart, $sLimitLength)
                    .orderBy($sOrder, $sOrderdir)
                    .then(rows => { return { type: 'fetchtotal', data: rows }; })
                    .catch(err => { console.log(err); return { type: 'fetchtotal', data: new Array(), message: err }; }),
                maintainance_1.default.query()
                    .then(rows => { return { type: 'total', data: rows }; })
                    .catch(err => { return { type: 'total', data: new Array(), message: err }; }),
            ], (Response) => __awaiter(this, void 0, void 0, function* () {
                yield Response.then(list => {
                    responseeCount++;
                    if (list.type == 'fetch') {
                        $rResult = list.data['results'];
                        if (list.data['results'] !== undefined && $rResult.length > 0) {
                            $rResult.forEach((row, index) => {
                                $rResult[index]['reason'] = FacilitiesAndServices_1.default.findMastertext(masters, 'reason', row['reason']);
                                $rResult[index]['blockstatus'] = FacilitiesAndServices_1.default.findMastertext(masters, 'blockstatus', row['blockstatus']);
                            });
                        }
                    }
                    else if (list.type == 'fetchtotal') {
                        $iFilteredTotal = list.data['total'];
                    }
                    else if (list.type == 'total') {
                        $iFilteredTotal = list.data.length;
                    }
                }).catch(err => {
                    console.log('err ' + err);
                });
                if (responseeCount == 3)
                    res.status(200).json({ success: true, message: 'Fetched block details', Tabledata: { draw: req.body.draw, data: $rResult, recordsFiltered: $iFilteredTotal, recordsTotal: $iFilteredTotal } });
            }));
        }));
        MMRouter.route('/:id')
            .get(inputvalidator_1.default.paramsID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            maintainance_1.default.query()
                .where('blockid', '=', req.params.id)
                .then(row => {
                res.status(200).json({ success: true, message: 'successfully retrived the maintenance info', data: row });
            })
                .catch(e => {
                res.status(400).json({ success: false, message: e.data });
            });
        }));
        MMRouter.route('/')
            .post(inputvalidator_1.default.maintainanceValidate('api'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let table = schema_1.default.createMaintainance();
            let ParallelExe = yield Parallel;
            let room_ids = new Array();
            let rooms = JSON.parse(req.body.room_details);
            let MArray = new Array();
            let batchInsertCount = 0;
            let successCount = 0;
            let errorArray = new Array();
            rooms.forEach(block => {
                room_ids.push(block.room_id);
                let block_data = {
                    userid: req.body.userid,
                    from_date: req.body.from_date,
                    to_date: req.body.to_date,
                    reason: req.body.reason,
                    status: req.body.status,
                    blockstatus: req.body.blockstatus,
                    room_id: block.room_id,
                    room_no: block.value,
                    floor_no: block.floorNumber,
                    room_name: block.room_name
                };
                MArray.push(block_data);
            });
            yield table.then(table => {
                maintainance_1.default.query()
                    .where('to_date', '>', req.body.from_date)
                    .where('from_date', '<', req.body.to_date)
                    .where('room_id', 'in', room_ids)
                    .then(fetchRows => {
                    let availableBlockids = new Array();
                    fetchRows.forEach(block => {
                        availableBlockids.push(block.blockid);
                    });
                    if (fetchRows.length == 0 || availableBlockids.indexOf(req.body.blockid) > -1) {
                        if (req.body.blockid !== undefined && inputvalidator_1.default.isValidUUID(req.body.blockid)) {
                            MArray.forEach((room, index) => {
                                room['modifiedTime'] = time_1.default.serverTime;
                            });
                            var result = ParallelExe.map(MArray, (item) => __awaiter(this, void 0, void 0, function* () {
                                batchInsertCount++;
                                yield maintainance_1.default.query().patch(item).where('blockid', '=', req.body.blockid).then(data => {
                                    successCount++;
                                }).catch(err => {
                                    errorArray.push(err);
                                });
                            }));
                            result.then(resdata => {
                                if (batchInsertCount == rooms.length) {
                                    if (successCount == rooms.length) {
                                        res.status(200).json({ success: true, message: 'successfully updated the maintenance' });
                                    }
                                    else {
                                        res.status(400).json({ success: false, message: errorArray });
                                    }
                                }
                            });
                        }
                        else {
                            MArray.forEach((room, index) => {
                                room['blockid'] = identification_1.default.generateUuid;
                                room['createdTime'] = time_1.default.serverTime;
                                room['modifiedTime'] = time_1.default.serverTime;
                            });
                            var result = ParallelExe.map(MArray, (item) => __awaiter(this, void 0, void 0, function* () {
                                batchInsertCount++;
                                yield maintainance_1.default.query().insert(item).then(data => {
                                    successCount++;
                                }).catch(err => {
                                    errorArray.push(err);
                                });
                            }));
                            result.then(resdata => {
                                if (batchInsertCount == rooms.length) {
                                    if (successCount == rooms.length) {
                                        res.status(200).json({ success: true, message: 'successfully saved the maintenance' });
                                    }
                                    else {
                                        res.status(400).json({ success: false, message: errorArray });
                                    }
                                }
                            });
                        }
                    }
                    else {
                        res.status(400).json({ success: false, message: 'Cannot be Scheduled. Please change your time slot.' });
                    }
                })
                    .catch(e => {
                    res.status(400).json({ success: false, message: e, errordata: 'failing to search blocks' });
                });
            }).catch(err => {
                res.status(400).json({ success: false, message: err });
            });
        }));
        return MMRouter;
    }
}
MaintainanceController.getAllMasters = () => __awaiter(this, void 0, void 0, function* () {
    let respond = {};
    let masterExists = true;
    let masterCollection = core_1.default.app.get('mongoClient').get('masters');
    masterExists = yield masterCollection.find({ type: MastersLaw.Type.MAINTAINANCE })
        .then(coll => {
        if (coll.length == 0) {
            return false;
        }
    });
    if (masterExists === false)
        return respond;
    let dropdowndata = yield masters_1.default.getDropdown(MastersLaw.Type.MAINTAINANCE, undefined);
    Object.keys(dropdowndata).forEach(df => {
        respond[dropdowndata[df]['title']] = dropdowndata[df].data;
    });
    let keyValueData = yield masters_1.default.getKeyValuePair(MastersLaw.Type.MAINTAINANCE, undefined);
    Object.keys(keyValueData).forEach(df => {
        respond[keyValueData[df]['title']] = keyValueData[df].data;
    });
    return respond;
});
exports.default = MaintainanceController;
