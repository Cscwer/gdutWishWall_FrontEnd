//主页控制器

app.controller('IndexCtrl', ['$scope', 'WishService',
    function($scope, WishService) {

        //愿望列表
        $scope.oddwishes = [];
        $scope.evenwishes = [];

        //加载下一页的内容，只有登录的人才能查看
        $scope.page = 1; //当前页数
        $scope.per_page = 15; //每页显示数目
        $scope.isLoading = false;
        $scope.nextpage = function(page, per_page) {
            $scope.isLoading = true;
            WishService.getUnpickedWishes(page, per_page)
                .success(function(data, status) {
                    if (status === 200) {
                        // alert(data.wishes.length);
                        for (var i = 0; i < data.wishes.length; i = i + 2) {
                            $scope.oddwishes.push(data.wishes[i]);
                        }
                        for (var i = 1; i < data.wishes.length; i = i + 2) {
                            $scope.evenwishes.push(data.wishes[i]);
                        }
                        $scope.page++;
                        $scope.isLoading = false;
                    }
                });
        };

        $scope.refreshPage = function(page, per_page) {
            $scope.isLoading = true;
            $scope.wishes = [];
            WishService.getUnpickedWishes(page, per_page)
                .success(function(data, status) {
                    for (var i = 0; i < data.wishes.length; i++) {
                        $scope.wishes.push(data.wishes[i]);
                    }
                    $scope.page = 2;
                    $scope.isLoading = false;
                });
        };

        $scope.nextpage(1, 15);


    }
]);

//祝福墙主页控制器
app.controller('BlessIndexCtrl', ['$scope', '$state', 'BlessService',
    function($scope, $state, BlessService) {
        //祝福列表
        $scope.blesses = [];

        $scope.pageForBless = 1;
        $scope.per_pageForBless = 5;
        $scope.nextpageBless = function(page, per_page) {
            $scope.isLoading = true;
            BlessService.getBlesses(page, per_page)
                .success(function(data, status) {
                    if (status === 200) {
                        for (var i = 0; i < data.blesses.length; i++) {
                            $scope.blesses.push(data.blesses[i]);
                        }
                        $scope.pageForBless++;
                        $scope.isLoading = false;
                    }
                });
        };

        $scope.nextpageBless(1, 5);

        //祝福点赞
        $scope.praiseIt = function(blessId) {
            console.log(blessId);
            console.log(data);
            BlessService.makePraise(data)
                .success(function(data, status) {
                    if (status === 200) {
                        console.log('点赞成功');
                    } else {
                        console.log(data);
                    }
                });
        };
    }
]);
//导航栏控制器
app.controller('LeaderCtrl', ['$scope', '$rootScope', '$state', '$location', '$http', 'MsgService', 'WeChatService',

    function($scope, $rootScope, $state, $location, $http, MsgService, WeChatService) {


        //获取微信用户信息
        WeChatService.getWeChatInfo()
            .success(function(data, status) {
                if (status === 200) {
                    if (!data.errmsg) {
                        $rootScope.user = data.data;
                        sessionStorage.setItem('uid', $rootScope.user._id);
                        sessionStorage.setItem('username', $rootScope.user.nickname);
                    } else {
                        $rootScope.user = null;
                    }
                }
            });

        //登录保护
        // $rootScope.$on('$stateChangeStart', function(event, toState) {

        //     if ($rootScope.user === null) {
        //         event.preventDefault();
        //         $state.go('index');
        //     }

        // });

        //系统消息队列
        // $scope.SystemMsg.push(msg);
        // console.log($scope.SystemMsg);
        // localStorage.WishMsg = JSON.stringify($scope.SystemMsg);

        //基于 socket.io 的消息推送
        $scope.hasNewMsg = false;
        $rootScope.isConnected = false;
        $rootScope.socket = io.connect('http://gdutgirl.duapp.com');
        $rootScope.socket.on('open', function() {
            $rootScope.isConnected = true;
            console.log('连接成功');
        });


        $rootScope.socket.on('WishMsg_res', function(msg) {
            console.log(msg);
            //处理系统消息
            if (msg.receiver === sessionStorage.getItem('uid')) {
                $scope.$apply(function() {
                    $scope.hasNewMsg = true;
                    $scope.SystemMsg.push(msg);
                    localStorage.WishMsg = JSON.stringify($scope.SystemMsg);
                });
            }
        });

        $scope.cancelMsgCount = function() {
            $scope.hasNewMsg = false;
            MsgService.readMsg(sessionStorage.getItem('uid'))
                .success(function(data, status) {
                    if (status === 200) {
                        console.log("清楚消息");
                    }
                });
        };

    }
]);

//搜索页面控制器
app.controller('SearchCtrl', ['$scope',
    function($scope) {
        $scope.searchwhere = '许愿墙';

        $scope.searchSelect = function(num) {
            if (num === 1) {
                $scope.searchwhere = '许愿墙';
            } else {
                $scope.searchwhere = '祝福墙';
            }
        };

        $scope.clearInput = function() {
            $scope.searchinput = '';
        };
    }
]);


//用户信息控制器
app.controller('UserInfoCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'UserService',
    function($scope, $rootScope, $state, $stateParams, UserService) {
        $scope.isSelf = ($stateParams.userId === sessionStorage.getItem('uid'))
        var data = {
            userId: $stateParams.userId
        };
        UserService.getUserInfo(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.user = data.user;
                    $state.go('userinfo.wishwall', {
                        sex: $scope.user.sex
                    });
                }
            });
    }
]);

app.controller('UserInfoWishWallCtrl', ['$scope', '$stateParams', 'WishService',
    function($scope, $stateParams, WishService) {
        $scope.oddwishes = [];
        $scope.evenwishes = [];
        //获取自己的愿望
        var data = {
            sex: $stateParams.sex,
            userId: $stateParams.userId
        };
        WishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    for (var i = 0; i < data.wishes.length; i = i + 2) {

                        $scope.oddwishes.push(data.wishes[i]);
                        $scope.evenwishes.push(data.wishes[i + 1]);
                    }
                }
            });
    }
]);

app.controller('UserInfoBlessWallCtrl', ['$scope',
    function($scope) {}
]);

app.controller('SettingCtrl', ['$scope', '$window',
    function($scope, $window) {
        $scope.goBack = function() {
            $window.history.back();
        };
    }
]);

//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'WishService', 'BlessService', 'WishData', 'BlessData', 'UserService', 'WeChatService', '$sce',
    function($scope, $rootScope, $state, $stateParams, WishService, BlessService, WishData, BlessData, UserService, WeChatService, $sce) {

        $scope.isRewrite = $stateParams.rewrite;

        var data = {
            userId: sessionStorage.getItem('uid')
        };

        UserService.getUserInfo(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.school_area = data.user.school_area;
                    $scope.college_name = data.user.college_name;
                    $scope.real_name = data.user.real_name;
                    $scope.long_tel = data.user.long_tel;
                    $scope.short_tel = data.user.short_tel;
                }
            });



        //获取微信 AccessToken 以及 ApiTicket (女生才需要)

        var ticket_data = {
            location: window.location.href.split('#')[0]
        };
        WeChatService.getSignature(ticket_data)
            .success(function(data, status) {
                if (status === 200) {
                    console.log(data);
                    var signature = data.data;
                    wx.config({
                        debug: true,
                        appId: signature.appId,
                        timestamp: signature.timestamp,
                        nonceStr: signature.nonceStr,
                        signature: signature.signature,
                        jsApiList: ['chooseImage', 'uploadImage']
                    });
                }
            });

        //Wish image
        $scope.chooseImage = function() {
            wx.chooseImage({
                count: 1,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: function(res) {
                    $scope.localIds = res.localIds;
                    wx.uploadImage({
                        localId: res.localIds[0],
                        isShowProgressTips: 1,
                        success: function(res) {
                            alert(res.serverId);
                            WishData.mediaId = res.serverId;
                        }
                    });
                }
            });
        };

        //Bless image
        $scope.chooseBlessImage = function() {
            wx.chooseImage({
                count: 1,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: function(res) {
                    $scope.localIds = res.localIds;
                    wx.uploadImage({
                        localId: res.localIds[0],
                        isShowProgressTips: 1,
                        success: function(res) {
                            alert(res.serverId);
                            BlessData.mediaId = res.serverId;
                        }
                    });
                }
            });
        };




        $scope.setUserInfo = function() {

            //组装愿望数据包
            WishData.user = sessionStorage.getItem('uid');
            WishData.username = sessionStorage.getItem('username');
            WishData.userheadimg = $rootScope.user.headimgurl;
            WishData.wishType = $scope.wish_type;
            WishData.wish = $scope.wish;

            $state.go('user.writeinfo');



        };

        //发布愿望
        $scope.publicWish = function() {

            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };
            WishData.school_area = $scope.school_area;
            //发布愿望
            WishService.putWish(WishData)
                .success(function(data, status) {
                    if (status === 200) {
                        //更新个人信息
                        UserService.updateInfo(InfoData)
                            .success(function(data, status) {
                                if (status === 200) {
                                    alert('许愿成功');
                                    $state.go('index.wishwall');
                                }
                            });
                    }
                });

        };

        //领取愿望动作
        $scope.pickWish = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };

            // if (confirm('确定领取该愿望?')) {
            var data = {
                type: 1,
                wishId: WishData._id,
                wishPicker: sessionStorage.getItem('uid'),
                wishPickerName: sessionStorage.getItem('username')
            };
            WishService.updateWishState(data)
                .success(function(data, status) {
                    if (status === 200) {
                        //更新个人信息
                        UserService.updateInfo(InfoData)
                            .success(function(data, status) {
                                if (status === 200) {
                                    var msg = {
                                        msg_type: 'System',
                                        sender: sessionStorage.getItem('uid'),
                                        sender_name: sessionStorage.getItem('username'),
                                        receiver: WishData.user,
                                        receiver_name: WishData.username,
                                        msg: '领取了你的愿望'
                                    };
                                    $rootScope.socket.emit('WishMsg', msg);
                                    alert('领取成功！');
                                    $state.go('wish.malewish');
                                }
                            });
                    }
                });
            // }
        };

        //修改个人信息
        $scope.rewrite = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };

            //更新个人信息
            UserService.updateInfo(InfoData)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('修改成功');
                        $state.go('userinfo', {
                            userId: InfoData.user
                        });
                    }
                });


        };

        //*************Bless Part***************//

        $scope.setUserBlessInfo = function() {

            //组装祝福数据包
            BlessData.user = sessionStorage.getItem('uid');
            BlessData.username = sessionStorage.getItem('username');
            BlessData.userheadimg = $rootScope.user.headimgurl;
            BlessData.bless = $scope.bless;

            $state.go('user.writeblessinfo');
        };

        //发布祝福
        $scope.publicBless = function() {

            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };
            BlessData.school_area = $scope.school_area;
            //发布愿望
            BlessService.putBless(BlessData)
                .success(function(data, status) {
                    if (status === 200) {
                        //更新个人信息
                        UserService.updateInfo(InfoData)
                            .success(function(data, status) {
                                if (status === 200) {
                                    alert('发布祝福成功');
                                    $state.go('index.blesswall');
                                }
                            });
                    }
                });

        };

        //*************Bless Part***************//



    }
]);

//消息控制器
app.controller('MsgCtrl', ['$scope', '$rootScope', '$state', 'MsgService',
    function($scope, $rootScope, $state, MsgService) {
        $scope.SystemMsg = JSON.parse(localStorage.getItem('WishMsg'));
        $scope.SystemMsgNum = $scope.SystemMsg.length;
        $scope.UserMsg = [];

        // var data = {
        //     userId: $rootScope.user._id
        // };
        // MsgService.getMsg(data)
        //     .success(function(data, status) {
        //         if (status === 200) {
        //             console.log(data.msgs);
        //             for (var i = 0; i < data.msgs.length; i++) {
        //                 if (data.msgs[i].msg_type === 'System') {
        //                     $scope.SystemMsg.push(data.msgs[i]);
        //                 }
        //                 if (data.msgs[i].msg_type === 'User') {
        //                     $scope.UserMsg.push(data.msgs[i]);
        //                 }
        //             }
        //         }
        //     });
    }
]);

app.controller('NoticeCtrl', ['$scope', '$window',
    function($scope, $window) {
        $scope.goBack = function() {
            $window.history.back();
        };
    }
]);

//用户联系控制器
app.controller('ContactCtrl', ['$scope', '$rootScope', '$stateParams', 'ContactService',
    function($scope, $rootScope, $stateParams, ContactService) {
        $scope.thisUser = $rootScope.user._id;
        $scope.thatUser = $stateParams.userId;
        var contact = {
            this: sessionStorage.getItem('uid'),
            that: $stateParams.userId
        };
        var updateContact = function() {

            ContactService.getContact(contact)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.contacts = data.contacts;
                        console.log(data.contacts);
                    }
                });
        };

        updateContact();
        $rootScope.socket.on('Msg_res', function(msg) {
            updateContact();
        });
        $scope.sendMsg = function() {
            var msg = {
                msg_type: 'User',
                msg: $scope.contact_msg,
                receiver: $stateParams.userId,
                receiver_name: $stateParams.username,
                sender: sessionStorage.getItem('uid'),
                sender_name: sessionStorage.getItem('username')
            };
            $scope.contact_msg = '';
            $rootScope.socket.emit('Msg', msg);
            $rootScope.socket.on('Msg_res', function(msg) {
                updateContact();
            });
        };
    }
]);


//愿望控制器
app.controller('WishCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'WishService', 'WishData',
    function($scope, $rootScope, $state, $stateParams, WishService, WishData) {

        //获取指定愿望的信息
        var data = {
            wishId: $stateParams.wishId
        };
        WishService.findWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.wish = data.wish;
                    WishData._id = data.wish._id;
                    WishData.user = data.wish.user;
                    WishData.username = data.wish.username;
                }
            });



        //修改愿望
        $scope.refreshWish = function(wish) {
            var data = {
                wishId: wish._id,
                wishType: wish.wishType,
                wish: wish.wish
            };
            WishService.updateWish(data)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('修改成功');
                        $state.go('wish.femalewish');
                    }
                });
        };
    }
]);

//女生愿望控制器
app.controller('FemaleWishCtrl', ['$scope', '$rootScope', '$state', 'WishService', 'MsgService',
    function($scope, $rootScope, $state, WishService, MsgService) {
        $scope.UnpickWishes = [];
        $scope.PickedWishes = [];
        $scope.CompletedWishes = [];



        //删除愿望
        $scope.deleteWish = function(wish) {
            if (confirm('确定要删除吗？')) {
                var data = {
                    wishId: wish._id
                };
                WishService.deleteWish(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            alert('删除成功');
                            $state.go('wish.femalewish', {}, {
                                reload: true
                            });
                        }
                    });
            }

        };

        //确认完成愿望
        $scope.completeWish = function(wish) {
            if (confirm('确定要完成吗？')) {
                var data = {
                    type: 2,
                    wishId: wish._id,
                    wishPicker: wish.wishpicker,
                    wishPickerName: wish.wishpickername
                };
                var msg = {
                    msg_type: 'System',
                    sender: sessionStorage.getItem('uid'),
                    sender_name: sessionStorage.getItem('username'),
                    receiver: wish.wishpicker,
                    receiver_name: wish.wishpickername,
                    msg: '确认完成了你领取的愿望'
                };
                WishService.updateWishState(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            $rootScope.socket.emit('Msg', msg);
                            $state.go('wish.femalewish', {}, {
                                reload: true
                            });
                        }
                    });
            }
        };

    }
]);

//男生愿望控制器
app.controller('MaleWishCtrl', ['$scope', '$state', 'GetMaleWishService',
    function($scope, $state, GetMaleWishService) {
        $scope.CompletedWishes = [];
        $scope.PickedWishes = [];
        var data = {
            pickerId: sessionStorage.getItem('uid')
        };
        GetMaleWishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    for (var i = 0; i < data.wishes.length; i++) {
                        if (data.wishes[i].ispicked === 1) {
                            $scope.PickedWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 2) {
                            $scope.CompletedWishes.push(data.wishes[i]);
                        }
                    }
                    $scope.wishes = data.wishes;
                }
            })
    }
]);