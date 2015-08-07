(function () {
    'use strict';
    /*
     * Contains services for 'stories' and 'images'
     */
    function Stories($http, Settings) {

        return {
            getStories: function (story_id) {
                return $http.get(Settings.api.measurements('/stories') + '/' + story_id)
            },
            searchStories: function (params) {
                return $http.get(Settings.api.measurements('/stories'), {params: params})
            },
            createStory: function (story) {
                return $http.post(Settings.api.measurements('/stories'), story)
            },
            updateStory: function (story) {
                return $http.put(Settings.api.measurements('/stories') + '/' + story.story_id, story)
            },
            /*
            * @source http://stackoverflow.com/questions/13963022/angularjs-how-to-implement-a-simple-file-upload-with-multipart-form
            */
            uploadStoryImage: function (story_id,formData) {
                return $http.post(Settings.api.measurements('/images'+'?story_id='+story_id),
                    formData,
                    {
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                    }
                )
            }
        };

    }

    angular.module('gma.services.stories').factory('Stories', Stories);
})();
