angular.module( 'app' )
	.factory( 'assignmentService', [
		'$resource', 'settings',
		function ( $resource, settings ) {
			return $resource( settings.api.measurements( '/assignments/:assignment_id' ), {assignment_id: '@assignment_id'}, {
				getAssignment:  {method: 'GET'},
				getAssignments: {method: 'GET', isArray: true},
				saveAssignment: {method: 'PUT'},
				addTeamMember:  {method: 'POST'}
			} );
		}] );
