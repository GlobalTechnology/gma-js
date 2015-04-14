(function () {
	'use strict';

	function Trainings( $http, Settings ) {
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
				return $http
					.get( Settings.api.measurements( '/training' ), {
						params: {
							ministry_id: ministry_id,
							show_all:    show_all,
							show_tree:   show_tree,
							mcc:         mcc
						}
					} )
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
				return $http.put( Settings.api.measurements( '/training/' + training.id ), training )
					.then( function ( response ) {
						return response.data;
					} );
			},
			addTraining:              function ( session_ticket, training ) {
				return $http.post( Settings.api.measurements( '/training' ), training )
					.then( function ( response ) {
						return response.data;
					} );
			},
			deleteTraining:           function ( session_ticket, training ) {
				return $http.delete( Settings.api.measurements( '/training/' + training.id ) )
					.then( function ( response ) {
						return;
					} );
			},
			addTrainingCompletion:    function ( session_ticket, training_completion ) {
				return $http.post( Settings.api.measurements( '/training_completion' ), training_completion )
					.then( function ( response ) {
						return response.data;
					} );
			},
			updateTrainingCompletion: function ( session_ticket, training_completion ) {
				return $http.put( Settings.api.measurements( '/training_completion/' + training_completion.id ), training_completion )
					.then( function ( response ) {
						return response.data;
					} );
			},
			deleteTrainingCompletion: function ( session_ticket, training_completion ) {
				return $http.delete( Settings.api.measurements( '/training_completion/' + training_completion.id ) )
					.then( function ( response ) {
						return;
					} );
			}
		}
	}

	angular.module( 'gma.services.measurements' ).factory( 'Trainings', Trainings );
})();
