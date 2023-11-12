// app.js
App({
    onLaunch(options) {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: 'my-env-id',
                traceUser: true,
            });
        }

        this.globalData = {
            active: false,
            userExist: false,
            werunEnabled: false,
            tabBarBadges: {}
        };

        wx.getSetting().then(r => {
            if (r.authSetting['scope.werun']) {
                wx.getWeRunData().then(r => {
                    console.log(r)
                    wx.cloud.callFunction({
                        name: 'fn',
                        data: {
                            type: 'updateWeRunStepInfo',
                            weRunData: wx.cloud.CloudID(r.cloudID)
                        }
                    })
                })
            } else {
                this.globalData.werunEnabled = true
            }
        });

        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getUser'
            }
        }).then(r => {
            this.globalData.userExist = true
        }).catch(e => {
            wx.showToast({
                title: '请前往`我`页面完善个人信息',
                icon: 'error'
            })
        })

        wx.getUpdateManager().onUpdateReady((e) => {
            console.log(e);
            wx.showModal({
              title: '幸福倒计时！',
              content: '船新版本的「西嘻」已经就绪！\n要现在进入新版本吗？',
              complete: (res) => {
                if (res.confirm) {
                    wx.getUpdateManager().applyUpdate();
                }
              }
            })
        })
    },

    onShow() {
        this.globalData.active = true
        let updateBadge = async () => {
            if(!this.globalData.active) return

            await wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'countUserUnreadPosts'
                }
            }).then(r => {
                let pages = getCurrentPages()
                let p = pages[pages.length-1]
                if (r.result > 99) {
                    p.getTabBar().setBadgeOfPage("/pages/moment/feed", { count: "99+" })
                } else if (r.result > 0) {
                    p.getTabBar().setBadgeOfPage("/pages/moment/feed", { count: r.result })
                } else {
                    p.getTabBar().setBadgeOfPage("/pages/moment/feed", {})
                }
            })
            setTimeout(updateBadge, 10000)
        }
        updateBadge()
    },

    onHide() {
        this.globalData.active = false
    }
});