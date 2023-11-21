// pages/moment/feed.js
import Message from 'tdesign-miniprogram/message/index';
import tabBarStore from '~/stores/tabBarStore';
import userStore from '~/stores/userStore';
import featureStore from '~/stores/featureStore';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        posts: [],
        votes: {},
        lastReadPost: null,
        noMorePost: false
    },

    lastPostUpdatedAt: null,

    async refreshVotes() {
        await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getTopicVotes',
                topicValue: 1
            }
        }).then(r => {
            r.result.sort((a, b) => {
                return a.votes.length > b.votes.length ? -1 : 1
            })
            // console.log(r.result)
            let votes = {}, current = 1
            for (let i = 0; i < r.result.length; i++) {
                const e = r.result[i];
                if (i > 0 && r.result[i-1].votes.length !== e.votes.length) current++
                votes[e._id] = {
                    rank: current,
                    count: e.votes.length,
                    hasVoted: e.hasVoted
                }
            }
            this.setData({
                votes
            })
        })

    },

    async refresh(clear) {
        if (clear) {
            this.lastPostUpdatedAt = null
        }

        return await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getPostsV2',
                updatedBefore: this.lastPostUpdatedAt,
                topicValue: this.data.topicValue
            }
        }).then(r => {
            // https://developers.weixin.qq.com/community/develop/article/doc/000404cadd0548fd6e48f439455413
            const {
                posts
            } = this.data;

            if (!clear) {
                this.setData({
                    [`posts[${posts.length}]`]: r.result.list,
                    noMorePost: r.result.list.length == 0,
                    lastUnreadPost: r.result.lastUnreadPost
                })
            } else {
                this.setData({
                    posts: [r.result.list],
                    noMorePost: r.result.list.length == 0,
                    lastUnreadPost: r.result.lastUnreadPost
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
            topicValue: e.detail.value
        })
        wx.startPullDownRefresh()
    },

    onSorterChange(e) {
        this.setData({
            sorterValue: e.detail.value
        })
        wx.startPullDownRefresh()
    },

    onTapCreate(e) {
        wx.navigateTo({
            url: '/pages/moment/create',
            events: {
                newPostCreated: wx.startPullDownRefresh
            }
        })
    },

    onTapMessage(e) {
        wx.startPullDownRefresh()
    },

    onPostVote(e) {
        // console.log(e)
        this.refreshVotes()
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
        // this.data.$f = {}
        featureStore.bind(this, '$f')
        // Needed, otherwise topic and sorter label would be empty by default
        this.setData({
            topicValue: featureStore.data.post.defaultTopicValue,
            sorterValue: featureStore.data.post.defaultSorterValue
        })
        // console.log(this.data.$f)
        this.refreshVotes()
        this.refresh(true)
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
        this.refreshVotes()
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