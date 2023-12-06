// components/feast/new-comment.js
import dayjs from 'dayjs'
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        foodId: String,
        draft: Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        rating: 0,
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

    lifetimes: {
        // attached() {
        //     if (this.properties.draft) {
        //         const {
        //             rating,
        //             textValue,
        //             mediaList,
        //             useStagename,
        //             stagename
        //         } = draft
        //         this.setData({
        //             rating,
        //             textValue,
        //             mediaList,
        //             useStagename,
        //             stagename
        //         })
        //     }
        // }
    },
    observers: {
        'draft': function (draft) {
            if (draft) {
                const {
                    rating,
                    textValue,
                    mediaList,
                    useStagename,
                    stagename
                } = draft
                this.setData({
                    rating,
                    textValue,
                    mediaList,
                    useStagename,
                    stagename
                })
            }
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {

        onRatingChange(e) {
            this.setData({
                rating: e.detail.value
            })
        },
        onToggleStagename(e) {
            // console.log(e)
            this.setData({
                useStagename: e.detail.value
            })
        },
        onTapHide(e) {
            this.triggerEvent('hide')
        },

        async onTapSubmit(e) {
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

            if (this.data.rating >= 1 && this.data.rating <= 5) {
                wx.cloud.callFunction({
                        name: 'fn',
                        data: {
                            mod: 'feast',
                            func: 'rate',
                            targetId: this.properties.foodId,
                            targetType: 'food',
                            rating: this.data.rating,
                            useStagename: this.data.useStagename,
                            stagename: this.data.useStagename ? this.data.stagename : undefined,
                            textContent: this.data.textValue,
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
                        if (this.data.mediaList.length) await this.uploadMediaToCloud(this.data.mediaList, `feast_ratings/${r.id}`)
                            .then(uploadResult => {
                                console.log(uploadResult)
                                wx.cloud.callFunction({
                                    name: 'fn',
                                    data: {
                                        mod: 'feast',
                                        func: 'updateRatingMedia',
                                        id: r.id,
                                        images: uploadResult.map(x => x.fileID)
                                    }
                                })
                            })
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
            } else {
                wx.showToast({
                    icon: 'error',
                    title: '似乎不太对',
                })
                return
            }

        },

        handleMediaAdd(e) {
            console.log(e.detail)
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
                        cloudPath: `${cloudFolderPath}/${file.type}${index}^${dayjs().unix()}`,
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
    }
})