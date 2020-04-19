module.exports = (opts) => {
	let module_name = 'cxbtest';
	let config = {
		module_name: module_name,
		remote_path: 'repertory/cxb/',
		package_name: `${module_name}.tar.gz?version=${opts.version}-${opts.platform}-${opts.arch}`,
		host: 'https://passoa-generic.pkg.coding.net',
		build_cmd: {
			windows_x64: [ '-G', 'Visual Studio 15 2017 Win64' ],
			node_x64: [ '-G', 'Visual Studio 14 2015 Win64' ]
		}
	};
	return config;
};
