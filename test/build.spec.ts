import { run, initConfig, build, install, release } from '../src/index';
import { Uploader } from '../src/uploader';
import { join } from 'path';
import * as fs from 'fs-extra';
import { runTest } from './simple';
import { exec } from 'child_process';

describe('cxb interface', () => {
	test(
		'run',
		async () => {
			process.chdir(join(__dirname, 'simple'));
			let ret = await run({});
			expect(ret).toBe(-2);
		},
		30000
	);
	test('build', async () => {
		process.chdir(join(__dirname, 'simple'));
		let config = initConfig();
		let ret = await build(config);
		expect(ret).toBe(0);
	});
	test('install', async () => {
		process.chdir(join(__dirname, 'simple'));
		let config = initConfig();
		//config.hosted_tarball = 'jijiji';
		let ret = await install(config);
		expect(ret).toBe(0);
	});
	test('errhost', async () => {
		process.chdir(join(__dirname, 'simple'));
		let config = initConfig();
		config.hosted_tarball = 'jijiji';
		let ret = await install(config);
		expect(ret).toBe(0);
	});
	test('release', async () => {
		process.chdir(join(__dirname, 'simple'));
		let config = initConfig();
		let ret = await release(config);
		expect(ret).toBe(0);
	}, 30000);
});
describe('cxb uploader', () => {
	let dst = join(__dirname, '../tmp/test.tgz');
	let src = join(__dirname, 'simple/build');

	test('tar.gz', async () => {
		process.chdir(join(__dirname, 'simple'));
		let up = new Uploader();

		fs.ensureFileSync(dst);
		let ret = await up.packTgz(src, dst);
		expect(ret).toBe(0);
	});

	// test('upload', async () => {
	// 	process.chdir(join(__dirname, 'simple'));
	// 	let up = new Uploader();
	// 	let env = process.env;
	// 	const token = Buffer.from(`${env.CXBUSERNAME}:${env.CXBPASSWORD}`, 'utf8').toString('base64');
	// 	let config = initConfig();

	// 	fs.ensureFileSync(dst);
	// 	let ret = await up.packTgz(src, dst);
	// 	expect(ret).toBe(0);
	// 	console.log(config.hosted_tarball, dst);
	// 	ret = await up.upload(config.hosted_tarball, dst, token);
	// 	expect(ret).toBe(0);
	// });
});

describe('cxb npm', () => {
	// test(
	// 	'npm',
	// 	async () => {
	// 		process.chdir(join(__dirname, 'use'));
	// 		// let ctx = fs.readFileSync(join(__dirname, 'use/package.tpl'), { encoding: 'utf8' });
	// 		// ctx = ctx.replace('{simple_path}', join(__dirname, 'simple').replace(/\\/g, '/'));
	// 		// ctx = ctx.replace('{cxb_path}', join(__dirname, '../').replace(/\\/g, '/'));
	// 		//fs.writeFileSync(join(__dirname, 'use/package.json'), ctx);

	// 		let ret = await execNpm('npm install');
	// 		expect(ret).toBe(0);
	// 	},
	// 	15 * 1000
	// );
	test('npm', () => {
		expect(runTest()).toBe('Hello World');
	});
});
