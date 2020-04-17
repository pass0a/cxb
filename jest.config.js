module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleFileExtensions: [ 'js', 'jsx', 'json', 'ts', 'tsx' ],
	transform: {
		'.+\\.tsx?$': '<rootDir>/node_modules/ts-jest'
	},
	collectCoverageFrom: [ 'src/**/*.{js,jsx,ts,tsx}', '!**/node_modules/**', '!src/**/*.d.ts' ],
	testMatch: [ '**/__tests__/**/*.(js|ts)?(x)', '**/?(*.)(spec|test).(js|ts)?(x)' ],
	coverageDirectory: '<rootDir>/.coverage-report'
};
