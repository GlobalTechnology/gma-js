(function () {
    'use strict';

    function StoriesCtrl($scope, $modal, growl, Stories, Settings, $filter) {
        $scope.current.isLoaded = false;
        $scope.storiesLoaded = false;
        $scope.feedsLoaded = false;
        //get configs from settings
        $scope.versionUrl = Settings.versionUrl;
        $scope.storiesConfig = angular.copy(Settings.stories);
        //init story pagination
        $scope.storiesNav = {
            currentPage: 1,
            perPage: $scope.storiesConfig.stories_per_page || 5
        };
        //lets keep some story search params in scope,  we may add some more in future
        $scope.storiesParams = {
            self_only: false
        };


        $scope.$watch('current.assignment', function (assignment, oldVal) {
            if (typeof assignment !== 'undefined') {
                $scope.current.isLoaded = true;
                //load data from server
                $scope.searchStories(1, $scope.storiesParams); //load first page
                $scope.loadNewsFeeds();

            }
        }, true);

        function scrollToTop() {
            window.setTimeout(function () {
                window.parent.scrollTo(0, 0);
            }, 10);
        }

        $scope.searchStories = function (page, storiesParams) {
            $scope.storiesLoaded = false;
            var params = {
                ministry_id: $scope.current.assignment.ministry_id,
                per_page: $scope.storiesConfig.stories_per_page || 5,
                page: page || 1,
                self_only: false
            };
            //fail safe
            if (typeof storiesParams !== 'undefined') {
                params.self_only = storiesParams.self_only
            }

            Stories.searchStories(params)
                .success(function (response) {
                    $scope.storiesLoaded = true;
                    $scope.visibleStories = response.stories;
                    //update pagination nav
                    $scope.storiesNav.totalItems = response.meta.total;
                    $scope.storiesNav.currentPage = response.meta.page;

                })
                .error(function (e) {
                    $scope.storiesLoaded = true;
                    growl.error('Unable to load stories');
                });
        };

        $scope.newStory = function () {

            $modal.open({
                templateUrl: 'partials/stories/new-story-dialog.html',
                size: 'lg',
                controller: function ($scope, $modalInstance, modalData) {
                    $scope.story = {};
                    $scope.imageFile = {};
                    $scope.storiesConfig = modalData.storiesConfig;

                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.removeImage = function () {
                        angular.element("#image-file").val('');
                        $scope.imageFile = {};
                    };
                    $scope.saveStory = function (story) {
                        $modalInstance.close({
                            story : story,
                            imageFile : $scope.imageFile
                        });
                    }

                },
                resolve: {
                    modalData: function () {
                        return {
                            storiesConfig: angular.copy($scope.storiesConfig)
                        }
                    }
                }
            }).result.then(function (data) {
                    var originalParams = angular.copy($scope.storiesParams);
                    Stories.createStory(data.story)
                        .success(function (response) {
                            response.created_at = $filter('date')(new Date(),'yyyy-MM-dd');
                            growl.success('Story saved successfully');
                            if (typeof data.imageFile.resized !== 'undefined') {
                                //Start uploading image file
                                uploadStoryImage(response.story_id, data.imageFile)
                                    .success(function (img) {
                                        growl.success('Image file was uploaded');
                                        //find new story in list and update image url
                                        var found_story = _.findWhere($scope.visibleStories,{story_id:img.story_id});
                                        if(found_story!==undefined){
                                            found_story.image_url= img.image_url;
                                        }
                                    })
                                    .error(function (e) {
                                        showUploadError(e)
                                    });

                            }
                            //if user is on first page, and params are same as before
                            if ($scope.storiesNav.currentPage === 1 && angular.equals(originalParams,$scope.storiesParams)) {
                                if ($scope.visibleStories.length === 0) {
                                    $scope.visibleStories = response
                                } else {
                                    $scope.visibleStories.push(response);
                                }
                            }
                        })
                        .error(function () {
                            growl.error('Failed to save story');
                        });
                });
            scrollToTop();

        };

        $scope.viewStory = function (story) {
            $modal.open({
                templateUrl: 'partials/stories/view-story-dialog.html',
                size: 'lg',
                controller: function ($scope, $modalInstance, modalData) {
                    $scope.story = modalData.story;
                    $scope.versionUrl = modalData.versionUrl;
                    $scope.isSelfOnlyEnabled = modalData.self_only;

                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    modalData: function () {
                        return {
                            story: angular.copy(story),
                            versionUrl : $scope.versionUrl,
                            self_only : angular.copy($scope.storiesParams.self_only)
                        }
                    }
                }
            });
            scrollToTop();
        };

        $scope.editStory = function (story) {
            var originalStory = story;
            $modal.open({
                templateUrl: 'partials/stories/edit-story-dialog.html',
                size: 'lg',
                controller: function ($scope, $modalInstance, modalData) {

                    $scope.story = modalData.story;
                    $scope.storiesConfig = modalData.storiesConfig;
                    $scope.versionUrl = modalData.versionUrl;

                    $scope.imageFile = {};
                    if (typeof $scope.story.image_url !== 'undefined' && $scope.story.image_url !== '') {
                        $scope.imageFile.url = $scope.versionUrl($scope.story.image_url + '?v=' + $scope.story.updated_at);
                    }

                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.updateStory = function (editStory) {
                        $modalInstance.close({
                            editStory : editStory,
                            imageFile : $scope.imageFile
                        });
                    };
                },
                resolve: {
                    modalData: function () {
                        return {
                            storiesConfig: angular.copy($scope.storiesConfig),
                            story: angular.copy(story),
                            versionUrl : $scope.versionUrl
                        }
                    }
                }
            }).result.then(function(data){
                    //fixed a bug , that was causing a 500
                    delete data.editStory.church_id;
                    delete data.editStory.training_id;

                    Stories.updateStory(data.editStory)
                        .success(function (response) {
                            growl.success('Story was updated');
                            //update current story list with new contents
                            angular.extend(originalStory,response);
                            if (typeof data.imageFile.resized !== 'undefined') {
                                //Start uploading image file
                                uploadStoryImage(response.story_id, data.imageFile)
                                .success(function (img) {
                                    angular.extend(originalStory,img);
                                    growl.success('Image file was uploaded');
                                })
                                .error(function(e){showUploadError(e)});

                            }
                        })
                        .error(function (e) {
                            growl.error('Unable to update story');
                        });
                });
            scrollToTop();
        };

        function uploadStoryImage(story_id, imageFile) {
            var form_data = new FormData();
            form_data.append('image-file', imageFile.resized.blob, imageFile.file.name);

            return Stories.uploadStoryImage(story_id, form_data);

        }
        function showUploadError(e){
            if (e.status === 400) {
                growl.error('Upload failed: Invalid file input');
            } else {
                growl.error('Unable to upload image file');
            }
        }

        $scope.loadNewsFeeds = function () {
            $scope.feedsLoaded = false;
            var params = {
                ministry_id: $scope.current.assignment.ministry_id,
                number_of_entries: $scope.storiesConfig.feeds_count || 10
            };
            Stories.getNewsFeeds(params).
                success(function (response) {
                    $scope.feedsLoaded = true;
                    $scope.recentNewsFeeds = response;
                })
                .error(function (e) {
                    $scope.feedsLoaded = true;
                    growl.error('Error loading news feeds');
                });

        };

        $scope.isStoryEditable = function (story) {

            if (story.ministry_id === $scope.current.assignment.ministry_id) {
                //admin and leaders can edit any story but within his ministry
                if ($scope.current.hasRole(['admin', 'inherited_admin', 'leader', 'inherited_leader'])) {
                    return true;
                }
            }

            //you can always edit your own story
            return ($scope.current.user.person_id === story.created_by);
        };


    }

    angular.module('gma.controllers.stories').controller('StoriesCtrl', StoriesCtrl);
}());