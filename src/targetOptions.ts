import * as environment from './environment';

interface ifOptions {
	runtimeVersion?: string;
	runtime?: string;
	arch?: string;
}
export class TargetOptions {
	private options: ifOptions;
	constructor(options: ifOptions) {
		this.options = options || {};
	}
	get arch() {
		return this.options.arch || environment.arch;
	}
	get isX86() {
		return this.arch === 'ia32';
	}
	get isX64() {
		return this.arch === 'x64';
	}
	get isArm() {
		return this.arch === 'arm';
	}
	get runtime() {
		return this.options.runtime || environment.runtime;
	}
	get runtimeVersion() {
		return this.options.runtimeVersion || environment.runtimeVersion;
	}
}
