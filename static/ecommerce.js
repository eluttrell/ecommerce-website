var app = angular.module('ecommerce', ['ui.router']);

app.factory('$productSearch', function($http) {
    var service = {};

    service.productListCall = function() {
        var url = 'http://localhost:5000/api/products';
        return $http({
            method: 'GET',
            url: url
        });
    }

    service.productDetailCall = function(query) {
        var url = 'http://localhost:5000/api/products/' + query;
        return $http({
          method: 'GET',
          url: url
        })
    }

    return service;
});

// controllers

app.controller('ProductListController', function($scope, $productSearch, $stateParams, $state) {

    $productSearch.productListCall().success(function(products) {
      $scope.products = products;
      console.log(products);
    })

    $scope.showDetails = function() {
      $state.go('detailsPage', {
        query: $stateParams.query
      })
    }
})

app.controller('DetailsPageController', function($scope, $productSearch, $stateParams, $state) {

  $productSearch.productDetailCall($stateParams.query).success(function(details) {
    $scope.packageDetails = details;
    console.log($scope.packageDetails);
  })


})

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state({
            name: 'home',
            url: '/',
            templateUrl: 'home.html',
            controller: 'ProductListController'
        })
        .state({
          name: 'detailsPage',
          url: '/{query}',
          templateUrl: 'detailsPage.html',
          controller: 'DetailsPageController'
        })
        .state({
          name: 'loginPage',
          url: '/login',
          templateUrl: 'login.html',
          contorller: 'LoginController'
        })
    $urlRouterProvider.otherwise('/');
})
