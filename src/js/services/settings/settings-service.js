(function () {
	'use strict';

	function settingsService() {
		var config = {};

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
			var returnTabs = [];
			angular.forEach( config.enabled_tabs, function ( tab ) {
				switch ( tab ) {
					case 'map':
						returnTabs.push( {
							name:          'Church',
							path:          '/map',
							templateUrl:   'partials/map/map.html',
							controller:    'MapCtrl',
							requiredRoles: ['self_assigned', 'member', 'inherited_leader', 'leader']
						} );
						break;
					case 'measurements':
						returnTabs.push( {
							name:          'Measurements',
							path:          '/measurements',
							templateUrl:   'partials/measurements/measurements.html',
							controller:    'MeasurementsCtrl',
							requiredRoles: ['self_assigned', 'member', 'inherited_leader', 'leader']
						} );
						break;
					case 'reports':
						returnTabs.push( {
							name:          'Reports',
							path:          '/reports',
							templateUrl:   'partials/reports/reports.html',
							controller:    'ReportsCtrl',
							requiredRoles: ['inherited_leader', 'leader']
						} );
						break;
					case 'admin':
						returnTabs.push( {
							name:          'Admin',
							path:          '/admin',
							templateUrl:   'partials/admin/admin.html',
							controller:    'AdminCtrl',
							requiredRoles: ['leader', 'inherited_leader']
						} );
						break;
				}
			} );
			config.enabledTabs = returnTabs;
			return returnTabs;
		};

		this.$get = function () {
			return {
				appUrl:       appUrl,
				versionUrl:   versionUrl,
				ticket:       config.ticket,
				api:          {
					measurements: measurementsApi,
					refresh:      config.api.refresh,
					logout:       config.api.logout,
					login:        config.api.login
				},
				mobileApps:   ( typeof config.mobileapps !== 'undefined' && config.mobileapps.length > 0  ) ? config.mobileapps : false,
				gmaNamespace: config.namespace,
				enabledTabs:  config.enabledTabs
			}
		};
	}

	angular.module( 'gma.services.settings' ).provider( 'settings', settingsService );
})();