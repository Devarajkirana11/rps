let tokenSecret: string = 'RoutePlanning123$$';
let cookieSecret: string = 'RoutePlanning123$$';

enum Zone {
	INDIA = 'Asia/India'
}

let environments = {
	local: {
		region: Zone.INDIA,
		mongoDBUrl: 'mongodb://superadmin:superadmin123$$@localhost:27017/route',
		baseURLconfig: {
			host: 'localhost',
			port: 3000,
			protocol: 'http',
			rootdir: __dirname,
			baseURL: 'http://localhost:3000'
		}
	},
	testing: {
		region: Zone.INDIA,
		mongoDBUrl: 'mongodb://superadmin:superadmin123$$@localhost:27017/route',
		baseURLconfig: {
			host: 'localhost',
			port: 3000,
			protocol: 'http',
			rootdir: __dirname,
			baseURL: 'http://localhost:3000'
		}
	},
	staging: {
		region: Zone.INDIA,
		mongoDBUrl: 'mongodb://superadmin:superadmin123$$@localhost:27017/route',
		baseURLconfig: {
			host: 'localhost',
			port: 3000,
			protocol: 'http',
			rootdir: __dirname,
			baseURL: 'http://localhost:3000'
		}
	},
	production: {
		region: Zone.INDIA,
		mongoDBUrl: 'mongodb://admin:ave11nue456!@127.0.0.1:27017/route',
		baseURLconfig: {
			host: 'localhost',
			port: 3000,
			protocol: 'http',
			rootdir: __dirname,
			baseURL: 'http://localhost:3000'
		}
	}
};

export { environments, tokenSecret, cookieSecret };
