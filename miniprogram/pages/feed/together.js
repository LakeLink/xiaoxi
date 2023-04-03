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
        imgUrl: "https://blog.playo.co/wp-content/uploads/2019/02/shutterstock_794204539-scaled.jpg",
        title: "羽毛球",
        number_of_likes:"11",
        content:"17号 艺哥和胡印良品约定大战三百回合，如果艺哥输了就得在书院献唱一曲。来观战的速报到👇",
        user:"@wxj"
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
            if (r.full) {
                wx.showToast({
                  title: '队伍已满，已加入到候补',
                  icon: 'none'
                })
            }
            this.refresh()
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