(function () {
	'use strict';

	function SettingsService() {
		var config = {},
			tabs = [];

		this.setConfig = function ( c ) {
			config = c;
		};

		var versionUrl = function ( path ) {
			return path.indexOf( '?' ) === -1
				? path + '?ver=' + config.version
				: path + '&ver=' + config.version;
		};

		var appUrl = function ( path, version ) {
			version = typeof version === 'undefined' ? true : version;
			var url = apiUrl( config.appUrl, path );
			if ( version ) {
				return versionUrl( url );
			}
			return url;
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

		this.routes = function () {
			angular.forEach( config.tabs, function ( tab ) {
				switch ( tab ) {
					case 'map':
						this.push( {
							name:          'Map',
							path:          '/map',
							templateUrl:   'partials/map/map.html',
							controller:    'MapCtrl',
							requiredRoles: ['admin','inherited_admin','self_assigned', 'member', 'inherited_leader', 'leader']
						} );
						break;
					case 'measurements':
						this.push( {
							name:          'Measurements',
							path:          '/measurements',
							templateUrl:   'partials/measurements/measurements.html',
							controller:    'MeasurementsCtrl',
							requiredRoles: ['admin','inherited_admin','self_assigned', 'member', 'inherited_leader', 'leader']
						} );
						break;
					case 'reports':
						this.push( {
							name:          'Reports',
							path:          '/reports',
							templateUrl:   'partials/reports/reports.html',
							controller:    'ReportsCtrl',
							requiredRoles: ['admin','inherited_admin','inherited_leader', 'leader']
						} );
						break;
					case 'admin':
						this.push( {
							name:          'Admin',
							path:          '/admin',
							templateUrl:   'partials/admin/admin.html',
							controller:    'AdminCtrl',
							requiredRoles: ['admin','inherited_admin','leader', 'inherited_leader']
						} );
						break;
                    case 'news':
                        this.push( {
                            name:          'News',
                            path:          '/news',
                            templateUrl:   'partials/stories/stories.html',
                            controller:    'StoriesCtrl',
                            requiredRoles: ['admin','inherited_admin','inherited_leader', 'leader']
                        } );
                        break;
				}
			}, tabs );
			return tabs;
		};

		this.$get = function () {
			return {
				appUrl:          appUrl,
				versionUrl:      versionUrl,
				version:         config.version,
				ticket:          config.ticket,
				appEnvironment:  config.environment,
				api:             {
					measurements: measurementsApi,
					refresh:      config.api.refresh,
					logout:       config.api.logout,
					login:        config.api.login
				},
				mobileApps:      ( typeof config.mobileapps !== 'undefined' && config.mobileapps.length > 0  ) ? config.mobileapps : false,
				gmaNamespace:    config.namespace,
				tabs:            tabs,
				googleAnalytics: config.googleanalytics,
				default_measurement_states: config.default_measurement_states || {}
			}
		};
	}

	angular.module( 'gma.services.settings' ).provider( 'Settings', SettingsService );
})();
