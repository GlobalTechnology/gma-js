(function ( require ) {
	var min = gma.config.useMin ? '.min' : '';
	require.config( {
		// Base URL for requireJS
		'baseUrl':     gma.config.appUrl + '/js',

		// Append version to urls to bust cache
		'urlArgs':     'ver=' + gma.config.version,

		// Wait slightly longer for slower connections, default: 7
		'waitSeconds': 15,

		// Library paths
		paths:         {
			// Libraries
			'async':                  '../vendor/requirejs-plugins/src/async',
			'goog':                   '../vendor/requirejs-plugins/src/goog',
			'propertyParser':         '../vendor/requirejs-plugins/src/propertyParser',
			'angularAMD':             '../vendor/angularAMD/angularAMD' + min,
			'angular':                '../vendor/angular/angular' + min,
			'angular-route':          '../vendor/angular-route/angular-route'+min,
			'angular-bootstrap':      '../vendor/angular-bootstrap/ui-bootstrap-tpls'+min,
			'angular-resource':       '../vendor/angular-resource/angular-resource'+min,
			'markerwithlabel':        '../vendor/easy-markerwithlabel/src/markerwithlabel',
			'bootstrap':              '../vendor/bootstrap/dist/js/bootstrap'+min,
			'moment':                 '../vendor/moment/moment',
			'underscore':             '../vendor/underscore/underscore',

			// Application
			'app':                    'app',

			// Controllers
			'adminController':        'controllers/adminCtrl',
			'gcmController':          'controllers/gcmCtrl',
			'mapController':          'controllers/mapCtrl',
			'measurementsController': 'controllers/measurementsCtrl',
			'ReportsController':      'controllers/reports',

			//Services
			'assignmentService':      'services/assignment',
			'churchService':          'services/church',
			'ministryService':        'services/ministry',
			'trainingService':        'services/training',
			'sessionService':         'services/session',
			'measurementService':     'services/measurement',
			'measurementTypeService': 'services/measurement_type',
			'settingsService':        'services/settings'
		},

		// Library Dependencies
		shim:          {
			'angularAMD':        ['angular'],
			'angular-route':     ['angular'],
			'angular-bootstrap': ['angular', 'bootstrap'],
			'angular-resource':  ['angular'],
			'markerwithlabel':   ['async!' + gma.config.googlemaps],
			'underscore':        {exports: '_'},
			'angular':           {exports: 'angular'}
		},

		// Kickstart application
		deps:          ['app', 'gcmController']
	} );
})( require );
