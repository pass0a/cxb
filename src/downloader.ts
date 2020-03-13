import * as crypto from 'crypto';
import { CMLog, ifCMLog } from './cmLog';
import { isNumber, isString } from 'util';
import * as fs from 'fs';
import * as readline from 'readline';
let request = require('request');

let MemoryStream = require('memory-stream');
let zlib = require('zlib');
let tar = require('tar');

let unzip = require('unzipper');

function slog(msg: string) {
	//readline.clearLine(process.stdout, 0);
	readline.cursorTo(process.stdout, 0, undefined);
	process.stdout.write(msg);
}

export interface ifDLOptions {
	path?: string;
	hash?: string;
	sum?: string;
	cwd?: string;
	strip?: number;
	filter?: (entryPath: string) => boolean;
}
export class Downloader {
	private log: CMLog;
	constructor(options: ifCMLog) {
		this.log = new CMLog(options);
	}
	downloadToStream(url: string, stream: any, hash?: string): Promise<string> {
		let self = this;
		let shasum = hash ? crypto.createHash(hash) : null;
		return new Promise(function(resolve, reject) {
			let length = 0;
			let done = 0;
			let lastPercent = 0;
			request
				.get(url)
				.on('error', function(err: any) {
					reject(err);
				})
				.on('response', function(data: any) {
					length = parseInt(data.headers['content-length']);
					if (isNumber(length)) {
						length = 0;
					}
				})
				.on('data', function(chunk: any) {
					if (shasum) {
						shasum.update(chunk);
					}
					done += chunk.length;
					if (length) {
						let percent = done / length * 100;
						percent = Math.round(percent / 10) * 10 + 10;
						if (percent > lastPercent) {
							slog(
								`Downloading ${(done / 1024).toFixed(
									2
								)} kb . Total size: ${length} kb . per:${lastPercent}%`
							);
							lastPercent = percent;
						}
					} else {
						slog(`Downloading ${(done / 1024).toFixed(2)} kb . Total size: unkown kb . per:unkown`);
					}
				})
				.pipe(stream);

			stream.once('error', function(err: any) {
				reject(err);
			});

			stream.once('finish', function() {
				console.log('\n');
				resolve(shasum ? shasum.digest('hex') : undefined);
			});
		});
	}

	async downloadString(url: string) {
		let result = new MemoryStream();
		await this.downloadToStream(url, result);
		return result.toString();
	}

	async downloadFile(url: string, options: ifDLOptions | string) {
		let opt: ifDLOptions = { path: '' };
		if (isString(options)) {
			opt = { path: options };
		} else {
			opt = options;
		}
		if (!opt.path) throw new Error('can not download null file with opt.path was undefined');
		let result = fs.createWriteStream(opt.path);
		let sum = await this.downloadToStream(url, result, opt.hash);
		this.testSum(url, sum, opt);
		return sum;
	}

	async downloadTgz(url: string, options: ifDLOptions | string) {
		let opt: ifDLOptions = { path: '' };
		if (isString(options)) {
			opt = { path: options };
		} else {
			opt = options;
		}
		let gunzip = zlib.createGunzip();
		let extractor = tar.extract(opt);
		gunzip.pipe(extractor);
		let sum = await this.downloadToStream(url, gunzip, opt.hash);
		this.testSum(url, sum, opt);
		return sum;
	}

	async downloadZip(url: string, options: ifDLOptions | string) {
		let opt: ifDLOptions = { path: '' };
		if (isString(options)) {
			opt = { path: options };
		} else {
			opt = options;
		}
		let extractor = new unzip.Extract(opt);
		let sum = await this.downloadToStream(url, extractor, opt.hash);
		this.testSum(url, sum, opt);
		return sum;
	}

	testSum(url: string, sum: string, options: ifDLOptions) {
		if (options.hash && sum && options.sum && options.sum !== sum) {
			throw new Error(options.hash.toUpperCase() + " sum of download '" + url + "' mismatch!");
		}
	}
}
