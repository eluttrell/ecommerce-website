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

    service.signupPageCall = function(data) {
      var url = 'http://localhost:5000/api/user/signup';
      return $http({
        method: 'POST',
        url: url,
        data: data
      })
    }

    // service.customerLoginCall = function(data) {
    //   var url = 'http://localhost:5000/api/user/login';
    //   return $http({
    //     method: 'POST',
    //     url: url,
    //     data: data
    //   })
    // }

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

app.controller('SignupController', function($scope, $productSearch, $stateParams, $state) {

    $scope.signupSubmit = function() {
      var stuff = {username: $scope.username, email: $scope.email, first_name: $scope.first_name, last_name: $scope.last_name, password: $scope.password};
      console.log(stuff);
      $productSearch.signupPageCall(stuff).success(function(signedUp) {
        $scope.success = signedUp;
        console.log(signedUp);
      })
    }


})

app.controller('LoginController', function($scope, $productSearch, $stateParams, $state) {
    // get the info

    // $productSearch.customerLoginCall()
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
            url: '/product/{query}',
            templateUrl: 'deatails_page.html',
            controller: 'DetailsPageController'
        })
        .state({
            name: 'signupPage',
            url: '/signupPage',
            templateUrl: 'signup_page.html',
            controller: 'SignupController'
        })
        .state({
            name: 'loginPage',
            url: '/login',
            templateUrl: 'login.html',
            contorller: 'LoginController'
        })
    $urlRouterProvider.otherwise('/');
})
