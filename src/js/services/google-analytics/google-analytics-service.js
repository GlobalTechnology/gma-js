(function () {
	'use strict';

	function GoogleAnalyticsService( $location, Settings ) {
		return {
			DIM: {
				guid:        'dimension1',
				ministry_id: 'dimension2',
				mcc:         'dimension3',
				period:      'dimension4',
				perm_link:   'dimension5',
				church_id:   'dimension6',
				training_id: 'dimension7'
			},
			init:   function () {
				if ( Settings.googleAnalytics === false ) return;

				// Initialize Google Analytics
				ga( 'create', Settings.googleAnalytics, 'auto' );
				ga( 'set', {
					'appName':        'GMA (' + Settings.appEnvironment + ')',
					'appId':          'com.expidev.javascript.' + Settings.appEnvironment,
					'appVersion':     Settings.version,
					'appInstallerId': $location.host()
				} );
			},
			screen: function ( screen, dimensions ) {
				if ( Settings.googleAnalytics === false ) return;

				dimensions = typeof dimensions !== 'undefined' ? dimensions : {};
				dimensions.screenName = screen;
				ga( 'send', 'screenview', dimensions );
			},
			event:  function ( category, action, dimensions ) {
				if ( Settings.googleAnalytics === false ) return;

				dimensions = typeof dimensions !== 'undefined' ? dimensions : {};
				ga( 'send', 'event', category, action, dimensions );
			}
		}
	}

	angular.module( 'gma.services.googleAnalytics' ).factory( 'GoogleAnalytics', GoogleAnalyticsService );
})();
