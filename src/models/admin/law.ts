export interface TaxCreate {
    tax_id: string;
    tax_level: string;
    hotel_id: string;
    name: string;
    country: string;
    state: string;
    city: string;
    tax_value: string;
    type: string;
    status: string;
    created_on: string;
    applicable_level:string;
    calculation_type:string;
    based_on:string;
    add_on:string;
};

export interface LandmarkCreate {
    landmark_id: string;
    landmark_name: string;
    country_id: string;
    state_id: string;
    city_id: string;
    locality_id: string;
    category: string;
    description: string;
    created_on: string;
    created_by:string;
    latitude:number;
    longitude:number;
    landmark_images:any;
}

