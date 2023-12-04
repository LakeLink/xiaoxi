// app.js
import Message from 'tdesign-miniprogram/message/index';
import userStore from '~/stores/userStore'
import tabBarStore from '~/stores/tabBarStore'
const miniShopPlugin = requirePlugin('mini-shop-plugin');

App({
    onLaunch(options) {
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

        //https://developers.weixin.qq.com/community/develop/article/doc/00086a45e1092094e0cc7ac0851813
        miniShopPlugin.initApp(this, wx);
        miniShopPlugin.initHomePath("/pages/shop/index");

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

        userStore.load()

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
    },

    onShow() {
        this.globalData.active = true
        let updateBadge = async () => {
            if (!this.globalData.active) return

            userStore.updateUnreadPosts()
            .then(r => {
                // console.log(r)
                if (r > 0) {
                    tabBarStore.setBadgeOfPage("/pages/moment/feed", {
                        count: r
                    })
                } else {
                    tabBarStore.setBadgeOfPage("/pages/moment/feed", {})
                }
            })
            setTimeout(updateBadge, 7000)
        }
        updateBadge()
    },

    onHide() {
        this.globalData.active = false
    }
});