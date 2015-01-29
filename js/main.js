require.config( {
	// Base URL for requireJS
	'baseUrl': GCM_APP.app_url + '/js',

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

		// Application
		'gcmApp':                 'gcmApp',

		// Controllers
		'adminController':        'controllers/adminCtrl',
		'gcmCtrl':                'controllers/gcmCtrl',
		'mapController':          'controllers/mapCtrl',
		'measurementsController': 'controllers/measurementsCtrl',

		//Services
		'assignment_service':     'services/assignments',
		'church_service':         'services/church',
		'measurement_service':    'services/measurement',
		'ministry_service':       'services/ministries',
		'token':                  'services/token',
		'training_service':       'services/training'
	},

	// Library Dependencies
	shim:      {
		'angularAMD':        ['angular'],
		'angular-route':     ['angular'],
		'angular-bootstrap': ['angular'],
		'angular-resource':  ['angular'],
		'markerwithlabel':   ['async!https://maps.googleapis.com/maps/api/js?sensor=false']
	},

	// Kickstart application
	deps:      ['gcmApp', 'gcmCtrl']
} );
