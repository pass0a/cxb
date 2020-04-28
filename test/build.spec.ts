import { run, initConfig, build, install, pack } from '../src/index';
import { join } from 'path';
import { runTest } from './simple';

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
	test(
		'pack',
		async () => {
			process.chdir(join(__dirname, 'simple'));
			let config = initConfig();
			let ret = await pack(config);
			expect(ret).toBe(0);
		},
		30000
	);
});

describe('cxb test', () => {
	test('test', () => {
		expect(runTest()).toBe('Hello World');
	});
});
