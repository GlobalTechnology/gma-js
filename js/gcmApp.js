var _api_url = window._api_url = GCM_APP.api_url;
define( ['angularAMD', 'angular-route', 'angular-bootstrap', 'angular-resource', 'sessionService'], function ( angularAMD ) {
	var gcmApp = angular.module( 'gcmApp', ['ngRoute', 'ui.bootstrap', 'ngResource'] )
		.run( ['$rootScope', '$route', 'sessionService', function ( $rootScope, $route, sessionService ) {
			// Attach global constants to root scope
			$rootScope.GCM_APP = window.GCM_APP;

			// Object to hold current values: assignments, assignment, user ...
			$rootScope.current = {
				isLoaded: false
			};

			// Reload the route since ng-view directive is inside a template.
			$route.reload();

			// Start the session with the API
			sessionService.startSession( $rootScope.GCM_APP.ticket );
		}] )
		.config( ['$routeProvider', '$httpProvider', function ( $routeProvider, $httpProvider ) {
			// Register sessionService as an http interceptor
			$httpProvider.interceptors.push( 'sessionService' );

			$routeProvider
				.when( '/map', angularAMD.route( {
					templateUrl: GCM_APP.app_url + "/template/map.html",
					controller:  'mapController'
				} ) )
				.when( '/measurements', angularAMD.route( {
					templateUrl: GCM_APP.app_url + "/template/measurements.html",
					controller:  'measurementsController'
				} ) )
				.when( '/admin', angularAMD.route( {
					templateUrl: GCM_APP.app_url + "/template/admin.html",
					controller:  'adminController'
				} ) )
				.otherwise( {redirectTo: '/map'} );
		}] );
	return angularAMD.bootstrap( gcmApp );
} );
