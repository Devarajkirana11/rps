import Core from '../core';

import * as express from 'express';

import { environments } from '../config/app';

export default class Index {
    
	public static get routes(): express.Router {

        let IndexRouter: express.Router = express.Router();

        IndexRouter.route("/")
        .get(async (req: express.Request, res: express.Response) => {
 
            res.status(200);
            res.render('home',{});

        });
       
		return IndexRouter;
    }
    
}
