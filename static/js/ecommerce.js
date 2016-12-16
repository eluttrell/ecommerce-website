var app = angular.module('ecommerce', ['ui.router', 'ngCookies']);

app.factory('$productSearch', function($http, $cookies, $rootScope, $state) {
    var service = {};

    $rootScope.username = $cookies.getObject("user");
    $rootScope.token = $cookies.getObject("token");
    $rootScope.logout = function() {
        $cookies.remove("user");
        $cookies.remove("token");
        $rootScope.username = null;
    }

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
            $rootScope.username = loggedIn.username;
            $cookies.putObject('token', loggedIn.token);
        })
    }

    service.addToCartCall = function(data) {
        var url = 'http://localhost:5000/api/shopping_cart';
        return $http({
            method: 'POST',
            url: url,
            data: data
        })
    }

    service.viewCartCall = function(data) {
        var url = 'http://localhost:5000/api/shopping_cart';
        return $http({
            method: 'GET',
            url: url,
            params: data
        })
    }

    service.checkoutCall = function(data) {
        var url = 'http://localhost:5000/api/shopping_cart/checkout';
        return $http({
            method: 'POST',
            url: url,
            data: data
        })
    }

    return service;
});

// controllers

app.controller('ProductListController', function($scope, $productSearch, $stateParams, $state, $rootScope) {

    $scope.addToCart = function(id) {
        var data = {
            token: $rootScope.token,
            product_id: id
        };
        $productSearch.addToCartCall(data).success(function(cart) {
            $scope.shoppingCart = cart;
            console.log($scope.shoppingCart);
        })
    }


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
            $state.go('home');
        })
    }
})

app.controller('checkoutController', function($scope, $rootScope, $productSearch) {
    var data = {
        token: $rootScope.token
    };
    $productSearch.viewCartCall(data).success(function(cartContents) {
        $scope.productInfo = cartContents[0];
        $scope.priceInfo = cartContents[1];
        console.log($scope.priceInfo);
        console.log($scope.productInfo);
        console.log(cartContents);
    })
    $scope.checkout = function() {
        var data = {
            token: $rootScope.token,
            shipping_address: [
                $scope.fullname,
                $scope.address1,
                $scope.address2,
                $scope.city,
                $scope.state,
                $scope.zip
            ]
        };
        $productSearch.checkoutCall(data).success(function(checkout) {
            var handler = StripeCheckout.configure({
                key: 'pk_test_sPjB8bsEsSoFSZkrKgq2lz5I',
                locale: 'atuo',
                token: function callback(token) {
                    var stripeToken = token.id;
                }
            })
            var amount = $scope.priceInfo;
            console.log(amount);
            handler.open({
                name: "NOW that's what I call music rentals!",
                description: 'Some music',
                amount: amount * 100
            });
        })
    }
})

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state({
            name: 'home',
            url: '/',
            templateUrl: 'templates/home.html',
            controller: 'ProductListController'
        })
        .state({
            name: 'teaChart',
            url: '/teaChart',
            templateUrl: 'templates/tea-chart.html',
            controller: 'TeaChartController'
        })
        .state({
            name: 'products',
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state({
            name: 'productsDisplay',
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state({
            name: 'login',
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state({
            name: 'signup',
            url: '/signupPage',
            templateUrl: 'templates/signup_page.html',
            controller: 'SignupController'
        })
        .state({
            name: 'checkout',
            url: '/checkout',
            templateUrl: 'templates/checkout.html',
            controller: 'checkoutController'
        })

    $urlRouterProvider.otherwise('/');
})
