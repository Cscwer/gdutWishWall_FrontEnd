var app = angular.module('gdutWishWall', ['ui.router', 'infinite-scroll', 'mobile-angular-ui']);

//配置路由规则
app.config(function($stateProvider, $urlRouterProvider) {
    //默认指向 index
    $urlRouterProvider.otherwise("/index/wishwall");
    //配置状态路由
    $stateProvider
        .state('index', {
            url: '/index',
            templateUrl: "../views/Index/index.html",
            controller: 'IndexCtrl',
            abstract: true
        })
        .state('index.wishwall', {
            url: '/wishwall',
            templateUrl: '../views/Index/wishwall.html'
        })
        .state('index.blesswall', {
            url: '/blesswall',
            templateUrl: '../views/Index/blesswall.html',
            controller: 'BlessIndexCtrl'
        })
        .state('user', {
            url: '/user',
            templateUrl: '../views/User/index.html'
        })
        .state('userinfo', {
            url: '/userinfo/:userId',
            templateUrl: '../views/User/userinfo.html',
            controller: 'UserInfoCtrl'
        })
        .state('wish', {
            abstract: true,
            url: '/wish',
            templateUrl: '../views/Wish/index.html'
        })
        .state('userinfo.wishwall', {
            url: '/wishwall/:sex',
            templateUrl: '../views/User/userinfowishwall.html',
            controller: 'UserInfoWishWallCtrl'
        })
        .state('userinfo.blesswall', {
            url: '/blesswall',
            templateUrl: '../views/User/userinfoblesswall.html',
            controller: 'UserInfoBlessWallCtrl'
        })
        .state('user.writewish', {
            url: '/writewish',
            templateUrl: '../views/User/female/writewish.html',
            controller: 'UserCtrl'
        })
        .state('user.writebless', {
            url: '/writebless',
            templateUrl: '../views/User/writebless.html',
            controller: 'UserCtrl'
        })
        .state('user.writeinfo', {
            url: '/writeinfo/:rewrite',
            templateUrl: '../views/User/female/writeinfo.html',
            controller: 'UserCtrl'
        })
        .state('user.writeblessinfo', {
            url: '/writeblessinfo/:rewrite',
            templateUrl: '../views/User/writeblessinfo.html',
            controller: 'UserCtrl'
        })
        .state('wish.femalewish', {
            url: '/female/mywish',
            templateUrl: '../views/User/female/mywish.html',
            controller: 'FemaleWishCtrl'
        })
        .state('wish.changewish', {
            url: '/female/changewish/:wishId',
            templateUrl: '../views/User/female/changewish.html',
            controller: 'WishCtrl'
        })
        .state('wish.malewish', {
            url: '/male/mywish/:pickerId',
            templateUrl: '../views/User/male/mywish.html',
            controller: 'MaleWishCtrl'
        })
        .state('user.message', {
            url: '/message',
            templateUrl: '../views/User/message.html',
            controller: 'MsgCtrl'
        })
        .state('user.contact', {
            url: '/contact/:userId/:username',
            templateUrl: '../views/User/contact.html',
            controller: 'ContactCtrl'
        })
        .state('wish.detail', {
            url: '/detail/:wishId',
            templateUrl: '../views/Wish/detail.html',
            controller: 'WishCtrl'
        });

});

//配置url参数规则
app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
]);