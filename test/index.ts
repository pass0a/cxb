async function testSync() {
	const response = await new Promise((resolve) => {
		setTimeout(() => {
			resolve('async await test...');
		}, 1000);
	});
	console.log(response);
}
main();
async function main() {
	console.log(await install());
	console.log(await wait(5000));
	console.log(await build());
	console.log('hahah');
}
async function wait(time: number) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve('async await test...');
		}, 1000);
	});
}
async function install() {
	return new Promise((resolve) => {
		console.log('install');
		resolve(0);
	});
}
async function build() {
	return new Promise((resolve) => {
		console.log(build);
		setTimeout(() => {
			resolve('async await install');
		}, 1000);
	});
}
