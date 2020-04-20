module.exports = (opts) => {
	let module_name = 'cxbtest';
	let config = {
		module_name: module_name,
		remote_path: 'repertory/cxb/',
		package_name: `${module_name}.tar.gz?version=${opts.version}-${opts.platform}-${opts.arch}`,
		host: 'https://passoa-generic.pkg.coding.net',
		build_cmd: {
			windows_x64: ['-G', 'Visual Studio 15 2017 Win64'],
			darwin_x64: [],
			linux_x64: []
		}
	};
	return config;
};
