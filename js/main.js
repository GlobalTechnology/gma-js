require.config( {
	// Base URL for requireJS
	'baseUrl': gma.config.appUrl + '/js',

	// Library paths
	paths:     {
		// Libraries
		'async':                  '../vendor/requirejs-plugins/src/async',
		'goog':                   '../vendor/requirejs-plugins/src/goog',
		'propertyParser':         '../vendor/requirejs-plugins/src/propertyParser',
		'angularAMD':             '../vendor/angularAMD/angularAMD',
		'angular':                '../vendor/angular/angular',
		'angular-route':          '../vendor/angular-route/angular-route',
		'angular-bootstrap':      '../vendor/angular-bootstrap/ui-bootstrap-tpls',
		'angular-resource':       '../vendor/angular-resource/angular-resource',
		'markerwithlabel':        '../vendor/easy-markerwithlabel/src/markerwithlabel',
		'bootstrap':              '../vendor/bootstrap/dist/js/bootstrap',
		'moment':                 '../vendor/moment/moment',
		'underscore':             '../vendor/underscore/underscore',

		// Application
		'app':                    'app',

		// Controllers
		'adminController':        'controllers/adminCtrl',
		'gcmController':          'controllers/gcmCtrl',
		'mapController':          'controllers/mapCtrl',
		'measurementsController': 'controllers/measurementsCtrl',

		//Services
		'assignmentService':      'services/assignment',
		'churchService':          'services/church',
		'ministryService':        'services/ministry',
		'trainingService':        'services/training',
		'sessionService':         'services/session',
		'measurementService':     'services/measurement',
		'settingsService':        'services/settings'
	},

	// Library Dependencies
	shim:      {
		'angularAMD':        ['angular'],
		'angular-route':     ['angular'],
		'angular-bootstrap': ['angular', 'bootstrap'],
		'angular-resource':  ['angular'],
		'markerwithlabel':   ['async!' + gma.config.googlemaps],
		'underscore':        {exports: '_'},
		'angular':           {exports: 'angular'}
	},

	// Kickstart application
	deps:      ['app', 'gcmController']
} );
