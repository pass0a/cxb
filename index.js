const path = require('path');
const getUri = require('get-uri');
const compressing = require('compressing');
const fs = require('fs-extra');
main();

function main() {
	let argv = require('minimist')(process.argv.slice(2));
	let conf_path = argv.c || argv.config;
	let target = argv.t || argv.target;

	usage(argv);
	//console.log(conf, argv._.length, argv);
	conf_path = path.resolve(process.cwd() + '/' + (conf_path ? conf_path : 'pmconfig.js'));
	let conf = require(conf_path);
	fs.mkdirp('tmp');
	for (const iterator of conf) {
		let tv = iterator[target];

		if (tv && iterator.name) {
			install(iterator[target], iterator.name);
		}
	}
}
function usage(argv) {
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
function install(remote, modname) {
	getUri(remote, function(err, rs) {
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
							console.log(('move failed', err));
						});
					console.log('ok');
				})
				.catch(() => {
					console.log('failed');
				});
		});
	});
}
