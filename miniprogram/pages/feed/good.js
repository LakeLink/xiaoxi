// pages/feed/good.js
Page({
    
    /**
     * 页面的初始数据
     */
    data: {
        List: [
            
           
        ],
        message: "",
        imgUrl: "https://img01.yzcdn.cn/vant/tree.jpg"
    },
    afterImgRead: function (event) {
        console.log(event)
        const file = event.detail.file
        this.data.List.push(...file);
        console.log(this.data.List)
        this.setData({ List: this.data.List });
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