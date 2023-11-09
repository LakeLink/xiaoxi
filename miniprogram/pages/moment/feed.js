// pages/moment/feed.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        posts: []
    },

    postsOffset: 0,
    postsNoMore: false,

    async refresh(offset) {
        return await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getPosts',
                offset: this.postsOffset
            }
        }).then(r => {
            // for (let i = 0; i < r.result.list.length; i++) {
            //     const e = r.result.list[i];
            //     e.swiper = e.images.map(x => {
            //         return {
            //             value: x
            //         }
            //     })
            // }
            // https://developers.weixin.qq.com/community/develop/article/doc/000404cadd0548fd6e48f439455413
            if (offset) {
                const {
                    posts
                } = this.data;
                this.setData({
                    [`posts[${posts.length}]`]: r.result.list
                })
            } else {
                this.setData({
                    posts: [r.result.list]
                })

            }
            console.log(r.result.list)
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

        wx.startPullDownRefresh()
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
        this.postsOffset = 0
        this.postsNoMore = false
        this.refresh().then(setTimeout(wx.stopPullDownRefresh, 500))
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (!this.postsNoMore) {
            this.refresh(this.postsOffset).then(c => {
                if (c == 0) {
                    this.postsNoMore = true
                } else {
                    this.postsOffset += c
                }
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})