(function ( $ ) {

	var measurement_service = function ( $http ) {

		var getMeasurements = function ( session_ticket, ministry_id, period, mcc ) {
			this._apiResourceUrl = _api_url + "/measurements" + "?token=" + session_ticket + "&ministry_id=" + ministry_id + "&period=" + period + "&mcc=" + mcc;
			console.log( this._apiResourceUrl );
			return $http.get( this._apiResourceUrl, {withCredentials: true} )
				.then( function ( response ) {
					return response.data;
				} );
		};

		var getMeasurementDetail = function ( session_ticket, id, ministry_id, period, mcc ) {
			this._apiResourceUrl = _api_url + "/measurements/" + id + "?token=" + session_ticket + "&ministry_id=" + ministry_id + "&period=" + period + "&mcc=" + mcc;
			console.log( this._apiResourceUrl );
			return $http.get( this._apiResourceUrl, {withCredentials: true} )
				.then( function ( response ) {
					return response.data;
				} );
		};

		//var saveMeasurement = function (session_ticket, id, related_entity_id, period, mcc, value) {
		//    this._apiResourceUrl =_api_url + "/measurements/" + id + "?token=" + session_ticket;
		//    var put_data = {period: period, related_entity_id: related_entity_id, period: period, value:value, mcc: mcc};


		//    console.log(this._apiResourceUrl);
		//    return $http.put(this._apiResourceUrl,put_data ,{ withCredentials: true })
		//       .then(function (response) {

		//           return response.data;

		//       });
		//}

		var saveMeasurement = function ( session_ticket, values ) {
			this._apiResourceUrl = _api_url + "/measurements/?token=" + session_ticket;
			// var put_data = { period: period, related_entity_id: related_entity_id, period: period, value: value, mcc: mcc };

			console.log( this._apiResourceUrl );
			return $http.post( this._apiResourceUrl, values, {withCredentials: true} )
				.then( function ( response ) {
					return response.data;
				} );
		};

		return {
			getMeasurements:      getMeasurements,
			getMeasurementDetail: getMeasurementDetail,
			saveMeasurement:      saveMeasurement
		};
	};

	var app = angular.module( "gcmApp" );
	//Of the 20 ways you can register a service you create in Angular, this is by far the easiest
	app.factory( "measurement_service", measurement_service );

})( jQuery );
