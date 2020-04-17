'use strict';
import * as readline from 'readline';
let log = require('npmlog');

export interface ifCMLog {
	noLog?: boolean;
	logName?: string;
}
export class CMLog {
	private options: ifCMLog;
	private debug: any;
	constructor(options: ifCMLog) {
		this.options = options || {};
		this.debug = require('debug')(this.options.logName || 'cxb');
	}
	get level() {
		if (this.options.noLog) {
			return 'silly';
		} else {
			return log.level;
		}
	}
	silly(cat: string, msg: string) {
		if (this.options.noLog) {
			this.debug(cat + ': ' + msg);
		} else {
			log.silly(cat, msg);
		}
	}

	verbose(cat: string, msg: string) {
		if (this.options.noLog) {
			this.debug(cat + ': ' + msg);
		} else {
			log.verbose(cat, msg);
		}
	}

	info(cat: string, msg: string) {
		if (this.options.noLog) {
			this.debug(cat + ': ' + msg);
		} else {
			log.info(cat, msg);
		}
	}

	warn(cat: string, msg: string) {
		if (this.options.noLog) {
			this.debug(cat + ': ' + msg);
		} else {
			log.warn(cat, msg);
		}
	}

	http(cat: string, msg: string) {
		if (this.options.noLog) {
			this.debug(cat + ': ' + msg);
		} else {
			log.http(cat, msg);
		}
	}

	error(cat: string, msg: string) {
		if (this.options.noLog) {
			this.debug(cat + ': ' + msg);
		} else {
			log.error(cat, msg);
		}
	}
}
export function slog(msg: string) {
	//readline.clearLine(process.stdout, 0);
	readline.cursorTo(process.stdout, 0, undefined);
	process.stdout.write(msg);
}
