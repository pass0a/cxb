const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const destDir = 'opencv';
const compressing = require('compressing');
let opt = { path: 'output', cwd: 'output' };

// axios({
// 	method: 'get',
// 	url: 'http://127.0.0.1:8080/pcan.zip',
// 	responseType: 'stream'
// }).then(function(response) {
// 	console.log('response', response.headers);
// 	response.data.on('data', (data) => {});
// 	response.data.pipe(zip);
// });
// let gunzip = zlib.createGunzip();
// let extractor = tar.extract(opt);
// gunzip.pipe(extractor);
// axios({
// 	method: 'get',
// 	url: 'http://127.0.0.1:8080/auctex-12.1.tar.gz',
// 	responseType: 'stream'
// }).then(function(response) {
// 	console.log('response');
// 	response.data.on('data', (data) => {});
// 	response.data.pipe(gunzip);
// });
// function onEntry(header, stream, next) {
// 	stream.on('end', next);

// 	// header.type => file | directory
// 	// header.name => path name

// 	if (header.type === 'file') {
// 		stream.pipe(fs.createWriteStream(path.join(destDir, header.name)));
// 	} else {
// 		// directory
// 		mkdirp(path.join(destDir, header.name), (err) => {
// 			if (err) return handleError(err);
// 			stream.resume();
// 		});
// 	}
// }
// let uc = new compressing.zip.UncompressStream();
// uc.on('entry', onEntry);
// axios({
// 	method: 'get',
// 	url: 'http://127.0.0.1:8080/pcan.zip',
// 	responseType: 'stream'
// }).then(function(response) {
// 	console.log('response', response.headers);
// 	response.data.on('data', (data) => {});
// 	response.data.pipe(uc);
// });
console.log(parseInt('fdsf', 10) + 12);
