(function () {
	'use strict';

	function Measurements( $resource, Settings ) {
		return $resource( Settings.api.measurements( '/measurements/:perm_link_stub' ), {}, {
			getMeasurement:  {method: 'GET'},
			getMeasurements: {method: 'GET', isArray: true, params: {source: Settings.gmaNamespace}},
			saveMeasurement: {method: 'POST'}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'Measurements', Measurements );
})();
