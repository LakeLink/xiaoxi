// pages/about/verify.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        username: null,
        password: null,
        loading: false
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
        this.setData({
            loading: true
        })
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
                this.getOpenerEventChannel().emit('userVerified')
                setTimeout(wx.navigateBack, 1000)
            } else {
                wx.showToast({
                    icon: 'error',
                    title: r.reason
                })
            }
        }).catch(e => {
            console.log(e)
            wx.showToast({
                icon: 'error',
                title: '云函数错误',
            })
        }).finally(() => {
            this.setData({
                loading: false
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