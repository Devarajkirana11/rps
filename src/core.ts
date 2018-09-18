import { environments, cookieSecret } from './config/app';
import { Model } from 'objection';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as path from 'path';
import * as mongoDB from 'mongodb';
import * as flash from "connect-flash";
import * as passport from "passport";
import * as session from 'express-session';

import expressValidator = require('express-validator');
import errorHandler = require('errorhandler');
import methodOverride = require('method-override');
import exphbs = require('express-handlebars');

var LocalStrategy = require("passport-local").Strategy;
var monk = require('monk');
const Knex = require('knex');

/*
*	Importing controllers to inject routes ------------------
*/

import handlebarsExtn from './helpers/handlebarsExtn';

import IndexController from './controllers/index';
import PermissionValidator from './middlewares/permission/permission';
import AdminController from './controllers/admin/admin';
import AdminManagerController from './controllers/admin/adminmanager';
import UserController from './controllers/users/users';
import UserManagerController from './controllers/users/usermanager';
import CDEController from './controllers/cde/cde';
import CDEManagerController from './controllers/cde/cdemanager';
import VansController from './controllers/vans/vans';
import VansManagerController from './controllers/vans/vansmanager';
import DcController from './controllers/dc/dc';
import DcManagerController from './controllers/dc/dcmanager';
import OrdersController from './controllers/orders/orders';
import OrdersManagerController from './controllers/orders/ordersmanager';

// ----------------------------------------------------------

export default class Core {
	public static app: express.Application = express();

	private static injectRoutes() {
		Core.app.use('/', IndexController.routes);
		Core.app.use('/admin', PermissionValidator.admin_access_control, AdminController.routes);
		Core.app.use('/admin-manager', AdminManagerController.routes);
		Core.app.use('/user', PermissionValidator.manager_access_control, UserController.routes);
		Core.app.use('/user-manager', UserManagerController.routes);
		Core.app.use('/cde', PermissionValidator.manager_access_control, CDEController.routes);
		Core.app.use('/cde-manager', CDEManagerController.routes);
		Core.app.use('/vans', PermissionValidator.manager_access_control, VansController.routes);
		Core.app.use('/vans-manager', VansManagerController.routes);
		Core.app.use('/dc', PermissionValidator.manager_access_control, DcController.routes);
		Core.app.use('/dc-manager', DcManagerController.routes);
		Core.app.use('/orders', PermissionValidator.cde_access_control, OrdersController.routes);
		Core.app.use('/orders-manager', OrdersManagerController.routes);
	}

	public static init() {

		Core.app.set('mongoClient', monk(environments[process.env.ENV].mongoDBUrl));

		Core.app.use(express.static(path.join(__dirname, 'public')));

		Core.app.engine('handlebars', handlebarsExtn.handle().engine);
		Core.app.set('view engine', 'handlebars');
		Core.app.set('views', path.join(__dirname, 'views'));

		Core.app.use(logger('dev'));

		Core.app.use(bodyParser.json());

		Core.app.use(bodyParser.urlencoded({ extended: true }));

		Core.app.use(expressValidator());

		Core.app.use(session({
			secret: 'keyboard cat',
			resave: false,
			saveUninitialized: true
		}));

		Core.app.use(function (req, res, next) {
			res.locals.session = req.session;
			next();
		});

		Core.app.use(passport.initialize());

		Core.app.use(cookieParser(cookieSecret));

		Core.app.use(methodOverride());

		Core.app.use(flash());

		Core.app.use(errorHandler());

		Core.injectRoutes();

		console.log('\n\n---------------------------------------------');
		console.log(`  SERVER IS UP AND RUNNING : ${environments[process.env.ENV].region}`);
		console.log('---------------------------------------------\n\n');

	}

}