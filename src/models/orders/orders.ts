import * as Law from './law';
import Identificaton from '../../helpers/identification';

export default class orders {

    private _uuid: string;
    private _order_id: number;
    private _mobile: string;
    private _store: string;
    private _order_total: string;
    private _payment_method: string;
    private _customer_name: string;
    private _address_1: string;
    private _address_2: string;
    private _city: string;
    private _pin_code: string;
    private _delivery_charge: string;
    private _delivery_date: string;
    private _slot: string;
    private _latitude: string;
    private _longitude: string;
    private _dc_name: string;
    private _weight: string;
    private _van_uuid: string;
    private _color_code: string;
    private _status: string;
    private _created_on: string;
    private _updated_on: number;
    
    public static createOrder(data: Law.createOrder): orders {
        let newOrder: orders = new orders();

        newOrder.uuid = Identificaton.generateUuid;
        newOrder.order_id = data.order_id;
        newOrder.address_1 = data.address_1;
        newOrder.address_2 = data.address_2;
        newOrder.city = data.city;
        newOrder.pin_code = data.pin_code;
        newOrder.mobile = data.mobile;
        newOrder.store = data.store;
        newOrder.order_total = data.order_total;
        newOrder.payment_method = data.payment_method;
        newOrder.customer_name = data.customer_name;
        newOrder.delivery_charge = data.delivery_charge;
        newOrder.delivery_date = data.delivery_date;
        newOrder.slot = data.slot;
        newOrder.latitude = data.latitude;
        newOrder.longitude = data.longitude;
        newOrder.dc_name = data.dc_name;
        newOrder.weight = data.weight;
        newOrder.van_uuid = data.van_uuid;
        newOrder.color_code = data.color_code;
        newOrder.status = data.status;
        newOrder.created_on = data.created_on;
        newOrder.updated_on = data.updated_on;
        
        return newOrder;
    }

    public get document(): Law.createOrder {
        return {
            uuid: this.uuid,
            order_id: this.order_id,
            address_1: this.address_1,
            address_2: this.address_2,
            city: this.city,
            pin_code: this.pin_code,
            mobile: this.mobile,
            store: this.store,
            order_total: this.order_total,
            payment_method: this.payment_method,
            customer_name: this.customer_name,
            delivery_charge: this.delivery_charge,
            delivery_date: this.delivery_date,
            slot: this.slot,
            latitude: this.latitude,
            longitude: this.longitude,
            dc_name: this.dc_name,
            weight: this.weight,
            van_uuid: this.van_uuid,
            color_code: this.color_code,
            status: this.status,
            created_on: this.created_on,
            updated_on: this.updated_on
		};
    }

    public get order_id(): number {
        return this._order_id;
    }
    public set order_id(value: number) {
        this._order_id = value;
    }
    public get uuid(): string {
        return this._uuid;
    }
    public set uuid(value: string) {
        this._uuid = value;
    }
    public get status(): string {
        return this._status;
    }
    public set status(value: string) {
        this._status = value;
    }
    public get created_on(): string {
        return this._created_on;
    }
    public set created_on(value: string) {
        this._created_on = value;
    }
    public get updated_on(): number {
        return this._updated_on;
    }
    public set updated_on(value: number) {
        this._updated_on = value;
    }
    public get delivery_date(): string {
        return this._delivery_date;
    }
    public set delivery_date(value: string) {
        this._delivery_date = value;
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
    public get dc_name(): string {
        return this._dc_name;
    }
    public set dc_name(value: string) {
        this._dc_name = value;
    }
    public get slot(): string {
        return this._slot;
    }
    public set slot(value: string) {
        this._slot = value;
    }
    public get mobile(): string {
        return this._mobile;
    }
    public set mobile(value: string) {
        this._mobile = value;
    }
    public get store(): string {
        return this._store;
    }
    public set store(value: string) {
        this._store = value;
    }
    public get order_total(): string {
        return this._order_total;
    }
    public set order_total(value: string) {
        this._order_total = value;
    }
    public get payment_method(): string {
        return this._payment_method;
    }
    public set payment_method(value: string) {
        this._payment_method = value;
    }
    public get customer_name(): string {
        return this._customer_name;
    }
    public set customer_name(value: string) {
        this._customer_name = value;
    }
    public get address_1(): string {
        return this._address_1;
    }
    public set address_1(value: string) {
        this._address_1 = value;
    }
    public get address_2(): string {
        return this._address_2;
    }
    public set address_2(value: string) {
        this._address_2 = value;
    }
    public get city(): string {
        return this._city;
    }
    public set city(value: string) {
        this._city = value;
    }
    public get pin_code(): string {
        return this._pin_code;
    }
    public set pin_code(value: string) {
        this._pin_code = value;
    }
    public get delivery_charge(): string {
        return this._delivery_charge;
    }
    public set delivery_charge(value: string) {
        this._delivery_charge = value;
    }
    public get weight(): string {
        return this._weight;
    }
    public set weight(value: string) {
        this._weight = value;
    }
    public get van_uuid(): string {
        return this._van_uuid;
    }
    public set van_uuid(value: string) {
        this._van_uuid = value;
    }
    public get color_code(): string {
        return this._color_code;
    }
    public set color_code(value: string) {
        this._color_code = value;
    }
}
