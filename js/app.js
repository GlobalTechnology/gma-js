define( ['angularAMD', 'angular-route', 'angular-bootstrap', 'angular-resource', 'sessionService', 'settingsService'], function ( angularAMD ) {
	var app = angular.module( 'app', ['ngRoute', 'ui.bootstrap', 'ngResource', 'app.settings'] )
		.run( [
			'$rootScope', '$route', 'sessionService', 'settings',
			function ( $rootScope, $route, sessionService, settings ) {
				// Object to hold current values: assignments, assignment, user ...
				$rootScope.current = {
					isLoaded: false
				};
				$rootScope.visibleTabs = settings.enabledTabs;

				// Reload the route since ng-view directive is inside a template.
				$route.reload();

				// Start the session with the API
				//TODO fetch a ticket from refresh to start session
				sessionService.startSession( settings.ticket );
			}] )
		.config( [
			'$routeProvider', '$httpProvider', '$compileProvider', 'settingsProvider', '$provide',
			function ( $routeProvider, $httpProvider, $compileProvider, settingsProvider, $provide ) {
				// Initialize Settings from wrapper provided config
				settingsProvider.setConfig( window.gma.config );

				// Add itms-services scheme to safe aHref protocols
				$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|itms-services):/ );

				// Register sessionService as an http interceptor
				$httpProvider.interceptors.push( 'sessionService' );

				// Setup application routes
				// angularAMD is used to provide on demand controller loading
				angular.forEach( settingsProvider.routes(), function ( route, i ) {
					if ( i === 0 ) {
						$routeProvider.otherwise( {redirectTo: route.path} );
					}
					$routeProvider
						.when( route.path, angularAMD.route( {
							templateUrl: route.templateUrl,
							controller:  route.controller
						} ) );
				} );

				// https://github.com/angular/angular.js/issues/1404
				// Source: http://plnkr.co/edit/hSMzWC?p=preview
				$provide.decorator( 'ngModelDirective', function ( $delegate ) {
					var ngModel = $delegate[0], controller = ngModel.controller;
					ngModel.controller = ['$scope', '$element', '$attrs', '$injector', function ( scope, element, attrs, $injector ) {
						var $interpolate = $injector.get( '$interpolate' );
						attrs.$set( 'name', $interpolate( attrs.name || '' )( scope ) );
						$injector.invoke( controller, this, {
							'$scope':   scope,
							'$element': element,
							'$attrs':   attrs
						} );
					}];
					return $delegate;
				} );

				$provide.decorator( 'formDirective', function ( $delegate ) {
					var form = $delegate[0], controller = form.controller;
					form.controller = ['$scope', '$element', '$attrs', '$injector', function ( scope, element, attrs, $injector ) {
						var $interpolate = $injector.get( '$interpolate' );
						attrs.$set( 'name', $interpolate( attrs.name || attrs.ngForm || '' )( scope ) );
						$injector.invoke( controller, this, {
							'$scope':   scope,
							'$element': element,
							'$attrs':   attrs
						} );
					}];
					return $delegate;
				} );
			}] );
	return angularAMD.bootstrap( app );
} );
