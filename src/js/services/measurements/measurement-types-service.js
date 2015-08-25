(function () {
    'use strict';

    function MeasurementTypes($resource, Settings) {
        return $resource(Settings.api.measurements('/measurement_types/:measurement_type_id'), {}, {
            getMeasurementType: {
                method: 'GET',
                params: {measurement_type_id: '@measurement_type_id', ministry_id: '@ministry_id', locale: '@locale'}
            },
            getMeasurementTypes: {
                method: 'GET',
                isArray: true,
                params: {ministry_id: '@ministry_id', locale: '@locale'}
            },
            updateMeasurementType: {
                method: 'PUT',
                params: {measurement_type_id: '@measurement_type_id', ministry_id: '@ministry_id', locale: '@locale'}
            },
            addMeasurementType: {
                method: 'POST',
                params: {ministry_id: '@ministry_id', locale: '@locale'}
            }
        });
    }

    angular.module('gma.services.measurements').factory('MeasurementTypes', MeasurementTypes);
})();
