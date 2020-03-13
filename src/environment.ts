'use strict';
import * as os from 'os';
let isIOJS = require('is-iojs');
let which = require('which');
export let moduleVersion = require('../package.json').version;
export let platform = os.platform();
export let isWin = os.platform() === 'win32';
export let isLinux = os.platform() === 'linux';
export let isOSX = os.platform() === 'darwin';
export let arch = os.arch();
export let isX86 = os.arch() === 'ia32';
export let isX64 = os.arch() === 'x64';
export let isArm = os.arch() === 'arm';
export let runtime = isIOJS ? 'iojs' : 'node';
export let runtimeVersion = process.versions.node;
export let home = process.env[os.platform() === 'win32' ? 'USERPROFILE' : 'HOME'];
export let EOL = os.EOL;

// Object.defineProperties(environment, {
// 	isPosix: {
// 		get: function() {
// 			return !this.isWin;
// 		}
// 	},
// 	_isNinjaAvailable: {
// 		value: null,
// 		writable: true
// 	},
// 	isNinjaAvailable: {
// 		get: function() {
// 			if (this._isNinjaAvailable === null) {
// 				this._isNinjaAvailable = false;
// 				try {
// 					if (which.sync('ninja')) {
// 						this._isNinjaAvailable = true;
// 					}
// 				} catch (e) {
// 					_.noop(e);
// 				}
// 			}
// 			return this._isNinjaAvailable;
// 		}
// 	},
// 	_isMakeAvailable: {
// 		value: null,
// 		writable: true
// 	},
// 	isMakeAvailable: {
// 		get: function() {
// 			if (this._isMakeAvailable === null) {
// 				this._isMakeAvailable = false;
// 				try {
// 					if (which.sync('make')) {
// 						this._isMakeAvailable = true;
// 					}
// 				} catch (e) {
// 					_.noop(e);
// 				}
// 			}
// 			return this._isMakeAvailable;
// 		}
// 	},
// 	_isGPPAvailable: {
// 		value: null,
// 		writable: true
// 	},
// 	isGPPAvailable: {
// 		get: function() {
// 			if (this._isGPPAvailable === null) {
// 				this._isGPPAvailable = false;
// 				try {
// 					if (which.sync('g++')) {
// 						this._isGPPAvailable = true;
// 					}
// 				} catch (e) {
// 					_.noop(e);
// 				}
// 			}
// 			return this._isGPPAvailable;
// 		}
// 	},
// 	_isClangAvailable: {
// 		value: null,
// 		writable: true
// 	},
// 	isClangAvailable: {
// 		get: function() {
// 			if (this._isClangAvailable === null) {
// 				this._isClangAvailable = false;
// 				try {
// 					if (which.sync('clang++')) {
// 						this._isClangAvailable = true;
// 					}
// 				} catch (e) {
// 					_.noop(e);
// 				}
// 			}
// 			return this._isClangAvailable;
// 		}
// 	}
// });
