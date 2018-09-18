"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../config/app");
const core_1 = require("../core");
const express = require("express");
const multer = require("multer");
const path = require("path");
const file_1 = require("../models/file/file");
const inputvalidator_1 = require("../middlewares/validation/inputvalidator");
const RoomManager_1 = require("../controllers/rooms/RoomManager");
const FacilitiesManager_1 = require("../controllers/hotel_info/FacilitiesManager");
const identification_1 = require("./identification");
const HotelManager_1 = require("../controllers/hotel_info/HotelManager");
const Parallel = require("async-parallel");
var S3url = require('s3-public-url');
var gm = require('gm');
var fs = require('fs-extra');
var slash = require('slash');
var AWS = require('aws-sdk');
var ObjectId = require('mongodb').ObjectID;
class FileManager {
    static S3Config() {
        AWS.config.update({
            path: 'assets/',
            region: app_1.environments[process.env.ENV].S3Credentials.region,
            acl: 'public-read',
            accessKeyId: app_1.environments[process.env.ENV].S3Credentials.accessKeyId,
            secretAccessKey: app_1.environments[process.env.ENV].S3Credentials.secretAccessKey
        });
        return new AWS.S3();
    }
    static createPath(hotel_id) {
        if (hotel_id === null || hotel_id === undefined) {
            return { status: false, message: "Hotel ID is not defined" };
        }
        this.basepath = path.join(app_1.environments[process.env.ENV].baseURLconfig.rootdir, '../', 'public');
        var public_dir = path.join(hotel_id);
        var large = path.join(hotel_id, 'large');
        var thumbnail = path.join(hotel_id, 'thumbnail');
        var medium = path.join(hotel_id, 'medium');
        var small = path.join(hotel_id, 'small');
        fs.ensureDir(path.join(this.basepath, public_dir), err => {
            return { status: false, msg: err };
        });
        return { status: true, path: { original_path: public_dir, large: large, medium: medium, small: small, thumbnail: thumbnail, } };
    }
    static get routes() {
        let FileRouter = express.Router();
        FileRouter.route('/getImagesForHotelId')
            .post(inputvalidator_1.default.validateImagesByHotel_id, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let hid = req.body.params.hotel_id;
            let respond;
            let globalImageFids = new Array();
            let hotel_imageFids = new Array();
            yield HotelManager_1.default.getHotelByID(hid)
                .then(hotel => {
                if (hotel.success) {
                    hotel.data.map(hotel => hotel._image_fids.map(fid => {
                        globalImageFids.push(fid);
                        hotel_imageFids.push(fid);
                    }));
                }
            });
            yield RoomManager_1.default.getRoomTypes(hid)
                .then(roomObj => {
                if (roomObj.success) {
                    roomObj.data.map(room => room.type._image_fids.map(fid => globalImageFids.push(fid)));
                }
            })
                .catch(err => {
                console.log(err.message);
            });
            yield FacilitiesManager_1.default.getFacilities_images(hid)
                .then(facilitiesObj => {
                if (facilitiesObj.success) {
                    facilitiesObj.images.map(fid => globalImageFids.push(fid));
                }
            }).catch(err => {
                console.log(err.message);
            });
            if (globalImageFids.length > 0) {
                let links = yield FileManager.getFiles(JSON.stringify(globalImageFids), req.body.params.imagetype);
                if (links.success) {
                    let NewImageArr = new Array();
                    Object.keys(links.data).forEach(image => {
                        NewImageArr.push({ image: links.data[image], fid: links.fids[image], tags: links.photo_tags[image] });
                    });
                    res.status(200);
                    respond = {
                        success: true,
                        message: 'These are the  Images found in facilities',
                        images: NewImageArr,
                        hotel_images: hotel_imageFids
                    };
                }
                else {
                    res.status(400);
                    respond = {
                        success: false,
                        message: links.message,
                        links: new Array()
                    };
                }
            }
            else {
                res.status(400);
                respond = {
                    success: false,
                    message: 'No Images Found for the ID ' + hid,
                    links: new Array()
                };
            }
            res.json(respond);
        }));
        FileRouter.route('/get')
            .post(inputvalidator_1.default.ValidtesImageIDs, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            if (req.body.params.files !== undefined) {
                let files = JSON.stringify(req.body.params.files);
                let linksResult;
                if (req.query.type !== undefined) {
                    if (req.query.type == 'all')
                        linksResult = yield this.getFiles(files, 'all');
                    else
                        linksResult = yield this.getFiles(files, req.query.type);
                }
                else {
                    linksResult = yield this.getFiles(files);
                }
                if (linksResult.success) {
                    respond = {
                        success: true,
                        links: linksResult.data,
                        fids: linksResult.fids,
                        photo_tags: linksResult.photo_tags,
                        mime_types: linksResult.mime_types
                    };
                }
                else {
                    respond = {
                        success: false,
                        message: linksResult.message
                    };
                }
                res.status(200).json(respond);
            }
            else {
                respond = {
                    success: false,
                    message: 'Input Files required'
                };
                res.status(400).json(respond);
            }
        }));
        FileRouter.route('/upload')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            res.send();
        }))
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            let respond;
            var directoryExists = this.createPath(req.query.id);
            var basePath = this.basepath;
            var newfilename = identification_1.default.generateUuid;
            if (directoryExists.status) {
                var storage = multer.diskStorage({
                    destination: function (req, file, cb) {
                        cb(null, path.join(basePath, directoryExists.path.original_path));
                    },
                    filename: function (req, file, cb) {
                        FileManager.fileExtension = file.originalname.slice((file.originalname.lastIndexOf(".") - 1 >>> 0) + 2);
                        FileManager.filename = newfilename + '.' + FileManager.fileExtension;
                        cb(null, FileManager.filename);
                    }
                });
                this.upload = multer({ storage: storage });
                var uploadtype = this.upload.single('myfile');
                var S3 = this.S3Config();
                uploadtype(req, res, function (err) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            respond = {
                                success: false,
                                message: err.message
                            };
                            return res.status(200).json(respond);
                        }
                        else {
                            var outputpath = req.file.path;
                            let outputlinks = {};
                            if (req.file.mimetype.indexOf('image') >= 0) {
                                yield Parallel.each([
                                    FileManager.imageResize(S3, outputpath, app_1.environments[process.env.ENV].Image_sizes.original, directoryExists.path.original_path, req.file.filename, 'original_path'),
                                    FileManager.imageResize(S3, outputpath, app_1.environments[process.env.ENV].Image_sizes.large, directoryExists.path.large, req.file.filename, 'large'),
                                    FileManager.imageResize(S3, outputpath, app_1.environments[process.env.ENV].Image_sizes.medium, directoryExists.path.medium, req.file.filename, 'medium'),
                                    FileManager.imageResize(S3, outputpath, app_1.environments[process.env.ENV].Image_sizes.small, directoryExists.path.small, req.file.filename, 'small'),
                                    FileManager.imageResize(S3, outputpath, app_1.environments[process.env.ENV].Image_sizes.thumbnail, directoryExists.path.thumbnail, req.file.filename, 'thumbnail')
                                ], (fileResponse) => __awaiter(this, void 0, void 0, function* () {
                                    yield fileResponse.then(data => {
                                        if (data['success']) {
                                            outputlinks[data['destkey']] = data['url'];
                                        }
                                    })
                                        .catch(err => {
                                        console.log(err);
                                    });
                                }));
                                if (Object.keys(outputlinks).length >= 5) {
                                    fs.unlinkSync(req.file.path);
                                    return res.status(200).json(yield FileManager.SaveFileObj(req, outputlinks));
                                }
                            }
                            else {
                                FileManager.docUpload(basePath, directoryExists, req, res, S3, outputlinks, req.file.filename).then(data => {
                                    return data;
                                }).catch(err => {
                                    return err;
                                });
                            }
                        }
                    });
                });
            }
            else {
                res.status(500).json(directoryExists);
            }
        }))
            .delete(inputvalidator_1.default.queryID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fid = req.query.id;
            let result = yield FileManager.getFiles(JSON.stringify(new Array(fid)), 'all');
            if (result.success) {
                let S3 = FileManager.S3Config();
                let taskArray = new Array();
                if (result.mime_types[0].indexOf('image') > -1) {
                    taskArray.push(FileManager.deleteS3Object(S3, result.data[0]._original_path, 'original_path', app_1.environments[process.env.ENV].S3Credentials.imageBucket));
                    taskArray.push(FileManager.deleteS3Object(S3, result.data[0]._large, 'large', app_1.environments[process.env.ENV].S3Credentials.imageBucket));
                    taskArray.push(FileManager.deleteS3Object(S3, result.data[0]._medium, 'medium', app_1.environments[process.env.ENV].S3Credentials.imageBucket));
                    taskArray.push(FileManager.deleteS3Object(S3, result.data[0]._small, 'small', app_1.environments[process.env.ENV].S3Credentials.imageBucket));
                    taskArray.push(FileManager.deleteS3Object(S3, result.data[0]._thumbnail, 'thumbnail', app_1.environments[process.env.ENV].S3Credentials.imageBucket));
                }
                else {
                    taskArray.push(FileManager.deleteS3Object(S3, result.data[0]._original_path, 'original_path', app_1.environments[process.env.ENV].S3Credentials.documentBucket));
                }
                let outputcount = {};
                yield Parallel.each(taskArray, (fileResponse) => __awaiter(this, void 0, void 0, function* () {
                    yield fileResponse.then(data => {
                        if (data['success']) {
                            outputcount[data['keytype']] = (data['message']);
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                }));
                if ((Object.keys(outputcount).length >= 5 && result.mime_types[0].indexOf('image') > -1) || Object.keys(outputcount).length >= 1) {
                    return res.status(200).json(yield FileManager.deletefiles(JSON.stringify(new Array(fid))));
                }
            }
            else {
                res.status(400).json(result);
            }
        }));
        FileRouter.route('/getPhotoTags')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200);
            let tags = yield FileManager.getPhotoTags();
            res.json(tags);
        }));
        FileRouter.route('/photo/save')
            .post(inputvalidator_1.default.validatePhotoEdit, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let photo_id = req.body.params.photo_id;
            let photo_tags = req.body.params.photo_tags;
            let respond;
            console.log('reached server');
            let DBCollection = core_1.default.app.get('mongoClient').get('file_details');
            yield DBCollection
                .update({ _fid: photo_id }, { $addToSet: { '_photo_tags': { $each: photo_tags } } }).then(doc => {
                res.status(200);
                respond = {
                    success: true,
                    message: 'Sucessfully Updated the photo!'
                };
            }).catch(err => {
                res.status(500);
                return respond = {
                    success: false,
                    message: err.message
                };
            });
            res.json(respond);
        }));
        return FileRouter;
    }
    static deleteS3Object(S3, filelink, resizetype, bucket) {
        return new Promise(function (resolve, reject) {
            let filename = filelink.split(bucket + '/');
            var params = {
                Bucket: bucket,
                Key: filename[1]
            };
            S3.deleteObject(params, function (err, data) {
                if (err) {
                    reject({ success: false, message: err });
                }
                if (data) {
                    resolve({ success: true, message: data, keytype: resizetype });
                }
            });
        });
    }
    static uploadJson(bucket, key, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let S3 = this.S3Config();
                let params = {
                    Bucket: bucket,
                    Key: key,
                    Body: content
                };
                yield S3.putObject(params, function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        resolve(data);
                    }
                });
            }));
        });
    }
    static docUpload(basePath, directoryExists, req, res, S3, outputlinks, filename) {
        return new Promise(function (resolve, reject) {
            fs.readFile(req.file.path, function (err, data) {
                if (err)
                    reject(res.status(500).json({ success: false, message: err }));
                var putParams = {
                    Bucket: app_1.environments[process.env.ENV].S3Credentials.documentBucket,
                    Key: slash(path.join(directoryExists.path.original_path, filename)),
                    Body: data,
                    ContentType: req.file.mime_type
                };
                S3.putObject(putParams, function (putErr, putData) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (putErr) {
                            reject(res.status(500).json({ success: false, message: putErr }));
                        }
                        if (putData) {
                            let url = S3url.getHttps(app_1.environments[process.env.ENV].S3Credentials.documentBucket, slash(path.join(directoryExists.path.original_path, filename)), app_1.environments[process.env.ENV].S3Credentials.region);
                            outputlinks['original_path'] = url;
                            fs.unlinkSync(req.file.path);
                            resolve(res.status(200).json(yield FileManager.SaveFileObj(req, outputlinks)));
                        }
                        else {
                            reject(res.status(500).json({ success: false, message: putData }));
                        }
                    });
                });
            });
        });
    }
}
FileManager.imageResize = function (S3, outputpath, ImageSize, dest, newfilename, destkey) {
    dest = (destkey == 'original_path' ? slash(path.join(dest, 'raw', newfilename)) : slash(path.join(dest, newfilename)));
    return new Promise(function (resolve, reject) {
        gm(outputpath).options({ imageMagick: true })
            .resize(ImageSize.width, ImageSize.height)
            .toBuffer(FileManager.fileExtension, function (err, buffer) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    reject({ success: false, message: err });
                }
                var putParams = {
                    Bucket: app_1.environments[process.env.ENV].S3Credentials.imageBucket,
                    Key: dest,
                    Body: buffer,
                    ACL: 'public-read'
                };
                return S3.putObject(putParams, function (putErr, putData) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (putErr) {
                            reject({ success: false, message: putErr });
                        }
                        else {
                            let url = S3url.getHttps(app_1.environments[process.env.ENV].S3Credentials.imageBucket, dest, app_1.environments[process.env.ENV].S3Credentials.region);
                            resolve({ success: true, url: url, destkey: destkey });
                        }
                    });
                });
            });
        });
    });
};
FileManager.SaveFileObj = function (req, outputlinks) {
    return __awaiter(this, void 0, void 0, function* () {
        let FileDetailsCollection = core_1.default.app.get('mongoClient').get('file_details');
        let newFileDetails = file_1.default.CreateFile({
            fid: identification_1.default.generateUuid,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            size: req.file.size,
            path: {
                original_path: outputlinks.original_path,
                large: outputlinks.large,
                thumbnail: outputlinks.thumbnail,
                medium: outputlinks.medium,
                small: outputlinks.small
            },
            photo_tags: []
        });
        return yield FileDetailsCollection
            .insert(newFileDetails)
            .then(document => {
            return {
                success: true,
                fid: document._fid,
                message: `New File Details has been stored with id ${document._id}`,
                file: outputlinks.original_path
            };
        })
            .catch(error => {
            return {
                success: false,
                message: error.message,
                mimetype: req.file.mimetype,
                filename: req.file.originalname
            };
        });
    });
};
FileManager.getFiles = function getFiles(files, imagetype = "original") {
    return __awaiter(this, void 0, void 0, function* () {
        var filesArray = new Array();
        if (files === undefined || files === null) {
            return {
                success: false,
                message: 'Invalid fids.'
            };
        }
        else if (files.length == 0) {
            return {
                success: false,
                message: 'No Files Found.'
            };
        }
        else {
            files = JSON.parse(files);
            Object.keys(files).forEach(key => {
                if (inputvalidator_1.default.isValidUUID(files[key]))
                    filesArray.push(files[key]);
            });
            let query = {
                _fid: {
                    $in: filesArray
                }
            };
            let respond;
            let DBCollection = core_1.default.app.get('mongoClient').get('file_details');
            return yield DBCollection
                .find(query)
                .then(document => {
                let outputlinks = new Array();
                let fids = new Array();
                let photo_tags = new Array();
                let mime_types = new Array();
                Object.keys(document).forEach(key => {
                    if (imagetype == 'original') {
                        outputlinks.push(document[key]._path._original_path);
                    }
                    else if (imagetype == 'large') {
                        outputlinks.push(document[key]._path._large);
                    }
                    else if (imagetype == 'medium') {
                        outputlinks.push(document[key]._path._medium);
                    }
                    else if (imagetype == 'small') {
                        outputlinks.push(document[key]._path._small);
                    }
                    else if (imagetype == 'thumbnail') {
                        outputlinks.push(document[key]._path._thumbnail);
                    }
                    else if (imagetype == 'all') {
                        outputlinks.push(document[key]._path);
                    }
                    fids.push(document[key]._fid);
                    if (document[key]._photo_tags !== undefined)
                        photo_tags.push(document[key]._photo_tags);
                    mime_types.push(document[key]._mime_type);
                });
                return respond = {
                    success: true,
                    message: `We have collected the requested File Details`,
                    data: outputlinks,
                    fids: fids,
                    photo_tags: photo_tags,
                    mime_types: mime_types
                };
            })
                .catch(error => {
                return respond = {
                    success: false,
                    message: error.message
                };
            });
        }
    });
};
FileManager.deletefiles = function (files) {
    return __awaiter(this, void 0, void 0, function* () {
        var filesArray = new Array();
        if (files === undefined || files === null) {
            return {
                success: false,
                message: 'Invalid fids.'
            };
        }
        else if (files.length == 0) {
            return {
                success: false,
                message: 'No Files Found.'
            };
        }
        else {
            files = JSON.parse(files);
            Object.keys(files).forEach(key => {
                if (inputvalidator_1.default.isValidUUID(files[key]))
                    filesArray.push(files[key]);
            });
            let query = {
                _fid: {
                    $in: filesArray
                }
            };
            let DBCollection = core_1.default.app.get('mongoClient').get('file_details');
            return yield DBCollection
                .remove(query)
                .then(document => {
                return {
                    success: true,
                    message: 'successfully deleted the fids'
                };
            }).catch(err => {
                return {
                    success: false,
                    message: err
                };
            });
        }
    });
};
FileManager.getPhotoTags = () => __awaiter(this, void 0, void 0, function* () {
    let respond;
    let DBCollection = core_1.default.app.get('mongoClient').get('photo_tags');
    return yield DBCollection
        .find()
        .then(tags => {
        delete (tags[0]._id);
        return respond = {
            success: true,
            message: 'successfully retrived tags',
            data: tags[0]
        };
    })
        .catch(err => {
        return respond = {
            success: false,
            message: err.message
        };
    });
});
exports.default = FileManager;
