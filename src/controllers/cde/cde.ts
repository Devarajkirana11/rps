import Core from '../../core';
import User from '../../models/users/users';
import Request from '../../helpers/request';
import Time from '../../helpers/time';

import * as express from 'express';
import * as bcrypt from 'bcrypt-nodejs';
import * as mongodb from 'mongodb';
import * as assert from 'assert';
import * as Law from '../../models/users/law';

var session = require("express-sessions");
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

export default class cde {

    public static get routes(): express.Router {

        let CDERouter: express.Router = express.Router();

        CDERouter.route('/list')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;

            await Request.get(
            '/cde-manager/get-cde-list',
            {  }, 
            ).then(response => {
                respond = response;
            }).catch(error => {
                console.log('Error: ', error.message);
            });
            
            res.status(200);
            res.render('cde_list',{output:respond});
		});

		CDERouter.route('/create')
		.get(async (req: express.Request, res: express.Response) => {
			let respond: any;
			res.status(200);
			res.render('cde_creation');
		})
		.post(async (req: express.Request, res: express.Response) => {
			
			let firstName = req.body.firstname;
            let lastName = req.body.lastname;
            let email = req.body.email;
            let phone = req.body.phone;
			let age = req.body.age;
			let employee_id = req.body.employee_id;
			let joining_date = req.body.joining_date;

            let postValues = {
                first_name : firstName,
                last_name : lastName,
                password : "123456",
                email : email,
				mobile : phone,
				age : age,
				employee_id : employee_id,
				joining_date : joining_date,
                roles : ["3"],
                status : "Active",
                created_on: Date.now(),
                updated_on: Date.now(),
                last_access: Date.now()
            }
			
            Request.post(
            '/cde-manager/create',
            {  }, 
            postValues
            ).then(response => {
                if(response.success == true){
                    res.status(200);
                    res.redirect('/cde/list');                    
                } else {
                    res.status(400);
                    res.render('cde_creation');
                }
            }).catch(error => {
                res.status(400);
                res.render('cde_creation');
			});
			
		});

		CDERouter.route('/:id/edit')
		.get(async (req: express.Request, res: express.Response) => {
			let uuid = req.params.id;
           
            Request.get(
            '/admin-manager/get-user-details',
            { uuid : uuid }, 
            ).then(response => {
                if(response.success) {
                res.status(200)
                .render('cde_edit',{output:response.data});
                } else {
                res.status(200)
                .render('cde_edit',{output:response.data});
                }
            }).catch(error => {
                console.log('Error: ', error.message);
                res.status(400);
                res.redirect('/cde/list');
			});
		})
        .post(async (req: express.Request, res: express.Response) => {

            let uuid:string = req.params.id;
            let respond: any;
            let email = req.body.email;
            let password = req.body.pass_hidden;
 
			let editCDE = {
                first_name: req.body.firstname,
                last_name: req.body.lastname,
                email: req.body.email,
				age: req.body.age,
				employee_id: req.body.employee_id,
				joining_date : req.body.joining_date,
                updated_on: Date.now()
            }
            
            Request.post(
                '/cde-manager/update',
                { uuid:uuid }, 
                editCDE
                ).then(response => {
                    if(response.success == true){
                        res.status(200);
                        res.redirect('/cde/list');                    
                    } else {
                        res.status(400);
                        res.render('cde_edit',{output:editCDE});
                    }
                }).catch(error => {
                    console.log('Error: ', error.message);
                    res.status(400);
                    res.render('cde_edit',{output:editCDE});
                });
        });
        
        return CDERouter;
    }

 
}

