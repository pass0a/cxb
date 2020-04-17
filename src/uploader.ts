import { createReadStream, createWriteStream, ensureFile } from 'fs-extra';
import { slog } from './cmLog';
import * as FormData from 'form-data';
import axios from 'axios';
import { tgz } from 'compressing';
import { pipeline } from 'stream';
import { readFile } from 'fs';

export class Uploader {
	constructor() {}
	packTgz(src: string, dst: string) {
		return new Promise(async (resolve, reject) => {
			let ts = new tgz.Stream();
			ts.addEntry(src);
			await ensureFile(dst);
			let destStream = createWriteStream(dst);
			let len = 0;
			ts.on('data', (data) => {
				slog(`ziped :${(len += data.length)}`);
			});
			pipeline(ts, destStream, (ev) => {
				if (ev) {
					console.log(ev);
					reject(-1);
				} else {
					resolve(0);
				}
			});
		});
	}
	readFileByPath(path: string) {}
	upload(url: string, path: string, token: string, opt = { method: 'put', form: false }) {
		return new Promise(async (resolve, reject) => {
			let form: any;
			let headers: any = {};
			if (form) {
				form = new FormData(); // FormData 对象
				form.append('files', createReadStream(path));
				headers = form.getHeaders();
			} else {
				form = await new Promise((resolve, reject) => {
					readFile(path, (err, data) => {
						if (err) {
							reject(err);
						} else {
							resolve(data);
						}
					});
				});
				headers['Content-Length'] = form.length;
			}
			headers.Authorization = `Basic ${token}`;
			axios({
				method: 'put',
				url: url,
				data: form,
				headers: headers,
				transformRequest: (data, headers) => {
					// Do whatever you want to transform the data
					if (data._valuesToMeasure) {
						data._valuesToMeasure[0].on('data', (data: Buffer) => {
							console.log('uploaded:' + data.length);
						});
					}
					return data;
				}
			})
				// axios({
				// 	method: 'put',
				// 	url: url,
				// 	data: form,
				// 	headers: headers,
				// 	onUploadProgress: (progressEvent) => {
				// 		let complete = ((progressEvent.loaded / progressEvent.total * 100) | 0) + '%';
				// 		console.log('upload:', complete);
				// 	}
				// })
				.then((res) => {
					//根据服务器返回进行处理

					if (res.status > 199 && res.status < 300) {
						console.log('upload done');
						resolve(0);
					} else {
						console.log('upload fail');
						reject(-1);
					}
				})
				.catch((error) => {
					console.log(error.message);
					reject(-2);
				});
		});
	}
}
