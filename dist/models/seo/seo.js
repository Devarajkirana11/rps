"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SEOModel {
    static create(data) {
        let newSeoDetails = new SEOModel();
        newSeoDetails.seo_type = data.seo_type;
        newSeoDetails.title = data.title;
        newSeoDetails.description = data.description;
        newSeoDetails.country_id = data.country_id;
        newSeoDetails.city_id = data.city_id;
        newSeoDetails.state_id = data.state_id;
        newSeoDetails.link = data.link;
        newSeoDetails.hotel_id = data.hotel_id;
        newSeoDetails._meta_tags = data.meta_tags;
        newSeoDetails._image_fids = data.image_fids;
        newSeoDetails.latitude = data.latitude;
        newSeoDetails.longitude = data.longitude;
        newSeoDetails.status = data.status;
        newSeoDetails.seo_id = data.seo_id;
        newSeoDetails.meta_description = data.meta_description;
        return newSeoDetails;
    }
    get seo_id() {
        return this._seo_id;
    }
    set seo_id(value) {
        this._seo_id = value;
    }
    get seo_type() {
        return this._seo_type;
    }
    set seo_type(value) {
        this._seo_type = value;
    }
    get title() {
        return this._title;
    }
    set title(value) {
        this._title = value;
    }
    get link() {
        return this._link;
    }
    set link(value) {
        this._link = value;
    }
    get meta_tags() {
        return this._meta_tags;
    }
    set meta_tags(value) {
        this._meta_tags = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get country_id() {
        return this._country_id;
    }
    set country_id(value) {
        this._country_id = value;
    }
    get hotel_id() {
        return this._hotel_id;
    }
    set hotel_id(value) {
        this._hotel_id = value;
    }
    get city_id() {
        return this._city_id;
    }
    set city_id(value) {
        this._city_id = value;
    }
    get state_id() {
        return this._state_id;
    }
    set state_id(value) {
        this._state_id = value;
    }
    get latitude() {
        return this._latitude;
    }
    set latitude(value) {
        this._latitude = value;
    }
    get longitude() {
        return this._longitude;
    }
    set longitude(value) {
        this._longitude = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get meta_description() {
        return this._meta_description;
    }
    set meta_description(value) {
        this._meta_description = value;
    }
}
exports.default = SEOModel;
