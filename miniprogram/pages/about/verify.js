// pages/about/verify.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        username: null,
        password: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.collegeIndex) {
            this.setData({
                collegeIndex: options.collegeIndex
            })
        }
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

    onTapBack() {
        wx.navigateBack()
    },

    onTapSubmit(e) {
        const {
            username,
            password,
            collegeIndex
        } = this.data
        if (!username || !password) {
            wx.showToast({
                icon: 'error',
                title: '没有输入学工号和密码',
            })
            return
        }
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'verifyUser',
                data: {
                    username,
                    password,
                    collegeIndex
                }
            }
        })
        .then(r => r.result)
        .then(r => {
            if (r.success) {
                wx.showToast({
                    icon: 'success',
                    title: '认证成功'
                })
                wx.navigateBack()
            } else {
                wx.showToast({
                    icon: 'error',
                    title: '用户名或密码不正确'
                })
            }
        }).catch(e => {
            console.log(e)
            wx.showToast({
                icon: 'error',
                title: '系统错误',
            })
        })
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