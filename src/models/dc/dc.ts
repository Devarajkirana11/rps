import * as Law from './law';
import Identificaton from '../../helpers/identification';

export default class dc {

    private _uuid: string;
    private _name: string;
    private _address_1: string;
    private _address_2: string;
    private _area: string;
    private _city: string;
    private _state: string;
    private _pincode: string;
    private _latitude: string;
    private _longitude: string;
    private _status: string;
    private _created_on: number;
    private _updated_on: number;
    
    public static createdc(data: Law.createDC): dc {
        let newdc: dc = new dc();

        newdc.uuid = Identificaton.generateUuid;
        newdc.name = data.name;
        newdc.address_1 = data.address_1;
        newdc.address_2 = data.address_2;
        newdc.area = data.area;
        newdc.city = data.city;
        newdc.state = data.state;
        newdc.pincode = data.pincode;
        newdc.latitude = data.latitude;
        newdc.longitude = data.longitude;
        newdc.status = data.status;
        newdc.created_on = data.created_on;
        newdc.updated_on = data.updated_on;
        
        return newdc;
    }

    public get document(): Law.createDC {
        return {
            uuid: this.uuid,
            name: this.name,
            address_1: this.address_1,
            address_2: this.address_2,
            area: this.area,
            city: this.city,
            state: this.state,
            pincode : this.pincode,
            latitude : this.latitude,
            longitude : this.longitude,
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

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get address_1(): string {
        return this._address_1;
    }

    public set address_1(value: string) {
        this._address_1 = value;
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

    public get address_2(): string {
        return this._address_2;
    }

    public set address_2(value: string) {
        this._address_2 = value;
    }    

    public get area(): string {
        return this._area;
    }

    public set area(value: string) {
        this._area = value;
    }

    public get city(): string {
        return this._city;
    }

    public set city(value: string) {
        this._city = value;
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        this._state = value;
    }

    public get latitude(): string {
        return this._latitude;
    }

    public set latitude(value: string) {
        this._latitude = value;
    }

    public get longitude(): string {
        return this._longitude;
    }

    public set longitude(value: string) {
        this._longitude = value;
    }

    public get pincode(): string {
        return this._pincode;
    }

    public set pincode(value: string) {
        this._pincode = value;
    }

}
