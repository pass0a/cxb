'use strict';
let environment = require('./environment');
let path = require('path');
let urljoin = require('url-join');
let fs = require('fs-extra');
import { CMLog } from './cmLog';
import { TargetOptions } from './targetOptions';
import { runtimePaths } from './runtimePaths';
import { Downloader } from './downloader';

function testSum(sums: string[], sum: string, fPath: string) {
	// let serverSum = _.first(
	// 	sums.filter(function(s) {
	// 		return s.getPath === fPath;
	// 	})
	// );
	// if (serverSum && serverSum.sum === sum) {
	// 	return;
	// }
	return true;
	throw new Error("SHA sum of file '" + fPath + "' mismatch!");
}
interface DistOptions {
	[key: string]: any;
}
function getStat(path: string) {
	try {
		return fs.statSync(path);
	} catch (e) {
		return {
			isFile: () => {
				return false;
			},
			isDirectory: () => {
				return false;
			}
		};
	}
}
export class Dist {
	private options: DistOptions;
	private log: CMLog;
	private targetOptions: TargetOptions;
	private downloader: Downloader;
	constructor(options?: DistOptions) {
		this.options = options || {};
		this.log = new CMLog(this.options);
		this.targetOptions = new TargetOptions(this.options);
		this.downloader = new Downloader(this.options);
	}

	get internalPath() {
		return path.join(
			environment.home,
			'.cxb',
			this.targetOptions.runtime + '-' + this.targetOptions.arch,
			'v' + this.targetOptions.runtimeVersion
		);
	}
	get externalPath() {
		return runtimePaths.get(this.targetOptions).externalPath;
	}
	get downloaded() {
		let headers = false;
		let libs = true;
		let stat = getStat(this.internalPath);
		if (stat.isDirectory()) {
			if (this.headerOnly) {
				stat = getStat(path.join(this.internalPath, 'include/node/node.h'));
				headers = stat.isFile();
			} else {
				stat = getStat(path.join(this.internalPath, 'src/node.h'));
				if (stat.isFile()) {
					stat = getStat(path.join(this.internalPath, 'deps/v8/include/v8.h'));
					headers = stat.isFile();
				}
			}
			if (environment.isWin) {
				for (let libPath of this.winLibs) {
					stat = getStat(libPath);
					libs = libs && stat.isFile();
				}
			}
		}
		return headers && libs;
	}
	get winLibs() {
		let libs = runtimePaths.get(this.targetOptions).winLibs;
		let result = [];
		for (let lib of libs) {
			result.push(path.join(this.internalPath, lib.dir, lib.name));
		}
		return result;
	}
	get headerOnly() {
		return runtimePaths.get(this.targetOptions).headerOnly;
	}
	async ensureDownloaded() {
		if (!this.downloaded) {
			await this.download();
		}
	}

	async download() {
		let log = this.log;
		log.info('DIST', 'Downloading distribution files.');
		await fs.ensureDir(this.internalPath);
		let sums = await this._downloadShaSums();
		await Promise.all([ this._downloadLibs(sums), this._downloadTar(sums) ]);
	}

	async _downloadShaSums() {
		if (this.targetOptions.runtime === 'node' || this.targetOptions.runtime === 'iojs') {
			let sumUrl = urljoin(this.externalPath, 'SHASUMS256.txt');
			let log = this.log;
			log.http('DIST', '\t- ' + sumUrl);
			return (await this.downloader.downloadString(sumUrl))
				.split('\n')
				.map(function(line: string) {
					let parts = line.split(/\s+/);
					return {
						getPath: parts[1],
						sum: parts[0]
					};
				})
				.filter(function(i: any) {
					return i.getPath && i.sum;
				});
		} else {
			return null;
		}
	}

	async _downloadTar(sums: string[]) {
		let log = this.log;
		let self = this;
		let tarLocalPath = runtimePaths.get(self.targetOptions).tarPath;
		let tarUrl = urljoin(self.externalPath, tarLocalPath);
		log.http('DIST', '\t- ' + tarUrl);

		let sum = await this.downloader.downloadTgz(tarUrl, {
			hash: sums ? 'sha256' : undefined,
			cwd: self.internalPath,
			strip: 1,
			filter: function(entryPath: string) {
				if (entryPath === self.internalPath) {
					return true;
				}
				let ext = path.extname(entryPath);
				return ext && ext.toLowerCase() === '.h';
			}
		});

		if (sums) {
			testSum(sums, sum, tarLocalPath);
		}
	}

	async _downloadLibs(sums: string[]) {
		const log = this.log;
		const self = this;
		if (!environment.isWin) {
			return;
		}

		const paths = runtimePaths.get(self.targetOptions);
		for (const dirs of paths.winLibs) {
			const subDir = dirs.dir;
			const fn = dirs.name;
			const fPath = subDir ? urljoin(subDir, fn) : fn;
			const libUrl = urljoin(self.externalPath, fPath);
			log.http('DIST', '\t- ' + libUrl);

			await fs.ensureDir(path.join(self.internalPath, subDir));
			console.log('_downloadLibs', libUrl, path.join(self.internalPath, fPath));
			const sum = await this.downloader.downloadFile(libUrl, {
				path: path.join(self.internalPath, fPath),
				hash: sums ? 'sha256' : undefined
			});

			if (sums) {
				testSum(sums, sum, fPath);
			}
		}
	}
}
