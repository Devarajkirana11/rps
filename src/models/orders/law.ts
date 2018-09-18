export interface createOrder {
    uuid: string;
    order_id: number;
    mobile : string;
    store : string;
    order_total : string;
    payment_method : string;
    customer_name : string;
    address_1 : string;
    address_2 : string;
    city : string;
    pin_code : string;
    delivery_charge : string;
    delivery_date: string;
    slot: string;
    latitude: string;
    longitude: string;
    dc_name: string;
    status: string;
    van_uuid: string; 
    color_code: string;
    weight: string;
    created_on: string;
    updated_on: number;
}
