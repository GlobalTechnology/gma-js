define( ['angular', 'underscore'], function ( angular, _ ) {
	angular.module( 'app.settings', [] )
		.provider( 'settings', function () {
			var config = {};

			this.setConfig = function ( c ) {
				config = c;
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

            this.routes = function(){
                var returnTabs = [];
                angular.forEach(config.enabled_tabs, function(tab){
                    switch(tab) {
                        case 'map':
                            returnTabs.push({
                                name: 'Church',
                                path: '/map',
                                templateUrl: apiUrl( config.appUrl, '/template/map.html' ),
                                controller:  'mapController',
                                requiredRoles: ['self_assigned', 'member', 'inherited_leader', 'leader']
                            });
                            break;
                        case 'measurements':
                            returnTabs.push({
                                name: 'Measurements',
                                path: '/measurements',
                                templateUrl: apiUrl( config.appUrl, '/template/measurements.html' ),
                                controller:  'measurementsController',
                                requiredRoles: ['self_assigned', 'member', 'inherited_leader', 'leader']
                            });
                            break;
                        case 'admin':
                            returnTabs.push({
                                name: 'Admin',
                                path: '/admin',
                                templateUrl: apiUrl( config.appUrl, '/template/admin.html' ),
                                controller:  'adminController',
                                requiredRoles: ['leader', 'inherited_leader']
                            });
                            break;
                    }
                });
                config.enabledTabs = returnTabs;
                return returnTabs;
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
					gmaNamespace: config.namespace,
                    enabledTabs: config.enabledTabs
				}
			};
		} );
} );
