// pages/together/create.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isCalendarOpen: false,
        sportsType: "",
        location: "",
        date: "",
        time: "",
        textInput: "",
        limit: "",
        fileList: []
    },

    openCalendar() {
        this.setData({
            isCalendarOpen: true
        })
    },

    closeCalendar() {
        this.setData({
            isCalendarOpen: false
        })
    },

    confirmDate(e) {
        console.log(e)
        this.realDate = e.detail
        this.setData({
            isCalendarOpen: false,
            date: `${this.realDate.getMonth() + 1}/${this.realDate.getDate()}`
        })
        this.computeRealDate()
    },

    onTimeChange(e) {
        console.log(e)
        this.setData({
            time: e.detail.value
        })
        this.computeRealDate()
    },

    computeRealDate() {
        let t = this.data.time.split(":")
        this.realDate.setHours(t[0], t[1])

        console.log(this.realDate)
    },

    afterFileRead(e) {
        console.log(e)
        this.data.fileList.push(...e.detail.file);
        this.setData({
            fileList: this.data.fileList
        });
    },

    fileDelete(e) {
        console.log(e)
        this.data.fileList.splice(e.detail.index);
        this.setData({
            fileList: this.data.fileList
        });
    },

    uploadFilesToCloud(fileList, filePrefix) {
        if (fileList.length) {
            wx.showLoading({
                title: '正在上传图片',
            })
            const uploadTasks = fileList.map((file, index) => wx.cloud.uploadFile({
                cloudPath: `${filePrefix}${index}`,
                filePath: file.url
            }));
            return Promise.all(uploadTasks)
                .catch(e => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '上传失败',
                        icon: 'none'
                    });
                    console.log(e);
                })
                .then(data => {
                    wx.hideLoading()
                    return data
                })
        }
    },

    onSubmit() {
        const db = wx.cloud.database()
        const col = db.collection("TogetherDetails")
        col.add({
                data: {
                    sportsType: this.data.sportsType,
                    publishedAt: db.serverDate(),
                    scheduledAt: this.realDate,
                    location: this.data.location,
                    description: this.data.textInput,
                    limit: Number(this.data.limit),
                    images: [],
                    partners: [],
                    waitList: []
                }
            })
            .then(r => this.uploadFilesToCloud(this.data.fileList, `TogetherDetails/${r._id}/img`)
                .then(uploadResult => {
                    console.log(uploadResult)
                    return col.doc(r._id).update({
                        data: {
                            images: uploadResult.map((file, index) => file.fileID)
                        }
                    })
                }))
            .then(() => {
                wx.showToast({
                    title: '发送成功',
                    icon: 'success'
                });
                wx.navigateBack()
            })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.realDate = new Date()
        console.log(this.realDate)
        this.setData({
            date: `${this.realDate.getMonth() + 1}/${this.realDate.getDate()}`,
            time: `${this.realDate.getHours()}:${this.realDate.getMinutes()}`
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},

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