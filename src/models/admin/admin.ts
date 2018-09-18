import * as Law from './law';

export default class Admin {

    private _objectId: string;
    private _tax_id: string;
    private _tax_level: string;
    private _hotel_id: string;
    private _name: string;
    private _country: string;
    private _state: string;
    private _city: string;
    private _tax_value: string;
    private _type: string;
    private _status: string;
    private _applicable_level: string;
    private _calculation_type: string;
    private _based_on: string;
    private _add_on: string;
    private _created_on: any;
 
    
    public static create(data: Law.TaxCreate): Admin {

        let newTax = new Admin();

        newTax.tax_id = data.tax_id;
        newTax.tax_level = data.tax_level;
        newTax.hotel_id = data.hotel_id;
        newTax.name = data.name;
        newTax.country = data.country;
        newTax.state = data.state;
        newTax.city = data.city;
        newTax.type = data.type;
        newTax.tax_value = data.tax_value;
        newTax.status = data.status;
        newTax.created_on = data.created_on;
        newTax.applicable_level = data.applicable_level;
        newTax.calculation_type = data.calculation_type;
        newTax.based_on = data.based_on;
        newTax.add_on = data.add_on;

        return newTax;
    }

    public get objectId(): string {
        return this._objectId;
    }

    public set objectId(value: string) {
        this._objectId = value;
    }

    public get tax_level(): string {
        return this._tax_level;
    }

    public set tax_level(value: string) {
        this._tax_level = value;
    }

    public get hotel_id(): string {
        return this._hotel_id;
    }

    public set hotel_id(value: string) {
        this._hotel_id = value;
    }
    public get tax_id(): string {
        return this._tax_id;
    }

    public set tax_id(value: string) {
        this._tax_id = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get calculation_type(): string {
        return this._calculation_type;
    }

    public set calculation_type(value: string) {
        this._calculation_type = value;
    }

    public get based_on(): string {
        return this._based_on;
    }

    public set based_on(value: string) {
        this._based_on = value;
    }

    public get add_on(): string {
        return this._add_on;
    }

    public set add_on(value: string) {
        this._add_on = value;
    }        

    public get applicable_level(): string {
        return this._applicable_level;
    }

    public set applicable_level(value: string) {
        this._applicable_level = value;
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        this._state = value;
    }

    public get country(): string {
        return this._country;
    }

    public set country(value: string) {
        this._country = value;
    }

    public get city(): string {
        return this._city;
    }

    public set city(value: string) {
        this._city = value;
    }

    public get type(): string {
        return this._type;
    }

    public set type(value: string) {
        this._type = value;
    }

    public get taxt_value(): string {
        return this._tax_value;
    }

    public set tax_value(value: string) {
        this._tax_value = value;
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

}
