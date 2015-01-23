var app = angular.module("gcmApp", ["ngRoute", "ngGrid", "ui.bootstrap"]);
app.config(function ($routeProvider, $httpProvider) {

    // enable CORS on IE <= 9
    //Default behavior since v1.1.1 (http://bit.ly/1t7Vcci)
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider
       .when("/map", {
           templateUrl: "/gcm_app/partials/map.html",  //relative path to the .html partial
           controller: "mapController" //name of controller variable not the file
       })
       .when("/training", {
           templateUrl: "/gcm_app/partials/training.html",
           controller: "trainingController"
       })
       .when("/measurements", {
           templateUrl: "/gcm_app/partials/measurements.html",
           controller: "measurementsController"
       })
       .when("/admin", {
           templateUrl: "/gcm_app/partials/admin.html",
           controller: "adminController"
       })
         .when("/stories", {
             templateUrl: "/gcm_app/partials/stories.html",
             controller: "storiesController"
         })
         .when("/church", {
             templateUrl: "/gcm_app/partials/church.html",
             controller: "churchController"
         })
       .otherwise({ redirectTo: "/map" });
});
//var _api_url = 'http://localhost:52195/api/measurements';
var _api_url = $('#hf_api_url').val();
console.log(_api_url);