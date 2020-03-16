import * as compressing from 'compressing';
import * as fs from 'fs-extra';
import * as minimist from 'minimist';
import * as request from 'request';
import * as readline from 'readline';
import * as url from 'url';
import * as path from 'path';
import * as cp from 'child_process';
import { Dist } from './dist';
import * as environment from './environment';
let dist = new Dist();

interface ConfigObject {
	[key: string]: any;
}
function slog(msg: string) {
	//readline.clearLine(process.stdout, 0);
	readline.cursorTo(process.stdout, 0, undefined);
	process.stdout.write(msg);
}
process.on('unhandledRejection', (error) => {
	console.error('unhandledRejection', error);
	process.exit(1); // To exit with a 'failure' code
});
main();
function initConfig(): ConfigObject {
	const pkg = require(`${process.cwd()}/package.json`);
	let env = process.env;
	let config = {
		name: pkg.name,
		configuration: env.build_type || 'Release',
		external: [],
		version: pkg.version,
		platform: plat_format(env.platform || process.platform),
		arch: arch_format(env.arch || process.arch),
		build_cmd: [],
		toolset_path: env.toolset_path || '',
		make_path: env.make_path || 'make',
		module_name: pkg.name,
		module_path: 'lib',
		remote_path: 'repertory/cxb/',
		package_name: '',
		host: '',
		hosted_path: '',
		hosted_tarball: '',
		staged_tarball: '',
		root_dir: process.cwd()
	};
	const opts: ConfigObject = require(`${config.root_dir}/cxb.config.js`)(config);
	mergeConfig(config, opts);
	return config;
}
function mergeConfig(config: ConfigObject, opts: ConfigObject) {
	for (const key in opts) {
		if (opts.hasOwnProperty(key) && config.hasOwnProperty(key)) {
			config[key] = opts[key];
		}
	}
}

async function main() {
	let argv = minimist(process.argv.slice(2));
	usage(argv);
	await dist.ensureDownloaded();
	let config = initConfig();
	if (argv.b || argv.build) {
		await build(config);
	} else if (argv.i || argv.install) {
		let cwd = process.cwd();
		let r = cwd.indexOf('node_modules');
		console.log(cwd, r);
		if (r < 0) {
			console.log('donot install when process.cwd in this project!!!');
		} else {
			await install(config);
		}
	} else {
		console.log('cxb: show help with --help');
	}
	//install('https://passoa-generic.pkg.coding.net/libbt/libbt/master?version=latest', '');
}
function usage(argv: any) {
	let help = argv.h || argv.help;
	if (help) {
		// If they didn't ask for help, then this is not a "success"
		var log = help ? console.log : console.error;
		log('Usage: pm <modules> [<Options> ...]');
		log('');
		log('  install native modules@passoa');
		log('');
		log('Options:');
		log('');
		log('  -h, --help     Display this usage info');
		log('  -b, --build   build cpp for project');
		log('  -i, --install   install cpp module(it will build cpp module if could not download from remote)');
		process.exit(help ? 0 : 1);
	}
}
function eval_template(template: string, opts: any) {
	template = template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (str: string, ...args: any[]): string => {
		let key = opts[args[0]] || process.env[args[0]] || 'undefined';
		return key;
	});
	// Object.keys(opts).forEach(function(key) {
	// 	var pattern = '{' + key + '}';
	// 	while (template.indexOf(pattern) > -1) {
	// 		template = template.replace(pattern, opts[key]);
	// 	}
	// });
	return template;
}

// url.resolve needs single trailing slash
// to behave correctly, otherwise a double slash
// may end up in the url which breaks requests
// and a lacking slash may not lead to proper joining
function fix_slashes(pathname: string) {
	if (pathname.slice(-1) != '/') {
		return pathname + '/';
	}
	return pathname;
}

// remove double slashes
// note: path.normalize will not work because
// it will convert forward to back slashes
function drop_double_slashes(pathname: string) {
	return pathname.replace(/\/\//g, '/');
}
function getExt(filename: string, extlist: string[]): string {
	let found: string = '';
	for (let ext of extlist) {
		if (filename.endsWith('.' + ext)) {
			if (found.length < ext.length) {
				found = ext;
			}
		}
		console.log(filename, found, ext);
	}
	return found;
}
function plat_format(plat: string) {
	switch (plat) {
		case 'win32':
		case 'windows':
			return 'windows';
	}
	return plat;
}
function arch_format(arch: string) {
	switch (arch) {
		case 'ia32':
		case 'x32':
		case 'x86':
			return 'x86';
		case 'x86_64':
		case 'x64':
			return 'x64';
	}
	return arch;
}
function isStringArray(arr: any[]) {
	for (const iterator of arr) {
		if (typeof iterator != 'string') return false;
	}
	return true;
}
function isStringArray2(arr: any[]) {
	for (const iterator of arr) {
		if (!Array.isArray(iterator) && !isStringArray(iterator)) return false;
	}
	return true;
}
function addDefaultCmd(bc: string[]) {
	let incPaths;
	if (dist.headerOnly) {
		incPaths = [ path.join(dist.internalPath, '/include/node') ];
	} else {
		let nodeH = path.join(dist.internalPath, '/src');
		let v8H = path.join(dist.internalPath, '/deps/v8/include');
		let uvH = path.join(dist.internalPath, '/deps/uv/include');
		incPaths = [ nodeH, v8H, uvH ];
	}
	// Includes:
	bc.push(`-DCMAKE_JS_INC=${incPaths.join(';')}`);
	if (environment.isWin) {
		// Win
		let libs = dist.winLibs;
		if (libs.length) {
			bc.push(`-DCMAKE_JS_LIB=${libs.join(';')}`);
		}
	}
}
function buildByStringArray(build_str: string, opts: any, bc: string[]) {
	for (const key in bc) {
		if (bc.hasOwnProperty(key)) {
			const element = bc[key];
			bc[key] = eval_template(element, opts);
		}
	}

	fs.emptyDirSync(`build/${build_str}`);
	process.chdir(`build/${build_str}`);

	bc = [ '../../' ].concat(bc);
	addDefaultCmd(bc);
	console.log(bc);

	let r = cp.spawnSync('cmake', bc, { stdio: 'inherit' });
	if (r.status) {
		throw new Error('cmake generator fails');
	}
	r = cp.spawnSync('cmake', [ '--build', './', '--config', opts.configuration ], { stdio: 'inherit' });
	if (r.status) {
		throw new Error('cmake build fails');
	}
	process.chdir('../../');
}
async function build(config: any) {
	if (config.external) {
		for (const key in config.external) {
			if (config.external.hasOwnProperty(key)) {
				const element = config.external[key];
				let src = path.join(`${config.root_dir}/build/stage`, key);
				let dst = path.join(`${config.root_dir}/3rd`, key);
				console.log('test:', dst);
				if (fs.existsSync(dst)) {
					break;
				}
				let ext = getExt(element, [ 'tgz', 'tar.gz', 'zip', 'gz' ]);
				src = `${src}.${ext}`;

				if (await download(element, src)) {
					fs.removeSync(src);
					throw new Error(`download ${element} error in build`);
				}
				if (await uncompress(src, dst)) {
					fs.removeSync(src);
					throw new Error(`uncompress ${src} error in build`);
				}
			}
		}
	}
	if (config.build_cmd) {
		let build_str = `${config.platform}_${config.arch}`;
		let bc = config.build_cmd[build_str];
		if (!bc) {
			throw new Error(`please check your config for ${build_str}`);
		}
		if (Array.isArray(bc)) {
			if (isStringArray(bc)) {
				buildByStringArray(build_str, config, bc);
			} else if (isStringArray2(bc)) {
				let idx = 0;
				for (const iterator of bc) {
					buildByStringArray(`${build_str}_${idx++}`, config, iterator);
				}
			} else {
				throw new Error(`please check your config for ${build_str}`);
			}
		}
	}
}
async function install(config: any) {
	config.hosted_path = url.resolve(config.host, config.remote_path);
	config.hosted_tarball = url.resolve(config.hosted_path, config.package_name);
	let tarball = `${config.module_name}-v${config.version}-${config.platform}-${config.arch}.tar.gz`;
	config.staged_tarball = path.join('build/stage', tarball);
	console.log(config);
	// if (await download(config.hosted_tarball, config.staged_tarball)) {
	// 	fs.removeSync(config.staged_tarball);
	// 	throw new Error(`download ${config.hosted_tarball} error in install`);
	// }
	// if (await uncompress(config.staged_tarball, config.module_path)) {
	// 	fs.removeSync(config.staged_tarball);
	// 	throw new Error(`uncompress ${config.staged_tarball} error in install`);
	// }
}
async function uncompress(src: string, dst: string) {
	return new Promise((resolve) => {
		let ext = getExt(src, [ 'tgz', 'tar.gz', 'zip', 'gz' ]);

		switch (ext) {
			case 'tgz':
			case 'tar.gz':
				fs.mkdirpSync(dst);
				compressing.tgz
					.uncompress(src, dst)
					.then(() => {
						resolve(0);
					})
					.catch(() => {
						fs.removeSync(dst);
						resolve(-2);
					});

				break;
			case 'tar':
				fs.mkdirpSync(dst);
				compressing.tar
					.uncompress(src, dst)
					.then(() => {
						resolve(0);
					})
					.catch(() => {
						fs.removeSync(dst);
						resolve(-2);
					});
				break;
			case 'gz':
				fs.mkdirpSync(dst);
				compressing.gzip
					.uncompress(src, dst)
					.then(() => {
						resolve(0);
					})
					.catch(() => {
						fs.removeSync(dst);
						resolve(-2);
					});
				break;
			case 'zip':
				fs.mkdirpSync(dst);
				compressing.zip
					.uncompress(src, dst)
					.then(() => {
						resolve(0);
					})
					.catch(() => {
						fs.removeSync(dst);
						resolve(-2);
					});
				break;
			default:
				resolve(-1);
				break;
		}
	});
}
function downloadByRequest(remote: string, staged: string, cb: (err: number) => void) {
	let total = 0,
		cur = 0,
		len = 0,
		err = 0;
	request
		.get(remote)
		.on('response', function(response) {
			err = response.statusCode == 200 ? 0 : -2; // 200
			let tmp = response.headers['content-length'];
			if (tmp) {
				len = parseInt(tmp, 10);
				total = len / (1024 * 1024);
			}
		})
		.on('data', (chunk) => {
			cur += chunk.length;
			if (len > 0) {
				slog(
					'Downloading ' +
						(100.0 * cur / len).toFixed(2) +
						'% ' +
						(cur / 1048576).toFixed(2) +
						' ' +
						'. Total size: ' +
						total.toFixed(2) +
						' mb'
				);
			} else {
				slog('Downloading ' + (cur / 1024).toFixed(2) + 'kb ' + '. Total size: unknow mb');
			}
		})
		.on('error', (code) => {
			console.log(code);
			err = -1;
			cb(-1);
		})
		.on('end', () => {
			console.log('\r\n');
			cb(err);
		})
		.pipe(fs.createWriteStream(staged));
}
//async function downloadByCurl(remote: string, staged: string) {}
async function download(remote: string, staged: string) {
	console.log(`downloading file from ${remote} to ${staged}`);
	return new Promise((resolve) => {
		fs.mkdirpSync(path.dirname(staged));
		if (fs.existsSync(staged)) {
			console.log('exist staged:' + staged);
			resolve(0);
		} else {
			let r = cp.spawn('curl', [ '-L', remote, '-o', staged ], { stdio: 'inherit' });
			r.on('error', (err) => {
				console.log(err);
			});
			r.on('close', (code) => {
				if (code) {
					console.log('downloadByCurl:' + code);
					downloadByRequest(remote, staged, (err) => {
						console.log('downloadByRequest:' + err);
						resolve(err);
					});
				} else {
					resolve(0);
				}
			});
		}
	});
	//return await downloadByCurl(remote, staged);
}
