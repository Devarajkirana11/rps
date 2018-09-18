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
const express = require("express");
const APIClient_1 = require("../../helpers/APIClient");
const inputvalidator_1 = require("../../middlewares/validation/inputvalidator");
const FileManager_1 = require("../../helpers/FileManager");
var ObjectId = require('mongodb').ObjectID;
class PhotoGalleryController {
    static get routes() {
        let PhotoGalleryRouter = express.Router();
        PhotoGalleryRouter.route('/:id')
            .get(inputvalidator_1.default.paramsID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let postbody = JSON.stringify({
                params: { hotel_id: req.params.id, imagetype: 'thumbnail' }
            });
            APIClient_1.default.send('/file/getImagesForHotelId', postbody, function (api_result) {
                if (api_result.success && api_result.images.length >= 1) {
                    let templateData = {
                        success: true,
                        images: api_result.images,
                        hid: req.params.id,
                        hotel_images: api_result.hotel_images,
                        message: "successfully retrived the images for a gallery"
                    };
                    res.status(200);
                    res.render('photo_gallery', templateData);
                }
                else {
                    let templateData = {
                        success: false,
                        message: "There are no images for this gallery"
                    };
                    res.status(400);
                    res.render('photo_gallery', templateData);
                }
            });
        }));
        PhotoGalleryRouter.route('/:hid/photo/:id/edit')
            .get(inputvalidator_1.default.paramsID, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let photoTags = yield FileManager_1.default.getPhotoTags();
            res.status(200);
            let postbody = JSON.stringify({
                params: { hotel_id: req.params.hid, imagetype: 'medium' }
            });
            APIClient_1.default.send('/file/getImagesForHotelId', postbody, function (api_result) {
                if (api_result.success && api_result.images.length >= 1) {
                    let templateData = {
                        success: true,
                        images: api_result.images,
                        currentid: req.params.id,
                        photoTags: photoTags,
                        message: "successfully retrived the images for a gallery"
                    };
                    res.status(200);
                    res.render('photo_edit', templateData);
                }
                else {
                    let templateData = {
                        success: false,
                        message: "There are no images for this gallery"
                    };
                    res.status(400);
                    res.render('photo_edit', templateData);
                }
            });
        }));
        return PhotoGalleryRouter;
    }
}
exports.default = PhotoGalleryController;
