const CircularDependencyPlugin = require( 'circular-dependency-plugin' );

module.exports = {
	plugins: [
		new CircularDependencyPlugin( {
			exclude: /node_modules/,
			failOnError: true,
			allowAsyncCycles: false,
			cwd: process.cwd(),
		} ),
	],
};
