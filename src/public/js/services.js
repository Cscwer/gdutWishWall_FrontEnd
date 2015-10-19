var Host = 'http://gdutgirl.duapp.com'; //定义主机


/************************** 用户服务**********************/
app.factory('UserService', ['$http',
    function($http) {
        return {
            //获取用户信息
            getUserInfo: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getUserInfo?userId=' + data.userId
                });
            },
            //更新用户信息
            updateInfo: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/updateinfo',
                    data: data
                })
            }
        };
    }
]);

/************************** 愿望服务**********************/
app.factory('WishService', ['$http',
    function($http) {
        return {
            getUnpickedWishes: function(page, per_page) {
                return $http({
                    method: 'GET',
                    url: Host + '/getUnpickedWish?page=' + page + '&per_page=' + per_page
                });
            },
            putWish: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/putwish',
                    data: data
                });
            },
            findWish: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getwish?wishId=' + data.wishId
                });
            },
            getWish: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getoneswish?sex=' + data.sex + '&userId=' + data.userId,
                    data: data
                });
            },
            updateWishState: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/updatewishstate',
                    data: data
                });
            },

            updateWish: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/refreshwish',
                    data: data
                });
            },

            deleteWish: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/deletewish',
                    data: data
                });
            },
        };
    }
]);




//男生获取自己领取的愿望
app.factory('GetMaleWishService', ['$http',
    function($http) {
        return {
            getWish: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getmalewish?pickerId=' + data.pickerId
                });
            }
        };
    }
]);

//消息服务
app.factory('MsgService', ['$http',
    function($http) {
        return {
            getMsg: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getmessage?userId=' + data.userId
                });
            },

            readMsg: function(uid) {
                return $http({
                    method: 'GET',
                    url: Host + '/readmessage?userId=' + uid
                });
            },


        };
    }
]);

//聊天服务
app.factory('ContactService', ['$http',
    function($http) {
        return {
            getContact: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/getcontact',
                    data: data
                });
            }
        };
    }
]);

/***************************祝福墙服务**********************/

//获取所有祝福
app.factory('GetAllBless', ['$http',
    function($http) {
        return {
            getBlesses: function(page, per_page) {
                return $http({
                    method: 'GET',
                    url: Host + '/getallbless?page=' + page + '&per_page=' + per_page
                });
            }
        };
    }
]);

//祝福点赞
app.factory('MakePraise', ['$http',
    function($http) {
        return {
            makePraise: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/makepraise',
                    data: data
                });
            }
        };
    }
]);

//发布祝福
app.factory('PutBlessService', ['$http',
    function($http) {
        return {
            putBless: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/putbless',
                    data: data
                });
            }
        };
    }
]);

/***************************微信服务************************/

//根据code获取网页授权access_token及用户资料
app.factory('WeChatService', ['$http',
    function($http) {
        return {

            getWeChatInfo: function(code) {
                return $http({
                    method: 'GET',
                    url: Host + '/getWeChatInfo?code=' + code
                });
            },

            getAccessToken: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getAccessToken?uid=' + data.userId
                });
            },

            getApiTicket: function(token) {
                return $http({
                    method: 'GET',
                    url: Host + '/getApiTicket?token=' + token
                });
            }
        };
    }
]);


/****************定义各种共享的数据******************/
app.factory('WishData', function() {
    return {
        user: '',
        username: '',
        wishType: '',
        wish: ''
    };
});

app.factory('BlessData', function() {
    return {
        user: '',
        username: '',
        bless: ''
    };
});