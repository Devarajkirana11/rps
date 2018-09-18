import { environments } from '../config/app';
import * as moment from 'moment-timezone';

export default class Time {
	public static serverRegion: string = environments[process.env.ENV].region;

	public static addDays(noOfdays=0,date,format="DD-MM-YYYY") {
		return moment(date,"DD-MM-YYYY")
			.tz(Time.serverRegion)
			.add(noOfdays,'days')
			.format(format);
	}

	public static nextYearDate() {
		return moment()
			.tz(Time.serverRegion)
			.add(12, 'months')
			.format('DD-MM-YYYY');
	}

	public static formatGivenDate(date) {
		return moment(date)
			.tz(Time.serverRegion)
			.format('DD-MM-YYYY');
	}

	public static OTAformatGivenDate(date) {
		return moment(date)
			.tz(Time.serverRegion)
			.format('YYYY-MM-DD');
	}

	public static formatGivenDateWithTime(date) {
		return moment(date)
			.tz(Time.serverRegion)
			.format('DD-MM-YYYY HH:mm:ss');
	}

	public static countryFormatGivenDateWithTime(date,country) {
		if(country == 'Thailand'){
			return moment(date)
				.tz(Time.serverRegion)
				.subtract('hours', 1)
				.format('DD-MM-YYYY HH:mm:ss');
		} else {
			return moment(date)
				.tz(Time.serverRegion)
				.format('DD-MM-YYYY HH:mm:ss');
		}
	}

	public static get serverTime(): string {
		return moment()
			.tz(Time.serverRegion)
			.format('DD-MM-YYYY HH:mm:ss');
	}

	public static get serverMoment() {
		return moment().tz(Time.serverRegion);
	}

	public static serverMomentInPattern(date: string, pattern: string) {
		return moment(date, pattern).tz(Time.serverRegion);
	}

	public static serverMomentInStrictPattern(date: string, pattern: string, strict: boolean) {
		return moment(date, pattern, strict).tz(Time.serverRegion);
	}
}
