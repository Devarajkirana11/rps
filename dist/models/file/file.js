"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileModel {
    static CreateFile(data) {
        let newFileDetailsModel = new FileModel();
        newFileDetailsModel.fid = data.fid;
        newFileDetailsModel.original_name = data.original_name;
        newFileDetailsModel.mime_type = data.mime_type;
        newFileDetailsModel.size = data.size;
        newFileDetailsModel.path = this.CreateFilePath(data.path);
        newFileDetailsModel.photo_tags = this.CreateTextValuePair(data.photo_tags);
        return newFileDetailsModel;
    }
    static CreateFilePath(data) {
        let newFilepathDetails = new FileModel();
        newFilepathDetails.original_path = data.original_path;
        newFilepathDetails.large = data.large;
        newFilepathDetails.thumbnail = data.thumbnail;
        newFilepathDetails.medium = data.medium;
        newFilepathDetails.small = data.small;
        return newFilepathDetails;
    }
    static CreateTextValuePair(data) {
        let newTextValuePair = new FileModel();
        let textvalueArr = new Array();
        let outputarray = new Array();
        Object.keys(data).forEach(key => {
            newTextValuePair.text = data[key]['text'];
            newTextValuePair.value = data[key]['value'];
            outputarray.push(newTextValuePair);
        });
        return textvalueArr;
    }
    get objectId() {
        return this._objectId;
    }
    set objectId(value) {
        this._objectId = value;
    }
    get fid() {
        return this._fid;
    }
    set fid(value) {
        this._fid = value;
    }
    get original_path() {
        return this._original_path;
    }
    set original_path(value) {
        this._original_path = value;
    }
    get thumbnail() {
        return this._thumbnail;
    }
    set thumbnail(value) {
        this._thumbnail = value;
    }
    get large() {
        return this._large;
    }
    set large(value) {
        this._large = value;
    }
    get medium() {
        return this._medium;
    }
    set medium(value) {
        this._medium = value;
    }
    get small() {
        return this._small;
    }
    set small(value) {
        this._small = value;
    }
    get original_name() {
        return this._original_name;
    }
    set original_name(value) {
        this._original_name = value;
    }
    get mime_type() {
        return this._mime_type;
    }
    set mime_type(value) {
        this._mime_type = value;
    }
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
    }
    get path() {
        return this._path;
    }
    set path(value) {
        this._path = value;
    }
    get photo_tags() {
        return this._photo_tags;
    }
    set photo_tags(value) {
        this._photo_tags = value;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
}
exports.default = FileModel;
