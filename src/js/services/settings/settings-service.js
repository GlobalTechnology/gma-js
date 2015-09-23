(function () {
	'use strict';

	function SettingsService( gettext ) {
		var config = {},
			tabs   = [];

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
							/// Main Navigation Tabs - Map
							name:          gettext( 'Map' ),
							path:          '/map',
							icon:          'glyphicon-map-marker',
							templateUrl:   'partials/map/map.html',
							controller:    'MapCtrl',
							requiredRoles: ['admin', 'inherited_admin', 'self_assigned', 'member', 'inherited_leader', 'leader']
						} );
						break;
					case 'measurements':
						this.push( {
							/// Main Navigation Tabs - Measurements
							name:          gettext( 'Measurements' ),
							path:          '/measurements',
							icon:          'glyphicon-stats',
							templateUrl:   'partials/measurements/measurements.html',
							controller:    'MeasurementsCtrl',
							requiredRoles: ['admin', 'inherited_admin', 'self_assigned', 'member', 'inherited_leader', 'leader']
						} );
						break;
					case 'reports':
						this.push( {
							/// Main Navigation Tabs - Reports
							name:          gettext( 'Reports' ),
							path:          '/reports',
							icon:          'glyphicon-list-alt',
							templateUrl:   'partials/reports/reports.html',
							controller:    'ReportsCtrl',
							requiredRoles: ['admin', 'inherited_admin', 'inherited_leader', 'leader']
						} );
						break;
					case 'admin':
						this.push( {
							/// Main Navigation Tabs - Administrate
							name:          gettext( 'Admin' ),
							path:          '/admin',
							icon:          'glyphicon-cog',
							templateUrl:   'partials/admin/admin.html',
							controller:    'AdminCtrl',
							requiredRoles: ['admin', 'inherited_admin', 'leader', 'inherited_leader']
						} );
						break;
					case 'news':
						this.push( {
							/// Main Navigation Tabs - Home (News/Stories)
							name:          gettext( 'Home' ),
							path:          '/news',
							icon:          'glyphicon-home',
							templateUrl:   'partials/stories/stories.html',
							controller:    'StoriesCtrl',
							requiredRoles: ['admin', 'inherited_admin', 'inherited_leader', 'leader', 'member']
						} );
						break;
				}
			}, tabs );
			return tabs;
		};

		this.$get = function () {
			return {
				appUrl:                     appUrl,
				versionUrl:                 versionUrl,
				version:                    config.version,
				name:                       config.name,
				ticket:                     config.ticket,
				appEnvironment:             config.environment,
				api:                        {
					measurements: measurementsApi,
					refresh:      config.api.refresh,
					logout:       config.api.logout,
					login:        config.api.login
				},
				mobileApps:                 ( typeof config.mobileapps === 'object' && Object.keys( config.mobileapps ).length > 0  ) ? config.mobileapps : false,
				gmaNamespace:               config.namespace,
				tabs:                       tabs,
				googleAnalytics:            config.googleanalytics,
				default_measurement_states: config.default_measurement_states || {},
				stories:                    config.stories,
				area_codes:                 config.area_codes,
				static_locales:             config.static_locales
			}
		};
	}

	angular.module( 'gma.services.settings' ).provider( 'Settings', SettingsService );
})();
