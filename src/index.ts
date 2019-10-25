import * as path from 'path';
import getUri from 'get-uri';
import * as compressing from 'compressing';
import * as fs from 'fs-extra';
import * as minimist from 'minimist';
import { spawn } from 'child_process';
main();
function main() {
	let argv = minimist(process.argv.slice(2));
	let build = argv.b || argv.build;

	usage(argv);
	if (build) {
		let cp = spawn('cmake', { stdio: 'inherit' });
	}
	//console.log(conf, argv._.length, argv);
	// conf_path = path.resolve(process.cwd() + '/' + (conf_path ? conf_path : 'pmconfig.js'));
	// require(conf_path);
	//fs.mkdirp('tmp');
	// for (const iterator of conf) {
	// 	let tv = iterator[target];

	// 	if (tv && iterator.name) {
	// 		install(iterator[target], iterator.name);
	// 	}
	// }
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
		log('  -c, --config   Path to the config file');
		log('  -t, --target   Environment to build for');
		process.exit(help ? 0 : 1);
	}
}
function install(remote: string, modname: string) {
	getUri(remote, null, function(err: any, rs: any) {
		if (err) throw err;
		rs.pipe(fs.createWriteStream(`tmp/${modname}.tar.gz`)).on('finish', () => {
			compressing.tgz
				.uncompress(`tmp/${modname}.tar.gz`, 'tmp')
				.then(() => {
					fs
						.copy('tmp/node_modules', 'node_modules/@passoa', { overwrite: true })
						.then(() => {
							console.log('move ok!!!');
						})
						.catch((err) => {
							console.log('move failed', err);
						});
					console.log('ok');
				})
				.catch(() => {
					console.log('failed');
				});
		});
	});
}
