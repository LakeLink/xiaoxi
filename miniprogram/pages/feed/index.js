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
        imgUrl: "https://blog.playo.co/wp-content/uploads/2019/02/shutterstock_794204539-scaled.jpg",
        title: "羽毛球",
        number_of_likes: "11",
        content: "今天艺哥和胡印良品大战三百回合，1：299艺哥惜败，无奈他只能在周末在书院献唱一曲。",
        user: "@wxj"
    },

    async refresh() {
        const db = wx.cloud.database()
        const r = await db.collection('WeRunDetails').get()
        r.data.forEach(e => {
            e.when = dayjs(e.when).fromNow()
        })
        this.setData({
            weRunDetails: r.data
        })
        console.log(this.data.weRunDetails)
    },

    onImgTap(e) {
        wx.previewImage({
          urls: this.data.weRunDetails[e.target.dataset.id].images,
          current: this.data.weRunDetails[e.target.dataset.id].images[e.target.dataset.imgId]
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