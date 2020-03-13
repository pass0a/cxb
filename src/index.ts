import * as compressing from 'compressing';
import * as fs from 'fs-extra';
import * as minimist from 'minimist';
import * as request from 'request';
import * as readline from 'readline';
import * as url from 'url';
import * as path from 'path';
import * as cp from 'child_process';
import { Dist } from './dist';

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
async function main() {
	let dist = new Dist();
	await dist.ensureDownloaded();
	let argv = minimist(process.argv.slice(2));
	usage(argv);
	const context = fs.readFileSync('./cxb.json', 'utf8');
	let config = JSON.parse(context);
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
	let env = process.env;
	var opts = {
		name: config.name,
		configuration: env.build_type || 'Release',
		external: config.cxb.external,
		version: config.version,
		platform: plat_format(env.platform || process.platform),
		arch: arch_format(env.arch || process.arch),
		build_cmd: config.cxb.build_cmd,
		toolset_path: env.toolset_path || '',
		make_path: env.make_path || 'make'
	};

	if (opts.external) {
		for (const key in opts.external) {
			if (opts.external.hasOwnProperty(key)) {
				const element = opts.external[key];
				let src = path.join('build/stage', key);
				let dst = path.join('3rd', key);
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
	if (opts.build_cmd) {
		let build_str = `${opts.platform}_${opts.arch}`;
		let bc = opts.build_cmd[build_str];
		if (!bc) {
			throw new Error(`please check your config for ${build_str}`);
		}
		if (Array.isArray(bc)) {
			if (isStringArray(bc)) {
				buildByStringArray(build_str, opts, bc);
			} else if (isStringArray2(bc)) {
				let idx = 0;
				for (const iterator of bc) {
					buildByStringArray(`${build_str}_${idx++}`, opts, iterator);
				}
			} else {
				throw new Error(`please check your config for ${build_str}`);
			}
		}
	}
}
async function install(config: any) {
	console.log(config);
	let env = process.env;
	let cxb = config.cxb;
	var opts = {
		name: config.name,
		configuration: 'Release',
		module_name: '',
		module_path: '',
		remote_path: '',
		package_name: cxb.binary.package_name,
		host: '',
		version: config.version,
		platform: plat_format(env.platform || process.platform),
		arch: arch_format(env.arch || process.arch),
		hosted_path: '',
		hosted_tarball: '',
		staged_tarball: ''
	};
	opts.host = fix_slashes(eval_template(cxb.binary.host, opts));
	opts.module_name = eval_template(cxb.binary.module_name, opts);
	opts.module_path = eval_template(cxb.binary.module_path, opts);
	opts.package_name = eval_template(cxb.binary.package_name, opts);
	opts.remote_path = eval_template(cxb.binary.remote_path, opts);
	opts.hosted_path = url.resolve(opts.host, opts.remote_path);
	opts.hosted_tarball = url.resolve(opts.hosted_path, opts.package_name);
	let tarball = `${opts.module_name}-v${opts.version}-${opts.platform}-${opts.arch}.tar.gz`;
	opts.staged_tarball = path.join('build/stage', tarball);
	if (await download(opts.hosted_tarball, opts.staged_tarball)) {
		fs.removeSync(opts.staged_tarball);
		throw new Error(`download ${opts.hosted_tarball} error in install`);
	}
	if (await uncompress(opts.staged_tarball, opts.module_path)) {
		fs.removeSync(opts.staged_tarball);
		throw new Error(`uncompress ${opts.staged_tarball} error in install`);
	}
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
