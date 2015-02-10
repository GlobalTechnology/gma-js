define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'assignmentService', ['$resource', '$rootScope', function ( $resource, $rootScope ) {
		return $resource( $rootScope.GCM_APP.api_url + '/assignments/:assignment_id', {token: $rootScope.current.sessionToken}, {
			get:           {withCredentials: true},
			query:         {withCredentials: true, isArray: true},
			save:          {withCredentials: true, method: 'PUT'},
			addTeamMember: {withCredentials: true, method: 'POST'}
		} );
	}] );
	gcmApp.factory( 'assignment_service', ['$http', '$resource', function ( $http, $resource ) {
		return {
			getAssignments: function ( session_ticket ) {
				return $http.get( _api_url + "/assignments" + "?token=" + session_ticket, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			getAssignment:  function ( session_ticket, assignmnet_id ) {
				return $http.get( _api_url + "/assignments/" + assignmnet_id + "?token=" + session_ticket, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			saveAssignment: function ( session_ticket, assignmnet_id, role ) {
				return $http.put( _api_url + "/assignments/" + assignmnet_id + "?token=" + session_ticket, {team_role: role}, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			addTeamMember:  function ( session_ticket, newTeamMember ) {
				return $http.post( _api_url + "/assignments" + "?token=" + session_ticket, newTeamMember, {withCredentials: true} )
					.then( function ( response ) {

						return response.data;

					} );
			}
		};
	}] );
} );
