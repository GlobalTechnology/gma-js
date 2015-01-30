define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'training_service', ['$http', function ( $http ) {
		return {
			getTrainings:             function ( session_ticket, ministry_id, mcc, show_all, show_tree ) {
				return $http.get( _api_url + "/training?token=" + session_ticket + "&ministry_id=" + ministry_id + "&show_all=" + show_all + "&show_tree=" + show_tree + "&mcc=" + mcc, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			updateTraining:           function ( session_ticket, training ) {
				return $http.put( _api_url + "/training/" + training.id + "?token=" + session_ticket, training, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			addTraining:              function ( session_ticket, training ) {
				return $http.post( _api_url + "/training?token=" + session_ticket, training, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			deleteTraining:           function ( session_ticket, training ) {
				return $http.delete( _api_url + "/training/" + training.id + "?token=" + session_ticket, {withCredentials: true} )
					.then( function ( response ) {
						return;
					} );
			},
			addTrainingCompletion:    function ( session_ticket, training_completion ) {
				return $http.post( _api_url + "/training_completion?token=" + session_ticket, training_completion, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			updateTrainingCompletion: function ( session_ticket, training_completion ) {
				return $http.put( _api_url + "/training_completion/" + training_completion.id + "?token=" + session_ticket, training_completion, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			deleteTrainingCompletion: function ( session_ticket, training_completion ) {
				return $http.delete( _api_url + "/training_completion/" + training_completion.id + "?token=" + session_ticket, {withCredentials: true} )
					.then( function ( response ) {
						return;
					} );
			}
		}
	}] );
} );
