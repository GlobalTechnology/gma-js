define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'assignmentService', ['$resource', '$rootScope', function ( $resource, $rootScope ) {
		return $resource( $rootScope.GCM_APP.api_url + '/assignments/:assignment_id', {assignment_id: '@assignment_id'}, {
			getAssignment:  {method: 'GET'},
			getAssignments: {method: 'GET', isArray: true},
			saveAssignment: {method: 'PUT'},
			addTeamMember:  {method: 'POST'}
		} );
	}] );
} );
