(function () {
    'use strict';

    function StoriesCtrl($scope, $filter, $modal, growl, Stories) {
        $scope.current.isLoaded = false;
        $scope.storiesLoaded = false;

        $scope.$watch('current.assignment', function (assignment, oldVal) {
            if (typeof assignment !== 'undefined') {
                $scope.current.isLoaded = true;
                //load stories
                $scope.searchStories();

            }
        }, true);

        function scrollToTop() {
            window.setTimeout(function () {
                window.parent.scrollTo(0, 0);
            }, 10);
        }

        $scope.searchStories = function () {
            $scope.storiesLoaded = false;
            var params = {
                ministry_id: $scope.current.assignment.ministry_id,
                per_page: 5
            };

            Stories.searchStories(params)
                .success(function (response) {
                    $scope.storiesLoaded = true;
                    $scope.visibleStories = response.stories;

                })
                .error(function (e) {
                    $scope.storiesLoaded = true;
                    growl.error('Unable load stories');
                });
        };

        $scope.newStoryDialog = function () {

            $modal.open({
                templateUrl: 'partials/stories/new-story-dialog.html',
                size: 'lg',
                controller: function ($scope, $modalInstance) {
                    $scope.story = {};
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.saveStory = function (story) {
                        Stories.createStory(story)
                            .success(function () {
                                growl.success('Saved successfully')
                            })
                            .error(function () {
                                growl.error('Failed to save story');
                            });
                        $modalInstance.dismiss();

                    }

                }
            });
            scrollToTop();

        };

        $scope.viewStory = function (story) {
            $modal.open({
                templateUrl: 'partials/stories/view-story-dialog.html',
                size: 'lg',
                controller: function ($scope, $modalInstance) {
                    $scope.story = angular.copy(story);
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };

                }
            });
            scrollToTop();
        };

        $scope.editStory = function (story) {
            $modal.open({
                templateUrl: 'partials/stories/edit-story-dialog.html',
                size: 'lg',
                controller: function ($scope, $modalInstance) {
                    //passing a copy of story to view
                    $scope.story = angular.copy(story);
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.updateStory = function (story) {
                        Stories.updateStory(story)
                            .success(function (response) {
                                growl.success('Story was updated');
                            })
                            .error(function (e) {
                                growl.error('Unable to update story');
                            });
                        $modalInstance.dismiss();
                    }

                }
            });
            scrollToTop();
        }


    }

    angular.module('gma.controllers.stories').controller('StoriesCtrl', StoriesCtrl);
}());