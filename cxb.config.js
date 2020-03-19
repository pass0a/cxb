module.exports = (opts) => {
	let module_name = opts.module_name;
	let config = {
		module_name: 'cvip',
		remote_path: 'repertory/cxb/',
		package_name: `${module_name}.tar.gz?version=${opts.version}-${opts.platform}-${opts.arch}`,
		host: 'https://passoa-generic.pkg.coding.net',
		external: { opencv: [ 'http://127.0.0.1:8080/pcan.zip', 1 ] },
		build_cmd: {
			windows_x86: [ `-DBT_APP=${module_name}` ],
			node_x86: [ '-DNODE=1' ]
		}
	};
	return config;
};
