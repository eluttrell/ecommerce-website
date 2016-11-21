var app = angular.module('ecommerce', ['ui.router']);

app.factory('$productSearch', factoryFunction($http) {
   var service = {};
   service.nowOnline = function() {
     return $http({
       url: ''
     }
   });
};

// controllers

app.controller('ProductListController', function($scope, $stateParams,$state ) {
  $scope.listProducts =
});

app.config(function($stateProvider, $urlRouterProvider) {
 $stateProvider
   .state({
     name: 'home',
     url: '/',
     templateUrl: 'home.html',
     controller: 'ProductListController'
   });
 $urlRouterProvider.otherwise('/');
});
