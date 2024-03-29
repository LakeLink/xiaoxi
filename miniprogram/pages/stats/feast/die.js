// pages/stats/feast/dice.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        food: null,
        window: null,
        confirmed: false
    },

    async randomFood() {
        let r = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                mod: 'feast',
                func: 'getLuckyFood'
            }
        }).then(r => r.result)
        console.log(r)

        this.setData({
            food: r.food,
            window: r.window
        })
    },

    onBack(e) {
        wx.navigateBack()
    },

    onRoll(e) {
        console.log(e)
        this.randomFood()
    },

    onChoose(e) {
        this.setData({
            confirmed: true
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
        this.randomFood()
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