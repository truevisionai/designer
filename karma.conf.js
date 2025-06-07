// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function ( config ) {
	config.set( {
		basePath: '',
		frameworks: [ 'jasmine', '@angular-devkit/build-angular' ],
		plugins: [
			require( 'karma-jasmine' ),
			require( 'karma-chrome-launcher' ),
			require( 'karma-jasmine-html-reporter' ),
			require( 'karma-spec-reporter' ),
			require( 'karma-coverage' ),
			require( '@angular-devkit/build-angular/plugins/karma' )
		],
		client: {
			jasmine: {
				// you can add configuration options for Jasmine here
				// the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
				// for example, you can disable the random execution with `random: false`
				// or set a specific seed with `seed: 4321`
			},
			clearContext: false, // leave Jasmine Spec Runner output visible in browser,
			captureConsole: false,
			jasmine: {
				random: false,
				verbose: false
			}
		},
		jasmineHtmlReporter: {
			suppressAll: true // removes the duplicated traces
		},
		coverageReporter: {
			dir: require( 'path' ).join( __dirname, 'coverage' ),
			subdir: '.',
			reporters: [
				{ type: 'html' },
				{ type: 'text-summary' }
			]
		},
		reporters: [ 'progress', 'kjhtml', 'spec' ],
		specReporter: {
			maxLogLines: 50, // Limit log lines per test
			suppressErrorSummary: false,  // Do not print error summary
			suppressFailed: false, // Do not print information about failed tests
			suppressPassed: false, // Do not print information about passed tests
			suppressSkipped: true,  // Do not print information about skipped tests
			showSpecTiming: true, // Print the time elapsed for each spec
		},
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: [ 'ChromeDebugging' ],
		singleRun: false,
		customLaunchers: {
			ChromeDebugging: {
				base: 'Chrome',
				flags: [ '--remote-debugging-port=9333' ]
			}
		},
		restartOnFileChange: true
	} );
};
