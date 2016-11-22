var app = angular.module('ecommerce', ['ui.router', 'ngCookies']);

app.factory('$productSearch', function($http, $cookies, $rootScope) {
    var service = {};

    $rootScope.username = $cookies.getObject("user");
    $rootScope.token = $cookies.getObject("token");

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

    service.customerLoginCall = function(data) {
        var url = 'http://localhost:5000/api/user/login';
        return $http({
            method: 'POST',
            url: url,
            data: data
        }).success(function(loggedIn) {
          $cookies.putObject('user', loggedIn.username);
          $rootScope.username = loggedIn.username
          $cookies.putObject('token', loggedIn.token);
        })
    }

    return service;
});

// controllers

app.controller('ProductListController', function($scope, $productSearch, $stateParams, $state) {

    $productSearch.productListCall().success(function(products) {
        $scope.products = products;
    })
})

app.controller('DetailsPageController', function($scope, $productSearch, $stateParams, $state) {
    $productSearch.productDetailCall($stateParams.query).success(function(details) {
        $scope.packageDetails = details;
    })

})

app.controller('SignupController', function($scope, $productSearch, $stateParams, $state, $cookies, $rootScope) {
    $scope.signupSubmit = function() {
        // add first letter uppercase function
        var data = {
            username: $scope.username,
            email: $scope.email,
            first_name: $scope.first_name,
            last_name: $scope.last_name,
            password: $scope.password
        };
        var loginData = {
            username: $scope.username,
            password: $scope.password
        };
        if ($scope.password !== $scope.password_confirm) {
            $scope.unmatchedPW = true;
        } else {
            $productSearch.signupPageCall(data).success(function(signedUp) {
                $scope.success = signedUp;
                $productSearch.customerLoginCall(loginData).success(function(loggedIn) {
                    $scope.success = loggedIn;
                    $state.go('home');
                })
            })
        }
    }


})

app.controller('LoginController', function($scope, $productSearch, $stateParams, $state, $cookies, $rootScope) {
    $scope.loginSubmit = function() {
        var loginData = {
            username: $scope.username,
            password: $scope.password
        };
        $productSearch.customerLoginCall(loginData).error(function() {
            $scope.failed = true;
        })
        $productSearch.customerLoginCall(loginData).success(function(loggedIn) {
            $scope.success = loggedIn;
            $state.go('home')
        })
    }
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
            name: 'details_page',
            url: '/product/{query}',
            templateUrl: 'details_page.html',
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
            controller: 'LoginController'
        })
    $urlRouterProvider.otherwise('/');
})
