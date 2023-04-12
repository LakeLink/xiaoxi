// pages/feed/index.js
const dayjs = require('dayjs')

const relativeTime = require('@3rdparty/dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

require('@3rdparty/dayjs/locale/zh-cn')
dayjs.locale('zh-cn')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        weRunDetails: [],
        showCommentInput: false,
        sendingComment: false,
        showPopup: false,
        ads: null
    },

    async refresh() {
        let r = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getWeRunFeed'
            }
        })
        // const db = wx.cloud.database()
        // const r = await db.collection('WeRunDetails').get()
        r.result.forEach(e => {
            e.when = dayjs(e.when).fromNow()
        })
        console.log(r.result)
        this.setData({
            weRunDetails: r.result
        })
        console.log(this.data.weRunDetails)
    },

    onImgTap(e) {
        wx.previewImage({
            urls: this.data.weRunDetails[e.target.dataset.id].images,
            current: this.data.weRunDetails[e.target.dataset.id].images[e.target.dataset.imgId]
        })
    },

    onLike(e) {
        if (this.data.weRunDetails[e.currentTarget.dataset.idx].alreadyLiked) {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'undoLikeWeRun',
                    id: this.data.weRunDetails[e.currentTarget.dataset.idx]._id
                }
            }).then(() => this.refresh())
        } else {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'likeWeRun',
                    id: this.data.weRunDetails[e.currentTarget.dataset.idx]._id
                }
            }).then(() => this.refresh())
        }
    },

    onShowEarlier(e) {
        this.setData({
            showAllComments: true
        })
    },

    onSubmitComment(e) {
        this.setData({
            sendingComment: true
        })
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'commentWeRun',
                id: this.data.weRunDetails[e.target.dataset.idx]._id,
                content: e.detail.newComment
            }
        }).then((r) => {
            if (r.result.updated == 1) {
                this.setData({
                    sendingComment: false
                })
                this.refresh()
            } else {
                throw new Error()
            }
        }).catch(e => {
            this.setData({
                sendingComment: false
            })
            wx.showToast({
                title: '数据错误',
                icon: 'error'
            })
        })
    },

    onTapToplevel(e) {
        this.setData({
            showPopup: false
        })
    },

    onAdTap(e) {
        wx.previewImage({
            urls: this.data.ads,
            current: this.data.ads[e.target.dataset.imgid]
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("onLoad")
        // this.refresh()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getAds'
            }
        }).then(r => {
            this.setData({
                ads: r.result
            })
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log("onShow")
        this.refresh()
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
        this.refresh().then(() => {
            console.log("Finished")
            wx.stopPullDownRefresh()
        })
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