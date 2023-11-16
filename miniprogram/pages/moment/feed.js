// pages/moment/feed.js
import Message from 'tdesign-miniprogram/message/index';
import tabBarStore from '~/stores/tabBarStore';
import userStore from '~/stores/userStore';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        posts: [],
        lastReadPost: null,
        noMorePost: false,
        topic: {
            options: [{
                    label: "所有话题",
                    value: 0
                },
                {
                    label: "三行诗大赛",
                    value: 1
                }, {
                    label: "吹水",
                    value: 2
                }, {
                    label: "「唐人」街",
                    value: 3
                }
            ],
            value: 0
        },
        sorter: {
            options: [{
                label: "最新发布",
                value: 0
            }],
            value: 0
        }
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
                updatedBefore: this.lastPostUpdatedAt,
                topic: this.data.topic.value == 0 ? undefined : this.data.topic.options[this.data.topic.value]
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
                this.lastPostUpdatedAt = r.result.list[r.result.list.length - 1].updatedAt
            }

            tabBarStore.setBadgeOfPage('/' + this.route, {})

            Message.hide({
                context: this
            })
            return r.result.list.length
        })
    },

    onTopicChange(e) {
        this.setData({
            'topic.value': e.detail.value
        })
        wx.startPullDownRefresh()
    },

    onTapCreate(e) {
        wx.navigateTo({
            url: '/pages/moment/create',
        })
    },

    onTapMessage(e) {
        wx.startPullDownRefresh()
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
        // console.log(userStore.data)
        if (userStore.data.unreadPostCount) {
            Message.info({
                context: this,
                offset: ['60rpx', '32rpx'],
                duration: 0,
                content: `有${userStore.data.unreadPostCount}条新内容，点我刷新！`,
            });
        }
        // wx.startPullDownRefresh()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},

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