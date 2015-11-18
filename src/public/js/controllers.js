
//主页控制器
app.controller('IndexCtrl', ['$scope', 'WishService', '$state', 'WishData', 'WeChatService', '$rootScope',
    function($scope, WishService, $state, WishData, WeChatService, $rootScope) {

        //获取调用sdk的signature
        var ticket_data = {
            location: window.location.href.split('#')[0]
        };
        WeChatService.getSignature(ticket_data)
            .success(function(data, status) {
                if (status === 200) {
                    var signature = data.data;
                    wx.config({
                        debug: true,
                        appId: signature.appId,
                        timestamp: signature.timestamp,
                        nonceStr: signature.nonceStr,
                        signature: signature.signature,
                        jsApiList: ['previewImage', 'chooseImage', 'uploadImage']
                    });
                }
            });

        $scope.previewImage = function(url) {
            wx.previewImage({
                current: url, // 当前显示图片的http链接
                urls: [url] // 需要预览的图片http链接列表
            });
        };
    }
]);

//许愿墙主页控制器
app.controller('WishIndexCtrl', ['$scope', 'WishData', '$state', 'WishService',
    function($scope, WishData, $state, WishService) {

        $scope.pickWish = function(wish) {
            if (confirm('确认领取' + wish.username + '的这个愿望?')) {
                WishData._id = wish._id;
                WishData.useremail = wish.useremail;
                $state.go('user.writeinfo', {
                    type: 2
                });
            }
        };

        //愿望列表
        $scope.oddwishes = [];
        $scope.evenwishes = [];

        //加载下一页的内容，只有登录的人才能查看
        $scope.page = 1; //当前页数
        $scope.per_page = 30; //每页显示数目
        $scope.isLoading = false;
        $scope.nextpage = function(page, per_page) {
            $scope.isLoading = true;
            WishService.getUnpickedWishes(page, per_page)
                .success(function(data, status) {
                    if (status === 200 && data.wishes.length !== 0) {
                        // alert(data.wishes.length);
                        for (var i = 1; i < data.wishes.length; i = i + 2) {
                            $scope.oddwishes.push(data.wishes[i]);
                            $scope.evenwishes.push(data.wishes[i - 1]);
                        }

                        $scope.page++;
                        $scope.isLoading = false;
                    }
                });
        };

    }
]);

//祝福墙主页控制器
app.controller('BlessIndexCtrl', ['$scope', '$state', 'BlessService',
    function($scope, $state, BlessService) {

        //祝福列表
        var uid = sessionStorage.getItem('uid');
        $scope.blesses = [];
        $scope.pageForBless = 1;
        $scope.per_pageForBless = 5;
        $scope.hadpraise = false;
        $scope.nextpageBless = function(page, per_page) {
            $scope.isLoading = true;
            BlessService.getBlesses(page, per_page)
                .success(function(data, status) {
                    if (status === 200 && data.blesses.length !== 0) {
                        for (var i = 0; i < data.blesses.length; i++) {
                            $scope.blesses.push(data.blesses[i]);
                            if (data.blesses[i].praiser.indexOf(uid) === -1) {
                                data.blesses[i].hadpraise = false;
                            } else {
                                data.blesses[i].hadpraise = true;
                            }
                        }
                        $scope.pageForBless++;
                        $scope.isLoading = false;
                    }
                });
        };

        //祝福点赞
        $scope.praiseIt = function(bless) {
            var praiseData = {
                blessId: bless._id,
                userId: sessionStorage.getItem('uid')
            };
            BlessService.makePraise(praiseData)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('点赞成功');
                        bless.praise_num++;
                        bless.hadpraise = true;
                    } else {
                        alert(data);
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
                        $scope.getUnreadMsgNum(data.data._id);
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


        //基于 socket.io 的消息推送
        $scope.unread_num = 0;
        $rootScope.isConnected = false;
        $rootScope.socket = io.connect('http://gdutgirl.duapp.com', {
            'connect_timeout': 500,
            'reconnect': true,
            'reconnection delay': 500,
            'reopen delay': 500,
            'max reconnection attempts': 10
        });
        $rootScope.socket.on('open', function() {
            $rootScope.isConnected = true;
            console.log('连接成功');
        });

        //SystemMsgList

        $rootScope.socket.on('WishMsg_res', function(msg) {
            //处理系统消息
            if (msg.receiver === sessionStorage.getItem('uid')) {
                $scope.getUnreadMsgNum(msg.receiver);
            }
        });
        $rootScope.socket.on('NewUserMsg', function(receiver) {
            if (receiver === sessionStorage.uid) {
                $scope.getUnreadMsgNum(sessionStorage.uid);
            }
        });
        $scope.getUnreadMsgNum = function(uid) {
            MsgService.getUnreadMsgNum(uid)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.unread_num = data.num;
                    }
                });
        };


        $scope.cancelMsgCount = function() {
            $scope.unread_num = 0;
        };

        $scope.searchwhere = '许愿墙';

    }
]);

//用户信息控制器
app.controller('UserInfoCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'UserService',
    function($scope, $rootScope, $state, $stateParams, UserService) {
        $scope.isSelf = ($stateParams.userId === sessionStorage.getItem('uid'))

        // var data = {
        //     userId: $stateParams.userId
        // };
        // UserService.getUserInfo(data)
        //     .success(function(data, status) {
        //         if (status === 200) {
        //             $scope.user = data.user;
        //             $state.go('userinfo.wishwall', {
        //                 sex: $scope.user.sex
        //             });
        //         }
        //     });
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

app.controller('UserInfoBlessWallCtrl', ['$scope', '$stateParams', 'BlessService',
    function($scope, $stateParams, BlessService) {
        $scope.blesses = [];
        var data = {
            userId: $stateParams.userId
        };
        BlessService.getUserBless(data)
            .success(function(data, status) {
                if (status === 200 && data.blesses.length !== 0) {
                    for (var i = 0; i < data.blesses.length; i++) {
                        $scope.blesses.push(data.blesses[i]);
                    }
                    /*$scope.pageForBless++;*/
                    $scope.isLoading = false;
                }
            });
    }
]);

app.controller('SettingCtrl', ['$scope', '$window',
    function($scope, $window) {
        $scope.goBack = function() {
            $window.history.back();
        };
    }
]);

//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'WishService', 'BlessService', 'WishData', 'BlessData', 'UserService', 'WeChatService', '$window',
    function($scope, $rootScope, $state, $stateParams, WishService, BlessService, WishData, BlessData, UserService, WeChatService, $window) {

        $scope.wish_type = '耗时类';
        $scope.goBack = function() {
            $window.history.back();
        };

        var data = {
            userId: sessionStorage.getItem('uid')
        };

        // UserService.getUserInfo(data)
        //     .success(function(data, status) {
        //         if (status === 200) {
        //             $scope.user = data.user;
        //         }
        //     });

        //获取微信 AccessToken 以及 ApiTicket (女生才需要)

        // var ticket_data = {
        //     location: window.location.href.split('#')[0]
        // };
        // WeChatService.getSignature(ticket_data)
        //     .success(function(data, status) {
        //         if (status === 200) {
        //             var signature = data.data;
        // wx.config({
        //     debug: true,
        //     appId: $rootScope.signature.appId,
        //     timestamp: $rootScope.signature.timestamp,
        //     nonceStr: $rootScope.signature.nonceStr,
        //     signature: $rootScope.signature.signature,
        //     jsApiList: ['chooseImage', 'uploadImage']
        // });
        //         }
        //     });

        //Wish image
        $scope.chooseImage = function() {
            wx.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: function(res) {
                    $scope.localIds = res.localIds;
                    wx.uploadImage({
                        localId: res.localIds[0],
                        isShowProgressTips: 1,
                        success: function(res) {
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
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: function(res) {
                    $scope.localBlessIds = res.localIds;
                    wx.uploadImage({
                        localId: res.localIds[0],
                        isShowProgressTips: 1,
                        success: function(res) {
                            BlessData.mediaId = res.serverId;
                        }
                    });
                }
            });
        };

        //发布愿望
        $scope.publicWish = function() {

            //组装愿望数据包
            WishData.user = sessionStorage.getItem('uid');
            WishData.username = sessionStorage.getItem('username');
            WishData.userheadimg = $scope.user.headimgurl;
            WishData.wishType = $scope.wish_type;
            WishData.wish = $scope.wish;
            WishData.school_area = $scope.user.school_area;
            WishData.useremail = $scope.user.email;
            //发布愿望
            WishService.putWish(WishData)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('许愿成功');
                        $state.go('index.wishwall');
                    }
                });

        };





        //*************Bless Part***************//

        //发布祝福
        $scope.publicBless = function() {

            //组装祝福数据包
            BlessData.user = sessionStorage.getItem('uid');
            BlessData.username = sessionStorage.getItem('username');
            BlessData.userheadimg = $scope.user.headimgurl;
            BlessData.bless = $scope.bless;
            BlessData.school_area = $scope.user.school_area;
            BlessData.useremail = $scope.user.email;
            //发布祝福
            BlessService.putBless(BlessData)
                .success(function(data, status) {
                    if (status === 200) {
                        alert("祝福成功");
                        $state.go('index.blesswall');
                    }
                });

        };

        //*************Bless Part***************//

    }
]);

//填写用户信息的控制器
app.controller('UserWriteInfoCtrl', ['$scope', '$state', 'UserService', '$stateParams', '$window', 'WishService', 'WishData', '$rootScope',
    function($scope, $state, UserService, $stateParams, $window, WishService, WishData, $rootScope) {

        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.type = $stateParams.type;

        // var data = {
        //     userId: sessionStorage.getItem('uid')
        // };

        // UserService.getUserInfo(data)
        //     .success(function(data, status) {
        //         if (status === 200) {
        //             $scope.user = data.user;
        //         }
        //     });

        //更新用户信息
        $scope.setUserInfo = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.user.real_name,
                school_area: $scope.user.school_area,
                college_name: $scope.user.college_name,
                long_tel: $scope.user.long_tel,
                short_tel: $scope.user.short_tel,
                email: $scope.user.email
            };
            UserService.updateInfo(InfoData)
                .success(function(data, status) {
                    if (status === 200) {
                        $rootScope.user.real_name = InfoData.real_name;
                        $rootScope.user.school_area = InfoData.school_area;
                        $rootScope.user.college_name = InfoData.college_name;
                        $rootScope.user.long_tel = InfoData.long_tel;
                        $rootScope.user.short_tel = InfoData.short_tel;
                        $rootScope.user.email = InfoData.email;
                        $window.history.back();
                    }
                });
        };

        //领取愿望动作
        $scope.pickWish = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.user.real_name,
                school_area: $scope.user.school_area,
                college_name: $scope.user.college_name,
                long_tel: $scope.user.long_tel,
                short_tel: $scope.user.short_tel,
                email: $scope.user.email
            };
            var data = {
                type: 1,
                wishId: WishData._id,
                wishPicker: sessionStorage.getItem('uid'),
                wishPickerName: sessionStorage.getItem('username'),
                email: WishData.useremail
            };
            WishService.updateWishState(data)
                .success(function(data, status) {
                    if (status === 200) {
                        //更新个人信息
                        UserService.updateInfo(InfoData)
                            .success(function(data, status) {
                                if (status === 200) {
                                    $rootScope.user.real_name = InfoData.real_name;
                                    $rootScope.user.school_area = InfoData.school_area;
                                    $rootScope.user.college_name = InfoData.college_name;
                                    $rootScope.user.long_tel = InfoData.long_tel;
                                    $rootScope.user.short_tel = InfoData.short_tel;
                                    $rootScope.user.email = InfoData.email;
                                    var msg = {
                                        msg_type: 'Notice',
                                        sender: sessionStorage.getItem('uid'),
                                        sender_name: sessionStorage.getItem('username'),
                                        receiver: WishData.user,
                                        receiver_name: WishData.username,
                                        msg: sessionStorage.username + '领取了你的愿望'
                                    };
                                    $rootScope.socket.emit('WishMsg', msg);
                                    alert('领取成功！');
                                    $state.go('wish.malewish');
                                }
                            });
                    }
                });
        };

        //修改个人信息
        $scope.rewrite = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.user.real_name,
                school_area: $scope.user.school_area,
                college_name: $scope.user.college_name,
                long_tel: $scope.user.long_tel,
                short_tel: $scope.user.short_tel,
                email: $scope.user.email
            };

            //更新个人信息
            UserService.updateInfo(InfoData)
                .success(function(data, status) {
                    if (status === 200) {
                        $rootScope.user.real_name = InfoData.real_name;
                        $rootScope.user.school_area = InfoData.school_area;
                        $rootScope.user.college_name = InfoData.college_name;
                        $rootScope.user.long_tel = InfoData.long_tel;
                        $rootScope.user.short_tel = InfoData.short_tel;
                        $rootScope.user.email = InfoData.email;
                        alert('修改成功');
                        $state.go('userinfo', {
                            userId: InfoData.user
                        });
                    }
                });


        };
    }
]);

//消息控制器
app.controller('MsgCtrl', ['$scope', '$rootScope', '$state', 'MsgService', '$window',
    function($scope, $rootScope, $state, MsgService, $window) {


        MsgService.getUnreadMsgNum(sessionStorage.uid)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.notices_num = data.notice;
                    $scope.praise_num = data.praise;
                    $scope.user_num = data.user;
                }
            });

        $scope.clearNotice = function(type) {
            MsgService.readMsg(sessionStorage.uid, type)
                .success(function(data, status) {
                    $state.go('user.notice', {
                        type: type
                    });
                });
        };

    }
]);

app.controller('NoticeCtrl', ['$scope', '$window', 'MsgService', '$stateParams',
    function($scope, $window, MsgService, $stateParams) {
        $scope.MsgList = [];
        $scope.goBack = function() {
            $window.history.back();
        };
        var type = $stateParams.type;
        MsgService.getMsg(sessionStorage.getItem('uid'))
            .success(function(data, status) {
                if (status === 200) {

                    for (var i = 0, len = data.msgs.length; i < len; i++) {
                        if (data.msgs[i].msg_type === type) {
                            $scope.MsgList.push(data.msgs[i]);
                        }
                    }
                }
            });
    }
]);

//用户联系控制器
app.controller('ContactCtrl', ['$scope', '$rootScope', '$stateParams', 'MsgService', '$state',
    function($scope, $rootScope, $stateParams, MsgService, $state) {
        $scope.thisUser = $rootScope.user._id;
        $scope.thatUser = $stateParams.userId;
        var contact = {
            this: sessionStorage.getItem('uid'),
            that: $stateParams.userId
        };
        var updateContact = function() {
            MsgService.getContact(contact)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.contacts = data.contacts;
                    }
                });
        };

        updateContact();
        $rootScope.socket.on('UserMsg_res', function(msg) {
            if (msg.sender === sessionStorage.uid || msg.receiver === sessionStorage.uid) {
                updateContact();
            }
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
            $rootScope.socket.emit('UserMsg', msg);
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
                    WishData.useremail = data.wish.useremail;
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

app.controller('MysteryLoverCtrl', ['$scope', '$window',
    function($scope, $window) {
        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.searchMystery = function() {

        };
    }
]);