(function () {
	'use strict';
	angular.module( 'gma' )
		.run( function ( $rootScope, $route, $location, Session, Settings, GoogleAnalytics ) {
			// Object to hold current values: assignments, assignment, user ...
			$rootScope.current = {
				isLoaded: false
			};

			// Init Google Analytics
			GoogleAnalytics.init();

			// Support application inside an iframe, sync parent hash.
			if ( typeof window.parent !== 'undefined' ) {
				var parentHash = window.parent.location.hash;
				if ( parentHash ) {
					$location.path( parentHash.slice( 1 ) );
				}

				$rootScope.$on( '$locationChangeSuccess', function () {
					window.parent.location.hash = '#' + $location.path();
				} );
			}

			// Reload the route since ng-view directive is inside a template.
			$route.reload();

			// Start the session with the API
			//TODO fetch a ticket from refresh to start session
			Session.startSession( Settings.ticket );
		} )
		.config( function ( $routeProvider, $httpProvider, $compileProvider, SettingsProvider, $provide, growlProvider ) {
			// Initialize Settings from wrapper provided config
			SettingsProvider.setConfig( window.gma.config );

			// Add itms-services scheme to safe aHref protocols
			$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|itms-services):/ );

			// Register Session as an http interceptor
			$httpProvider.interceptors.push( 'Session' );


			//global configs for angular-growl
			growlProvider.globalPosition('top-right');
			growlProvider.globalTimeToLive(5000);
			growlProvider.globalDisableCountDown(true);

			// Setup application routes
			angular.forEach( SettingsProvider.routes(), function ( route, i ) {
				if ( i === 0 ) {
					$routeProvider.otherwise( {redirectTo: route.path} );
				}
				$routeProvider
					.when( route.path, {
						templateUrl: route.templateUrl,
						controller:  route.controller
					} );
			} );
			$routeProvider.when( '/error/:reason', {
				templateUrl: 'partials/error/error.html',
				controller:  'ErrorCtrl'
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
		} );
})();
