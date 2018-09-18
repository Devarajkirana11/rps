import { Value } from 'aws-sdk/clients/configservice';

import Core from '../../core';
import expressValidator = require('express-validator');
import Time from '../../helpers/time';

import * as session from 'express-session';

var in_array = require('in_array');

export default class Permission {

    public static admin_access_control = async (req, res, next) => {

        res.locals.user_details = req.session.user;
        if (req.session.user) {
            let roles = req.session.user.roles;
            if(in_array(1, roles)){
                next();
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/user/login');
        }

    }

    public static manager_access_control = async (req, res, next) => {

        res.locals.user_details = req.session.user;

        let path = req.originalUrl;
        
        if (path.indexOf('?') > -1) {
            let path_parsing = path.split('?');
            path = path_parsing[ 0 ];
        }

        if(path == '/user/login' || path =='/user/register'){
            next();
        } else {

            if (req.session.user) {
                let roles = req.session.user.roles;
                if(in_array(1, roles)){
                    next();
                } else if(in_array(4, roles)){
                    next();
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/user/login');
            }

        }
       
    }

    public static cde_access_control = async (req, res, next) => {

        res.locals.user_details = req.session.user;

        let path = req.originalUrl;
        
        if (path.indexOf('?') > -1) {
            let path_parsing = path.split('?');
            path = path_parsing[ 0 ];
        }

        if (req.session.user) {
            let roles = req.session.user.roles;
            if(in_array(1, roles)){
                next();
            } else if(in_array(4, roles)){
                next();
            } else if(in_array(3, roles)){
                next();
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/user/login');
        }
     
    }

    public static access_control = async (req, res, next) => {

        let path = req.originalUrl;
        
        if (path.indexOf('?') > -1) {
            let path_parsing = path.split('?');
            path = path_parsing[ 0 ];
        }
        console.log(path);
        
        res.locals.user_details = req.session.user;
        if(path == '/user/login' || path =='/user/register'){
            next();
        } else {
            if (req.session.user) {
                let roles = req.session.user.roles;
                if(in_array(1, roles)){
                    next();
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/user/login');
            }
        }
        
        

    }

}