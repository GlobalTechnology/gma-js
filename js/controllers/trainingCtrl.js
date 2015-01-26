(function ($) {

    //Find existing Module instance named 'gcmApp'
    var app = angular.module("gcmApp");

    var training_controller = function ($scope, training_service) {
        $scope.newTraining = {};
        $scope.deleteTraining = {};
       
        $scope.deleteTrainingCompletion = {};
     
     
        $scope.onAddTraining = function (response) {
            response.current_stage = getHighest(response.gcm_training_completions) + 1;
            response.editMode = false;
            $scope.assignment.trainings.push(response);
            $scope.newTraining = {};
  
        };
        $scope.onDeleteTraining = function () {
            $scope.assignment.trainings.splice($scope.assignment.trainings.indexOf($scope.deleteTraining), 1);
            $scope.deleteTraining = {};
        };
        $scope.onDeleteTrainingCompletion = function () {
            angular.forEach($scope.assignment.trainings, function (training) {
                if (training.id == $scope.deleteTrainingCompletion.training_id) {
                    training.gcm_training_completions.splice(training.gcm_training_completions.indexOf($scope.deleteTrainingCompletion), 1);
                    training.current_stage = $scope.deleteTrainingCompletion.phase;
                    console.log(training.current_stage);
                }
            });
            
            $scope.deleteTraining = {};
            $scope.deleteTrainingCompletion = {};
        };

        $scope.$watch('assignment.ministry_id', function (a) {
            $scope.reloadTraining();

        });
        $scope.$watch('assignment.mcc', function () {
            $scope.reloadTraining();
        });
        

        $scope.getTrainingTotal = function (t) {
            var rtn = 0;
            if($scope.assignment){
            angular.forEach($scope.assignment.trainings, function (training) {
                if(training.type==t){
                    rtn+=getHighestCount(training.gcm_training_completions);
                }
            });
        }
            return rtn;
        };

       

        $scope.saveTraining = function (data) {
            training_service.updateTraining($scope.user.session_ticket, data).then($scope.onSaveTraining, $scope.onError);
        };
       
      
        $scope.addTraining = function () {
            angular.extend($scope.newTraining, { ministry_id: $scope.assignment.ministry_id, mcc: $scope.assignment.mcc });
            training_service.addTraining($scope.user.session_ticket, $scope.newTraining).then($scope.onAddTraining, $scope.onError);
            
        };
        $scope.removeTraining = function () {
          
            training_service.deleteTraining($scope.user.session_ticket, $scope.deleteTraining).then($scope.onDeleteTraining, $scope.onError);
        };

        $scope.removeTrainingCompletion = function () {
            
            training_service.deleteTrainingCompletion($scope.user.session_ticket, $scope.deleteTrainingCompletion).then($scope.onDeleteTrainingCompletion, $scope.onError);
        };
        // $scope.Math = window.Math;
        //$scope.training_activities = [
        // { Id: '1', name: 'First Training', training_type: "mc2", start_date: "2014-09-02", completion: [{ stage: "1", date: "2014-09-07", number_completed: 9 }, { stage: "2", date: "2014-09-07", number_completed: 8 }, { stage: "3", date: "2014-09-07", number_completed: 7 }] },
        // { Id: '2', name: 'Second Training', training_type: "mc2", start_date: "2014-09-07", completion: [{ stage: "2", date: "2014-09-07", number_completed: 8 }] },
        // { Id: '3', name: 'Third Training', training_type: "mc2", start_date: "2014-09-30", completion: [{ stage: "3", date: "2014-09-07", number_completed: 7 }] }
        //];






    };

    app.controller("trainingController", ["$scope", "training_service", training_controller]);
    
})(jQuery);
