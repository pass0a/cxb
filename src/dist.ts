'use strict';
let environment = require('./environment');
let path = require('path');
let urljoin = require('url-join');
let fs = require('fs-extra');
import { CMLog } from './cmLog';
import { TargetOptions } from './targetOptions';
import { runtimePaths } from './runtimePaths';
import { Downloader, ifKy } from './downloader';

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
		//let sums = await this._downloadShaSums();
		let task1 = new Array<ifKy>(),
			task2 = new Array<ifKy>();
		this._downloadLibs(task1);
		this._downloadTar(task1, task2);
		await this.downloader.downloadAll(task1);
		await this.downloader.unzipAll(task2);
	}

	async _downloadTar(task1: ifKy[], task2: ifKy[]) {
		let log = this.log;
		let self = this;
		let tarLocalPath = runtimePaths.get(self.targetOptions).tarPath;
		let tarUrl = urljoin(self.externalPath, tarLocalPath);
		log.http('DIST', '\t- ' + tarUrl);
		fs.ensureDirSync('tmp/stage/');
		task1.push({ src: tarUrl, dst: 'tmp/stage/' + tarLocalPath });
		task2.push({ src: 'tmp/stage/' + tarLocalPath, dst: self.internalPath, option: { strip: 1 } });
	}

	async _downloadLibs(task: ifKy[]) {
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

			fs.ensureDirSync(path.join(self.internalPath, subDir));
			task.push({ src: libUrl, dst: path.join(self.internalPath, fPath) });
		}
	}
}
