(function () {
    'use strict';

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
            }
        };

    }

    angular.module('gma.services.stories').factory('Stories', Stories);
})();
