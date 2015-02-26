define( ['angularAMD', 'angular-route', 'angular-bootstrap', 'angular-resource', 'sessionService', 'settingsService'], function ( angularAMD ) {
	var app = angular.module( 'app', ['ngRoute', 'ui.bootstrap', 'ngResource', 'app.settings'] )
		.run( [
			'$rootScope', '$route', 'sessionService', 'settings',
			function ( $rootScope, $route, sessionService, settings ) {
				// Object to hold current values: assignments, assignment, user ...
				$rootScope.current = {
					isLoaded: false
				};

				// Reload the route since ng-view directive is inside a template.
				$route.reload();

				// Start the session with the API
				//TODO fetch a ticket from refresh to start session
				sessionService.startSession( settings.ticket );
			}] )
		.config( [
			'$routeProvider', '$httpProvider', '$compileProvider', 'settingsProvider',
			function ( $routeProvider, $httpProvider, $compileProvider, settingsProvider ) {
				// Initialize Settings from wrapper provided config
				settingsProvider.setConfig( window.gma.config );

				// Add itms-services scheme to safe aHref protocols
				$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|itms-services):/ );

				// Register sessionService as an http interceptor
				$httpProvider.interceptors.push( 'sessionService' );

				// Setup application routes
				// angularAMD is used to provide on demand controller loading
				$routeProvider
					.when( '/map', angularAMD.route( {
						templateUrl: settingsProvider.appUrl( '/template/map.html' ),
						controller:  'mapController'
					} ) )
					.when( '/measurements', angularAMD.route( {
						templateUrl: settingsProvider.appUrl( '/template/measurements.html' ),
						controller:  'measurementsController'
					} ) )
					.when( '/admin', angularAMD.route( {
						templateUrl: settingsProvider.appUrl( '/template/admin.html' ),
						controller:  'adminController'
					} ) )
					.otherwise( {redirectTo: '/map'} );
			}] );
	return angularAMD.bootstrap( app );
} );
