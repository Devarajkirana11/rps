export interface userCreate {
    uuid: string;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    username: string;
    password: string;
    roles: any;
    status:string;
    created_on: number;
    updated_on: number;
    last_access: number;

}

export interface userUpdate {
    
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    username: string;
    password: string;
    roles: any;
    status:string;
    updated_on: number;
    
}

export interface userDocument {
    
    uuid: string;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    username: string;
    password: string;
    roles: any;
    status:string;
    created_on: number;
    updated_on: number;
    last_access: number;

}