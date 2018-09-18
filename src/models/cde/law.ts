export interface createCDE {
    uuid: string;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    age: number;
    joining_date:string;
    employee_id: string;
    password: string;
    roles: any;
    status:string;
    created_on: number;
    updated_on: number;
    last_access: number;
}

export interface updateCDE {
    
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    age: number;
    joining_date:string;
    employee_id: string;
    password: string;
    roles: any;
    status:string;
    updated_on: number;
    
}
