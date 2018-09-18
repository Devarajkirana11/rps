import { tokenSecret } from '../../config/app';

import Core from '../../core';
import Request from '../../helpers/request';
import Time from '../../helpers/time';

import * as express from 'express';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as passport from 'passport';
import * as session from 'express-session';

var in_array = require('in_array');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');

export default class Admin {

    public static get routes(): express.Router {

        let AdminRouter: express.Router = express.Router();

        AdminRouter.route('/dashboard')
        .get(async (req: express.Request, res: express.Response) => {
            res.status(200);
            res.render('dashboard');
        })
        .post(async (req: express.Request, res: express.Response) => {
     
        });

        AdminRouter.route('/users/list')
        .get(async (req: express.Request, res: express.Response) => {
            let respond: any;

            await Request.get(
            '/admin-manager/get-users-list',
            {  }, 
            ).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            
            res.status(200);
            res.render('users_list',{output:respond});
        })
        .post(async (req: express.Request, res: express.Response) => {
     
        });

        AdminRouter.route('/user/create')
        .get(async (req: express.Request, res: express.Response) => {
            res.status(200);
            res.render('users_creation');
        })
        .post(async (req: express.Request, res: express.Response) => {
            let firstName = req.body.firstname;
            let lastName = req.body.lastname;
            let userName = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password: any;
            let roles = req.body.roles;
            
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
                roles : roles,
                status : "Active",
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: Date.now()
            }

            Request.post(
            '/admin-manager/user-create',
            {  }, 
            postValues
            ).then(response => {
                if(response.success == true){
                    res.status(200);
                    res.redirect('/admin/users/list');                    
                } else {
                    res.status(400);
                    res.render('users_creation');
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.render('users_creation');
            });
        });
        
        AdminRouter.route('/user/:id/edit')
        .get(async (req: express.Request, res: express.Response) => {
            let uuid = req.params.id;
           
            Request.get(
            '/admin-manager/get-user-details',
            { uuid : uuid }, 
            ).then(response => {
                if(response.success) {
                res.status(200)
                .render('users_edit',{output:response.data});
                } else {
                res.status(200)
                .render('users_edit',{output:response.data});
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/admin/users/list');
            });
        })
        .post(async (req: express.Request, res: express.Response) => {
            let uuid:string = req.params.id;
            let respond: any;
            let email = req.body.email;
            let password: any;
        
            if(req.body.password){
                password =  bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
            } else {
                password = req.body.pass_hidden;
            }

            let editUser = {
                first_name: req.body.firstname,
                last_name: req.body.lastname,
                email: req.body.email,
                username: req.body.username,
                password: password,
                roles:req.body.roles,
                status:'Active',
                updated_on: Date.now()
            }
        
            Request.post(
                '/admin-manager/user-update',
                { uuid:uuid }, 
                editUser
                ).then(response => {
                    if(response.success == true){
                        res.status(200);
                        res.redirect('/admin/users/list');                    
                    } else {
                        res.status(400);
                        res.render('users_edit',{output:editUser});
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                    res.status(400);
                    res.render('users_edit',{output:editUser});
                });
        });

        return AdminRouter;

    }
 
}

