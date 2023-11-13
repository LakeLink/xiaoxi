// pages/moment/feed.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        posts: [],
        lastReadPost: null,
        noMorePost: false
    },

    lastPostUpdatedAt: null,

    async refresh(clear) {
        if (clear) {
            this.lastPostUpdatedAt = null
        }
        return await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getPosts',
                updatedBefore: this.lastPostUpdatedAt
            }
        }).then(r => {
            // https://developers.weixin.qq.com/community/develop/article/doc/000404cadd0548fd6e48f439455413
            const {
                posts
            } = this.data;
            let unreadPost = null
            for (let i = 0; i < r.result.list.length; i++) {
                const e = r.result.list[i];
                // console.log(e.updatedAt, r.result.lastReadPostAt, e.updatedAt > r.result.lastReadPostAt)
                if (e.updatedAt > r.result.lastReadPostAt) {
                    unreadPost = i
                }
            }
            if (!clear) {
                this.setData({
                    [`posts[${posts.length}]`]: r.result.list,
                    noMorePost: r.result.list.length == 0,
                    unreadPost
                })
            } else {
                this.setData({
                    posts: [r.result.list],
                    noMorePost: r.result.list.length == 0,
                    unreadPost
                })
            }
            // console.log(r.result)
            if (r.result.list.length) {
                this.lastPostUpdatedAt = r.result.list[r.result.list.length-1].updatedAt
            }

            this.getTabBar().setBadge({})
            return r.result.list.length
        })
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
        this.refresh(true)
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
        this.getTabBar().onPageShow(this)

        // wx.startPullDownRefresh()
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
        this.refresh(true).then(setTimeout(wx.stopPullDownRefresh, 500))
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (!this.data.noMorePost) this.refresh()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})