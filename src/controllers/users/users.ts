import { tokenSecret } from '../../config/app';

import Core from '../../core';
//import Identification from '../../helpers/identification'; 
import User from '../../models/users/users';
import Request from '../../helpers/request';
import Time from '../../helpers/time';

import * as express from 'express';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as Law from '../../models/users/law';
import * as passport from 'passport';
import * as session from 'express-session';
import { ConfigService } from 'aws-sdk/clients/all';

var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');

export default class Users {

    public static get routes(): express.Router {

        let UsersRouter: express.Router = express.Router();

        UsersRouter.route('/register')
        .get(async (req: express.Request, res: express.Response) => {
            res.status(200);
            res.render('register');
        })
        .post(async (req: express.Request, res: express.Response) => {
            
            let firstName = req.body.firstname;
            let lastName = req.body.lastname;
            let userName = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password: any;

            if(req.body.password){
                password =  bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
            } else {
                password = req.body.pass_hidden;
            }

            let postValues = {
                first_name : firstName,
                last_name : lastName,
                username : userName,
                password : password,
                email : email,
                mobile : phone,
                roles : ['1'],
                status : "Active",
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: Date.now()
            }

            Request.post(
            '/user-manager/user-register',
            {  }, 
            postValues
            ).then(response => {
                console.log(response);
                res.status(200);
                res.render('register');
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(200);
                res.render('register',{errors:error.message});
            });
            
        });

        UsersRouter.route('/login')
        .get(async (req: express.Request, res: express.Response) => {
            
            res.status(200);
            res.render('login');
        })
        .post(async (req: express.Request, res: express.Response) => {
            let username = req.body.username;
            let password = req.body.password;

            let postValues = {
                username : username,
                password : password
            }

            Request.post(
            '/user-manager/login-authentication',
            {  }, 
            postValues
            ).then(response => {
                if(response.success == true){
                    req.session.user = response.data;
                    res.status(200);
                    res.redirect('/orders/import');
                } else {
                    res.status(400);
                    res.render('login',{errors:response.message});
                }
            }).catch(error => {
                res.status(400);
                res.render('login',{errors:error.message});
            });

        });

        UsersRouter.route('/logout')
        .get(async (req: express.Request, res: express.Response) => {
            req.session.destroy(function(err) { });
            res.status(200);
            res.redirect('/');
        })
        .post(async (req: express.Request, res: express.Response) => {
     
        });

        return UsersRouter;

    }
 
}

