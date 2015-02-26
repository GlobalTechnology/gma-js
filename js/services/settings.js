define( ['angular', 'underscore'], function ( angular, _ ) {
	angular.module( 'app.settings', [] )
		.provider( 'settings', function () {
			var config = {};

			this.setConfig = function ( c ) {
				config = c;
			};

			this.appUrl = function ( path ) {
				return apiUrl( config.appUrl, path );
			};

			var measurementsApi = function ( path ) {
				return apiUrl( config.api.measurements, path );
			};

			function apiUrl( base, path ) {
				if ( typeof path === 'undefined' ) return base;
				return ( path.indexOf( '/' ) === 0 )
					? base + path
					: base + '/' + path;
			}

			var mobileApps = function () {
				if ( typeof config.mobileapps === 'undefined' ) return false;
				return config.mobileapps.length > 0 ? config.mobileapps : false;
			};

			this.$get = function () {
				return {
					appUrl:     this.appUrl,
					ticket:     config.ticket,
					api:        {
						measurements: measurementsApi,
						refresh:      config.api.refresh,
						logout:       config.api.logout
					},
					mobileApps: ( typeof config.mobileapps !== 'undefined' && config.mobileapps.length > 0  ) ? config.mobileapps : false,
					gmaNamespace: config.namespace
				}
			};
		} );
} );
