module.exports = {
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	transform: {
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
	transformIgnorePatterns: [
		'node_modules/(?!(react-native|@react-native|expo|@expo|react-native-svg|react-native-chart-kit|react-native-elements)/)'],
	testMatch: [
		'**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)'],
	testPathIgnorePatterns: [
		'__tests__/MortgageForm.test.js', '__tests__/AIAssistant.test.js'],
	collectCoverageFrom: [
		'utils/**/*.{js,jsx}', '!**/node_modules/**', '!**/coverage/**', '!**/*.config.js'],
	coverageThreshold: {
		global: {
			branches: 60, functions: 70, lines: 70, statements: 70,
		},
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy', '^react-native$': '<rootDir>/node_modules/react-native/jest/react-native.js',
	},
};