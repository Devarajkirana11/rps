import * as Law from './law';
import Identificaton from '../../helpers/identification';

export default class CDE {

    private _uuid: string;
    private _user_id: number;
    private _first_name: string;
    private _last_name: string;
    private _email: string;
    private _mobile: string;
    private _age: number;
    private _joining_date: string;
    private _employee_id: string;
    private _password: string;
    private _roles: any;
    private _status: string;
    private _created_on: number;
    private _updated_on: number;
    private _last_access: number;
    private _last_logged_in: string;
    private _last_logged_out: string;
    
    public static createCDE(data: Law.createCDE): CDE {
        let newCDE: CDE = new CDE();

        newCDE.uuid = Identificaton.generateUuid;
        newCDE.user_id = Math.floor(100000 + Math.random() * 900000);
        newCDE.first_name = data.first_name;
        newCDE.last_name = data.last_name;
        newCDE.email = data.email;
        newCDE.mobile = data.mobile;
        newCDE.age = data.age;
        newCDE.employee_id = data.employee_id;
        newCDE.joining_date = data.joining_date;
        newCDE.password = data.password;
        newCDE.status = data.status;
        newCDE.created_on = data.created_on;
        newCDE.roles = data.roles;
        newCDE.updated_on = data.updated_on;
        newCDE.last_access = data.last_access;

        return newCDE;
    }

    public get document(): Law.createCDE {
        return {
            uuid: this.uuid,
            user_id: this.user_id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            mobile: this.mobile,
            age: this.age,
            employee_id : this.employee_id,
            joining_date : this.joining_date,
            password: this.password,
            roles: this.roles,
            status: this.status,
            created_on: this.created_on,
            updated_on: this.updated_on,
            last_access: this.last_access
		};
    }

    public get user_id(): number {
        return this._user_id;
    }

    public set user_id(value: number) {
        this._user_id = value;
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

    public get last_access(): number {
        return this._last_access;
    }

    public set last_access(value: number) {
        this._last_access = value;
    }    

    public get roles(): string {
        return this._roles;
    }

    public set roles(value: string) {
        this._roles = value;
    }

    public get first_name(): string {
        return this._first_name;
    }

    public set first_name(value: string) {
        this._first_name = value;
    }

    public get last_name(): string {
        return this._last_name;
    }

    public set last_name(value: string) {
        this._last_name = value;
    }

    public get email(): string {
        return this._email;
    }

    public set email(value: string) {
        this._email = value;
    }

    public get mobile(): string {
        return this._mobile;
    }

    public set mobile(value: string) {
        this._mobile = value;
    }

    public get employee_id(): string {
        return this._employee_id;
    }

    public set employee_id(value: string) {
        this._employee_id = value;
    }

    public get joining_date(): string {
        return this._joining_date;
    }

    public set joining_date(value: string) {
        this._joining_date = value;
    }

    public get age(): number {
        return this._age;
    }

    public set age(value: number) {
        this._age = value;
    }

    public get password(): string {
        return this._password;
    }

    public set password(value: string) {
        this._password = value;
    }

    public get last_logged_in(): string {
        return this._last_logged_in;
    }

    public set last_logged_in(value: string) {
        this._last_logged_in = value;
    }

    public get last_logged_out(): string {
        return this._last_logged_out;
    }

    public set last_logged_out(value: string) {
        this._last_logged_out = value;
    }
    
}
