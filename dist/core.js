"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./config/app");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const flash = require("connect-flash");
const passport = require("passport");
const session = require("express-session");
const expressValidator = require("express-validator");
const errorHandler = require("errorhandler");
const methodOverride = require("method-override");
var LocalStrategy = require("passport-local").Strategy;
var monk = require('monk');
const Knex = require('knex');
const handlebarsExtn_1 = require("./helpers/handlebarsExtn");
const index_1 = require("./controllers/index");
const permission_1 = require("./middlewares/permission/permission");
const admin_1 = require("./controllers/admin/admin");
const adminmanager_1 = require("./controllers/admin/adminmanager");
const users_1 = require("./controllers/users/users");
const usermanager_1 = require("./controllers/users/usermanager");
const cde_1 = require("./controllers/cde/cde");
const cdemanager_1 = require("./controllers/cde/cdemanager");
const vans_1 = require("./controllers/vans/vans");
const vansmanager_1 = require("./controllers/vans/vansmanager");
const dc_1 = require("./controllers/dc/dc");
const dcmanager_1 = require("./controllers/dc/dcmanager");
const orders_1 = require("./controllers/orders/orders");
const ordersmanager_1 = require("./controllers/orders/ordersmanager");
class Core {
    static injectRoutes() {
        Core.app.use('/', index_1.default.routes);
        Core.app.use('/admin', permission_1.default.admin_access_control, admin_1.default.routes);
        Core.app.use('/admin-manager', adminmanager_1.default.routes);
        Core.app.use('/user', permission_1.default.manager_access_control, users_1.default.routes);
        Core.app.use('/user-manager', usermanager_1.default.routes);
        Core.app.use('/cde', permission_1.default.manager_access_control, cde_1.default.routes);
        Core.app.use('/cde-manager', cdemanager_1.default.routes);
        Core.app.use('/vans', permission_1.default.manager_access_control, vans_1.default.routes);
        Core.app.use('/vans-manager', vansmanager_1.default.routes);
        Core.app.use('/dc', permission_1.default.manager_access_control, dc_1.default.routes);
        Core.app.use('/dc-manager', dcmanager_1.default.routes);
        Core.app.use('/orders', permission_1.default.cde_access_control, orders_1.default.routes);
        Core.app.use('/orders-manager', ordersmanager_1.default.routes);
    }
    static init() {
        Core.app.set('mongoClient', monk(app_1.environments[process.env.ENV].mongoDBUrl));
        Core.app.use(express.static(path.join(__dirname, 'public')));
        Core.app.engine('handlebars', handlebarsExtn_1.default.handle().engine);
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
        Core.app.use(cookieParser(app_1.cookieSecret));
        Core.app.use(methodOverride());
        Core.app.use(flash());
        Core.app.use(errorHandler());
        Core.injectRoutes();
        console.log('\n\n---------------------------------------------');
        console.log(`  SERVER IS UP AND RUNNING : ${app_1.environments[process.env.ENV].region}`);
        console.log('---------------------------------------------\n\n');
    }
}
Core.app = express();
exports.default = Core;
