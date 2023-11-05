// pages/moment/feed.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        imageProps: {
            shape: 'round',
            mode: 'aspectFit',
            'show-menu-by-longpress': true,
        },
        posts: []
    },

    onTapCreate(e) {
        wx.navigateTo({
            url: '/pages/moment/create',
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
        if (typeof this.getTabBar === 'function' &&
            this.getTabBar()) {
            this.getTabBar().setData({
                value: '/pages/moment/feed'
            })
        }

        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getPosts'
            }
        }).then(r => {
            for (let i = 0; i < r.result.list.length; i++) {
                const e = r.result.list[i];
                e.swiper = e.images.map(x => {
                    return {
                        value: x
                    }
                })
            }
            this.setData({
                posts: r.result.list
            })
            console.log(r.result.list)
        })
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