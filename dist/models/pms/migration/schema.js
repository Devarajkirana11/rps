"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../../core");
class Migration {
    static createMaintainance() {
        return core_1.default.app.get('mysqlClient').schema.createTableIfNotExists('maintainance', table => {
            table.increments('id').primary();
            table.string('blockid');
            table.string('userid');
            table.dateTime('to_date');
            table.dateTime('from_date');
            table.integer('status');
            table.string('room_id');
            table.integer('room_no');
            table.string('room_name');
            table.string('floor_no');
            table.dateTime('createdTime');
            table.dateTime('modifiedTime');
            table.integer('reason');
            table.integer('blockstatus');
        });
    }
}
exports.default = Migration;
