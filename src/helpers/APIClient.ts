import { environments } from '../config/app';

import { String } from 'aws-sdk/clients/emr';
import Core from '../core';
import http = require('http');

export default class APIClient {
    /**
     * 
     * @param path string
     * @param postbody must a json string. 
     * @param callbackfun return callback
     */
    public static send(path:string,postbody:String,callbackfun,method='POST') {
            const options = {
                    hostname: environments[process.env.ENV].baseURLconfig.host,
                    port: environments[process.env.ENV].baseURLconfig.port,
                    path: path,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        "Content-Length": postbody.length
                    }
            };

            var post_req =  http.request(options, function (response) {
                    var data = [];
                    response.setEncoding('utf8');
                    response.on('data', function (chunk) {
                        data.push(chunk);
                    });
                    response.on('end', function() {
                        console.log('Api Client Response '+data)
                        if(data.length!=0){
                            try { 
                                JSON.parse(data.join(''))
                            } catch(e) {
                                callbackfun({success:false,message: 'Not a valid Response JSON '+e})
                            }
                            callbackfun(JSON.parse(data.join('')));
                        }else{
                            callbackfun({success:false,message:'Couldn\'t get Response from Server!'});
                        }
                    });
                });

            post_req.on('error', function(e) {
                callbackfun({success:false,message:e.message});
            });
            post_req.write(postbody);
            post_req.end();
    }

}