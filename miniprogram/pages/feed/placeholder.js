// pages/feed/placeholder.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nodes: `
        <h3>西嘻「爱水贴」即将上线</h3>
        <br>
        <ul>
            <li>聊天吹水</li>
            <li>二手交易</li>
            <li>组局开黑</li>
            <li>......</li>
        </ul>
        `,
        subscribed: false
    },

    refresh() {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'hasSubscribed',
                templateId: 'NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'
            }
        }).then(r => this.setData({
            subscribed: r.result
        }))
    },

    onTapSubscribe(e) {
        console.log(e)

        wx.requestSubscribeMessage({
            tmplIds: [
                'NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'
            ]
        }).then(r => {
            if (r['NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'] == "accept") {
                console.log(r)
                wx.showToast({
                    icon: 'success',
                    title: '订阅成功…'
                })
                this.refresh()
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // this.refresh()
        if (typeof this.getTabBar === 'function' &&
            this.getTabBar()) {
            this.getTabBar().setData({
                value: '/pages/feed/placeholder'
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})