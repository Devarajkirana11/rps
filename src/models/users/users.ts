import * as Law from './law';
import Identificaton from '../../helpers/identification';

export default class Users {

    private _uuid: string;
    private _user_id: number;
    private _first_name: string;
    private _last_name: string;
    private _email: string;
    private _mobile: string;
    private _username: string;
    private _password: string;
    private _roles: any;
    private _status: string;
    private _created_on: number;
    private _updated_on: number;
    private _last_access: number;
    private _last_logged_in: string;
    private _last_logged_out: string;
    
    public static usersCreate(data: Law.userCreate): Users {

        let newUsers: Users = new Users();
        newUsers.uuid = Identificaton.generateUuid;
        newUsers.user_id = Math.floor(100000 + Math.random() * 900000);
        newUsers.first_name = data.first_name;
        newUsers.last_name = data.last_name;
        newUsers.email = data.email;
        newUsers.mobile = data.mobile;
        newUsers.username = data.username;
        newUsers.password = data.password;
        newUsers.status = data.status;
        newUsers.created_on = data.created_on;
        newUsers.roles = data.roles;
        newUsers.updated_on = data.updated_on;
        newUsers.last_access = data.last_access;

        return newUsers;
    }

    public static usersUpdate(data: Law.userUpdate): Users {

        let newUsers: Users = new Users();
        
        newUsers.first_name = data.first_name;
        newUsers.last_name = data.last_name;
        newUsers.email = data.email;
        newUsers.mobile = data.mobile;
        newUsers.username = data.username;
        newUsers.password = data.password;
        newUsers.status = data.status;
        newUsers.roles = data.roles;
        newUsers.updated_on = data.updated_on;
        
        return newUsers;
    }

    public static spawn(document: Law.userDocument): Users {
		let users: Users = new Users();
        users.uuid = document.uuid;
        users.user_id = document.user_id;
        users.first_name = document.first_name;
        users.last_name = document.last_name;
        users.username = document.username;
        users.email = document.email;
        users.mobile = document.mobile;
        users.password = document.password;
        users.roles = document.roles;
        users.status = document.status;
        users.created_on = document.created_on;
        users.last_access = document.last_access;
        users.updated_on = document.updated_on;


		return users;
    }
    
    public get document(): Law.userCreate {
        return {
            uuid: this.uuid,
            user_id: this.user_id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            username: this.username,
            mobile: this.mobile,
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

    public get username(): string {
        return this._username;
    }

    public set username(value: string) {
        this._username = value;
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
