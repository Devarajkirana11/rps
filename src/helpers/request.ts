import { environments } from '../config/app';

var call = require('request-promise');

export default class Request {
	public static get(path: string, query: any = {}): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			var options = {
				method: 'GET',
				uri: environments[process.env.ENV].baseURLconfig.baseURL + path,
				qs: query,
				headers: {
					'User-Agent': 'Request-Promise'
				},
				json: true
			};

			await call(options)
				.then(response => resolve(response))
				.catch(error => reject(error));
		});
	}

	public static post(path: string, query: any = {}, body: any = {}): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			var options = {
				method: 'POST',
				uri: environments[process.env.ENV].baseURLconfig.baseURL + path,
				qs: query,
				body: body,
				headers: {
					'User-Agent': 'Request-Promise'
				},
				json: true
			};

			await call(options)
				.then(response => resolve(response))
				.catch(error => reject(error));
		});
	}

	public static put(path: string, query: any = {}, body: any = {}): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			var options = {
				method: 'PUT',
				uri: environments[process.env.ENV].baseURLconfig.baseURL + path,
				qs: query,
				body: body,
				headers: {
					'User-Agent': 'Request-Promise'
				},
				json: true
			};

			await call(options)
				.then(response => resolve(response))
				.catch(error => reject(error));
		});
	}

	public static ext_post(path: string, query: any = {}, body: any = {},headers: any = {}): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			var options = {
				method: 'POST',
				uri: path,
				qs: query,
				body: body,
				headers: headers,
				json: true
			};

			await call(options)
				.then(response => resolve(response))
				.catch(error => reject(error));
		});
	}
	public static ext_get(path: string, query: any = {}, headers: any = {}): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			var options = {
				method: 'GET',
				uri: path,
				qs: query,
				headers: headers,
				json: true
			};

			await call(options)
				.then(response => resolve(response))
				.catch(error => reject(error));
		});
	}

}
