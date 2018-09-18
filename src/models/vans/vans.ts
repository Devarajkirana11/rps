import * as Law from './law';
import Identificaton from '../../helpers/identification';

export default class vans {

    private _uuid: string;
    private _make: string;
    private _reg_no: string;
    private _type: string;
    private _capacity: string;
    private _provider: string;
    private _gps_tracking_id: string;
    private _documents: string;
    private _dc_uuid: string;
    private _dc_name: any;
    private _color_code: any;
    private _status: string;
    private _created_on: number;
    private _updated_on: number;
    
    public static createvan(data: Law.createVan): vans {
        let newvan: vans = new vans();

        newvan.uuid = Identificaton.generateUuid;
        newvan.make = data.make;
        newvan.reg_no = data.reg_no;
        newvan.type = data.type;
        newvan.capacity = data.capacity;
        newvan.provider = data.provider;
        newvan.gps_tracking_id = data.gps_tracking_id;
        newvan.documents = data.documents;
        newvan.dc_uuid = data.dc_uuid;
        newvan.dc_name = data.dc_name;
        newvan.color_code = data.color_code;
        newvan.status = data.status;
        newvan.created_on = data.created_on;
        newvan.updated_on = data.updated_on;
        
        return newvan;
    }

    public get document(): Law.createVan {
        return {
            uuid: this.uuid,
            make: this.make,
            reg_no: this.reg_no,
            type: this.type,
            capacity: this.capacity,
            provider: this.provider,
            gps_tracking_id: this.gps_tracking_id,
            documents : this.documents,
            dc_uuid : this.dc_uuid,
            dc_name: this.dc_name,
            color_code: this.color_code,
            status: this.status,
            created_on: this.created_on,
            updated_on: this.updated_on
        };
    }

    public get uuid(): string {
        return this._uuid;
    }

    public set uuid(value: string) {
        this._uuid = value;
    }

    public get make(): string {
        return this._make;
    }

    public set make(value: string) {
        this._make = value;
    }

    public get reg_no(): string {
        return this._reg_no;
    }

    public set reg_no(value: string) {
        this._reg_no = value;
    }

    public get status(): string {
        return this._status;
    }

    public set status(value: string) {
        this._status = value;
    }

    public get created_on(): number {
        return this._created_on;
    }

    public set created_on(value: number) {
        this._created_on = value;
    }

    public get updated_on(): number {
        return this._updated_on;
    }

    public set updated_on(value: number) {
        this._updated_on = value;
    }

    public get type(): string {
        return this._type;
    }

    public set type(value: string) {
        this._type = value;
    }    

    public get capacity(): string {
        return this._capacity;
    }

    public set capacity(value: string) {
        this._capacity = value;
    }

    public get provider(): string {
        return this._provider;
    }

    public set provider(value: string) {
        this._provider = value;
    }

    public get gps_tracking_id(): string {
        return this._gps_tracking_id;
    }

    public set gps_tracking_id(value: string) {
        this._gps_tracking_id = value;
    }

    public get documents(): string {
        return this._documents;
    }

    public set documents(value: string) {
        this._documents = value;
    }

    public get dc_uuid(): string {
        return this._dc_uuid;
    }

    public set dc_uuid(value: string) {
        this._dc_uuid = value;
    }

    public get dc_name(): string {
        return this._dc_name;
    }

    public set dc_name(value: string) {
        this._dc_name = value;
    }
    
    public get color_code(): string {
        return this._color_code;
    }

    public set color_code(value: string) {
        this._color_code = value;
    }

}
