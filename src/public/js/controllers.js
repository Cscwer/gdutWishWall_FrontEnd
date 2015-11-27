//主页控制器
app.controller('IndexCtrl', ['$scope',
    function($scope) {

        $scope.previewImage = function(url) {
            wx.previewImage({
                current: url, // 当前显示图片的http链接
                urls: [url] // 需要预览的图片http链接列表
            });
        };

    }
]);

//许愿墙主页控制器
app.controller('WishIndexCtrl', ['$scope', 'WishData', '$state', 'WishService', 'SearchConfig', '$rootScope',
    function($scope, WishData, $state, WishService, SearchConfig, $rootScope) {
        $scope.user = $rootScope.user;
        $scope.pickWish = function(wish) {
            if (confirm('确认领取' + wish.username + '的这个愿望?')) {
                WishData._id = wish._id;
                WishData.user = wish.user;
                WishData.username = wish.username;
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
        $scope.per_page = 15; //每页显示数目
        $scope.search_area = SearchConfig.search_area;
        $scope.search_wishtype = SearchConfig.search_wishtype;
        $scope.isLoading = false;
        $scope.nextpage = function(page, per_page, search_area, search_wishtype) {
            $scope.isLoading = true;
            SearchConfig.search_area = '';
            SearchConfig.search_wishtype = '';
            WishService.getUnpickedWishes(page, per_page, search_area, search_wishtype)
                .success(function(data, status) {
                    var len = data.wishes.length;
                    if (status === 200 && len !== 0) {
                        for (var i = 0; i < len - 1; i = i + 2) {
                            $scope.evenwishes.push(data.wishes[i + 1]);
                            $scope.oddwishes.push(data.wishes[i]);
                        }
                        if (len % 2 !== 0) {
                            $scope.oddwishes.push(data.wishes[len - 1]);
                        }

                        $scope.page++;
                        $scope.isLoading = false;
                    }
                });
        };

    }
]);

//祝福墙主页控制器
app.controller('BlessIndexCtrl', ['$scope', '$state', 'BlessService', 'SearchConfig',
    function($scope, $state, BlessService, SearchConfig) {

        //祝福列表
        var uid = sessionStorage.getItem('uid');
        $scope.blesses = [];
        $scope.pageForBless = 1;
        $scope.per_pageForBless = 15;
        $scope.search_area = SearchConfig.bless_search_area;
        $scope.search_sort = SearchConfig.search_sort;
        $scope.hadpraise = false;
        $scope.isLoading = false;
        $scope.nextpageBless = function(page, per_page, search_area, search_sort) {
            $scope.isLoading = true;
            SearchConfig.bless_search_area = '';
            SearchConfig.search_sort = '';
            BlessService.getBlesses(page, per_page, search_area, search_sort)
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
app.controller('LeaderCtrl', ['$scope', '$rootScope', 'MsgService', 'WeChatService', 'UserService',
    function($scope, $rootScope, MsgService, WeChatService, UserService) {

        $scope.leadericon = 1;
        //获取微信用户信息
        UserService.getMyInfo()
            .success(function(data, status) {
                if (status === 200) {
                    if (!data.error) {
                        $rootScope.user = data.data;
                        $scope.user = data.data;
                        sessionStorage.setItem('uid', $rootScope.user._id);
                        sessionStorage.setItem('username', $rootScope.user.nickname);
                        $scope.getUnreadMsgNum(data.data._id);
                    } else {
                        $rootScope.user = null;
                        alert(data.error);
                    }
                }
            });

        //获取调用sdk的signature
        var ticket_data = {
            location: window.location.href.split('#')[0]
        };
        WeChatService.getSignature(ticket_data)
            .success(function(data, status) {
                if (status === 200) {
                    $rootScope.signature = data.data;
                    var signature = data.data;
                    wx.config({
                        debug: false,
                        appId: signature.appId,
                        timestamp: signature.timestamp,
                        nonceStr: signature.nonceStr,
                        signature: signature.signature,
                        jsApiList: ['previewImage']
                    });
                }
            });

        //基于 socket.io 的消息推送
        $scope.unread_num = 0;
        $rootScope.isConnected = false;
        $rootScope.socket = io.connect('180.149.144.13:30004');
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
        $rootScope.socket.on('FemaleMsg_res', function(msg) {
            if (msg.receiver === sessionStorage.uid) {
                $scope.getUnreadMsgNum(sessionStorage.uid);
            }
        });
        $scope.getUnreadMsgNum = function(uid) {
            MsgService.getUnreadMsg(uid)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.unread_num = data.num;
                    }
                });
        };


        $scope.cancelMsgCount = function() {
            $scope.unread_num = 0;
        };

    }
]);

app.controller('SearchCtrl', ['$scope', '$state', 'WishService', 'WishData', 'SearchConfig', 'BlessService',
    function($scope, $state, WishService, WishData, SearchConfig, BlessService) {
        //许愿墙筛选部分
        $scope.searchwhere = '许愿墙';
        $scope.search_area = '';
        $scope.search_wishtype = '';
        $scope.search_sort = '';
        $scope.searchSelect = function(index) {
            if (index === 1) {
                $scope.searchwhere = '许愿墙';
            } else {
                $scope.searchwhere = '祝福墙';
            }
        };
        $scope.areaSelect = function(index) {
            switch (index) {
                case 1:
                    $scope.search_area = '大学城';
                    break;
                case 2:
                    $scope.search_area = '龙洞';
                    break;
                case 3:
                    $scope.search_area = '东风路';
                    break;
                case 4:
                    $scope.search_area = '番禺';
                    break;
                case 5:
                    $scope.search_area = '沙河';
                    break;
                case 0:
                    $scope.search_area = '';
                    break;
            }
        };
        $scope.typeSelect = function(index) {
            switch (index) {
                case 0:
                    $scope.search_wishtype = '';
                    break;
                case 1:
                    $scope.search_wishtype = '实物类';
                    break;
                case 2:
                    $scope.search_wishtype = '耗时类';
                    break;
            }
        };
        $scope.sortSelect = function(index) {
            switch (index) {
                case -1:
                    $scope.search_sort = -1;
                    break;
                case 0:
                    $scope.search_sort = '';
                    break;
                case 1:
                    $scope.search_sort = 1;
                    break;
            }
        };

        $scope.wishwallSearch = function() {
            if ($scope.searchwhere === '许愿墙') {
                SearchConfig.search_area = $scope.search_area;
                SearchConfig.search_wishtype = $scope.search_wishtype;
                $state.go('index.wishwall', {}, {
                    reload: true
                });
            } else {
                SearchConfig.bless_search_area = $scope.search_area;
                SearchConfig.search_sort = $scope.search_sort;
                $state.go('index.blesswall', {}, {
                    reload: true
                });
            }

        };

        $scope.doSearch = function() {
            if ($scope.searchwhere === '许愿墙') {
                WishService.searchWish($scope.searchinput)
                    .success(function(data, status) {
                        $scope.search_result_wishes = data.wishes;
                    });
            }
            if ($scope.searchwhere === '祝福墙') {
                BlessService.searchBless($scope.searchinput)
                    .success(function(data, status) {
                        if (status === 200 && data.blesses.length !== 0) {
                            $scope.search_result_wishes = [];
                            for (var i = 0; i < data.blesses.length; i++) {
                                $scope.search_result_wishes.push(data.blesses[i]);
                                if (data.blesses[i].praiser.indexOf(sessionStorage.uid) === -1) {
                                    $scope.search_result_wishes[i].hadpraise = false;
                                } else {
                                    $scope.search_result_wishes[i].hadpraise = true;
                                }
                            }
                        }
                    });
            }
        };

        $scope.pickWish = function(wish) {
            if (confirm('确认领取' + wish.username + '的这个愿望?')) {
                $scope.sure_to_pick = true;
                WishData._id = wish._id;
                WishData.useremail = wish.useremail;
                $state.go('user.writeinfo', {
                    type: 2
                });
            }
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
                        bless.praise_num++;
                        bless.hadpraise = true;
                    } else {
                        // alert(data);
                    }
                });
        };
    }
]);

//用户信息控制器
app.controller('UserInfoCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'UserService',
    function($scope, $rootScope, $state, $stateParams, UserService) {
        $scope.isSelf = ($stateParams.userId === sessionStorage.getItem('uid'));

        var data = {
            userId: $stateParams.userId
        };
        UserService.getUserInfo(data)
            .success(function(data, status) {
                if (status === 200) {
                    if (!data.errmsg) {
                        $scope.user = data.user;
                        $rootScope.user = data.user;
                        $state.go('userinfo.wishwall', {
                            sex: $scope.user.sex
                        });
                    } else {
                        alert(data.errmsg);
                    }
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
                var len = data.wishes.length;
                if (status === 200) {
                    for (var i = 0; i < len - 1; i = i + 2) {
                        $scope.evenwishes.push(data.wishes[i + 1]);
                        $scope.oddwishes.push(data.wishes[i]);
                    }
                    if (len % 2 !== 0) {
                        $scope.oddwishes.push(data.wishes[len - 1]);
                    }
                }
            });

    }
]);

app.controller('UserInfoBlessWallCtrl', ['$scope', '$stateParams', 'BlessService', '$state',
    function($scope, $stateParams, BlessService, $state) {
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

app.controller('SettingCtrl', ['$scope', '$window', '$rootScope',
    function($scope, $window, $rootScope) {
        $scope.user = $rootScope.user;
        $scope.goBack = function() {
            $window.history.back();
        };
    }
]);

//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope',
    function($scope, $rootScope) {
        $scope.goBack = function() {
            $window.history.back();
        };
        var signature = $rootScope.signature;
        wx.config({
            debug: false,
            appId: signature.appId,
            timestamp: signature.timestamp,
            nonceStr: signature.nonceStr,
            signature: signature.signature,
            jsApiList: ['chooseImage', 'uploadImage']
        });
    }
]);

//填写愿望控制器
app.controller('UserWriteWishCtrl', ['$scope', 'WishData', 'WishService', '$rootScope', '$state', '$stateParams',
    function($scope, WishData, WishService, $rootScope, $state, $stateParams) {
        $scope.type = $stateParams.type;
        var refresh_wish_data = {};
        if ($scope.type === '1') {
            $scope.writewish_title = '许愿望';
            //默认愿望类型为耗时类

            $scope.wish_type = WishData.wishType || '耗时类';
            $scope.wish = WishData.wish || '';
            $scope.localIds = WishData.localIds || [];

        } else {
            $scope.writewish_title = '修改愿望';
            var data = {
                wishId: $stateParams.wishId
            };
            WishService.findWish(data)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.wish = data.wish.wish;
                        $scope.wish_type = data.wish.wishType;
                        $scope.wishimg = data.wish.img;
                        refresh_wish_data.imgurl = data.wish.img;
                    }
                });
        }


        //choose wish image
        $scope.chooseImage = function() {
            wx.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: function(res) {
                    $scope.localIds = res.localIds;
                    WishData.localIds = res.localIds;
                    wx.uploadImage({
                        localId: res.localIds[0],
                        isShowProgressTips: 1,
                        success: function(res) {
                            refresh_wish_data.mediaId = res.serverId;
                            WishData.mediaId = res.serverId;
                        }
                    });
                }
            });
        };

        $scope.goWriteInfo = function() {
            WishData.wishType = $scope.wish_type;
            WishData.wish = $scope.wish;
            $state.go('user.writeinfo', {
                type: 1
            });
        };

        $scope.isClick = false;
        //发布愿望
        $scope.publicWish = function() {
            $scope.isClick = true;
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
                        WishData.wishType = '';
                        WishData.wish = '';
                        WishData.mediaId = null;
                        WishData.localIds = [];
                        alert('许愿成功');
                        $state.go('index.wishwall');
                    }
                });
        };

        $scope.refreshWish = function() {
            $scope.isClick = true;
            refresh_wish_data.wishId = $stateParams.wishId;
            refresh_wish_data.wishType = $scope.wish_type;
            refresh_wish_data.wish = $scope.wish;
            WishService.updateWish(refresh_wish_data)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('修改成功');
                        $state.go('wish.detail', {
                            wishId: refresh_wish_data.wishId
                        });
                    }
                });
        };

    }
]);

//用户填写祝福控制器
app.controller('UserWriteBlessCtrl', ['$scope', '$rootScope', 'BlessData', 'BlessService', '$state',
    function($scope, $rootScope, BlessData, BlessService, $state) {

        $scope.isClick = false;
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

        //发布祝福
        $scope.publicBless = function() {
            $scope.isClick = true;
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
                        BlessData.mediaId = null;
                        alert("祝福成功");
                        $state.go('index.blesswall');
                    }
                });

        };
    }
]);

//填写用户信息的控制器
app.controller('UserWriteInfoCtrl', ['$scope', '$state', 'UserService', '$stateParams', '$window', 'WishService', 'WishData', '$rootScope',
    function($scope, $state, UserService, $stateParams, $window, WishService, WishData, $rootScope) {
        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.type = $stateParams.type;
        $scope.isClick = false;
        //更新用户信息
        $scope.setUserInfo = function() {
            $scope.isClick = true;
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.uid,
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
            $scope.isClick = true;
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.uid,
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
                wishPicker: sessionStorage.uid,
                wishPickerName: sessionStorage.username,
                email: WishData.useremail
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
                    }
                });

            var msg = {
                msg_type: 'Notice',
                sender: sessionStorage.uid,
                sender_name: sessionStorage.username,
                receiver: WishData.user,
                receiver_email: WishData.useremail,
                receiver_name: WishData.username,
                msg: sessionStorage.username + '领取了你的愿望'
            };
            $rootScope.socket.emit('WishMsg', msg);
            WishService.updateWishState(data)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('领取成功！');
                        $state.go('index.wishwall');
                    }
                });

        };

        //修改个人信息
        $scope.rewrite = function() {
            $scope.isClick = true;
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
app.controller('MsgCtrl', ['$scope', '$state', 'MsgService',
    function($scope, $state, MsgService) {

        MsgService.getUnreadMsg(sessionStorage.uid)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.notices_num = data.notice;
                    $scope.praise_num = data.praise;
                    $scope.user_msg_list = data.user;
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
        MsgService.getMsg(type, sessionStorage.getItem('uid'))
            .success(function(data, status) {

                if (status === 200) {

                    for (var i = 0, len = data.msgs.length; i < len; i++) {
                        $scope.MsgList.push(data.msgs[i]);
                    }
                }
            });
    }
]);

//用户联系控制器
app.controller('ContactCtrl', ['$scope', '$rootScope', '$stateParams', 'MsgService', '$state',
    function($scope, $rootScope, $stateParams, MsgService, $state) {
        // $scope.thisUser = $rootScope.user._id;
        $scope.thisUser = $rootScope.user._id;
        $scope.thatUser = $stateParams.userId;
        $scope.thatUserName = $stateParams.username;
        $scope.user = $rootScope.user;
        var contact = {
            this: $scope.thisUser,
            that: $scope.thatUser
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
        MsgService.clearUserMsg(contact)
            .success(function(data, status) {

            });
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
                sender_name: sessionStorage.getItem('username'),
                sender_headimg: $scope.user.headimgurl
            };
            $scope.contact_msg = '';
            $rootScope.socket.emit('UserMsg', msg);
        };
    }
]);


//愿望控制器
app.controller('WishCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'WishService', 'WishData', '$window', 'UserService',
    function($scope, $rootScope, $state, $stateParams, WishService, WishData, $window, UserService) {

        $scope.user = $rootScope.user;
        $scope.usersex = $stateParams.sex;


        //获取指定愿望的信息
        var wish_data = {
            wishId: $stateParams.wishId
        };
        WishService.findWish(wish_data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.wish = data.wish;
                    if ($scope.wish.ispicked !== 0 && $scope.usersex === '2') {
                        var picker_data = {
                            userId: $scope.wish.wishpicker
                        };
                        UserService.getUserInfo(picker_data)
                            .success(function(data, status) {
                                if (status === 200) {
                                    $scope.wishpicker = data.user;
                                }
                            });
                    }
                    if ($scope.usersex === '1') {
                        var wishuser = {
                            userId: $scope.wish.user
                        };
                        UserService.getUserInfo(wishuser)
                            .success(function(data, status) {
                                if (status === 200) {
                                    $scope.wishpicker = data.user;
                                }
                            });
                    }
                }
            });

        $scope.goBack = function() {
            $window.history.back();
        };



        //修改愿望
        $scope.isRewrite = false;



        $scope.deleteWish = function(wish) {
            if (confirm('确定要删除愿望？')) {
                WishService.deleteWish(wish)
                    .success(function(data, status) {
                        if (status === 200) {
                            alert('删除成功');
                            $state.go('userinfo', {
                                userId: wish.user
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
                    msg_type: 'Notice',
                    sender: sessionStorage.getItem('uid'),
                    sender_name: sessionStorage.getItem('username'),
                    receiver: wish.wishpicker,
                    receiver_email: $scope.wishpicker.email,
                    receiver_name: wish.wishpickername,
                    msg: wish.username + '确认完成了你领取的愿望'
                };
                WishService.updateWishState(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            $rootScope.socket.emit('FemaleMsg', msg);
                            alert('操作成功！');
                            $state.go('userinfo', {
                                userId: msg.sender
                            });
                        }
                    });
            }
        };


    }
]);

app.controller('BlessCtrl', ['$scope', '$window', 'BlessService', '$stateParams',
    function($scope, $window, BlessService, $stateParams) {
        var uid = sessionStorage.getItem('uid');
        $scope.hadpraise = false;
        $scope.goBack = function() {
            $window.history.back();
        };
        var bless_data = {
            blessId: $stateParams.blessId
        };
        BlessService.getBless(bless_data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.bless = data.bless;
                    if ($scope.bless.praiser.indexOf(uid) === -1) {
                        $scope.bless.hadpraise = false;
                    } else {
                        $scope.bless.hadpraise = true;
                    }
                }
            });
        $scope.deleteBless = function(bless) {
            if (confirm('确定要删除祝福？')) {
                BlessService.deleteBless(bless)
                    .success(function(data, status) {
                        if (status === 200) {
                            alert('删除成功');
                            $state.go('userinfo.blesswall', {
                                userId: bless.user
                            }, {
                                reload: true
                            });
                        }
                    });
            }
        };
        $scope.praiseIt = function(bless) {
            var praiseData = {
                blessId: bless._id,
                userId: uid
            };
            BlessService.makePraise(praiseData)
                .success(function(data, status) {
                    if (status === 200) {
                        bless.praise_num++;
                        bless.hadpraise = true;
                    } else {
                        alert(data);
                    }
                });
        };              
    }
]);

app.controller('MysteryLoverCtrl', ['$scope', '$window', '$rootScope', 'UserService', '$stateParams', '$state',
    function($scope, $window, $rootScope, UserService, $stateParams, $state) {
        var user_data = {
            userId: $stateParams.userId
        };
        UserService.getUserInfo(user_data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.user = data.user;
                }
            });
        $scope.rewrite = $stateParams.rewrite;
        $scope.goBack = function() {
            $window.history.back();
        };

        $scope.match_data = {
            uid: $scope.user._id,
            useremail: $scope.user.email
        };
        $scope.searchMystery = function() {

            UserService.matchLover($scope.match_data)
                .success(function(data, status) {
                    if (status === 200) {
                        // $scope.user.mystery_lover = $scope.match_data.hisname;
                        // $scope.user.match_success = data.result;
                        $state.go('user.mysterylover', {
                            userId: $scope.user._id
                        }, {
                            reload: true
                        });
                    }
                });
        };
        $scope.rewrite_data = {
            uid: $scope.user._id,
            useremail: $scope.user.email
        };
        $scope.rewriteMystery = function() {

            UserService.matchLover($scope.rewrite_data)
                .success(function(data, status) {
                    if (status === 200) {
                        // $scope.user.mystery_lover = $scope.match_data.hisname;
                        // $scope.user.match_success = data.result;

                        $state.go('user.mysterylover', {
                            userId: $scope.user._id,
                            rewrite: ''
                        }, {
                            reload: true
                        });
                    }
                });
        };
    }
]);