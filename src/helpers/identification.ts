import * as uuidV4 from 'uuid/v4';
import * as Crypto from 'crypto';

var randomstring = require('randomstring');

export default class Identification {
	public static get generateUuid(): string {
		return uuidV4();
	}

	public static get generateReferenceId(): string {
		return randomstring.generate({
			length: 6,
			charset: 'alphanumeric',
			readable: true,
			capitalization: 'uppercase'
		});
	}

	public static hash(data: string): string {
		return Crypto.createHash('sha256')
			.update(data)
			.digest('hex');
	}
}
