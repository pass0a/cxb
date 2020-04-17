export function runTest() {
	let bindings = require('bindings')('simple');
	return bindings.hello();
}
