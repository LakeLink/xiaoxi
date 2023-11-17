import userStore from "~/stores/userStore"
import featureStore from "~/stores/featureStore"
// pages/moment/create.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        topicPickerVisible: false,
        topicValue: [],
        topicLabel: '',
        visibilityValue: [],
        visibilityLabel: '',
        visibilityPickerVisible: false,
        textValue: "",
        mediaList: [],
        useStagename: false,
        stagename: "",
        loading: false,
        uploadConfig: {
            count: 9,
            // sizeType: 'compressed'
        }
    },

    onToggleStagename(e) {
        // console.log(e)
        this.setData({
            useStagename: e.detail.value
        })
    },

    onTapBack(e) {
        console.log(e)
        wx.navigateBack()
    },

    async onTapSubmit(e) {
        if (!this.data.topicValue.length || this.data.topicValue[0] == 0) {
            wx.showToast({
                title: '请选择一个话题',
                icon: 'error'
            })
            return
        }
        if (!this.data.textValue) {
            wx.showToast({
                title: '喂，至少写一个字吧！',
                icon: 'error'
            })
            return
        }
        this.setData({
            loading: true
        })
        wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'addPost',
                    useStagename: this.data.useStagename,
                    stagename: this.data.useStagename ? this.data.stagename : undefined,
                    topicValue: this.data.topicValue[0],
                    text: this.data.textValue,
                    visibilityValue: this.data.visibilityValue[0]
                }
            })
            .then(r => r.result)
            .then(async r => {
                if (!r.success) {
                    wx.showModal({
                        title: '发送失败',
                        content: r.reason,
                        showCancel: false,
                        confirmText: '知道了'
                    })
                    return
                }
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
                this.getOpenerEventChannel().emit('newPostCreated')
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

    onTopicChange(e) {
        const {
            value,
            label
        } = e.detail;
        console.log(e.detail)
        if (value[0] == 0 && !userStore.data.verifiedIdentity) {
            wx.showModal({
                title: '需要认证',
                content: '投稿三行诗需要在“我的”页面中设置「神秘符号」，并通过认证。',
                showCancel: false,
                confirmText: '知道了'
            })
            return
        }
        this.setData({
            topicPickerVisible: false,
            topicValue: value,
            topicLabel: label
        })
    },

    onVisibilityPicker(e) {
        this.setData({
            visibilityPickerVisible: true
        })
    },

    onVisibilityChange(e) {
        const {
            value,
            label
        } = e.detail;
        console.log(e)
        this.setData({
            visibilityPickerVisible: false,
            visibilityValue: value,
            visibilityLabel: label
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
        let topics = featureStore.data.post.topics.slice(1) // 删除第一个（全部话题）

        // Needed, otherwise topic and sorter label would be empty by default
        // let topicValue = 0
        let visibilityValue = featureStore.data.post.defaultVisibilityValue
        this.setData({
            topics,
            topicValue: [0],
            topicLabel: [''],
            visibilities: featureStore.data.post.visibilities,
            visibilityValue: [visibilityValue],
            visibilityLabel: [featureStore.data.post.visibilities[visibilityValue].label]
        })
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