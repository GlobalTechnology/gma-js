define( ['gcmApp', 'assignmentService', 'ministry_service'], function ( gcmApp ) {
	gcmApp.controller( 'adminController', [
		'$scope', 'assignmentService', 'ministry_service',
		function ( $scope, assignmentService, ministry_service ) {
			$scope.current.isLoaded = false;

			$scope.$watch( 'current.assignment', function ( assignment ) {
				if ( typeof assignment === 'undefined' ) return;
				ministry_service.getMinistry( $scope.current.sessionToken, assignment.ministry_id ).then( function ( data ) {
					$scope.ministry = data;
					$scope.current.isLoaded = true;
				} );
			} );

			$scope.roles = [
				{value: "leader", text: 'Leader'},
				{value: "inherited_leader", text: "Leader (inherited)"},
				{value: "member", text: 'Member'},
				{value: "blocked", text: 'Blocked'},
				{value: "self_assigned", text: 'Self Assigned'}
			];

			$scope.onSaveAssignment = function ( response ) {
				console.log( 'saved' );
			};

			$scope.saveRole = function ( s ) {
				console.log( 'saving role' );
				assignmentService.save( {
					token: $scope.current.sessionToken,
					assignment_id: s.assignment_id
				}, {team_role: s.team_role} );
				$scope.newMember = {};
			};

			$scope.addTeamMember = function () {
				$scope.newMember.ministry_id = $scope.current.assignment.ministry_id;
				assignmentService.addTeamMember( {token: $scope.current.sessionToken}, $scope.newMember, function() {
					console.log( 'adding_team_member' );
				} );
			};
		}] );
} );
