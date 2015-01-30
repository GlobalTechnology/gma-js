define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'measurement_service', ['$http', function ( $http ) {
		return {
			getMeasurements:      function ( session_ticket, ministry_id, period, mcc ) {
				return $http.get( _api_url + "/measurements" + "?token=" + session_ticket + "&ministry_id=" + ministry_id + "&period=" + period + "&mcc=" + mcc, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			getMeasurementDetail: function ( session_ticket, id, ministry_id, period, mcc ) {
				return $http.get( _api_url + "/measurements/measurements/" + id + "?token=" + session_ticket + "&ministry_id=" + ministry_id + "&period=" + period + "&mcc=" + mcc, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			saveMeasurement:      function ( session_ticket, values ) {
				return $http.post( _api_url + "/measurements/?token=" + session_ticket, values, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			}
		};
	}] );
} );
