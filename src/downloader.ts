import { slog, ifCMLog } from './cmLog';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import { gzip, tgz, zip } from 'compressing';

export interface optUnZip {
	strip: number;
	filter?: (entryPath: string) => boolean;
}
export interface ifKy {
	src: string;
	dst: string;
	option?: optUnZip;
}
export class Downloader {
	private done: number = 0;
	private length: number = 0;
	private unzipTotal = 0;
	private unzipNo = 0;
	private notifyOk = (result: any) => {};
	constructor(options: ifCMLog) {}
	async downloadAll(task: ifKy[]) {
		let op = [];
		for (const iter of task) {
			op.push(this.downloadFile(iter));
		}
		await Promise.all(op);
		console.log('\ndownload all end\n');
	}
	private downloadFile(iter: ifKy): Promise<boolean> {
		return new Promise((resolve, reject) => {
			axios({
				method: 'get',
				url: iter.src,
				responseType: 'stream'
			})
				.then((response) => {
					this.length += parseInt(response.headers['content-length'], 10);
					fs.ensureDirSync(path.dirname(iter.dst));
					response.data.on('data', (chunk: Buffer) => {
						this.done += chunk.length;
						if (isNaN(this.length)) {
							slog(`Downloading ${(this.done / 1024).toFixed(2)}/ unknow kb`);
						} else {
							slog(`Downloading ${(this.done / 1024).toFixed(2)}/ ${(this.length / 1024).toFixed(2)} kb`);
						}
					});
					fs.ensureFileSync(iter.dst);
					response.data.pipe(
						fs
							.createWriteStream(iter.dst)
							.on('close', () => {
								resolve(true);
							})
							.on('error', (err) => {
								throw new Error(`some error was happend with write file ${iter.src}`);
							})
							.on('finish', () => {})
					);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
	getExt(filename: string, extlist: string[]): string {
		let found: string = '';
		for (let ext of extlist) {
			if (filename.endsWith('.' + ext)) {
				if (found.length < ext.length) {
					found = ext;
				}
			}
		}
		return found;
	}
	async unzipAll(task: ifKy[]) {
		let op = [];

		for (const iter of task) {
			let ext = this.getExt(iter.src, [ 'tgz', 'tar.gz', 'zip', 'gz', 'gzip' ]);
			switch (ext) {
				case 'tgz':
				case 'tar.gz':
					op.push(this.uncompressingTgz(iter));
					break;
				case 'zip':
					op.push(this.uncompressingZip(iter));
					break;
				case 'gz':
				case 'gzip':
					op.push(this.uncompressingGZip(iter));
					break;
			}
		}

		await Promise.all(op);
		console.log('\nunzip all end\n');
	}

	private strip(str: string, deep: number) {
		let arr = path.normalize(str).split(path.sep);
		arr.splice(0, arr.length < deep ? arr.length - 1 : deep);
		return arr.join(path.sep);
	}
	private onEntry(iter: ifKy, header: any, stream: any, next: () => void) {
		stream.on('end', next);
		if (iter.option && iter.option.strip) header.name = this.strip(header.name, iter.option.strip);
		if (header.type === 'file') {
			this.unzipTotal++;
			fs.ensureDirSync(path.dirname(path.join(iter.dst, header.name)));
			stream.pipe(
				fs.createWriteStream(path.join(iter.dst, header.name)).on('close', () => {
					this.unzipNo++;
					this.notifyFinish();
				})
			);
		} else {
			// directory
			fs.ensureDirSync(path.dirname(path.join(iter.dst, header.name)));
			stream.resume();
		}
	}
	private notifyFinish() {
		if (this.notifyOk && this.unzipNo >= this.unzipTotal) this.notifyOk(true);
	}
	uncompressingTgz(iter: ifKy): Promise<boolean> {
		return new Promise((resolve, reject) => {
			new tgz.UncompressStream({ source: iter.src })
				.on('error', (err) => {
					reject(err);
				})
				.on('finish', () => {
					this.notifyOk = resolve;
					this.notifyFinish();
				}) // uncompressing is done
				.on('entry', (header, stream, next) => {
					this.onEntry(iter, header, stream, next);
				});
		});
	}

	uncompressingZip(iter: ifKy): Promise<boolean> {
		return new Promise((resolve, reject) => {
			new zip.UncompressStream({ source: iter.src })
				.on('error', (err) => {
					reject(err);
				})
				.on('finish', () => {
					this.notifyOk = resolve;
					this.notifyFinish();
				}) // uncompressing is done
				.on('entry', (header, stream, next) => {
					this.onEntry(iter, header, stream, next);
				});
		});
	}
	uncompressingGZip(iter: ifKy): Promise<boolean> {
		return new Promise((resolve, reject) => {
			new gzip.UncompressStream({ source: iter.src })
				.on('error', (err) => {
					reject(err);
				})
				.on('finish', () => {
					this.notifyOk = resolve;
					this.notifyFinish();
				}) // uncompressing is done
				.on('entry', (header, stream, next) => {
					this.onEntry(iter, header, stream, next);
				});
		});
	}
}
