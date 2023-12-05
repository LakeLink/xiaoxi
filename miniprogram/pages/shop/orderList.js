// pages/shop/orderList.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    went: false,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.navigateTo({
          url: 'plugin-private://wx34345ae5855f892d/pages/orderList/orderList',
          complete: () => {
              this.went = true
          }
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
        if (this.went) {
            wx.switchTab({
              url: '/pages/moment/feed',
            })
        }
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