define( ['gcmApp', 'moment', 'sessionService', 'ministry_service', 'assignmentService', 'church_service', 'training_service'], function ( gcmApp, moment ) {
	gcmApp.controller( 'gcmController', [
		'$scope', '$filter', '$location', '$modal', 'sessionService', 'ministry_service', 'assignment_service', 'church_service', 'training_service', '$log',
		function ( $scope, $filter, $location, $modal, sessionService, ministry_service, assignment_service, church_service, training_service, $log ) {
			// Attach $location provider to scope, this is used to set active tabs
			$scope.$location = $location;

			//---------------------------------------
			// Assignments
			//---------------------------------------

			// Update current assignment when assignments is set - this occurs after a session is established
			$scope.$watch( 'current.assignments', function ( assignments, oldVal ) {
				if ( assignments === oldVal ) return;

				$log.debug( 'Assignments Changed' );

				if ( typeof assignments === 'object' ) {
					$scope.current.assignment = $filter( 'orderBy' )( assignments, 'name' )[0];
				} else {
					delete $scope.current.assignment;
				}
			} );

			// Update assignment and mcc when assignment changes
			$scope.$watch( 'current.assignment', function ( assignment, oldVal ) {
				if ( assignment === oldVal ) return;

				$log.debug( 'Assignment Changed: ' + assignment.name );

				if ( typeof assignment === 'object' ) {

					if ( assignment.mccs.length > 0 ) {
						// Append ALL mcc if assignment has more than 1 mcc
						if ( assignment.mccs.length > 1 && assignment.mccs.indexOf( 'all' ) == -1 ) {
							assignment.mccs.push( 'all' );
						}

						// Set mcc if none is currently set or new assignment does not include current mcc
						if ( typeof $scope.current.mcc === 'undefined' || assignment.mccs.indexOf( $scope.current.mcc ) < 0 ) {
							$scope.current.mcc = $filter( 'orderBy' )( assignment.mccs, $scope.mccSort )[0];
						}
					}
					else {
						// Delete current mcc if assignment has no mccs
						delete $scope.current.mcc;
					}
				}
			} );

			$scope.current.hasRole = function ( role ) {
				return (typeof role === 'string') ? role == $scope.current.assignment.team_role : _.contains( role, $scope.current.assignment.team_role );
			};

			//---------------------------------------
			// Mission Critical Components (MCC)
			//---------------------------------------

			// MCC labels, this should be done in localization in the future.
			$scope.mccLabels = {
				all: 'All',
				ds:  'Digital Strategies',
				gcm: 'Global Church Movements',
				llm: 'Leader Led',
				slm: 'Student Led'
			};

			$scope.mccSort = function ( value ) {
				return $scope.mccLabels[value];
			};

			//---------------------------------------
			// Periods
			//---------------------------------------
			var periods = [], now = moment().date( 1 );
			for ( var i = 0; i < 12; i++ ) {
				periods.push( now.clone() );
				now.subtract( 1, 'M' );
			}
			$scope.periods = periods;
			$scope.current.period = periods[0];

			$scope.prevPeriod = function () {
				var index = $scope.periods.indexOf( $scope.current.period );
				index = ( ( index + 1 ) >= $scope.periods.length ) ? 0 : index + 1;
				$scope.current.period = $scope.periods[index];
			};

			$scope.nextPeriod = function () {
				var index = $scope.periods.indexOf( $scope.current.period );
				index = ( ( index - 1 ) < 0 ) ? $scope.periods.length - 1 : index - 1;
				$scope.current.period = $scope.periods[index];
			};

			//---------------------------------------
			// Session
			//---------------------------------------

			// Establish Session
			sessionService.startSession( $scope.GCM_APP.ticket ).then( function ( data ) {

				//Open Modal if user has no assignment
				if ( typeof data.assignments === 'undefined' ) {
					$scope.joinMinistry( false );
				}

			} );

			$scope.logout = function () {
				$log.debug( 'Logout' );
				window.location = 'https://thekey.me/cas/logout';
			};

			$scope.joinMinistry = function ( allowClose ) {
				allowClose = typeof allowClose !== 'undefined' ? allowClose : true;
				var instance = $modal.open( {
					templateUrl: 'join_ministry.html',
					controller:  'joinMinistryController',
					keyboard:    allowClose,
					backdrop:    allowClose ? true : 'static',
					resolve:     {
						'ministries': function () {
							return ministry_service.getMinistries( $scope.current.sessionToken );
						},
						'allowClose': function () {
							return allowClose;
						}
					}
				} );
				instance.result.then( function ( ministry ) {
					assignment_service.addTeamMember( $scope.current.sessionToken, {
						username:    $scope.current.user.cas_username,
						ministry_id: ministry.ministry_id,
						team_role:   'self_assigned'
					} ).then( function ( assignment ) {
						if ( typeof $scope.current.assignments === 'undefined' ) {
							// If assignments is empty, setting the array will also set the current assignment
							$scope.current.assignments = [assignment];
						}
						else {
							// Add new assignment
							$scope.current.assignments.push( assignment );

							// Set new assignment as current
							$scope.current.assignment = assignment;
						}
					} );
				} );
			};

			$scope.onError = function ( response, code ) {
				if ( code == 401 && response.hasOwnProperty( 'reason' ) ) {
					if ( response.reason == 'SESSION_INVALID' ) {
						window.location = window.location.pathname;
					}
				}
				$scope.error = response.reason;
			};

			$scope.addTrainingStage = function ( training ) {
				var newPhase = {
					phase:            training.current_stage,
					date:             training.insert.date,
					number_completed: training.insert.number_completed,
					training_id:      training.id

				};
				training_service.addTrainingCompletion( $scope.user.session_ticket, newPhase ).then( $scope.onAddTrainingCompletion, $scope.onError );

				training.insert.date = "";
				training.insert.number_completed = 0;

			};

			$scope.onAddTrainingCompletion = function ( response ) {
				response.editMode = false;

				angular.forEach( $scope.assignment.trainings, function ( training ) {
					if ( training.id == response.training_id ) {
						training.gcm_training_completions.push( response );
						training.current_stage = response.phase + 1;
					}
				} );
			};

			$scope.saveTrainingCompletion = function ( data ) {
				training_service.updateTrainingCompletion( $scope.user.session_ticket, data ).then( $scope.onSaveTrainingCompletion, $scope.onError );
			};
		}] );

	gcmApp.controller( 'joinMinistryController', [
		'$scope', '$modalInstance', 'ministries', 'allowClose',
		function ( $scope, $modalInstance, ministries, allowClose ) {
			$scope.ministries = ministries;
			$scope.allowClose = allowClose;

			$scope.join = function () {
				$modalInstance.close( $scope.ministry );
			};

			$scope.cancel = function () {
				$modalInstance.dismiss( 'cancel' );
			};
		}] );
} );

