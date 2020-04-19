/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = {
	...require('./jest.config'),
	coverageReporters: [ 'cobertura' ],
	coverageDirectory: '<rootDir>/reports/coverage',
	reporters: [
		[ 'jest-junit', { outputDirectory: '<rootDir>/reports/junit', outputName: 'js-test-results.xml' } ],
		[ 'jest-silent-reporter', { showPaths: true, showWarnings: true, useDots: true } ]
	]
};
