define( ['app'], function ( app ) {
	app.factory( 'measurementTypeService', [
		'$resource', 'settings',
		function ( $resource, settings ) {
			return $resource( settings.api.measurements( '/measurement_types/:measurement_type_id' ), {}, {
				getMeasurementType:  {method: 'GET'},
				getMeasurementTypes: {method: 'GET', isArray: true},
				saveMeasurementType: {method: 'POST'},
				addMeasurementType: {method: 'PUT'}
			} );
		}] );
} );
