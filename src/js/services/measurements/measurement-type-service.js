(function () {
	'use strict';

	function measurementTypeService( $resource, settings ) {
		return $resource( settings.api.measurements( '/measurement_types/:measurement_type_id' ), {}, {
			getMeasurementType:  {method: 'GET'},
			getMeasurementTypes: {method: 'GET', isArray: true},
			saveMeasurementType: {method: 'PUT'},
			addMeasurementType:  {method: 'POST'}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'measurementTypeService', measurementTypeService );
})();
