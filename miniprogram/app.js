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
                env: 'xiaoxiaiyundong-8g95vuw53cf7c6b4',
                traceUser: true,
            });
        }
        this.globalData = {};

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
            }
        });

        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getUser',
                q: options.query
            }
        }).then(r => {
            if (!r.result.exist) {
                wx.showToast({
                    title: '请前往`About`完善个人信息',
                    icon: 'error'
                })
            }
            this.globalData.cachedUser = r.result
        })
    }
});