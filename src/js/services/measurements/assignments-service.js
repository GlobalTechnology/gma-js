(function () {
	'use strict';

	function Assignments( $resource, Settings ) {
		return $resource( Settings.api.measurements( '/assignments/:assignment_id' ), {assignment_id: '@assignment_id'}, {
			getAssignment:  {method: 'GET'},
			getAssignments: {method: 'GET', isArray: true},
			saveAssignment: {method: 'PUT'},
			addTeamMember:  {method: 'POST'}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'Assignments', Assignments );
})();
