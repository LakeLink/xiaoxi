// pages/moment/create.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        topicPickerVisible: false,
        topicValue: [],
        topics: [{
            label: "唐人街",
            value: "唐人街"
        }],
        textValue: "",
        mediaList: [],
        loading: false
    },
    onTapBack(e) {
        console.log(e)
        wx.navigateBack()
    },

    async onTapSubmit(e) {
        this.setData({
            loading: true
        })
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'addPost',
                topic: this.data.topic,
                text: this.data.textValue
            }
        })
        .then(r => r.result)
        .then(async r => {
            if (this.data.mediaList.length) await this.uploadMediaToCloud(this.data.mediaList, `posts/${r.id}`)
                .then(uploadResult => {
                    console.log(uploadResult)
                    wx.cloud.callFunction({
                        name: 'fn',
                        data: {
                            type: 'setPostMedia',
                            id: r.id,
                            images: uploadResult.map(x => x.fileID)
                        }
                    })
                })
            wx.navigateBack()
        }).catch(e => {
            wx.showToast({
                title: '数据错误',
                icon: 'error'
            })
            // throw e
        }).finally(() => {
            this.setData({
                loading: false
            })
        })

    },

    onTopicPicker(e) {
        this.setData({
            topicPickerVisible: true
        })
    },

    onPickerChange(e) {
        const {
            value
        } = e.detail;
        this.setData({
            topicPickerVisible: false,
            topicValue: value,
            topic: value.join(' ')
        })
    },

    handleMediaAdd(e) {
        const {
            files
        } = e.detail;
        this.setData({
            mediaList: files,
        });
    },

    handleMediaRemove(e) {
        const {
            index
        } = e.detail;
        const {
            mediaList
        } = this.data;

        mediaList.splice(index, 1);
        this.setData({
            mediaList,
        })
    },
    async uploadMediaToCloud(fileList, cloudFolderPath) {
        wx.showLoading({
            title: '正在上传',
        })
        const uploadTasks = fileList.map((file, index) => {
            if (!file.url.startsWith('cloud')) {
                return wx.cloud.uploadFile({
                    cloudPath: `${cloudFolderPath}/${file.type}${index}`,
                    filePath: file.url
                }).then(r => {
                    return {
                        fileID: r.fileID,
                        type: file.type
                    }
                })
            } else return {
                fileID: file.url,
                type: file.type
            }
        });
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