// pages/stats/feast/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canteens: []
    },

    onTapCanteen(e) {
        console.log(e)
        wx.navigateTo({
          url: `/pages/stats/feast/canteen?id=${e.currentTarget.dataset.id}`,
        })
    },

    onTapLucky(e) {
        wx.navigateTo({
          url: '/pages/stats/feast/die',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                mod: 'feast',
                func: 'listCanteens'
            }
        }).then(r => {
            this.setData({
                canteens: r.result
            })
        })
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