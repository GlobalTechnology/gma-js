define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'trainingService', ['$http', function ( $http ) {
		function getHighest( array ) {
			var max = 0;
			if ( !array ) return 0;
			for ( var i = 0; i < array.length; i++ ) {
				if ( array[i].phase > (max || 0) ) {
					max = array[i].phase;
				}
			}

			return max;
		}

		function getHighestCount( array ) {
			var max = 0;
			for ( var i = 0; i < array.length; i++ ) {
				if ( array[i].number_completed > (max || 0) ) {
					max = array[i].number_completed;
				}
			}

			return max;
		}

		return {
			getTrainings:             function ( session_ticket, ministry_id, mcc, show_all, show_tree ) {
				return $http.get( _api_url + "/training?token=" + session_ticket + "&ministry_id=" + ministry_id + "&show_all=" + show_all + "&show_tree=" + show_tree + "&mcc=" + mcc, {withCredentials: true} )
					.then( function ( response ) {

						angular.forEach( response.data, function ( training ) {
							training.current_stage = getHighest( training.gcm_training_completions ) + 1;
							training.leaders_trained = getHighestCount( training.gcm_training_completions );
							training.editMode = false;
						} );

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
