define( ['gcmApp'], function ( app ) {
	app.factory( 'assignment_service', ['$http', function ( $http ) {
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
