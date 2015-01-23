var app = angular.module("gcmApp", ["ngRoute", "ngGrid", "ui.bootstrap"]);
app.run(function($rootScope) {
    // Attach global constants to root scope
    $rootScope.GCM_APP = window.GCM_APP;
});
app.config(function ($routeProvider, $httpProvider) {

    // enable CORS on IE <= 9
    //Default behavior since v1.1.1 (http://bit.ly/1t7Vcci)
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider
       .when("/map", {
           templateUrl: GCM_APP.app_url + "/template/map.html",  //relative path to the .html partial
           controller: "mapController" //name of controller variable not the file
       })
       .when("/training", {
           templateUrl: GCM_APP.app_url + "/template/training.html",
           controller: "trainingController"
       })
       .when("/measurements", {
           templateUrl: GCM_APP.app_url + "/template/measurements.html",
           controller: "measurementsController"
       })
       .when("/admin", {
           templateUrl: GCM_APP.app_url + "/template/admin.html",
           controller: "adminController"
       })
         .when("/stories", {
             templateUrl: GCM_APP.app_url + "/template/stories.html",
             controller: "storiesController"
         })
         .when("/church", {
             templateUrl: GCM_APP.app_url + "/template/church.html",
             controller: "churchController"
         })
       .otherwise({ redirectTo: "/map" });
});
//var _api_url = 'http://localhost:52195/api/measurements';
//var _api_url = jQuery('#hf_api_url').val();
var _api_url = GCM_APP.api_url;
console.log(_api_url);
