(function () {
	'use strict';

	function MeasurementTypes( $resource, Settings ) {
		return $resource( Settings.api.measurements( '/measurement_types/:measurement_type_id' ), {}, {
			getMeasurementType:  {method: 'GET'},
			getMeasurementTypes: {method: 'GET', isArray: true},
			saveMeasurementType: {method: 'PUT'},
			addMeasurementType:  {method: 'POST'}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'MeasurementTypes', MeasurementTypes );
})();
