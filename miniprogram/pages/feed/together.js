// pages/feed/together.js
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
        showPopup: false,
        // waitListUserinfo: null,
        popupIndex: null
    },

    async refresh() {
        const db = wx.cloud.database()
        const r = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getTogether'
            }
        })
        console.log(r)
        r.result.forEach(e => {
            e.myScheduledAt = dayjs(e.scheduledAt).format("YYYY/M/D HH:mm")
            e.deltaPublishedAt = dayjs(e.publishedAt).fromNow()
        })
        this.setData({
            togetherDetails: r.result
        })
        console.log(this.data.togetherDetails)
    },

    onJoin(e) {
        console.log(e)
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'joinTogether',
                id: e.target.dataset.id
            }
        }).then(r => {
            if (r.result.full) {
                wx.showToast({
                    title: '队伍已满，已加入到候补',
                    icon: 'none'
                })
            }
            this.refresh()
        })
    },

    onQuit(e) {
        wx.showModal({
            title: '已加入',
            content: '是否要退出该活动',
            complete: (r) => {
                if (r.confirm) {
                    wx.cloud.callFunction({
                        name: 'fn',
                        data: {
                            type: 'quitTogether',
                            id: e.target.dataset.id
                        }
                    }).catch(e => wx.showToast({
                        title: '数据错误',
                        icon: 'error'
                    })).then(r => {
                        if (r.result.updated) {
                            this.refresh()
                        } else {
                            wx.showToast({
                                title: '记录未匹配',
                                icon: 'error'
                            })
                        }
                    })
                }
            }
        })
    },

    onImgTap(e) {
        wx.previewImage({
            urls: this.data.togetherDetails[e.target.dataset.idx].images,
            current: e.target.dataset.imgSrc
        })
    },

    onPopupClose(e) {
        this.setData({
            showPopup: false
        })
    },

    onTapOpenPopup(e) {
        console.log(e.target.dataset.idx)
        this.setData({
            showPopup: true,
            popupIndex: e.target.dataset.idx
        })
    },

    // onTabChange(e) {
    //     if (e.detail.index == 1) {
    //         console.log(this.data.togetherDetails[this.data.popupIndex].waitList)
    //         const db = wx.cloud.database()
    //         const _ = db.command
    //         const col = db.collection('Users')
    //         col.aggregate().match({
    //             _id: _.in(["oY_bj5cA6Cc8gfqkc35sOZtE3Nys"])
    //         }).project({nickname: 1}).end().then(r => {
    //             console.log(r)
    //         })
    //     }
    // },

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
        this.refresh().then(() =>
            wx.stopPullDownRefresh())
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