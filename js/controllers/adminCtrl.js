(function ( $ ) {

	//Find existing Module instance named 'gcmApp'
	var app = angular.module( "gcmApp" );

	var admin_controller = function ( $scope, assignment_service ) {

		$scope.roles = [
			{value: "leader", text: 'Leader'},
			{value: "inherited_leader", text: "Leader (inherited)"},
			{value: "member", text: 'Member'},
			{value: "blocked", text: 'Blocked'},
			{value: "", text: 'Self Assigned'}
		];
		$scope.onSaveAssignment = function ( response ) {
			console.log( 'saved' );

		};
		$scope.saveRole = function ( s ) {
			console.log( 'saving role' );
			assignment_service.saveAssignment( $scope.user.session_ticket, s.assignment_id, s.team_role ).then( $scope.onSaveAssignment, $scope.onError );
			$scope.newMember = {};
		};

		$scope.addTeamMember = function () {
			$scope.newMember.ministry_id = $scope.assignment.ministry_id;
			assignment_service.addTeamMember( $scope.user.session_ticket, $scope.newMember ).then( $scope.onAddTeamMember, $scope.onError );

			console.log( 'adding_team_member' );

		};

	};

	app.controller( "adminController", ["$scope", "assignment_service", admin_controller] );

})( jQuery );
